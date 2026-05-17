import { Disposable } from "~/nano_core/disposable";
import { dom } from "~/nano_core/dom";
import { log } from "~/nano_core/log";
import { State } from "~/state";
import { Scenario } from "~/types/types";
import { IntroScreen } from "./ui/intro-screen";
import * as ui from "./ui/ui.css";

export class GameManager extends Disposable {
    private _currentView: any = null;

    constructor(
        private _container: HTMLElement,
        private _state: State,
        private _scenario: Scenario
    ) {
        super();
        log.info("GameManager zainicjalizowany.");
    }

    public start() {
        const currentState = this._state.get();

        if (currentState.collectedItems.length > 0 || currentState.threatId) {
            this.showResumePrompt();
        } else {
            this.showIntro();
        }
    }

    private showResumePrompt() {
        log.info("Znaleziono zapisany stan. Wyświetlanie okna kontynuacji...");
        this.clearView();

        const prompt = dom('div', { className: ui['modal-overlay'], role: 'dialog', 'aria-labelledby': "resume-title", 'aria-modal': true },
            dom('div', { className: ui['modal-window'] },
                dom('h2', { id: ui['resume-title'] }, "Wykryto zapisany stan gry"),
                dom('p', {}, "Czy chcesz kontynuować przerwaną rozgrywkę?"),
                dom('div', { className: ui['modal-actions'] },
                    dom('button', { className: [ ui['btn'], ui['btn-secondary'] ], 'aria-label': 'Nowa gra' }, "Nowa gra"),
                    dom('button', { className: [ ui['btn'], ui['btn-primary'] ], 'aria-label': 'Kontynuuj' }, "Kontynuuj")
                )
            )
        );

        const btns = prompt.querySelectorAll('button');
        btns[0].onclick = () => {
            this._state.reset();
            this.showIntro();
        };
        btns[1].onclick = () => {
            this.resumeGame();
        };

        this._container.appendChild(prompt);
        this._currentView = { dispose: () => prompt.remove() };
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
        this._container.innerHTML = "";
    }
}