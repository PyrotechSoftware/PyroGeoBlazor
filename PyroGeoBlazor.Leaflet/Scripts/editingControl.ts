declare const L: typeof import('leaflet');

export interface EditingControlOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    dotNetRef?: any;
    polygonIcon?: string;
    lineIcon?: string;
    editIcon?: string;
    deleteIcon?: string;
    confirmIcon?: string;
    cancelIcon?: string;
    addVertexIcon?: string;
    removeVertexIcon?: string;
    moveVertexIcon?: string;
    polygonTooltip?: string;
    lineTooltip?: string;
    editTooltip?: string;
    deleteTooltip?: string;
    confirmTooltip?: string;
    cancelTooltip?: string;
    addVertexTooltip?: string;
    removeVertexTooltip?: string;
    moveVertexTooltip?: string;
    buttonSize?: number;
    iconSize?: number;
}

export class EditingControl extends L.Control {
    private container: HTMLDivElement | null = null;
    private dotNetRef: any;
    private isDrawing: boolean = false;
    private isEditing: boolean = false;
    private selectedCount: number = 0;
    private isAddingVertices: boolean = false;
    private isRemovingVertices: boolean = false;
    private isMovingVertices: boolean = false;
    private controlOptions: EditingControlOptions;

    constructor(options?: EditingControlOptions) {
        super(options);
        this.dotNetRef = options?.dotNetRef;
        this.controlOptions = options || {};
    }

