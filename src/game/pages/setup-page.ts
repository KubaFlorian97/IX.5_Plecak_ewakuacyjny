import * as styles from "./setup-page.css";
import { Difficulty, Scenario, Threat } from "~/types/types";
import { FocusTrap } from "~/utils/focus-trap";
import { t } from "~/utils/localization";

export class SetupPage {
    private _container: HTMLElement;
    private _scenario: Scenario;
    private _element: HTMLElement;
    private _modal: HTMLElement;

    private _focusTrap: FocusTrap;

    private _selThreat?: Threat;
    private _selDiff?: Difficulty;
    private _isCrisis: boolean = false;
    private _isCustom: boolean = false;

    private _threatIcon: Record<string, string> = {
        flood: "images/icons/icon_flood.webp",
        fire: "images/icons/icon_fire.webp",
        contamination: "images/icons/icon_contamination.webp",
        uxo: "images/icons/icon_uxo.webp",
        crisis: "images/icons/icon_crisis.webp"
    };

    private _diffIcon: Record<string, string> = {
        easy: "images/icons/icon_easy.webp",
        hard: "images/icons/icon_hard.webp",
        extreme: "images/icons/icon_extreme.webp",
        hardcore: "images/icons/icon_hardcore.webp",
        custom: "images/icons/icon_custom.webp"
    };

    constructor(container: HTMLElement, scenario: Scenario) {
        this._container = container;
        this._scenario = scenario;

        this._element = document.createElement("div");
        this._element.className = styles["setup-page"];

        this._modal = document.createElement("div");
        this._modal.className = styles["setup-modal"];
        this._element.appendChild(this._modal);

        this.render('threat');

        this._focusTrap = new FocusTrap(this._element);
    }

    public show() {
        this._container.appendChild(this._element);
        this._focusTrap.activate();
    }

    public hide() {
        if (this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
        this._focusTrap.deactivate();
    }

    private render(stage: 'threat' | 'diff' = 'threat') {
        this._modal.innerHTML = "";
        const isThreatStage = stage === 'threat';

        const modalTitle = document.createElement("h1");
        modalTitle.className = styles["setup-title"];
        modalTitle.textContent = isThreatStage ? t("intro.step1") : t('intro.step2');
        this._modal.appendChild(modalTitle);

        /*
            <div class="parent">
                <div class="div1">1</div>
                <div class="div2">2</div>
                <div class="div3">3</div>
                <div class="div4">4</div>
                <div class="div5">5</div>
            </div>
            .parent {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 8px;
            }
            .div5 {
                grid-column: span 2 / span 2;
            }
        */
    }
}