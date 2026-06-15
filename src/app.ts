import { loadCss, path, setState } from "@/zpe-port";
import { State } from "./state";
import * as mainCss from "~/styles/main.css";
import { GameState, Scenario } from "./types/types";
import { GameManager } from "./game/game-manager";

export const state = new State();
let _gm: GameManager | null = null;
let _container: HTMLElement;
export let _gameWrapper: HTMLElement;

export function init(container: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
        _container = container;
        console.info("[ZPE Game] Running Game | v0.6.15b");

        state.subscribe((newState) => {
            setState(newState);
        });

        _gameWrapper = document.createElement("div");
        _gameWrapper.className = `${mainCss["game-wrapper"]} game-wrapper`;
        _gameWrapper.tabIndex = -1;
        _gameWrapper.style.outline = "none";
        _gameWrapper.setAttribute("role", "main");
        _gameWrapper.setAttribute("aria-atomic", "false");
        _gameWrapper.setAttribute("lang", "pl");
        _gameWrapper.setAttribute("xml:lang", "pl");

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            _gameWrapper.classList.add(mainCss["reduce-motion"]);
        }
        _container.appendChild(_gameWrapper);

        const version = document.createElement("span");
        version.className = mainCss["version-label"];
        version.textContent = "beta v0.6.15 ツ";
        version.ariaHidden = "true";
        _container.appendChild(version);

        setTimeout(() => {
            _gameWrapper.focus();
        }, 100);

        loadCss('entry.css').then(() => {
            fetch(path("scenario.json"))
                .then(res => res.json())
                .then((sc: Scenario) => {
                    setTimeout(() => {
                        _gm = new GameManager(_gameWrapper, state, sc);
                        resolve();
                    }, 100);
                })
                .catch(err => {
                    console.error("[ZPE Game] Błąd podczas ładowania scenariusza gry: ", err);
                    resolve();
                });
        });
    });
}

export function run(stateData: Record<string, any> | null, isFrozen: boolean): Promise<void> {
    if (_gm) {
        _gm.start(stateData as GameState || {});
        console.info("[ZPE Game] Run");
    }
    return Promise.resolve();
}

export function unload(): Promise<void> {
    _gm?.dispose();
    console.info("[ZPE Game] Unload");
    return Promise.resolve();
}

export function destroy(): void {
    _gm = null;
    _gameWrapper.remove();
    console.info("[ZPE Game] Destroy");
}

export function getState(): Record<string, any> {
    return state.get();
}