import { getData, loadCss, path } from "@/zpe-port";
import * as styles from "./styles/main.css";
import { state } from "./state";
import { Scenario } from "./types/types";
import { dom } from "./nano_core/dom";
import { log } from "./nano_core/log";
import { GameManager } from "./game/game-manager";

let _gm: GameManager | null;
export let _gameWrapper: HTMLElement;

export function init(container: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
        container.innerHTML = "";

        const landscapeOverlay = dom('div', { className: styles['landscape-overlay'], 'aria-hidden': true },
            dom('div', { className: styles['landscape-icon'] }, "📱"), 
            dom('h2', { style: 'margin: 0 0 1rem 0; color: var(--c-secondary);' }, "Obróć urządzenie"),
            dom('p', { style: 'margin: 0;' }, "Aby gra działała poprawnie, prosimy o obrócenie urządzenia do poziomu.")
        );

        // Wrapper init
        _gameWrapper = dom('div', {
            className: styles["game-wrapper"],
            role: "application",
            "aria-label": "Gra Plecak Ewakuacyjny"
        });
        _gameWrapper.appendChild(landscapeOverlay)
        container.appendChild(_gameWrapper);

        loadCss("entry.css").then(() => {
            fetch(path("scenario.json"))
                .then(response => response.json())
                .then((scenario: Scenario) => {
                    _gm = new GameManager(_gameWrapper, state, scenario);
                    resolve();
                })
                .catch(err => {
                    log.error("Błąd ładowania scenariusza gry: ", err);
                    resolve();
                });
        });
    });
}

export function run(stateData: Record<string, any> | null, isFrozen: boolean): Promise<void> {
    if (stateData && Object.keys(stateData).length > 0) {
        log.info("Przywracanie stanu gry...", stateData);
        state.set(stateData as any);
    }
    if (_gm) _gm.start();
    return Promise.resolve();
}

export function unload(): Promise<void> {
    if (_gm) {
        log.info("Zwalnianie zasobów...");
        _gm.dispose();
        _gm = null;
    }
    return Promise.resolve();
}

export function destroy(): Promise<void> {
    unload();
    if (_gameWrapper) _gameWrapper.remove();
    log.success("Aplikacja została zniszczona poprawnie.");
    return Promise.resolve();
}