export interface IDisposable {
    dispose(): void;
}

export abstract class Disposable implements IDisposable {
    private _disposables: IDisposable[] = [];

    protected _register<T extends IDisposable>(obj: T): T {
        this._disposables.push(obj);
        return obj;
    }

    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }
}