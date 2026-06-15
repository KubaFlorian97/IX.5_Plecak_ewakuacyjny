import { _gameWrapper } from "~/app";
import * as styles from "./modals.css";
import { FocusTrap } from "~/utils/focus-trap";
import { SoundManager } from "~/utils/sound-manager";

export class HelpModal {
    private _container: HTMLElement;
    private _element: HTMLElement;
    private _modal: HTMLElement;
    private _title!: HTMLElement;
    private _isOpen: boolean = false;
    private _focusTrap: FocusTrap;

    constructor(container: HTMLElement) {
        this._container = container;
        this._element = document.createElement("div");
        this._element.className = styles["modal-overlay"];
        this._element.style.display = "none";

        this._modal = document.createElement("div");
        this._modal.className = styles["modal"];
        this._modal.onclick = (e) => { e.stopPropagation(); };

        this._element.appendChild(this._modal);
        this._element.onclick = (e) => {
            if (e.target === this._element) {
                SoundManager.play('click');
                this.hide();
            }
        };

        this.build();

        this._focusTrap = new FocusTrap(this._modal);
        this._modal.addEventListener('close-modal', () => {
            SoundManager.play('click');
            this.hide();
        });
    }

    public show() {
        this._isOpen = true;
        this._container.appendChild(this._element);
        this._element.style.display = "flex";
        _gameWrapper.dispatchEvent(new CustomEvent('modal-toggled', { detail: { isOpen: true } }));
        this._focusTrap.activate();
    }

    public hide() {
        this._focusTrap.deactivate();
        this._element.style.display = "none";
        if (this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
        _gameWrapper.dispatchEvent(new CustomEvent('modal-toggled', { detail: { isOpen: false } }));
        this._isOpen = false;
    }

    private build() {

    }

    public get isOpen(): boolean {
        return this._isOpen;
    }
}