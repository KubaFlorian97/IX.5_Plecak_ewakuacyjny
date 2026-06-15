import * as mainCss from "~/styles/main.css";
import * as styles from "./modals.css";
import { FocusTrap } from "~/utils/focus-trap";
import { t } from "~/utils/localization";
import { SoundManager } from "~/utils/sound-manager";
import { _gameWrapper } from "~/app";

const FILTERS = [
    { id: 'none', filter: 'none' },
    { id: 'grayscale', filter: `grayscale(100%)` },
    { id: 'sepia', filter: `sepia(100%)` },
    { id: 'invert', filter: `invert(100%)` },
    { id: 'protanopia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="p"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/></filter></svg>#p')` },
    { id: 'deuteranopia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="p"><feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#p')` },
    { id: 'tritanopia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="p"><feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#p')` },
    { id: 'achromatopsia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="p"><feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0"/></filter></svg>#p')` }
];

const cursorSizes = [
    { id: 'small', label: t('settings.cursorSmall'), cls: null },
    { id: 'large', label: t('settings.cursorLarge'), cls: mainCss["cursor-large"] }
];

const cursorColors = [
    { id: 'white', bg: mainCss["bg-white"], label: t('settings.cursorColor.white') },
    { id: 'yellow', bg: mainCss["bg-yellow"], label: t('settings.cursorColor.yellow') },
    { id: 'black', bg: mainCss["bg-black"], label: t('settings.cursorColor.black') },
    { id: 'red', bg: mainCss["bg-red"], label: t('settings.cursorColor.red') }
];

export class SettingsModal {
    private _container: HTMLElement;
    private _element: HTMLElement;
    private _modal: HTMLElement;
    private _title!: HTMLElement;
    private _isOpen: boolean = false;
    private _focusTrap: FocusTrap;

    private _settingsState = {
        textSize: 'A' as 'A' | 'AA' | 'AAA',
        highContrast: false,
        colorFilter: 'none',
        cursorSize: 'small' as 'small' | 'large',
        cursorColor: 'white' as 'white' | 'yellow' | 'black' | 'red'
    };
    public static isTimerEnabled: boolean = true;

    private _uiElements: {
        textBtns: Map<string, HTMLButtonElement>,
        textSizeLabel: HTMLElement | null,
        filterBtns: Map<string, HTMLButtonElement>,
        contrastBtn: HTMLButtonElement | null,
        timerBtn: HTMLButtonElement | null,
        cursorSizeBtns: Map<string, HTMLButtonElement>,
        cursorColorBtns: Map<string, HTMLButtonElement>
    } = { textBtns: new Map(), textSizeLabel: null, filterBtns: new Map(), contrastBtn: null, timerBtn: null, cursorSizeBtns: new Map(), cursorColorBtns: new Map() };

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