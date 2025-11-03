/**
 * Minimal shape for DotNetObjectReference passed from Blazor.
 * Avoid importing from DotNetHelper to prevent module resolution issues in some build setups.
 */
export type DotNetObjectRefShape = {
    invokeMethodAsync(methodName: string, ...args: any[]): Promise<any>;
};

/**
 * TypeScript representation of the Blazor `InteractionOptions` model.
 * Use this when passing interaction/click options into the TS API.
 */
export class InteractionOptions {
    dotNetRef?: DotNetObjectRefShape;
    events?: Record<string, string>;

    constructor(init?: Partial<InteractionOptions>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * Convenience: get the method name for an event (or undefined).
     */
    getMethodForEvent(eventName: string): string | undefined {
        return this.events?.[eventName];
    }
}

export default InteractionOptions;
