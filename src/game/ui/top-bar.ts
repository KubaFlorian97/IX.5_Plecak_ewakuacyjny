import { Component } from "~/nano_core/component";
import { dom } from "~/nano_core/dom";
import { addDisposableListener } from "~/nano_core/events";
import { t } from "~/utils/localization";
import { path } from "@/zpe-port";
import * as ui from "./ui.css";
import { _gameWrapper } from "~/app";
import { soundManager } from "~/utils/sound-manager";

export interface TopBarProps {
    onSettings: () => void;
    onHelp: () => void;
    onSoundToggle: (isMuted: boolean) => void;
}

export class TopBar extends Component {
    private _fsBtn!: HTMLButtonElement;
    private _soundBtn!: HTMLButtonElement;
    private _menuContainer!: HTMLElement;

    private _isMenuOpen: boolean = false;
    private _isMuted: boolean = false;

    constructor(
        container: HTMLElement,
        private _props: TopBarProps
    ) {
        super(dom('header', {
            className: ui['top-bar'],
            'data-global-focus': "true"
        }));
        container.appendChild(this.element);

        this._register(soundManager.onStateChanged.event(() => {
            this.updateSoundIcon();
        }));
    }

    public render() {
        this.element.innerHTML = "";

        // Hamburger
        const menuBtn = dom('button', {
            className: [ ui['icon-btn'], ui['menu-toggle-btn'] ],
            'aria-label': t('topbar.menu_btn'),
            'aria-expanded': this._isMenuOpen,
            onclick: (e: MouseEvent) => {
                e.stopPropagation();
                this.toggleMenu();
            }
        }, dom('span', { className: ui['menu-icon'] }, "☰"));

        this._menuContainer = dom('nav', {
            className: [ ui['top-bar-nav'], this._isMenuOpen && ui['nav-open'] ]
        });

        // Help
        const helpBtn = dom('button', {
            className: ui['icon-btn'],
            'aria-label': t('topbar.help_btn'),
            style: `background-image: url(${path('images/ui/btn_help.webp')})`,
            onclick: this._props.onHelp
        });

        // Settings
        const settingsBtn = dom('button', {
            className: ui['icon-btn'],
            'aria-label': t('topbar.settings_btn'),
            style: `background-image: url(${path('images/ui/btn_settings.webp')})`,
            onclick: this._props.onSettings
        });

        // Sound
        this._soundBtn = dom('button', {
            className: ui['icon-btn'],
            'aria-label': t('topbar.sound_mute_btn'),
            style: `background-image: url(${path('images/ui/icon_sound_off.webp')})`,
            onclick: () => {
                soundManager.toggleSfxMute();
                soundManager.toggleMusicMute();
            }
        });
        this.updateSoundIcon();

        // Fullscreen
        this._fsBtn = dom('button', {
            className: ui['icon-btn'],
            'aria-label': t('topbar.fullscreen_btn'),
            style: `background-image: url(${path('images/ui/btn_fullscreen.webp')})`,
            onclick: () => this.toggleFullscreen()
        });

        this._menuContainer.append(this._fsBtn, this._soundBtn, helpBtn, settingsBtn);
        this.element.append(menuBtn, this._menuContainer);
    
        // Listeners
        this._register(addDisposableListener(_gameWrapper, 'fullscreenchange', () => this.updateFullscreenIcon()));

        this._register(addDisposableListener(_gameWrapper, 'click', (e: Event) => {
            const target = e.target as HTMLElement;
            if (this._isMenuOpen && !this.element.contains(target)) {
                this.toggleMenu(false);
            }
        }));
    }

    private toggleMenu(force?: boolean) {
        this._isMenuOpen = force !== undefined ? force : !this._isMenuOpen;
        this.render();
    }

    private toggleFullscreen() {
        if (!document.fullscreenElement) {
            _gameWrapper.requestFullscreen?.().catch(() => this.togglePseudoFullscreen(_gameWrapper));
        } else {
            document.exitFullscreen?.();
        }
    }

    private togglePseudoFullscreen(wrapper: HTMLElement) {
        wrapper.classList.toggle(ui['pseudo-fullscreen']);
        _gameWrapper.dispatchEvent(new Event('resize'));
        this.updateFullscreenIcon();
    }

    private updateFullscreenIcon() {
        const isFullScreen = !!document.fullscreenElement || _gameWrapper.classList.contains(ui['pseudo-fullscreen']);
        this._fsBtn.style.backgroundImage = `url(${path(isFullScreen ? 'images/ui/btn_fullscreen_exit.webp' : 'images/ui/btn_fullscreen.webp')})`;
    }

    private updateSoundIcon() {
        if (!this._soundBtn) return;
        const isMuted = soundManager.sfxMuted;
        this._soundBtn.style.backgroundImage = `url(${path(isMuted ? 'images/ui/icon_sound_off.webp' : 'images/ui/icon_sound_on.webp')})`;
    }
}