// src/game/ui/settings-modal.ts
import { Disposable } from "~/nano_core/disposable";
import { dom } from "~/nano_core/dom";
import { t } from "~/utils/localization";
import { Modal } from "./components/modal";
import { createButton } from "./components/button";
import { soundManager } from "~/utils/sound-manager";
import { _gameWrapper } from "~/app";
import { _settingsState } from "~/game/game-manager";
import * as ui from "./ui.css";
import * as styles from "~/styles/main.css";
import { CursorManager } from "~/utils/cursor-manager";

const FILTERS = [
    { id: 'none', name: 'Brak', filter: 'none' },
    { id: 'grayscale', name: 'Skala szarości', filter: `grayscale(100%)` },
    { id: 'sepia', name: 'Sepia', filter: `sepia(100%)` },
    { id: 'invert', name: 'Odwrócenie', filter: `invert(100%)` },
    { id: 'protanopia', name: 'Protanopia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="p"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/></filter></svg>#p')` },
    { id: 'deuteranopia', name: 'Deuteranopia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="d"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/></filter></svg>#d')` },
    { id: 'tritanopia', name: 'Tritanopia', filter: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="t"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/></filter></svg>#t')` }
];

const TEXT_SIZES = [
    { id: "A", label: "A", cssClass: null },
    { id: "AA", label: "AA", cssClass: styles['text-size-150'] },
    { id: "AAA", label: "AAA", cssClass: styles['text-size-200'] }
];

const cursorSizes = [
    { id: 'small', label: t('settings.cursor_normal') },
    { id: 'large', label: t('settings.cursor_large') }
];

const cursorColors = [
    { id: 'white', bg: styles["bg-white"], label: t('settings.cursorColor.white') },
    { id: 'yellow', bg: styles["bg-yellow"], label: t('settings.cursorColor.yellow') },
    { id: 'black', bg: styles["bg-black"], label: t('settings.cursorColor.black') },
    { id: 'red', bg: styles["bg-red"], label: t('settings.cursorColor.red') }
];

export class SettingsModal extends Disposable {
    private _modal: Modal;
    private _contentWrapper: HTMLElement;

    private _uiElements: {
        textBtns: Map<string, HTMLButtonElement> | null,
        contrastBtn: HTMLButtonElement | null,
        motionBtn: HTMLButtonElement | null,
        timeBtn: HTMLButtonElement | null,
        filterBtns: Map<string, HTMLButtonElement> | null,
        cursorSizeBtns: Map<string, HTMLButtonElement> | null,
        cursorColorBtns: Map<string, HTMLButtonElement> | null,
        sfxVolLbl: HTMLSpanElement | null,
        musicVolLbl: HTMLSpanElement | null
    } = {
        textBtns: new Map(),
        contrastBtn: null,
        motionBtn: null,
        timeBtn: null,
        filterBtns: new Map(),
        cursorSizeBtns: new Map(),
        cursorColorBtns: new Map,
        sfxVolLbl: null,
        musicVolLbl: null
    };

    constructor(private _onClose: () => void) {
        super();
        this._contentWrapper = dom('div', { className: ui['settings-content'] });

        this._modal = this._register(new Modal({
            title: t('settings.title'),
            content: this._contentWrapper,
            actions: createButton({
                label: t('help.btn_close'),
                variant: 'primary',
                onClick: () => {
                    soundManager.play('click');
                    this._onClose();
                }
            })
        }));

        this.updateView(); // Generujemy treść przycisku za pierwszym razem
    }

    public get element() { return this._modal.element; }
    public render() { this._modal.render(); }

    private updateView() {
        this._contentWrapper.innerHTML = "";
        this._contentWrapper.append(
            this.buildAccessibilitySection(),
            this.buildFiltersSection(),
            this.buildAudioSection()
        );
    }

