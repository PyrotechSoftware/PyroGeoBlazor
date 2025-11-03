export type DotNetObjectRef = {
    invokeMethodAsync(methodName: string, ...args: any[]): Promise<any>;
};

/**
 * Simple helper for invoking Blazor methods from TypeScript.
 * - For instance method calls pass a DotNetObjectReference from Blazor and call `invokeInstanceMethod`.
 * - For static calls provide an assembly name and call `invokeStaticMethod`.
 */
export class DotNetHelper {
    private dotNetRef?: DotNetObjectRef;
    private assemblyName?: string;

    constructor(dotNetRef?: DotNetObjectRef, assemblyName?: string) {
        this.dotNetRef = dotNetRef;
        this.assemblyName = assemblyName;
    }

    setDotNetRef(ref: DotNetObjectRef | undefined): void {
        this.dotNetRef = ref;
    }

    setAssemblyName(name: string | undefined): void {
        this.assemblyName = name;
    }

    hasInstanceRef(): boolean {
        return typeof this.dotNetRef !== 'undefined';
    }

    hasAssemblyName(): boolean {
        return typeof this.assemblyName === 'string' && this.assemblyName.length > 0;
    }

    async invokeInstanceMethod<T = any>(methodName: string, ...args: any[]): Promise<T> {
        if (!this.dotNetRef) {
            return Promise.reject(new Error('DotNetObjectReference is not set.'));
        }
        return this.dotNetRef.invokeMethodAsync(methodName, ...args) as Promise<T>;
    }

    async invokeStaticMethod<T = any>(methodName: string, ...args: any[]): Promise<T> {
        if (!this.assemblyName) {
            return Promise.reject(new Error('Assembly name is not set for static invoke.'));
        }
        const dotnet = (window as any).DotNet;
        if (!dotnet || typeof dotnet.invokeMethodAsync !== 'function') {
            return Promise.reject(new Error('Blazor DotNet interop is not available on window.DotNet.'));
        }
        return dotnet.invokeMethodAsync(this.assemblyName, methodName, ...args) as Promise<T>;
    }

    /**
     * Convenience: try instance invoke, fallback to static invoke if instance missing.
     */
    async invokeEither<T = any>(methodName: string, ...args: any[]): Promise<T> {
        if (this.dotNetRef) {
            return this.invokeInstanceMethod<T>(methodName, ...args);
        }
        return this.invokeStaticMethod<T>(methodName, ...args);
    }
}

export default DotNetHelper;
