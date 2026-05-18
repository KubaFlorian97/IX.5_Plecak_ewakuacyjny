// src/game/ui/settings-modal.ts
import { Disposable } from "~/nano_core/disposable";
import { dom } from "~/nano_core/dom";
import { t } from "~/utils/localization";
import { Modal } from "./components/modal";
import { createButton } from "./components/button";
import { soundManager } from "~/utils/sound-manager";
import { _gameWrapper } from "~/app";
import * as ui from "./ui.css";
import * as styles from "~/styles/main.css";

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

export class SettingsModal extends Disposable {
    private _modal: Modal;
    private _contentWrapper: HTMLElement;

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
            const isActive = s.cssClass ? _gameWrapper.classList.contains(s.cssClass) : 
                (!_gameWrapper.classList.contains(styles['text-size-150']) && !_gameWrapper.classList.contains(styles['text-size-200']));
            
            return createButton({
                label: s.label,
                variant: isActive ? 'primary' : 'secondary',
                onClick: () => {
                    _gameWrapper.classList.remove(styles['text-size-150'], styles['text-size-200']);
                    if (s.cssClass) _gameWrapper.classList.add(s.cssClass);
                    soundManager.play('click');
                    this.updateView();
                }
            });
        });

        // 2, 3, 4. Przełączniki (Kontrast, Animacje, Czas)
        const buildToggle = (label: string, className: string) => {
            const isActive = _gameWrapper.classList.contains(className);
            return createButton({
                label: `${label}: ${isActive ? 'WŁ' : 'WYŁ'}`,
                variant: isActive ? 'primary' : 'secondary',
                onClick: () => {
                    _gameWrapper.classList.toggle(className);
                    soundManager.play('click');
                    this.updateView();
                }
            });
        };

        return dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "Dostępność"),
            dom('div', { className: ui['btn-group'] }, ...sizeBtns),
            dom('div', { className: ui['btn-group-vertical'] },
                buildToggle("Wysoki kontrast", styles['high-contrast']),
                buildToggle("Redukcja animacji", styles['reduce-motion']),
                buildToggle("Zatrzymanie czasu", styles['time-freeze']) // Zatrzymanie czasu dodane!
            )
        );
    }

    private buildFiltersSection() {
        const currentFilter = _gameWrapper.style.filter || 'none';
        
        // 5. Filtry kolorów
        const filterBtns = FILTERS.map(f => {
            const isActive = currentFilter === f.filter;
            return createButton({
                label: f.name,
                variant: isActive ? 'active' : 'secondary',
                onClick: () => {
                    _gameWrapper.style.filter = f.filter;
                    soundManager.play('click');
                    this.updateView();
                }
            });
        });

        return dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "Filtry kolorów"),
            dom('div', { className: ui['filter-grid'] }, ...filterBtns)
        );
    }

    private buildAudioSection() {
        // 6. Suwaki Głośności
        const createSlider = (label: string, value: number, onChange: (val: number) => void) => {
            const slider = dom('input', {
                type: 'range', min: '0', max: '100', step: 1,
                value: (value * 100).toString(),
                className: ui['slider'],
                oninput: (e: Event) => {
                    const val = parseInt((e.target as HTMLInputElement).value, 10) / 100;
                    onChange(val);
                }
            });
            
            return dom('div', { className: ui['slider-row'] },
                dom('span', { style: 'width: 80px; font-weight: bold;' }, label),
                slider,
                dom('span', { style: 'width: 40px; text-align: right;' }, `${Math.round(value * 100)}%`)
            );
        };

        return dom('div', { className: ui['settings-section'] },
            dom('h3', {}, "Dźwięk"),
            createSlider("SFX", soundManager.sfxVolume, (val) => {
                soundManager.setSfxVolume(val);
                this.updateView(); // Przerenderuj, aby zaktualizować "%" po prawej
            }),
            createSlider("Muzyka", soundManager.musicVolume, (val) => {
                soundManager.setMusicVolume(val);
                this.updateView();
            })
        );
    }
}