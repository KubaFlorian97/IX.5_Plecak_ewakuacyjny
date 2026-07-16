import { loadCss, path, setState } from "@/zpe-port";
import { GameManager } from "./game/game-manager";
import { State } from "./state";
import { AssetLoader } from "./utils/asset-loader";
import { GameState, Scenario } from "./types/types";

import * as styles from "./style/style.css";

export const state = new State();
let _gm: GameManager | null = null;
let _container: HTMLElement;
export let _gameWrapper: HTMLElement;

export function init(container: HTMLElement): Promise<void> {
    let verNum = "0.7.16";
    return new Promise((resolve) => {
        _container = container;
        console.info(`[ZPE Game] Running Game | v${verNum}b`);

        state.subscribe((newState) => {
            setState(newState);
        });

        _gameWrapper = document.createElement("div");
        _gameWrapper.className = `${styles["game-wrapper"]} game-wrapper`;
        _gameWrapper.tabIndex = -1;
        _gameWrapper.style.outline = "none";
        _gameWrapper.setAttribute("role", "application");
        _gameWrapper.setAttribute("aria-atomic", "false");
        _gameWrapper.setAttribute("lang", "pl");
        _gameWrapper.setAttribute("xml:lang", "pl");

        new ResizeObserver(() => {
            _gameWrapper.style.setProperty("--app-scale", `${_gameWrapper.clientHeight / 896}`);
        }).observe(_gameWrapper);

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            _gameWrapper.classList.add(styles["reduce-motion"]);
        }
        _container.appendChild(_gameWrapper);

        const version = document.createElement("span");
        version.className = styles["version-label"];
        version.textContent = `makieta v${verNum} ツ`;
        version.ariaHidden = "true";
        _container.appendChild(version);

        setTimeout(() => {
            _gameWrapper.focus();
        }, 100);

        const loader = document.createElement("div");
        loader.className = styles["loader"];
        const loaderText = document.createElement("div");
        loaderText.className = styles["loader-text"];
        loaderText.textContent = "Ładowanie... 0%";
        loader.appendChild(loaderText);
        _gameWrapper.appendChild(loader);

        loadCss('entry.css').then(() => {
            return AssetLoader.preloadAll((percent) => {
                loaderText.textContent = `Ładowanie... ${Math.round(percent)}%`;
            });
        }).then(() => {
            return fetch(path("scenario.json"));
        }).then(res => res.json())
          .then((sc: Scenario) => {
              setTimeout(() => {
                  loader.remove();
                  _gm = new GameManager(_gameWrapper, state, sc);
                  resolve();
              }, 100);
          })
          .catch(err => {
              console.error("[ZPE Game] Błąd podczas ładowania: ", err);
              resolve();
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