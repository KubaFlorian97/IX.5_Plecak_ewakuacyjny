import { Disposable } from "~/nano_core/disposable";
import { dom } from "~/nano_core/dom";
import { log } from "~/nano_core/log";
import { State } from "~/state";
import { Scenario } from "~/types/types";
import { IntroScreen } from "./ui/intro-screen";
import * as ui from "./ui/ui.css";
import { t } from "~/utils/localization";
import { Modal } from "./ui/components/modal";
import { createButton } from "./ui/components/button";
import { TopBar } from "./ui/top-bar";
import { soundManager } from "~/utils/sound-manager";
import { createHelpModal } from "./ui/help-modal";
import { SettingsModal } from "./ui/settings-modal";

export class GameManager extends Disposable {
    private _currentView: any = null;
    private _currentModal: any = null;
    private _topBar: TopBar;

    constructor(
        private _container: HTMLElement,
        private _state: State,
        private _scenario: Scenario
    ) {
        super();
        log.info("GameManager zainicjalizowany.");

        this._topBar = this._register(new TopBar(this._container, {
            onSettings: () => this.showSettings(),
            onHelp: () => this.showHelp(),
            onSoundToggle: () => {
                soundManager.toggleSfxMute();
                soundManager.toggleMusicMute();
            }
        }));
    }

    public start() {
        const currentState = this._state.get();
        soundManager.setupAutoplayUnlock();
        this._topBar.render();

        if (currentState.collectedItems.length > 0 || currentState.threatId) {
            this.showResumePrompt();
        } else {
            this.showIntro();
        }
    }

    private showResumePrompt() {
        log.info("Znaleziono zapisany stan. Wyświetlanie okna kontynuacji...");
        this.clearView();

        const prompt = this._register(new Modal({
            title: t('intro.resume_title'),
            description: t('intro.resume_text'),
            actions: [
                createButton({
                    label: t('intro.btn_new'),
                    variant: 'secondary',
                    onClick: () => { this._state.reset(); this.showIntro(); }
                }),
                createButton({
                    label: t('intro.btn_resume'),
                    variant: 'primary',
                    onClick: () => { this.resumeGame(); }
                })
            ]
        }));

        this._container.appendChild(prompt.element);
        prompt.render();
        this._currentView = prompt;
    }

    private showIntro() {
        log.info("Uruchamiam Ekran Startowy...");
        this.clearView();
        
        this._currentView = this._register(new IntroScreen(
            this._container,
            this._scenario,
            (difficultyId, threatId) => {
                this.startGame(difficultyId, threatId);
            }
        ));

        this._currentView.render();
    }

    private resumeGame() {
        log.success("Wznawianie gry z zapisanego stanu...");
        this.clearView();
        // TODO: GameScene
    }

    private startGame(difficultyId: string, threatId: string) {
        log.success(`Rozpoczęto nową grę. Zagrożenie: ${threatId}, Poziom: ${difficultyId}`);
        this._state.set({ threatId, difficultyId });

        this.clearView();
        // TODO: GameScene
    }

    private clearView() {
        if (this._currentView) {
            this._currentView.dispose();
            this._currentView = null;
        }
        this.clearModal();
    }

    // Modals
    private showHelp() {
        this.clearModal();
        soundManager.play('click');

        const helpModal = createHelpModal(() => this.clearModal());

        this._container.appendChild(helpModal.element);
        helpModal.render();
        this._currentModal = helpModal;
    }

    private showSettings() {
        this.clearModal();
        soundManager.play('click');

        const settingsModal = new SettingsModal(() => this.clearModal());

        this._container.appendChild(settingsModal.element);
        settingsModal.render();
        this._currentModal = settingsModal;
    }

    private clearModal() {
        if (this._currentModal) {
            this._currentModal.dispose();
            this._currentModal = null;
        }
    }
}