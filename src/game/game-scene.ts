import { Component } from "~/nano_core/component";
import { dom } from "~/nano_core/dom";
import { log } from "~/nano_core/log";
import { State } from "~/state";
import { ItemData, Scenario } from "~/types/types";
import { t } from "~/utils/localization";
import { soundManager } from "~/utils/sound-manager";
import { path } from "@/zpe-port";
import * as styles from "~/styles/main.css";
import * as ui from "./ui/ui.css";
import * as gs from "./game.css";
import { HotspotRenderer } from "./hotspot-renderer";

export class GameScene extends Component {
    private _viewPortWrapper!: HTMLElement;
    private _inventoryPanel!: HTMLElement;
    private _inventoryContent!: HTMLElement;
    private _closeBtn!: HTMLButtonElement;
    private _backpackBtn!: HTMLButtonElement;

    private _renderedRoomId: string | null = null;
    private _isInventoryOpen: boolean = false;

    private _hotspotRenderer: HotspotRenderer;


    constructor(
        container: HTMLElement,
        private _state: State,
        private _scenario: Scenario
    ) {
        super(dom('main', {
            className: gs['game-scene'],
            'aria-label': "Eksploracja mieszkania",
            role: "main"
        }));

        container.appendChild(this.element);

        this._hotspotRenderer = new HotspotRenderer(
            this._state,
            {
                onChangeRoom: (roomId: string) => {
                    this._state.set({ currentRoomId: roomId });
                },
                onOpenContainer: (item) => {
                    this.showContainerModal(item);
                }
            }
        );

        this._register(this._state.current.onDidChange((newState) => {
            if (newState.currentRoomId !== this._renderedRoomId) {
                this.renderViewport();
            }
            this.renderInventoryItems();
        }));
    }

    public render() {
        this.element.innerHTML = "";

        // Viewport
        this._viewPortWrapper = dom('section', {
            className: gs['viewport-wrapper'],
            'aria-label': "Widok pokoju"
        });

        // Inventory
        this._closeBtn = dom('button', {
            className: gs['inventory-close-btn'],
            'aria-label': t('inventory.btn_exit'),
            style: `background-image: url(${path('images/ui/btn_close.webp')})`,
            onclick: () => this.toggleInventory(false)
        });

        const inventoryHeader = dom('div', { className: gs['inventory-header'] },
            dom('h2', { className: gs['inventory-title'] }, "📝", t('inventory.title')),
            this._closeBtn
        );

        this._inventoryContent = dom('div', {
            className: gs['inventory-content'],
            'aria-label': "Lista przedmiotów"
        });

        this._inventoryPanel = dom('aside', { className: gs['inventory-panel'] },
            inventoryHeader,
            this._inventoryContent
        );

        // BACKPACK BTN
        this._backpackBtn = dom('button', {
            className: gs['backpack-icon-btn'],
            'aria-label': t('inventory.title'),
            style: `background-image: url(${path('images/ui/backpack_icon.webp')})`,
            onclick: () => this.toggleInventory(true)
        });

        this.element.append(this._viewPortWrapper, this._inventoryPanel, this._backpackBtn);

        this.renderViewport();
        this.renderInventoryItems();

        this.toggleInventory(this._isInventoryOpen, true);
    }

    private toggleInventory(open: boolean, silent: boolean = false) {
        this._isInventoryOpen = !this._isInventoryOpen;
        if (!silent) soundManager.play('click');

        if (open) {
            this.element.classList.add(gs['inventory-open']);
        } else {
            this.element.classList.remove(gs['inventory-open']);
        }
    }
    private renderViewport() {
        if (!this._viewPortWrapper) return;
        this._viewPortWrapper.innerHTML = "";

        const roomId = this._state.get().currentRoomId;
        const roomData = this._scenario.rooms.find(r => r.id === roomId);

        if (!roomData) {
            log.error(`Nie znaleziono danych dla pokoju: ${roomId}`);
            return;
        }

        this._renderedRoomId = roomId;
        log.info(`Renderowanie pokoju: ${roomId}`);

        const roomLayer = dom('div', {
            className: gs['room-layer'],
            style: `background-image: url('${roomData.background}');`,
            role: "application",
            'aria-label': `Pokój: ${t(roomData.name)}`
        });

        if (roomData.items) {
            this._hotspotRenderer.render(roomLayer, roomData.items);
        }

        this._viewPortWrapper.appendChild(roomLayer);
    }

    private showContainerModal(containerItem: ItemData) {
        log.success(`Wywołano zbliżenie kontenera: ${containerItem.id}`);
    }

    private renderInventoryItems() {
        if (!this._inventoryContent) return;
        this._inventoryContent.innerHTML = "";

        const collectedItems = this._state.get().collectedItems || [];
        const allItems = this.getAllCollectibles();

        if (allItems.length === 0) {
            this._inventoryContent.appendChild(
                dom('div', { style: 'color: var(--c-grey);' }, "Brak przedmiotów w scenariuszu.")
            );
            return;
        }

        allItems.forEach(itemData => {
            const isCollected = collectedItems.includes(itemData.id);

            const itemTile = dom('button', {
                className: [
                    gs['inventory-item-tile'], 
                    isCollected ? gs['item-collected'] : gs['item-uncollected']
                ],
                'aria-label': `${itemData.name || itemData.id}. ${isCollected ? 'Zebrano. Kliknij, aby usunąć z plecaka.' : 'Niezebrane.'}`,
                disabled: !isCollected,
                onclick: () => {
                    if (isCollected) this.removeItem(itemData.id);
                }
            },
                dom('div', {},
                    dom('img', {
                        className: gs['inventory-item-icon'],
                        src: path(itemData.imagePath),
                        alt: "",
                    })
                ),
                dom('div', { className: gs['inv-item-details'] },
                    dom('span', { className: gs['name'] }, itemData.name as string)
                )
                // ,isCollected ? dom('button', {
                //     className: 'inv-remove-btn',
                //     'aria-label': `Usuń przedmiot ${itemData.name}`
                // }, "✕") : ""
            );

            this._inventoryContent.appendChild(itemTile);
        });
    }

    private removeItem(itemId: string) {
        soundManager.play('drop');
        const currentItems = this._state.get().collectedItems || [];
        this._state.set({ collectedItems: currentItems.filter(id => id !== itemId) });
    }

    private getAllCollectibles(): ItemData[] {
        const collectibles: ItemData[] = [];
        
        this._scenario.rooms.forEach(room => {
            room.items.forEach(item => {
                if (item.type === 'collectible' || item.type === undefined) {
                    if (!collectibles.some(i => i.id === item.id)) {
                        collectibles.push(item);
                    }
                }
            });
        });
        
        return collectibles;
    }
}