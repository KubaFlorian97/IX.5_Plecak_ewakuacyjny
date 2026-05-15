import { Emitter } from "./emitter";
import { IDisposable } from "./disposable";

export class Value<T> {
    private _emitter = new Emitter<T>();
    public readonly onDidChange = this._emitter.event.bind(this._emitter);


    constructor(private _value: T) { }

    public get value(): T {
        return this._value;
    }

    public set(newVal: T) {
        if (this._value !== newVal) {
            this._value = newVal;
            this._emitter.emmit(this._value);
        }
    }
}