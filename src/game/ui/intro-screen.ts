import { Component } from "~/nano_core/component";
import { dom } from "~/nano_core/dom";
import { Scenario } from "~/types/types";
import * as styles from "~/styles/main.css";
import * as ui from "./ui.css";
import { t } from "~/utils/localization";

export class IntroScreen extends Component {
    private _step: 'threat' | 'difficulty' = 'threat';
    private _selectedThreat: string | null = null;

    constructor(
        container: HTMLElement,
        private _scenario: Scenario,
        private _onFinish: (difficultyId: string, threatId: string) => void
    ) {
        super(dom('main', { className: ui['intro-screen'] }));
        container.appendChild(this.element);
    }

    public render() {
        this.element.innerHTML = "";

        if (this._step === 'threat') this.renderThreatSelection();
        else this.renderDifficultySelection();
    }

    private renderThreatSelection() {
        const title = dom('h1', { className: styles['sr-only'] }, t('intro.step1'));
        const header = dom('h2', { className: ui['section-title'] }, t('intro.step1'));

        const grid = dom('div', { className: ui['selection-grid'], role: 'radiogroup', 'aria-label': 'Lista zagrożeń'});

        this._scenario.threats.forEach(threat => {
            const btn = dom('button', {
                className: ui['select-card'],
                role: 'radio',
                'aria-checked': false,
                'aria-label': `${threat.name}. ${threat.description}`
            },
                dom('span', { className: ui['card-icon'], 'aria-hidden': true }, threat.icon),
                dom('span', { className: ui['card-name'] }, t(threat.name))
            );

            btn.onclick = () => {
                this._selectedThreat = threat.id;
                this._step = 'difficulty';
                this.render();
            };
            
            grid.appendChild(btn);
        });

        this.element.append(title, header, grid);
    }

    private renderDifficultySelection() {
        const title = dom('h1', { className: styles['sr-only'] }, t('intro.step2'));
        const header = dom('h2', { className: ui['section-title'] }, t('intro.step2'));

        const grid = dom('div', { className: ui['selection-grid'], role: 'radiogroup', 'aria-label': 'Lista poziomów trudności' });

        this._scenario.difficulties.forEach(diff => {
            const btn = dom('button', { className: ui['select-card'], role: 'radio', 'aria-checked': false },
                dom('span', { className: ui['card-name'] }, t(diff.name)),
                dom('span', { className: ui['card-desc'] }, `${diff.timeLimit} min.`)
            );

            btn.onclick = () => {
                if (this._selectedThreat) {
                    this._onFinish(diff.id, this._selectedThreat);
                }
            };

            grid.appendChild(btn);
        });

        const backBtn = dom('button', { className: [
            ui['btn'],
            ui['btn-secondary'],
            ui['btn-back']
        ] }, "Powrót");
        backBtn.onclick = () => {
            this._step = 'threat';
            this._selectedThreat = null;
            this.render();
        };

        this.element.append(title, header, grid, backBtn);
    }
}