import { IDisposable } from "./disposable";

export function addDisposableListener(
    element: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
): IDisposable {
    element.addEventListener(type, handler, options);

    return {
        dispose: () => element.removeEventListener(type, handler, options)
    };
}