import * as mainCss from "~/styles/main.css";
import * as styles from "./setup-page.css";
import { Difficulty, Scenario, Threat } from "~/types/types";
import { FocusTrap } from "~/utils/focus-trap";
import { t } from "~/utils/localization";
import { path } from "@/zpe-port";
import { SoundManager } from "~/utils/sound-manager";

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

        const selectionGrid = document.createElement("div");
        selectionGrid.className = `${styles["selection-grid"]} ${mainCss["scrollable"]}`;
        this._modal.appendChild(selectionGrid);

        const actionArea = document.createElement("div");
        actionArea.style.marginTop = "1rem";
        actionArea.style.display = "flex";
        actionArea.style.justifyContent = "center";

        const nextBtn = document.createElement("button");
        nextBtn.className = mainCss["btn"] || "btn";
        nextBtn.textContent = isThreatStage ? "Dalej" : "Graj";
        nextBtn.disabled = true; // Disabled until selection is made

        nextBtn.onclick = () => {
            SoundManager.play('click');
            if (isThreatStage) {
                this.render('diff');
            } else {
                this._onComplete();
            }
        };

        actionArea.appendChild(nextBtn);

        if (isThreatStage) {
            this._renderThreatSelection(selectionGrid, nextBtn);
        } else {
            this._renderDiffSelection(selectionGrid, nextBtn);
        }

        this._modal.appendChild(actionArea);
    }

    private _renderThreatSelection(selectionGrid: HTMLElement, nextBtn: HTMLButtonElement) {
        const threats = this._scenario.threats;

        const selectCard = (card: HTMLElement, th?: Threat, isCrisis?: boolean) => {
            Array.from(selectionGrid.children).forEach(c => c.classList.remove(styles["selected"]));
            card.classList.add(styles["selected"]);
            this._selThreat = th;
            this._isCrisis = isCrisis || false;
            nextBtn.disabled = false;
        };

        threats.forEach(th => {
            const card = this.createSelectionCard(
                t(th.name),
                t(th.description),
                path(this._threatIcon[th.id]),
                `Zagrożenie: ${t(th.name)}. ${th.description}`,
                () => {
                    SoundManager.play('click');
                    selectCard(card, th, false);
                }
            );
            selectionGrid.appendChild(card);
        });

        const crisisCard = this.createSelectionCard(
            t('intro.crisis_mode'),
            t('intro.crisis_desc'),
            path(this._threatIcon["crisis"]),
            `Zagrożenie: ${t('intro.crisis_mode')}. ${t('intro.crisis_desc')}`,
            () => {
                SoundManager.play('click');
                selectCard(crisisCard, undefined, true);
            },
            true
        );
        selectionGrid.appendChild(crisisCard);
    }

    private _renderDiffSelection(selectionGrid: HTMLElement, nextBtn: HTMLButtonElement) {
        const diffs = this._scenario.difficulties;

        const selectCard = (card: HTMLElement, diff?: Difficulty, isCustom?: boolean) => {
            Array.from(selectionGrid.children).forEach(c => c.classList.remove(styles["selected"]));
            card.classList.add(styles["selected"]);
            this._selDiff = diff;
            this._isCustom = isCustom || false;
            nextBtn.disabled = false;
        };

        diffs.forEach(diff => {
            if (diff.id !== 'hardcore') {
                const card = this.createSelectionCard(
                    t(diff.name),
                    `Czas: ${diff.timeLimit} min.`,
                    path(this._diffIcon[diff.id]),
                    `Poziom trudności: ${t(diff.name)}. Czas: ${diff.timeLimit} minut.`,
                    () => {
                        SoundManager.play('click');
                        selectCard(card, diff, false);
                    },
                );
                selectionGrid.appendChild(card);
            }
        });

        const customCard = this.createSelectionCard(
            t('intro.custom_mode'),
            t('intro.custom_desc'),
            path(this._diffIcon["custom"]),
            `Poziom trudności: ${t('intro.custom_mode')}. ${t('intro.custom_desc')}.`,
            () => {
                SoundManager.play('click');
                selectCard(customCard, undefined, true);
            }
        );
        selectionGrid.appendChild(customCard);

        const hardcore = diffs.find(d => d.id === 'hardcore');
        if (hardcore) {
            const hardcoreCard = this.createSelectionCard(
                t(hardcore.name),
                `Czas: ${hardcore.timeLimit} min.`,
                path(this._diffIcon[hardcore.id]),
                `Poziom trudności: ${t(hardcore.name)}. Czas: ${hardcore.timeLimit} minut.`,
                () => {
                    SoundManager.play('click');
                    selectCard(hardcoreCard, hardcore, false);
                },
                true
            );
            selectionGrid.appendChild(hardcoreCard);
        }
    }

    private _onComplete() {
        this._element.dispatchEvent(new CustomEvent('setup-complete', {
            bubbles: true,
            detail: {
                threat: this._selThreat,
                isCrisis: this._isCrisis,
                diff: this._selDiff,
                isCustom: this._isCustom
            }
        }));
    }

    private createSelectionCard(
        title: string,
        sub: string,
        img: string,
        srOnly: string,
        onclick: () => void,
        double?: boolean
    ): HTMLElement {
        const card = document.createElement("div");
        card.tabIndex = 0;
        card.role = "button";
        card.className = `${styles["selection-card"]} ${double ? styles["double"] : ""}`;
        card.onclick = onclick;

        const cardImgSpan = document.createElement("span");
        cardImgSpan.ariaHidden = "true";
        card.appendChild(cardImgSpan);

        const cardImg = document.createElement("img");
        cardImg.src = img;
        cardImg.alt = "";
        cardImg.draggable = false;
        cardImgSpan.appendChild(cardImg);

        const cardTitle = document.createElement("div");
        cardTitle.className = styles["card-title"];
        cardTitle.ariaHidden = "true";
        cardTitle.textContent = title;
        card.appendChild(cardTitle);

        const cardSub = document.createElement("div");
        cardSub.className = styles["card-sub"];
        cardSub.ariaHidden = "true";
        cardSub.textContent = sub;
        card.appendChild(cardSub);

        const sr = document.createElement("span");
        sr.className = mainCss["sr-only"];
        sr.textContent = srOnly;
        card.appendChild(sr);

        return card;
    }
}