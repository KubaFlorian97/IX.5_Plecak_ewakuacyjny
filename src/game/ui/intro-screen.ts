import { Component } from "~/nano_core/component";
import { dom } from "~/nano_core/dom";
import { createButton } from "./components/button";
import { Modal } from "./components/modal";
import { Difficulty, Scenario } from "~/types/types";
import { State } from "~/state";
import * as styles from "~/styles/main.css";
import * as ui from "./ui.css";
import { t } from "~/utils/localization";
import { path } from "@/zpe-port";
import { soundManager } from "~/utils/sound-manager";

export class IntroScreen extends Component {
    private _step: number = 0;
    private _selectedThreat: string | null = null;
    private _selectedDifficulty: string | null = null;
    private _customDifficulty: Difficulty | null = null;
    private _voPlayResume!: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        private _state: State,
        private _scenario: Scenario,
        private _onStartGame: (difficultyId: string, threatId: string) => void
    ) {
        super(dom('main', { className: ui['intro-screen'] }));
        container.appendChild(this.element);
    }

    public render() {
        this.element.innerHTML = "";

        if (this._step === 0) this.renderThreats();
        else if (this._step === 1) this.renderDifficulties();
        else if (this._step === 2) this.renderBriefing();
    }

    private renderThreats() {
        const title = dom('h1', { className: styles['sr-only'] }, t('intro.step1'));
        const header = dom('h2', { className: ui['section-title'] }, t('intro.step1'));

        const grid = dom('div', { className: ui['selection-grid'], role: 'radiogroup', 'aria-label': 'Lista zagrożeń'});

        this._scenario.threats.forEach(threat => {
            const btn = this.createCardBtn(t(threat.name), `images/icons/icon_${threat.id}.webp`, "", () => {
                soundManager.play('click');
                this._selectedThreat = threat.id;
                this._step = 1;
                this.render();
            });
            
            grid.appendChild(btn);
        });

        const randomBtn = this.createCardBtn(t('intro.crisis_mode'), "images/icons/icon_crisis.webp", "", () => {
            soundManager.play('click');
            const randomThreat = this._scenario.threats[Math.floor(Math.random() * this._scenario.threats.length)];
            this._selectedThreat = randomThreat.id;
            this._step = 1;
            this.render();
        }, true);
        grid.appendChild(randomBtn);

        this.element.append(title, header, grid);
    }

    private renderDifficulties() {
        const title = dom('h1', { className: styles['sr-only'] }, t('intro.step2'));
        const header = dom('h2', { className: ui['section-title'] }, t('intro.step2'));

        const grid = dom('div', { className: ui['selection-grid'], role: 'radiogroup', 'aria-label': 'Lista poziomów trudności' });

        this._scenario.difficulties.forEach(diff => {
            const btn = this.createCardBtn(t(diff.name), `images/icons/icon_${diff.id}.webp`, `${diff.timeLimit} min.`, () => {
                soundManager.play('click');
                this._selectedDifficulty = diff.id;
                this._step = 2;
                this.render();
            });

            grid.appendChild(btn);
        });

        const customBtn = this.createCardBtn(t('intro.custom_mode'), "images/icons/icon_custom.webp", "", () => {
            soundManager.play('click');
            this.showCustomDifficultyModal();
        }, true);
        grid.appendChild(customBtn);

        const backBtn = createButton({
            label: t('intro.btn_back'), variant: 'secondary',
            onClick: () => { soundManager.play('click'); this._step = 0; this._selectedThreat = null; this.render(); }
        });

        this.element.append(title, header, grid, backBtn);
    }

    private renderBriefing() {
        const threat = this._scenario.threats.find(t => t.id === this._selectedThreat)!;
        const difficulty = this._selectedDifficulty === 'custom' && this._customDifficulty
            ? this._customDifficulty
            : this._scenario.difficulties.find(d => d.id === this._selectedDifficulty)!;

        const audioPath = threat.briefingAudio || `audio/descriptions/${threat.id}_desc.mp3`;
        soundManager.playVoiceover(audioPath);

        this._voPlayResume = createButton({
            label: "Wstrzymaj", variant: 'secondary',
            className: ui['btn-small'],
            onClick: () => {
                soundManager.play('click');
                soundManager.pauseResumeVoiceover();
                this._voPlayResume.textContent = soundManager.isVoiceoverPlaying ? "Wstrzymaj" : "Wznów";
            }
        });

        const briefingContainer = dom('div', { className: ui['briefing-container'] },
            dom('img', { className: ui["briefing-horn"], src: 'images/ui/icon_bullhorn.webp' }),
            dom('h1', { className: ui["briefing-title"] }, t(threat.name) || threat.name),
            dom('div', { className: ui["briefing-preset"] },
                dom('span', {}, `${t('intro.diff')} ${t(difficulty.name)}`),
                dom('span', {}, `${t('intro.cust_time')} ${difficulty.timeLimit} min`)
            ),
            dom('div', { className: ui["briefing-alert"] },
                dom('p', { }, 
                    t(threat.alertMessage) || threat.alertMessage
                ),
                dom('div', { style: 'display: flex; gap: 1rem; justify-content: center;' },
                    createButton({
                        label: "Od początku", variant: 'secondary',
                        className: ui['btn-small'],
                        onClick: () => {
                            soundManager.play('click');
                            soundManager.stopVoiceover();
                            soundManager.playVoiceover(audioPath);
                        }
                    }),
                    this._voPlayResume
                )
            ),
            dom('div', { style: 'display: flex; gap: 1rem; justify-content: center;' },
                createButton({
                    label: t('intro.btn_back'), variant: 'secondary',
                    onClick: () => {
                        soundManager.stopVoiceover();
                        soundManager.play('click');
                        this._step = 1;
                        this._selectedDifficulty = null;
                        this.render();
                    }
                }),
                createButton({
                    label: t('intro.btn_start'), variant: 'primary',
                    onClick: () => {
                        soundManager.stopVoiceover();
                        soundManager.play('click');
                        this._onStartGame(this._selectedDifficulty!, this._selectedThreat!);
                    }
                })
            )
        );

        this.element.appendChild(briefingContainer);
    }

    private showCustomDifficultyModal() {
        let timeValue = 15;
        let isDarkness = false;
        let isHints = true;

        const timeLabel = dom('span', { style: 'width: 60px; text-align: right; font-size: var(--fs-md);' }, `${timeValue} min.`);
        
        const updateTimeLabel = (val: number) => {
            timeValue = val;
            timeLabel.textContent = `${val} min.`;
        };

        const timeSlider = dom('input', {
            type: 'range', min: '1', max: '60', step: '1', value: '30',
            className: ui['slider'], style: 'flex: 1;',
            oninput: (e: Event) => updateTimeLabel(parseInt((e.target as HTMLInputElement).value, 10))
        });

        const darknessBtn = dom('button', {
            className: [ ui['btn'], ui['btn-secondary'], ui['settings-btn'], ui['toggle-btn'] ]
        }, "WYŁ");
        darknessBtn.onclick = () => {
            isDarkness = !isDarkness;
            darknessBtn.textContent = isDarkness ? "WYŁ" : "WŁ";
            darknessBtn.classList.toggle(ui['btn-active']);
        };

        const hintsBtn = dom('button', {
            className: [ ui['btn'], ui['btn-secondary'], ui['settings-btn'], ui['toggle-btn'], ui['btn-active'] ]
        }, "WŁ");
        hintsBtn.onclick = () => {
            isHints = !isHints;
            hintsBtn.textContent = isHints ? "WŁ" : "WYŁ";
            hintsBtn.classList.toggle(ui['btn-active']);
        };

        const content = dom('div', { style: 'text-align: left; display: flex; flex-direction: column; gap: 1.5rem;' },
            dom('div', { style: 'display: flex; align-items: center; gap: 1rem;' },
                dom('span', { style: 'width: 140px; font-weight: bold; font-size: var(--fs-md);' }, "Czas na ucieczkę:"),
                timeSlider, timeLabel
            ),
            dom('div', { className: ui['toggle-btn-row'] },
                dom('span', { className: ui['toggle-btn-label'] }, t('intro.cust_dark')),
                dom('div', { className: ui['toggle-wrapper'] },
                    darknessBtn
                )
            ),
            dom('div', { className: ui['toggle-btn-row'] },
                dom('span', { className: ui['toggle-btn-label'] }, t('intro.cust_hints')),
                dom('div', { className: ui['toggle-wrapper'] },
                    hintsBtn
                )
            )
        );

        const customModal = this._register(new Modal({
            title: "WŁASNY POZIOM TRUDNOŚCI",
            content: content,
            actions: [
                createButton({ label: "Anuluj", variant: 'secondary', onClick: () => customModal.dispose() }),
                createButton({ label: "Zatwierdź", variant: 'primary', onClick: () => {
                    this._customDifficulty = {
                        id: 'custom', name: 'Własny', timeLimit: timeValue,
                        hintsEnabled: isHints, flashlightRadius: 150, darknessEnabled: isDarkness
                    };
                    
                    this._selectedDifficulty = 'custom';
                    this._state.set({
                        difficultyId: this._selectedDifficulty,
                        threatId: this._selectedThreat!,
                        customDifficulty: this._customDifficulty
                    });
                    this._step = 2;
                    customModal.dispose();
                    this.render();
                }})
            ]
        }));

        this.element.appendChild(customModal.element);
        customModal.render();
    }

    private createCardBtn(name: string, iconPath: string, desc: string = "", onclickFn: () => void, center?: boolean) {
        const centerCls = center ? ui['center'] : "";
        const btn = dom('button', { className: [ui['select-card'], centerCls], role: 'radio', 'aria-checked': false },
            dom('span', { className: ui['card-icon'], 'aria-hidden': true }, 
                dom('img', { 'aria-hidden': true, src: path(iconPath) })
            ),
            dom('span', { className: ui['card-name'] }, name),
            desc ? dom('span', { className: ui['card-desc'] }, desc) : ""
        );

        btn.onclick = () => onclickFn();

        return btn;
    }
}