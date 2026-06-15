import { t } from "~/utils/localization";
import * as styles from "./top-bar.css";
import * as mainCss from "~/styles/main.css";
import { path } from "@/zpe-port";
import { createButton } from "./button";
import { SoundManager } from "~/utils/sound-manager";
import { AssetLoader } from "~/utils/asset-loader";
import { _gameWrapper } from "~/app";

export class TopBar {
    private _element: HTMLElement;
    private _controlsWrapper!: HTMLElement;

    private _isMenuOpen: boolean = false;
    private _hamburgerBtn!: HTMLElement;

    constructor() {
        this._element = document.createElement("div");
        this._element.className = styles["top-bar"];
        this._element.setAttribute("data-global-focus", "true");

        this.build();
    }

    public getElement() {
        return this._element;
    }

    private build() {
        const title = document.createElement("h2");
        title.className = styles["top-bar-title"];
        title.textContent = t('topbar.title');
        this._element.appendChild(title);

        const controls = document.createElement("div");
        controls.className = styles["top-bar-controls"];

        // Hamburger
        this._hamburgerBtn = document.createElement("button");
        this._hamburgerBtn.className = styles["top-bar-toggle"];
        this._hamburgerBtn.innerHTML = `
            ☰
            <div class="${mainCss["sr-only"]}">${t("topbar.menu_btn")}</div>
        `;
        this._hamburgerBtn.onclick = () => {
            SoundManager.play('click');
            this.toggleMenu(!this._isMenuOpen);
        };
        controls.appendChild(this._hamburgerBtn);

        this._controlsWrapper = document.createElement("div");
        this._controlsWrapper.className = styles["top-bar-controls-wrapper"];
        const btnSound = createButton({
            variant: 'icon',
            srOnly: t("accessibility.topbar.audioMute"),
            onClick: () => {
                const isMuted = SoundManager.getMusicMute() && SoundManager.getSfxMute();
                SoundManager.setGlobalMute(!isMuted);
                if (!!isMuted) {
                    SoundManager.play("click");
                }
            }
        });
        this._controlsWrapper.appendChild(btnSound);

        const btnFs = createButton({
            variant: 'icon',
            srOnly: t('topbar.fullscreen_btn'),
            onClick: () => {
                SoundManager.play('click');
                this._element.dispatchEvent(new CustomEvent('toggle-fullscreen', { bubbles: true }));
            }
        });
        this._controlsWrapper.appendChild(btnFs);

        const btnHelp = createButton({
            onClick: (e: MouseEvent) => {
                e.stopPropagation();
                SoundManager.play('click');
                this._element.dispatchEvent(new CustomEvent('toggle-help', { bubbles: true }));
            },
            variant: 'icon',
            srOnly: t('topbar.help_btn')
        });
        this._controlsWrapper.appendChild(btnHelp);

        const btnSettings = createButton({
            onClick: (e: MouseEvent) => {
                e.stopPropagation();
                SoundManager.play('click');
                this._element.dispatchEvent(new CustomEvent('toggle-settings', { bubbles: true }));
            },
            variant: 'icon',
            srOnly: t('topbar.settings_btn')
        });
        this._controlsWrapper.appendChild(btnSettings);

        const updateIconsUI = () => {
            const isMuted = SoundManager.getMusicMute() && SoundManager.getSfxMute();

            const soundBase = isMuted ? 'images/ui/btn_sound_on.webp' : 'images/ui/btn_sound_off.webp';
            btnSound.style.backgroundImage = `url(${path(AssetLoader.getImagePath(soundBase))})`;

            const fsBase = document.fullscreenElement ? 'images/ui/btn_fullscreen_exit.webp' : 'images/ui/btn_fullscreen.webp';
            btnFs.style.backgroundImage = `url(${path(AssetLoader.getImagePath(fsBase))})`;

            const sr = btnSound.querySelector(`.${mainCss["sr-only"]}`) as HTMLDivElement;
            if (sr) sr.textContent = isMuted ? t("accessibility.topBar.audioUnmute") : t("accessibility.topBar.audioMute");

            btnHelp.style.backgroundImage = `url(${path(AssetLoader.getImagePath('images/ui/btn_help.webp'))})`;
            btnSettings.style.backgroundImage = `url(${path(AssetLoader.getImagePath('images/ui/btn_settings.webp'))})`;
        };

        updateIconsUI();
        SoundManager.subscribe(updateIconsUI);
        _gameWrapper.addEventListener('hc-changed', updateIconsUI);
        _gameWrapper.addEventListener('toggle-fullscreen', updateIconsUI);

        controls.appendChild(this._controlsWrapper);
        this._element.appendChild(controls);
    }

    private toggleMenu(isOpen: boolean) {
        this._isMenuOpen = isOpen;
        if (isOpen) {
            this._controlsWrapper.classList.add(styles["visible"]);
            this._hamburgerBtn.innerHTML = "✕";
            this._hamburgerBtn.classList.add(styles["active"]);
        } else {
            this._controlsWrapper.classList.remove(styles["visible"]);
            this._hamburgerBtn.innerHTML = "☰";
            this._hamburgerBtn.classList.remove(styles["active"]);
        }
    }
}