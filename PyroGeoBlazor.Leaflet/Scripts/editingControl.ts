declare const L: typeof import('leaflet');

export interface EditingControlOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    dotNetRef?: any;
    polygonIcon?: string;
    lineIcon?: string;
    deleteIcon?: string;
    confirmIcon?: string;
    cancelIcon?: string;
    polygonTooltip?: string;
    lineTooltip?: string;
    deleteTooltip?: string;
    confirmTooltip?: string;
    cancelTooltip?: string;
    buttonSize?: number;
    iconSize?: number;
}

export class EditingControl extends L.Control {
    private container: HTMLDivElement | null = null;
    private dotNetRef: any;
    private isDrawing: boolean = false;
    private selectedCount: number = 0;
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

        // Always show all buttons, but disable based on state
        this.addButton('btn-polygon', () => this.handlePolygonClick(), this.isDrawing);
        this.addButton('btn-line', () => this.handleLineClick(), this.isDrawing);
        this.addButton('btn-delete', () => this.handleDeleteClick(), this.selectedCount === 0);
        this.addButton('btn-confirm', () => this.handleConfirmClick(), !this.isDrawing);
        this.addButton('btn-cancel', () => this.handleCancelClick(), !this.isDrawing);
    }

    private addButton(id: string, onClick: () => void, disabled: boolean = false): void {
        const button = L.DomUtil.create('button', 'leaflet-editing-button', this.container!);
        button.id = id;
        button.type = 'button';
        button.disabled = disabled;
        
        const buttonSize = this.controlOptions.buttonSize || 40;
        const iconSize = this.controlOptions.iconSize || 24;
        
        // Add inline styles to ensure visibility
        button.style.cssText = `
            background: white;
            border: 2px solid rgba(0,0,0,0.2);
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
        } else if (id === 'btn-delete') {
            ariaLabel = this.controlOptions.deleteTooltip || 'Delete selected features';
            svgContent = this.controlOptions.deleteIcon || '';
        } else if (id === 'btn-confirm') {
            ariaLabel = this.controlOptions.confirmTooltip || 'Confirm drawing';
            svgContent = this.controlOptions.confirmIcon || '';
        } else if (id === 'btn-cancel') {
            ariaLabel = this.controlOptions.cancelTooltip || 'Cancel drawing';
            svgContent = this.controlOptions.cancelIcon || '';
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

    // Public methods to update state from C#
    public setDrawing(isDrawing: boolean): void {
        this.isDrawing = isDrawing;
        this.render();
    }

    public setSelectedCount(count: number): void {
        this.selectedCount = count;
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
    }
};

// Make it available globally
(window as any).LeafletEditingControl = LeafletEditingControl;
