import * as mainCss from "~/styles/main.css";
import * as styles from "./modals.css";
import * as inputs from "../components/inputs.css";
import { FocusTrap } from "~/utils/focus-trap";
import { t } from "~/utils/localization";
import { SoundManager } from "~/utils/sound-manager";
import { _gameWrapper } from "~/app";
import { createCheckbox } from "../components/checkbox";
import { createButton } from "../components/button";
import { CursorManager } from "~/utils/cursor-manager";
import { AssetLoader } from "~/utils/asset-loader";

const TEXT_SIZES = [
    { id: "A", label: "A", cssClass: null, aria: t('settings.text_100'), btnClass: mainCss["normal"] },
    { id: "AA", label: "AA", cssClass: mainCss["text-size-150"], aria: t('settings.text_150'), btnClass: mainCss["medium"] },
    { id: "AAA", label: "AAA", cssClass: mainCss["text-size-200"], aria: t('settings.text_200'), btnClass: mainCss["large"] }
];

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
    { id: 'small', label: t('settings.cursor_normal') },
    { id: 'large', label: t('settings.cursor_large') }
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
    private _gameplayMode: boolean;

    private _settingsState = {
        textSize: 'A' as 'A' | 'AA' | 'AAA',
        highContrast: false,
        reducedMotion: false,
        timerFreeze: false,
        colorFilter: 'none',
        cursorSize: 'small' as 'small' | 'large',
        cursorColor: 'white' as 'white' | 'yellow' | 'black' | 'red'
    };

    private _uiElements: {
        contrastChk: HTMLInputElement | null,
        motionChk: HTMLInputElement | null,
        timerChk: HTMLInputElement | null,
        textBtns: Map<string, HTMLButtonElement>,
        textSizeLabel: HTMLElement | null,
        filterBtns: Map<string, HTMLButtonElement>,
        cursorSizeBtns: Map<string, HTMLButtonElement>,
        cursorColorBtns: Map<string, HTMLButtonElement>
    } = {
            contrastChk: null,
            motionChk: null,
            timerChk: null,
            textBtns: new Map(),
            textSizeLabel: null,
            filterBtns: new Map(),
            cursorSizeBtns: new Map(),
            cursorColorBtns: new Map()
        };

    // --- ZMIENNE DO AUDIO ---
    private _musicIcon!: HTMLElement;
    private _musicSlider!: HTMLInputElement;
    private _musicLabel!: HTMLElement;
    private _sfxIcon!: HTMLElement;
    private _sfxSlider!: HTMLInputElement;
    private _sfxLabel!: HTMLElement;

    // private _soundListener = () => this.updateAudioVisuals();

    constructor(container: HTMLElement, gameplayMode: boolean = false) {
        this._container = container;
        this._gameplayMode = gameplayMode;

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

        if (this._gameplayMode) {
            _gameWrapper.classList.remove(mainCss["gameplay-mode"]);
        }
    }

    public hide() {
        this._focusTrap.deactivate();
        this._element.style.display = "none";
        if (this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
        _gameWrapper.dispatchEvent(new CustomEvent('modal-toggled', { detail: { isOpen: false } }));
        this._isOpen = false;

        if (this._gameplayMode) {
            _gameWrapper.classList.add(mainCss["gameplay-mode"]);
        }
    }

    private build() {
        // Title
        const modalTitle = document.createElement("h2");
        modalTitle.className = styles["modal-title"];
        modalTitle.textContent = t('settings.title');
        this._modal.appendChild(modalTitle);

        // Content
        const modalContent = document.createElement("div");
        modalContent.className = `${styles["modal-content"]} ${mainCss["scrollable"]}`;
        this._modal.appendChild(modalContent);

        // HC Mode
        const hcRow = this.createCheckboxOption(t('settings.hc_mode'), () => { SoundManager.play("click"); this.setHighContrast(!this._settingsState.highContrast); }, this._settingsState.highContrast);
        this._uiElements.contrastChk = hcRow.input;
        modalContent.appendChild(hcRow.row);

        // Reduced Motion
        const rmRow = this.createCheckboxOption(t('settings.rm_mode'), () => { SoundManager.play("click"); this.setReducedMotion(!this._settingsState.reducedMotion); }, this._settingsState.reducedMotion);
        this._uiElements.motionChk = rmRow.input;
        modalContent.appendChild(rmRow.row);

        // Timer
        const tfRow = this.createCheckboxOption(t('settings.tf_mode'), () => { SoundManager.play('click'); this.setTimeFreeze(!this._settingsState.timerFreeze); }, this._settingsState.timerFreeze);
        this._uiElements.timerChk = tfRow.input;
        modalContent.appendChild(tfRow.row);
        this.addSeparator(modalContent);

        // Text Size
        modalContent.appendChild(this.buildTextSizeSection());
        this.addSeparator(modalContent);

        // Filters
        modalContent.appendChild(this.buildFiltersSection());
        this.addSeparator(modalContent);

        // Cursors
        modalContent.appendChild(this.buildCursorSection());
        this.addSeparator(modalContent);

        // FOOTER
        const modalFooter = document.createElement("div");
        modalFooter.className = styles["modal-footer"];
        this._modal.appendChild(modalFooter);

        const closeBtn = createButton({
            label: t("help.btn_close"),
            className: inputs["btn-secondary"],
            onClick: () => {
                SoundManager.play('click');
                _gameWrapper.dispatchEvent(new CustomEvent('toggle-settings', { bubbles: true }));
            }
        });
        modalFooter.appendChild(closeBtn);

        const resetBtn = createButton({
            label: t('settings.btn_reset'),
            className: inputs["btn-secondary"],
            onClick: () => {
                SoundManager.play('click');
                this.resetSettings();
            }
        });
        modalFooter.appendChild(resetBtn);
    }

    public get isOpen(): boolean {
        return this._isOpen;
    }

    private addSeparator(container: HTMLElement) {
        const hr = document.createElement("hr");
        hr.style.border = "0";
        hr.style.borderTop = "1px solid rgba(255, 255, 255, 0.2)";
        hr.style.margin = "15px 0";
        hr.setAttribute("aria-hidden", "true");
        container.appendChild(hr);
    }

    private createCheckboxOption(
        label: string,
        changeFn: () => void,
        isChecked: boolean,
        srOnly?: string
    ): { input: HTMLInputElement, row: HTMLElement } {
        const chkRow = document.createElement("div");
        chkRow.className = styles["checkbox-row"];

        const chkSpan = document.createElement("span");
        chkSpan.textContent = label;
        chkRow.appendChild(chkSpan);

        const checkbox = createCheckbox({
            srOnly: srOnly ? srOnly : label,
            checked: isChecked,
            changeFn: changeFn
        });
        chkRow.appendChild(checkbox.wrapper);

        return { input: checkbox.input, row: chkRow };
    }

    // CHECKBOX SETTERS

    private setHighContrast(hc: boolean) {
        this._settingsState.highContrast = hc;
        AssetLoader.setHighContrast(hc);

        if (hc) _gameWrapper.setAttribute("data-high-contrast", "true");
        else _gameWrapper.removeAttribute("data-high-contrast");

        _gameWrapper.classList.toggle(mainCss["high-contrast"], hc);
    }

    private setReducedMotion(rm: boolean) {
        this._settingsState.reducedMotion = rm;
        _gameWrapper.classList.toggle(mainCss["reduce-motion"], rm);
    }

    private setTimeFreeze(tf: boolean) {
        this._settingsState.timerFreeze = tf;
        _gameWrapper.classList.toggle(mainCss["timer-freeze"], tf);
    }

    // TEXT SIZE SECTION

    private buildTextSizeSection(): HTMLElement {
        const textSection = document.createElement("div");
        textSection.className = styles["modal-section"];

        const sectionHeader = document.createElement("div");
        sectionHeader.className = styles["modal-section-header"];
        sectionHeader.textContent = t('settings.text_size');
        textSection.appendChild(sectionHeader);

        const sectionContent = document.createElement("div");
        sectionContent.className = styles["section-flex-grid"];
        textSection.appendChild(sectionContent);

        TEXT_SIZES.forEach(size => {
            const active = size.id === this._settingsState.textSize;
            const btn = createButton({
                label: `<span aria-hidden="true">${size.label}</span>`,
                srOnly: `${t('settings.text_size')}: ${size.aria}`,
                ariaPressed: active,
                className: [styles["flex-1"], size.btnClass, active ? inputs["active"] : ""],
                onClick: () => {
                    SoundManager.play("click");
                    this.setTextSize(size);
                }
            });

            this._uiElements.textBtns.set(size.id, btn);
            sectionContent.appendChild(btn);
        });

        return textSection;
    }

    private setTextSize(size: any) {
        this._settingsState.textSize = size.id as 'A' | 'AA' | 'AAA';
        this._uiElements.textBtns.forEach(b => {
            b.classList.remove(inputs["active"]);
            b.ariaPressed = "false";
        });
        _gameWrapper.classList.remove(mainCss["text-size-150"], mainCss["text-size-200"]);
        if (size.cssClass) _gameWrapper.classList.add(size.cssClass);

        this._uiElements.textBtns.get(size.id)?.classList.add(inputs["active"]);
        this._uiElements.textBtns.get(size.id)?.setAttribute("aria-pressed", "true");
    }

    // FILTERS SECTION

    private buildFiltersSection(): HTMLElement {
        const filterSection = document.createElement("div");
        filterSection.className = styles["modal-section"];

        const sectionHeader = document.createElement("div");
        sectionHeader.className = styles["modal-section-header"];
        sectionHeader.textContent = t('settings.filter_title');
        filterSection.appendChild(sectionHeader);

        const sectionContent = document.createElement("div");
        sectionContent.className = `${styles["section-flex-grid"]} ${styles["flex-wrap"]}`;
        filterSection.appendChild(sectionContent);

        FILTERS.forEach(f => {
            const active = f.id === this._settingsState.colorFilter;
            const btn = createButton({
                label: `<span aria-hidden="true">${t('settings.filter_' + f.id)}</span>`,
                srOnly: `${t('settings.filter_title')}: ${t('settings.filter_' + f.id)}`,
                ariaPressed: active,
                className: [inputs["btn-flexible"], active ? inputs["active"] : ""],
                onClick: () => {
                    SoundManager.play("click");
                    this.setColorFilter(f);
                }
            });

            this._uiElements.textBtns.set(f.id, btn);
            sectionContent.appendChild(btn);
        });

        return filterSection;
    }

    private setColorFilter(f: any) {
        this._uiElements.filterBtns.forEach(b => {
            b.classList.remove(inputs["active"]);
            b.ariaPressed = "false";
        });
        if (f.filter) _gameWrapper.style.filter = f.filter;
        else _gameWrapper.style.filter = "";
        this._settingsState.colorFilter = f.id;

        this._uiElements.filterBtns.get(f.id)?.classList.add(inputs["active"]);
        this._uiElements.filterBtns.get(f.id)?.setAttribute("aria-pressed", "true");
    }

    // CURSOR SECTION

    private buildCursorSection(): HTMLElement {
        const cursorSection = document.createElement("div");
        cursorSection.className = styles["modal-section"];

        const sectionHeader = document.createElement("div");
        sectionHeader.className = styles["modal-section-header"];
        sectionHeader.textContent = t('settings.cursor_title');
        cursorSection.appendChild(sectionHeader);

        const sectionContent = document.createElement("div");
        sectionContent.className = styles["section-flex-grid"];
        cursorSection.appendChild(sectionContent);

        // CURSOR SIZE
        const cursorSize = document.createElement("div");
        cursorSize.style.flex = "1";
        sectionContent.appendChild(cursorSize);

        const cursorSizeLabel = document.createElement("div");
        cursorSizeLabel.style.marginBottom = "0.5rem";
        cursorSizeLabel.textContent = t('settings.cursor_size');
        cursorSize.appendChild(cursorSizeLabel);

        const cursorSizeBtns = document.createElement("div");
        cursorSizeBtns.className = styles["filter-grid"];
        cursorSizeBtns.style.marginBottom = "0";
        cursorSize.appendChild(cursorSizeBtns);

        cursorSizes.forEach(size => {
            const active = size.id === this._settingsState.cursorSize;
            const btn = createButton({
                label: `<span aria-hidden="true">${size.label}</span>`,
                srOnly: `${t('settings.cursor_size')}: ${size.label}`,
                ariaPressed: active,
                className: active ? inputs["active"] : "",
                onClick: () => {
                    SoundManager.play('click');
                    this.setCursorSize(size.id as 'small' | 'large');
                }
            });

            this._uiElements.cursorSizeBtns.set(size.id, btn);
            cursorSizeBtns.appendChild(btn);
        });

        // CURSOR COLOR
        const cursorColor = document.createElement("div");
        cursorColor.style.flex = "1";
        sectionContent.appendChild(cursorColor);

        const cursorColorLabel = document.createElement("div");
        cursorColorLabel.style.marginBottom = "0.5rem";
        cursorColorLabel.textContent = t('settings.cursor_color');
        cursorColor.appendChild(cursorColorLabel);

        const cursorColorBtns = document.createElement("div");
        cursorColorBtns.className = styles["cursor-color-picker"];
        cursorColor.appendChild(cursorColorBtns);

        cursorColors.forEach(color => {
            const active = color.id === this._settingsState.cursorColor;
            const btn = createButton({
                variant: 'color',
                srOnly: `${t('settings.cursor_color')}: ${color.label}`,
                ariaPressed: active,
                className: [color.bg, active ? mainCss["active"] : ""],
                onClick: () => {
                    SoundManager.play("click");
                    this.setCursorColor(color.id as 'white' | 'yellow' | 'black' | 'red');
                }
            });

            this._uiElements.cursorColorBtns.set(color.id, btn);
            cursorColorBtns.appendChild(btn);
        });

        return cursorSection;
    }

    private setCursorSize(size: 'small' | 'large') {
        this._settingsState.cursorSize = size;

        this._uiElements.cursorSizeBtns.forEach((btn, key) => {
            if (key === size) {
                btn.classList.add(inputs['active']);
                btn.setAttribute("aria-pressed", "true");
            } else {
                btn.classList.remove(inputs['active']);
                btn.setAttribute("aria-pressed", "false");
            }
        });

        CursorManager.applyCursor(_gameWrapper, this._settingsState.cursorColor, this._settingsState.cursorSize);
    }

    private setCursorColor(color: 'white' | 'yellow' | 'black' | 'red') {
        this._settingsState.cursorColor = color;

        this._uiElements.cursorColorBtns.forEach((btn, key) => {
            if (key === color) {
                btn.classList.add(inputs['active']);
                btn.setAttribute("aria-pressed", "true");
            } else {
                btn.classList.remove(inputs['active']);
                btn.setAttribute("aria-pressed", "false");
            }
        });

        CursorManager.applyCursor(_gameWrapper, this._settingsState.cursorColor, this._settingsState.cursorSize);
    }

    // RESET SETTINGS

    private resetSettings() {
        this.setHighContrast(false);
        this.setReducedMotion(false);
        this.setTimeFreeze(false);
        this.setTextSize(TEXT_SIZES.find(s => s.id === 'A'));
        this.setColorFilter(FILTERS.find(f => f.id === 'none'));
        this.setCursorSize('small');
        this.setCursorColor('white');

        SoundManager.setGlobalMute(false);
        SoundManager.setSfxVolume(1.0);
        SoundManager.setMusicVolume(0.2);
    }
}