import { t } from "~/utils/localization";
import * as styles from "./intro-page.css";
import * as buttons from "../components/button.css";
import { createButton } from "../components/button";
import { SoundManager } from "~/utils/sound-manager";

export class IntroPage {
    private _container: HTMLElement;
    private _element: HTMLElement;
    private _hasSavedGame: boolean;

    constructor(container: HTMLElement, hasSavedGame: boolean) {
        this._container = container;
        this._hasSavedGame = hasSavedGame;

        this._element = document.createElement("div");
        this._element.className = styles["intro-page"];

        this.render();
    }

    public show() {
        this._container.appendChild(this._element);
    }

    public hide() {
        if (this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
    }

    private render() {
        const modal = document.createElement("div");
        modal.className = styles["intro-modal"];

        const readingWrapper = document.createElement("div");
        readingWrapper.className = styles["reading-wrapper"];

        const title = document.createElement("h1");
        title.className = styles["intro-title"];
        title.textContent = t('intro.resume_title');
        readingWrapper.appendChild(title);

        const alertBox = document.createElement("div");
        alertBox.className = styles["alert-box"];
        alertBox.textContent = t('intro.resume_intro');
        readingWrapper.appendChild(alertBox);

        const gameTarget = document.createElement("p");
        gameTarget.className = styles["target-box"];
        gameTarget.innerHTML = `<strong>${t('intro.resume_taskLbl')}</strong> ${t('intro.resume_task')}`;
        readingWrapper.appendChild(gameTarget);

        const actionsContainer = document.createElement("div");
        actionsContainer.className = styles["actions-container"];

        const btnNewGame = createButton({
            label: t('intro.btn_new'),
            className: buttons["btn-finish"],
            onClick: () => {
                SoundManager.play('click');
                this._element.dispatchEvent(new CustomEvent('new-game', { bubbles: true }));
            }
        });
        actionsContainer.appendChild(btnNewGame);

        if (this._hasSavedGame) {
            const btnResumeGame = createButton({
                label: t('intro.btn_resume'),
                onClick: () => {
                    SoundManager.play('click');
                    this._element.dispatchEvent(new CustomEvent('resume-game', { bubbles: true }));
                }
            });
            actionsContainer.appendChild(btnResumeGame);
        }

        readingWrapper.appendChild(actionsContainer);
        modal.appendChild(readingWrapper);
        this._element.appendChild(modal);
    }
}