    private buildAccessibilitySection() {
        // 1. Wielkość tekstu
        const sizeBtns = TEXT_SIZES.map(s => {
            const isActive = s.id === _settingsState.textSize;
            const btn = createButton({
                label: s.label,
                variant: 'secondary',
                className: [ isActive ? ui['btn-active'] : '', s.id === 'AAA' ? ui['text-size-200'] : (s.id === 'AA' ? ui['text-size-150'] : ui['text-size-100'])],
                onClick: () => {
                    this.setTextSize(s.id as 'A' | 'AA' | 'AAA', s.cssClass);
                    soundManager.play('click');
                }
            });
            this._uiElements.textBtns?.set(s.id, btn);

            return btn;
        });

        const createToggleRow = (btn: HTMLButtonElement, label: string) => {
            return dom('div', { className: ui['toggle-btn-row'] },
                dom('span', { className: ui['toggle-btn-label'] }, label),
                dom('div', { className: ui['toggle-wrapper'] },
                    btn
                )
            );
        };

        const hcBtn = dom('button', { className: [ ui['btn'], ui['btn-secondary'], ui['settings-btn'], ui['toggle-btn'] ] },
            _settingsState.highContrast ? "WŁ" : "WYŁ"
        );
        hcBtn.onclick = () => {
            _settingsState.highContrast = !_settingsState.highContrast;
            this.setHighContrast(_settingsState.highContrast);
            soundManager.play('click');
        };
        this._uiElements.contrastBtn = hcBtn;

        const rmBtn = dom('button', { className: [ ui['btn'], ui['btn-secondary'], ui['settings-btn'], ui['toggle-btn'] ] },
            _settingsState.reduceMotion ? "WŁ" : "WYŁ"
        );
        rmBtn.onclick = () => {
            _settingsState.reduceMotion = !_settingsState.reduceMotion;
            this.setReduceMotion(_settingsState.reduceMotion);
            soundManager.play('click');
        };
        this._uiElements.motionBtn = rmBtn;

        const tfBtn = dom('button', { className: [ ui['btn'], ui['btn-secondary'], ui['settings-btn'], ui['toggle-btn'] ] },
            _settingsState.timeFreeze ? "WŁ" : "WYŁ"
        );
        tfBtn.onclick = () => {
            _settingsState.timeFreeze = !_settingsState.timeFreeze;
            this.setTimeFreeze(_settingsState.timeFreeze);
            soundManager.play('click');
        };
        this._uiElements.timeBtn = tfBtn;

        return dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "Dostępność"),
            dom('div', { className: ui['btn-group'] }, ...sizeBtns),
            dom('div', { className: ui['btn-group-vertical'] },
                createToggleRow(hcBtn, t('settings.hc_mode')),
                createToggleRow(rmBtn, t('settings.rm_mode')),
                createToggleRow(tfBtn, t('settings.tf_mode'))
            )
        );
    }

    private buildFiltersSection() {
        // 5. Filtry kolorów
        const filterBtns = FILTERS.map(f => {
            const isActive = _settingsState.colorFilter === f.id;
            const btn = createButton({
                label: f.name,
                variant: 'secondary',
                className: [ isActive ? ui['btn-active'] : '' ],
                onClick: () => {
                    this.setFilter(f.id);
                    soundManager.play('click');
                }
            });
            this._uiElements.filterBtns?.set(f.id, btn);
            return btn;
        });
        const cursorSizeBtns = cursorSizes.map(s => {
            const isActive = _settingsState.cursorSize === s.id;
            const btn = createButton({
                label: s.label,
                variant: 'secondary',
                className: isActive ? ui['btn-active'] : '',
                onClick: () => {
                    this.setCursorSize(s.id as 'small' | 'large');
                    soundManager.play('click');
                }
            });
            this._uiElements.cursorSizeBtns?.set(s.id, btn);
            return btn;
        });
        const cursorColorBtns = cursorColors.map(c => {
            const isActive = _settingsState.cursorColor === c.id;
            const btn = dom('button', { className: [ ui['color-btn'], ui[`bg-${c.id}`], isActive ? ui['btn-active'] : '' ] });
            btn.onclick = () => {
                this.setCursorColor(c.id as 'white' | 'yellow' | 'black' | 'red');
                soundManager.play('click');
            };
            this._uiElements.cursorColorBtns?.set(c.id, btn);
            return btn;
        });

        return dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "Filtry kolorów"),
            dom('div', { className: ui['filter-grid'] }, ...filterBtns)
        ),
        dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "KURSOR"),
            dom('div', { className: ui['settings-cursor-row'] },
                dom('div', { style: 'flex: 1 1 0%;' }, 
                    dom('div', { style: 'margin-bottom: 8px;' }, "Rozmiar kursora"),
                    dom('div', { className: ui['cursor-grid'] }, ...cursorSizeBtns)
                ),
                dom('div', { style: 'flex: 1 1 0%;' },
                    dom('div', { style: 'margin-bottom: 8px;' }, "Kolor kursora"),
                    dom('div', { className: ui['cursor-color-grid'] }, ...cursorColorBtns)
                )
            )
        );
    }

    private buildAudioSection() {
        const sfxVolLabel = dom('span', { style: 'width: 75px; text-align: right;' }, `${Math.round(_settingsState.sfxVolume * 100)}%`);
        this._uiElements.sfxVolLbl = sfxVolLabel;
        const sfxSlider = dom('input', {
            type: 'range', min: '0', max: '100', step: 1,
            value: (_settingsState.sfxVolume * 100).toString(),
            className: ui['slider'],
            oninput: (e: Event) => {
                const val = parseInt((e.target as HTMLInputElement).value);
                this.setSfxVolume(val / 100);
            },
            onmouseup: () => { soundManager.play('click'); }
        });

        const musicVolLabel = dom('span', { style: 'width: 75px; text-align: right;' }, `${Math.round(_settingsState.musicVolume * 100)}%`);
        this._uiElements.musicVolLbl = musicVolLabel;
        const musicSlider = dom('input', {
            type: 'range', min: '0', max: '100', step: 1,
            value: (_settingsState.musicVolume * 100).toString(),
            className: ui['slider'],
            oninput: (e: Event) => {
                const val = parseInt((e.target as HTMLInputElement).value);
                this.setMusicVolume(val / 100);
            },
            onmouseup: () => { soundManager.play('click'); }
        });

        return dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "Dźwięk"),
            dom('div', { className: ui['slider-row'] },
                dom('span', { style: 'width: 110px; font-weight: bold;' }, "SFX"),
                sfxSlider,
                sfxVolLabel
            ),
            dom('div', { className: ui['slider-row'] },
                dom('span', { style: 'width: 110px; font-weight: bold;' }, "Muzyka"),
                musicSlider,
                musicVolLabel
            )
        );
    }

    // Setters
    private setTextSize(size: 'A' | 'AA' | 'AAA', cls: string | null) {
        _settingsState.textSize = size;
        _gameWrapper.classList.remove(styles['text-size-150'], styles['text-size-200']);
        if (cls) _gameWrapper.classList.add(cls);
        this._uiElements.textBtns?.forEach(btn => btn.classList.remove(ui['btn-active']));
        this._uiElements.textBtns?.get(size)?.classList.add(ui['btn-active']);
    }

    private setHighContrast(hcMode: boolean) {
        _settingsState.highContrast = hcMode;
        _gameWrapper.classList.toggle(styles['high-contrast'], hcMode);
        this._uiElements.contrastBtn?.classList.toggle(ui['btn-active'], hcMode);
        this._uiElements.contrastBtn!.textContent = hcMode ? "WŁ" : "WYŁ";
    }

    private setReduceMotion(rmMode: boolean) {
        _settingsState.reduceMotion = rmMode;
        _gameWrapper.classList.toggle(styles['reduce-motion'], rmMode);
        this._uiElements.motionBtn?.classList.toggle(ui['btn-active'], rmMode);
        this._uiElements.motionBtn!.textContent = rmMode ? "WŁ" : "WYŁ";
    }

    private setTimeFreeze(tfMode: boolean) {
        _settingsState.timeFreeze = tfMode;
        _gameWrapper.classList.toggle(styles['time-freeze'], tfMode);
        this._uiElements.timeBtn?.classList.toggle(ui['btn-active'], tfMode);
        this._uiElements.timeBtn!.textContent = tfMode ? "WŁ" : "WYŁ";
    }

    private setFilter(filterId: string) {
        _settingsState.colorFilter = filterId;
        const filter = FILTERS.find(f => f.id === filterId)?.filter || 'none';
        _gameWrapper.style.filter = filter;
        this._uiElements.filterBtns?.forEach(btn => btn.classList.remove(ui['btn-active']));
        this._uiElements.filterBtns?.get(filterId)?.classList.add(ui['btn-active']);
    }

    private setCursorSize(size: 'small' | 'large') {
        _settingsState.cursorSize = size;
        this._uiElements.cursorSizeBtns?.forEach(btn => btn.classList.remove(ui['btn-active']));
        this._uiElements.cursorSizeBtns?.get(size)?.classList.add(ui['btn-active']);
        CursorManager.applyCursor(_gameWrapper, _settingsState.cursorColor, size);
    }

    private setCursorColor(color: 'white' | 'yellow' | 'black' | 'red') {
        _settingsState.cursorColor = color;
        this._uiElements.cursorColorBtns?.forEach(btn => btn.classList.remove(ui['btn-active']));
        this._uiElements.cursorColorBtns?.get(color)?.classList.add(ui['btn-active']);
        CursorManager.applyCursor(_gameWrapper, color, _settingsState.cursorSize);
    }

    private setSfxVolume(volume: number) {
        _settingsState.sfxVolume = volume;
        soundManager.setSfxVolume(volume);
        this._uiElements.sfxVolLbl!.textContent = `${Math.round(volume * 100)}%`;
    }

    private setMusicVolume(volume: number) {
        _settingsState.musicVolume = volume;
        soundManager.setMusicVolume(volume);
        this._uiElements.musicVolLbl!.textContent = `${Math.round(volume * 100)}%`;
    }
}