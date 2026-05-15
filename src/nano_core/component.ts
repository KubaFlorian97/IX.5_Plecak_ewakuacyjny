import { Disposable } from "./disposable";

export abstract class Component extends Disposable {
    public readonly element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    public abstract render(): void;

    public dispose(): void {
        super.dispose();
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}