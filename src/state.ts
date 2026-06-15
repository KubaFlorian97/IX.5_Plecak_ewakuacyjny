export interface ListenerHandle<T> {
    callback: ListenerFn<T>;
    scope: object;
}

export type ListenerFn<T> = (value: T, prev: T | undefined) => void;

export type UnsubscribeFn = () => void;

export function isObject(value: unknown): value is object {
    return value !== undefined && typeof value === "object" && !Array.isArray(value);
}

export function mergeDeep(
    target: Record<string, unknown>,
    ...sources: Record<string, unknown>[]
): Record<string, unknown> {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export function equalDeep(a: any, b: any): boolean {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) return false;

        let length, i, keys;

        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0;)
                if (!equalDeep(a[i], b[i])) return false;
            return true;
        }

        if ((a instanceof Map) && (b instanceof Map)) {
            if (a.size !== b.size) return false;
            for (i of a.entries())
                if (!b.has(i[0])) return false;
            for (i of a.entries())
                if (!equalDeep(i[1], b.get(i[0]))) return false;
            return true;
        }

        if ((a instanceof Set) && (b instanceof Set)) {
            if (a.size !== b.size) return false;
            for (i of a.entries())
                if (!b.has(i[0])) return false;
            return true;
        }

        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = length; i-- !== 0;) {
            const key = keys[i];
            if (!equalDeep(a[key], b[key])) return false;
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
};

type StateType = Record<string, any>;

export class State {
    private listeners: ListenerHandle<StateType>[] = [];
    private state: StateType;
    private initState: StateType;
    private prev: StateType | undefined;

    constructor(value: StateType = {}) {
        this.state = value;
        this.initState = value;
        this.prev = undefined;
    }

    destroy(): void {
        this.listeners = [];
    }

    subscribe(callback: ListenerFn<StateType>, scope: object = this): UnsubscribeFn {
        const handle: ListenerHandle<StateType> = {
            callback,
            scope
        };

        this.listeners.push(handle);

        // this.deliveryValueToSubscriber(handle, this.state, this.prev);

        return () => {
            this.listeners.splice(this.listeners.indexOf(handle), 1);
        };
    }

    get(): StateType {
        return mergeDeep({}, this.state);
    }

    set(value: StateType): void {
        const newState = mergeDeep({}, this.state, value);

        if (equalDeep(this.state, newState)) {
            return;
        }

        const oldState = this.state;
        this.prev = oldState;
        this.state = newState;

        const tempNewState = mergeDeep({}, this.state);
        const tempOldState = mergeDeep({}, this.prev);

        this.listeners.forEach((handle) => {
            this.deliveryValueToSubscriber(handle, tempNewState, tempOldState);
        });
    }

    reset(): void {
        this.set(this.initState);
    }

    private deliveryValueToSubscriber(
        handle: ListenerHandle<StateType>,
        newValue: StateType,
        oldValue: StateType | undefined
    ): void {
        handle.callback.call(handle.scope, newValue, oldValue);
    }
}