import { getData } from "@/zpe-port";
import { State } from "~/state";
import { GameState, ItemData, Scenario, TeacherSettings } from "~/types/types";
import { CursorManager } from "~/utils/cursor-manager";
import { SoundManager } from "~/utils/sound-manager";

interface ColorMatrix {
    id: string;
    values: string;
}

export class GameManager {
    private _container: HTMLElement;
    private _mainContent!: HTMLElement;

    private _state: State;
    private _scenario: Scenario;
    private _originalScenario: Scenario;
    private _allScenarioItems: ItemData[] = [];

    private _teacherSettings: TeacherSettings | null = null;

    // private _topBar?: TopBar;
    // private _settingsModal?: SettingsModal;
    // private _helpModal?: HelpModal;

    // private _startPage?: StartPage;
    // // config gry
    // private _gamePage?: GamePage;
    // private _summaryPage?: SummaryPage;

    private _resizeObserver?: ResizeObserver;
    private _isRunning: boolean = false;
    private _listenersAttached: boolean = false;

    private COLOR_FILTERS: ColorMatrix[] = [
        {
            id: "protanopia",
            values: "0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0"
        },
        {
            id: "deuteranopia",
            values: "0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"
        },
        {
            id: "tritanopia",
            values: "0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0"
        },
        {
            id: "achromatopsia",
            values: "0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0"
        }
    ];

    constructor (container: HTMLElement, state: State, scenario: Scenario) {
        this._container = container;
        this._state = state;
        this._scenario = scenario;
        this._originalScenario = JSON.parse(JSON.stringify(scenario));

        CursorManager.applyCursor(this._container, 'white', 'small');
    }

    private applyTeacherSettings(settings: TeacherSettings) {
        this._scenario = JSON.parse(JSON.stringify(this._originalScenario));
        
        if (settings.difficulties && settings.difficulties.length > 0) {
            this._scenario.difficulties = this._scenario.difficulties.filter(diff => {
                const setting = settings.difficulties.find(s => s.id === diff.id);
                return setting ? setting.enabled : true;
            });
        }

        if (settings.threats && settings.threats.length > 0) {
            this._scenario.threats = this._scenario.threats.filter(threat => {
                const setting = settings.threats.find(s => s.id === threat.id);
                return setting ? setting.enabled : true;
            });
        }

        if (settings.rooms && settings.rooms.length > 0) {
            this._scenario.rooms.forEach(room => {
                const roomSettings = settings.rooms.find(r => r.id === room.id);
                if (roomSettings && roomSettings.items) {
                    room.items = room.items.filter(item => {
                        const itemSettings = roomSettings.items.find(s => s.id === item.id);
                        return itemSettings ? itemSettings.enabled : true;
                    });
                }
            });
        }

        this._allScenarioItems = this.getAllItemsHelper(this._scenario);
    }

    private getAllItemsHelper(sc: Scenario): ItemData[] {
        let items: ItemData[] = [];
        if (sc.rooms) {
            sc.rooms.forEach(r => {
                if (r.items) {
                    items = items.concat(r.items);
                }
            });
        }
        return items;
    }

    public async start(stateData: GameState) {
        if (this._isRunning) return;
        this._isRunning = true;

        this._container.innerHTML = "";
        
        SoundManager.setupAutoplayUnlock();
        SoundManager.playMusic('theme_loop');

        this.defineColorFilters();
        this._teacherSettings = getData()?.config as TeacherSettings;
        if (this._teacherSettings) {
            console.log("[ZPE Game] Applying teacher settings: ", this._originalScenario);
            this.applyTeacherSettings(this._teacherSettings);
        } else {
            this._scenario = JSON.parse(JSON.stringify(this._originalScenario));
        }
    }

    private defineColorFilters() {
        const svgNS = "http://www.w3.org/2000/svg";

        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("style", "position: absolute; width: 0; height: 0; overflow: hidden;");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");

        const defs = document.createElementNS(svgNS, "defs");

        this.COLOR_FILTERS.forEach(filterData => {
            const filter = document.createElementNS(svgNS, "filter");
            filter.setAttribute("id", filterData.id);
            
            const colorMatrix = document.createElementNS(svgNS, "feColorMatrix");
            colorMatrix.setAttribute("type", "matrix");
            colorMatrix.setAttribute("value", filterData.values);

            filter.appendChild(colorMatrix);
            defs.appendChild(filter);
        });

        svg.appendChild(defs);
        this._container.appendChild(svg);
    }

    public dispose(): void {

    }
}