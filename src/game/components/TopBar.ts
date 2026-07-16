import * as global from "~/style/style.css";
import * as styles from "./components.css";
import { t } from "~/utils/localization";
import { createButton } from "./Button";
import { path } from "@/zpe-port";
import { SoundManager } from "~/utils/sound-manager";
import { AssetLoader } from "~/utils/asset-loader";
import { _gameWrapper } from "~/app";

export class TopBar {
    private _element: HTMLElement;

    constructor() {
        this._element = document.createElement("div");
        this._element.className = styles["top-bar"];
        this._element.setAttribute("data-global-focus", "true");
        this.build();
    }

    public getElement() {
        this._element;
    }

    private build() {
        const title = document.createElement("div");
        title.className = styles["center"];
        
    }
}