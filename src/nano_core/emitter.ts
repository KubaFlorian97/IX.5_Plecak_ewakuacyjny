import { IDisposable } from "./disposable";

type Listener<T> = (event: T) => void;

export class Emitter<T = void> {
    private _listeners: Listener<T>[] = [];

    public emmit(event: T): void {
        this._listeners.forEach(l => l(event));
    }

    public event(listener: Listener<T>): IDisposable {
        this._listeners.push(listener);
        
        return {
            dispose: () => {
                const index = this._listeners.indexOf(listener);
                if (index > -1) {
                    this._listeners.splice(index, 1);
                }
            }
        }
    }
}