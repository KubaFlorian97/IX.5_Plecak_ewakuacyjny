import { Disposable } from "~/nano_core/disposable";
import { dom } from "~/nano_core/dom";
import { log } from "~/nano_core/log";
import { State } from "~/state";
import { Scenario } from "~/types/types";


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
            // this.showIntro();
        }
    }

    private showResumePrompt() {
        log.info("Znaleziono zapisany stan. Wyświetlanie okna kontynuacji...");
        // this.clearView();

        // const prompt = dom('div', { className: 'modal-overlay', role: 'dialog', 'aria-labelledby': "resume-title", 'aria-modal': true },
        //     dom('div', { className: 'modal-window' },
        //         dom('h2', { id: 'resume' })
        //     )
        // )
    }
}