    onAdd(map: L.Map): HTMLElement {
        // Create the control container
        this.container = L.DomUtil.create('div', 'leaflet-editing-control leaflet-bar');
        
        // Add inline styles to ensure visibility
        this.container.style.cssText = `
            background: white !important;
            padding: 10px !important;
            border-radius: 4px !important;
            box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
            display: flex !important;
            gap: 8px !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        // Prevent map interactions when clicking on the control
        L.DomEvent.disableClickPropagation(this.container);
        L.DomEvent.disableScrollPropagation(this.container);

        // Initial render
        this.render();

        return this.container;
    }

    onRemove(map: L.Map): void {
        // Cleanup if needed
        if (this.container) {
            L.DomEvent.off(this.container);
        }
    }

    private render(): void {
        if (!this.container) return;

        // Clear existing content
        this.container.innerHTML = '';

        // Button visibility logic:
        // - Normal mode: show polygon/line, hide others
        // - Feature selected: show polygon/line/edit/delete, hide vertex buttons
        // - Editing mode: show vertex buttons and confirm/cancel, hide others
        // - Drawing mode: show only confirm/cancel
        
        const isInActiveSession = this.isDrawing || this.isEditing;
        
        // Basic drawing buttons (always show unless in active session)
        this.addButton('btn-polygon', () => this.handlePolygonClick(), isInActiveSession);
        this.addButton('btn-line', () => this.handleLineClick(), isInActiveSession);
        
        // Edit and delete buttons (show when feature selected, hide during sessions)
        this.addButton('btn-edit', () => this.handleEditClick(), this.selectedCount === 0 || isInActiveSession);
        this.addButton('btn-delete', () => this.handleDeleteClick(), this.selectedCount === 0 || isInActiveSession);
        
        // Vertex edit buttons (only show during editing session)
        if (this.isEditing) {
            this.addButton('btn-move-vertex', () => this.handleMoveVertexClick(), false, this.isMovingVertices);
            this.addButton('btn-add-vertex', () => this.handleAddVertexClick(), false, this.isAddingVertices);
            this.addButton('btn-remove-vertex', () => this.handleRemoveVertexClick(), false, this.isRemovingVertices);
        }
        
        // Confirm and cancel (show during any active session)
        this.addButton('btn-confirm', () => this.handleConfirmClick(), !isInActiveSession);
        this.addButton('btn-cancel', () => this.handleCancelClick(), !isInActiveSession);
    }

    private addButton(id: string, onClick: () => void, disabled: boolean = false, isActive: boolean = false): void {
        const button = L.DomUtil.create('button', 'leaflet-editing-button', this.container!);
        button.id = id;
        button.type = 'button';
        button.disabled = disabled;
        
        const buttonSize = this.controlOptions.buttonSize || 40;
        const iconSize = this.controlOptions.iconSize || 24;
        
        // Highlight button if it's active
        const shouldHighlight = isActive;
        
        // Add inline styles to ensure visibility
        button.style.cssText = `
            background: ${shouldHighlight ? '#4CAF50' : 'white'};
            border: 2px solid ${shouldHighlight ? '#4CAF50' : 'rgba(0,0,0,0.2)'};
            border-radius: 4px;
            padding: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            margin: 0 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: ${buttonSize}px;
            min-height: ${buttonSize}px;
            color: ${shouldHighlight ? 'white' : 'currentColor'};
            box-shadow: ${shouldHighlight ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none'};
        `;
        
        if (disabled) {
            button.style.opacity = '0.4';
            button.style.cursor = 'not-allowed';
        }

        // Get SVG icon and tooltip from options (guaranteed to be present from C#)
        let svgContent = '';
        let ariaLabel = '';
        
        if (id === 'btn-polygon') {
            ariaLabel = this.controlOptions.polygonTooltip || 'Draw new polygon';
            svgContent = this.controlOptions.polygonIcon || '';
        } else if (id === 'btn-line') {
            ariaLabel = this.controlOptions.lineTooltip || 'Draw new line';
            svgContent = this.controlOptions.lineIcon || '';
        } else if (id === 'btn-edit') {
            ariaLabel = this.controlOptions.editTooltip || 'Edit selected features';
            svgContent = this.controlOptions.editIcon || '';
        } else if (id === 'btn-delete') {
            ariaLabel = this.controlOptions.deleteTooltip || 'Delete selected features';
            svgContent = this.controlOptions.deleteIcon || '';
        } else if (id === 'btn-confirm') {
            ariaLabel = this.controlOptions.confirmTooltip || 'Confirm drawing';
            svgContent = this.controlOptions.confirmIcon || '';
        } else if (id === 'btn-cancel') {
            ariaLabel = this.controlOptions.cancelTooltip || 'Cancel drawing';
            svgContent = this.controlOptions.cancelIcon || '';
        } else if (id === 'btn-add-vertex') {
            ariaLabel = this.controlOptions.addVertexTooltip || 'Add vertex';
            svgContent = this.controlOptions.addVertexIcon || '';
        } else if (id === 'btn-remove-vertex') {
            ariaLabel = this.controlOptions.removeVertexTooltip || 'Remove vertex';
            svgContent = this.controlOptions.removeVertexIcon || '';
        } else if (id === 'btn-move-vertex') {
            ariaLabel = this.controlOptions.moveVertexTooltip || 'Move vertex';
            svgContent = this.controlOptions.moveVertexIcon || '';
        }

        // Set button HTML with just the SVG (no text)
        button.innerHTML = svgContent;
        button.setAttribute('aria-label', ariaLabel);
        button.setAttribute('title', ariaLabel);

        // Use Leaflet's event system
        L.DomEvent.on(button, 'click', (e: Event) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            onClick();
        });
    }

    private async handlePolygonClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlPolygonClick');
            } catch (error) {
                console.error('Error calling OnControlPolygonClick:', error);
            }
        }
    }

    private async handleLineClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlLineClick');
            } catch (error) {
                console.error('Error calling OnControlLineClick:', error);
            }
        }
    }

    private async handleEditClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlEditClick');
            } catch (error) {
                console.error('Error calling OnControlEditClick:', error);
            }
        }
    }

    private async handleConfirmClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlConfirmClick');
            } catch (error) {
                console.error('Error calling OnControlConfirmClick:', error);
            }
        }
    }

    private async handleCancelClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlCancelClick');
            } catch (error) {
                console.error('Error calling OnControlCancelClick:', error);
            }
        }
    }

    private async handleDeleteClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlDeleteClick');
            } catch (error) {
                console.error('Error calling OnControlDeleteClick:', error);
            }
        }
    }

    private async handleAddVertexClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlAddVertexClick');
            } catch (error) {
                console.error('Error calling OnControlAddVertexClick:', error);
            }
        }
    }

    private async handleRemoveVertexClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlRemoveVertexClick');
            } catch (error) {
                console.error('Error calling OnControlRemoveVertexClick:', error);
            }
        }
    }

    private async handleMoveVertexClick(): Promise<void> {
        if (this.dotNetRef) {
            try {
                await this.dotNetRef.invokeMethodAsync('OnControlMoveVertexClick');
            } catch (error) {
                console.error('Error calling OnControlMoveVertexClick:', error);
            }
        }
    }

    // Public methods to update state from C#
    public setDrawing(isDrawing: boolean): void {
        this.isDrawing = isDrawing;
        this.render();
    }

    public setSelectedCount(count: number): void {
        this.selectedCount = count;
        this.render();
    }

    public setEditing(isEditing: boolean): void {
        this.isEditing = isEditing;
        this.render();
    }

    public setAddingVertices(isAdding: boolean): void {
        this.isAddingVertices = isAdding;
        this.render();
    }

    public setRemovingVertices(isRemoving: boolean): void {
        this.isRemovingVertices = isRemoving;
        this.render();
    }

    public setMovingVertices(isMoving: boolean): void {
        this.isMovingVertices = isMoving;
        this.render();
    }
}

// Export for use in interop
export const LeafletEditingControl = {
    create(mapElementId: string, options: EditingControlOptions): EditingControl {
        const control = new EditingControl(options);
        return control;
    },

    remove(control: EditingControl): void {
        control.remove();
    },

    setDrawing(control: EditingControl, isDrawing: boolean): void {
        control.setDrawing(isDrawing);
    },

    setSelectedCount(control: EditingControl, count: number): void {
        control.setSelectedCount(count);
    },

    setEditing(control: EditingControl, isEditing: boolean): void {
        control.setEditing(isEditing);
    },

    setAddingVertices(control: EditingControl, isAdding: boolean): void {
        control.setAddingVertices(isAdding);
    },

    setRemovingVertices(control: EditingControl, isRemoving: boolean): void {
        control.setRemovingVertices(isRemoving);
    },

    setMovingVertices(control: EditingControl, isMoving: boolean): void {
        control.setMovingVertices(isMoving);
    }
};

// Make it available globally
(window as any).LeafletEditingControl = LeafletEditingControl;
