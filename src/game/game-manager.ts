import { getData } from "@/zpe-port";
import { State } from "~/state";
import { Difficulty, GameState, ItemData, Scenario, SpawnPoint, TeacherSettings, Threat } from "~/types/types";
import { CursorManager } from "~/utils/cursor-manager";
import { SoundManager } from "~/utils/sound-manager";
import { TopBar } from "./components/top-bar";
import * as mainCss from "~/styles/main.css";
import { IntroPage } from "./pages/intro-page";
import { SettingsModal } from "./modals/settings-modal";
import { HelpModal } from "./modals/help-modal";

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

    private _teacherSettings: TeacherSettings | null = null;

    private _topBar?: TopBar;
    private _settingsModal?: SettingsModal;
    private _helpModal?: HelpModal;

    private _introPage?: IntroPage;

    private _loadingElement?: HTMLElement;

    private _timeLeft: number = 0;
    private _lastTime: number = 0;
    private _totalTime: number = 0;

    private _diff?: Difficulty;
    private _threat?: Threat;
    private _startTime: number = 0;
    private _allScenarioItems: ItemData[] = [];

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

    constructor(container: HTMLElement, state: State, scenario: Scenario) {
        this._container = container;
        this._state = state;
        this._scenario = scenario;
        this._originalScenario = JSON.parse(JSON.stringify(scenario));

        CursorManager.applyCursor(this._container, 'white', 'small');
    }

    public async start(stateData: GameState) {
        if (this._isRunning) return;
        this._isRunning = true;

        this._container.innerHTML = "";

        // Dane z edytora
        this._teacherSettings = getData() as TeacherSettings;
        if (this._teacherSettings) {
            console.log("Applying teacher settings:", this._originalScenario);
            this.applyTeacherSettings(this._teacherSettings);
        } else {
            this._scenario = JSON.parse(JSON.stringify(this._originalScenario));
            this._allScenarioItems = this.getAllItemsHelper(this._scenario);
        }

        // Preaload assets
        // await this.preloadAllAssets();

        const s = stateData as GameState;
        const hasValidSave = !!(s && s.threatId && s.difficultyId);

        SoundManager.play('intro');

        if (!hasValidSave) {
            const initialPlacements = this.generateItemPlacements(this._scenario);

            this._state.set({
                collectedItems: [],
                currentRoomId: this._scenario.startRoomId,
                openedContainers: [],
                hasFlashlight: false,
                timeLeft: undefined,
                customDifficulty: undefined,
                itemPlacements: initialPlacements
            });
        } else {
            this._state.set(stateData);
        }

        this._topBar = new TopBar();
        this._container.appendChild(this._topBar.getElement());

        this._mainContent = document.createElement("div");
        this._mainContent.className = mainCss["main-content"];
        this._container.appendChild(this._mainContent);

        this._resizeObserver = new ResizeObserver(() => {
            if (this._topBar) {
                const topH = this._topBar.getElement().offsetHeight;
                this._container.style.setProperty("--dynamic-top-h", `${topH}px`);
            }
        });
        this._resizeObserver.observe(this._topBar.getElement());

        // MODALE
        this._settingsModal = new SettingsModal(this._container);
        this._helpModal = new HelpModal(this._container);

        this._introPage = new IntroPage(this._mainContent, hasValidSave);
        this._introPage.show();

        if (!this._listenersAttached) {
            // Ustawienia
            this._container.addEventListener('toggle-settings', () => {
                this.toggleSettings();
            });

            // Pomoc
            this._container.addEventListener('toggle-help', () => {
                this.toggleHelp();
            });

            this._listenersAttached = true;
        }
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

    // MOZG OPERACJI ROZMIESZCZANIA ITEMOW !!!
    private generateItemPlacements(sc: Scenario): Record<string, any> {
        const placements: Record<string, any> = {};
        const containerContentsMap = new Map<string, string[]>();

        sc.rooms.forEach(room => {
            room.items.forEach(item => {
                if ((item.type === 'container' || item.type === 'wardrobe' || item.type === 'movable') && item.contents) {
                    containerContentsMap.set(item.id, item.contents);
                }
            });
        });

        const generateId = () => Math.random().toString(36).substr(2, 9);

        sc.rooms.forEach(room => {
            const occupiedSpawnIds = new Set<string>();

            let allSpawns: (SpawnPoint & { _uuid: string })[] = [];

            if (room.spawnPoints) {
                room.spawnPoints.forEach(sp => {
                    allSpawns.push({ ...sp, _uuid: generateId() });
                });
            }

            room.items.forEach(item => {
                if ((item.type === 'container' || item.type === 'wardrobe' || item.type === 'movable') && item.spawnPoints) {
                    item.spawnPoints.forEach(sp => {
                        allSpawns.push({
                            ...sp,
                            containerId: sp.containerId || item.id,
                            _uuid: generateId()
                        });
                    });
                }
            });

            let movableItems = room.items.filter(i =>
                i.type !== 'container' &&
                i.type !== 'wardrobe' &&
                !(i.x && i.y)
            );

            if (allSpawns.length === 0 || movableItems.length === 0) return;

            const itemsWithPriority = movableItems.map(item => {
                const possibleCount = allSpawns.filter(sp => {
                    if (sp.avoid && sp.avoid.includes(item.id)) return false;

                    if (sp.containerId) {
                        const allowedItems = containerContentsMap.get(sp.containerId);
                        if (allowedItems && !allowedItems.includes(item.id)) return false;
                    }
                    return true;
                }).length;

                return { item, possibleCount };
            });

            itemsWithPriority.sort((a, b) => a.possibleCount - b.possibleCount);

            itemsWithPriority.forEach(({ item }) => {
                const validSpawns = allSpawns.filter(sp => {
                    if (occupiedSpawnIds.has(sp._uuid)) return false;

                    if (sp.avoid && sp.avoid.includes(item.id)) return false;

                    if (sp.containerId) {
                        const allowedItems = containerContentsMap.get(sp.containerId);
                        if (allowedItems && !allowedItems.includes(item.id)) return false;
                    }
                    return true;
                });

                if (validSpawns.length > 0) {
                    const chosenSp = validSpawns[Math.floor(Math.random() * validSpawns.length)];

                    occupiedSpawnIds.add(chosenSp._uuid);

                    placements[item.id] = {
                        x: chosenSp.x,
                        y: chosenSp.y,
                        roomId: room.id,
                        containerId: chosenSp.containerId,
                        side: chosenSp.side,
                        scale: chosenSp.scale,
                        zx: chosenSp.zx,
                        zy: chosenSp.zy,
                        zscale: chosenSp.zscale
                    };
                } else {
                    console.warn(`[GameManager] Brak miejsca dla: ${item.id} w ${room.id} (Dostępnych opcji teoretycznych: ${itemsWithPriority.find(x => x.item.id === item.id)?.possibleCount})`);
                }
            });
        });

        return placements;
    }

    private toggleSettings() {
        const isSettingsOpen = this._settingsModal?.isOpen;
        const isHelpOpen = this._helpModal?.isOpen;

        if (isHelpOpen) {
            this._helpModal?.hide();
        }

        if (isSettingsOpen) {
            this._settingsModal?.hide();
        } else {
            this._settingsModal?.show();
        }
    }

    private toggleHelp() {
        const isHelpOpen = this._helpModal?.isOpen;
        const isSettingsOpen = this._settingsModal?.isOpen;

        if (isSettingsOpen) {
            this._settingsModal?.hide();
        }

        if (isHelpOpen) {
            this._helpModal?.hide();
        } else {
            this._helpModal?.show();
        }
    }

    public dispose() {
        this._isRunning = false;
        this._container.innerHTML = "";
    }
}