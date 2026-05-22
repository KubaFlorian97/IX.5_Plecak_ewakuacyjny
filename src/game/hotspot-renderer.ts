import { State } from "~/state";
import { ItemData } from "~/types/types";
import * as gs from "./game.css";
import { path } from "@/zpe-port";
import { t } from "~/utils/localization";
import { log } from "~/nano_core/log";
import { dom } from "~/nano_core/dom";
import { soundManager } from "~/utils/sound-manager";

export interface HotspotCallbacks {
    onOpenContainer?: (item: ItemData) => void;
    onChangeRoom?: (roomId: string) => void;
}

export class HotspotRenderer {
    private BASE_W = 1280;
    private BASE_H = 1
    
    constructor(
        private _state: State,
        private _callbacks: HotspotCallbacks = {}
    ) {}

    public render(parentEl: HTMLElement, items: ItemData[], activeContainerId?: string) {
        const collectedItems = this._state.get().collectedItems || [];
        const placements = this._state.get().itemPlacements || {};

        items.forEach(item => {
            if (item.type === 'collectible' || item.type === undefined) {
                if (collectedItems.includes(item.id)) return;

                const placement = placements[item.id];
                if (!placement) return;

                if (activeContainerId && placement.containerId !== activeContainerId) return;
                if (!activeContainerId && placement.containerId) return;

                const x = activeContainerId ? (placement.zx ?? placement.x) : placement.x;
                const y = activeContainerId ? (placement.zy ?? placement.y) : placement.y;
                const scale = activeContainerId ? (placement.zscale ?? placement.scale ?? 1) : (placement.scale ?? 1);

                const hotspot = this.createCollectibleHotspot(item, x, y, scale);
                parentEl.appendChild(hotspot);
            } else {
                if (activeContainerId) return;
                const hotspot = this.createFixedHotspot(item);
                parentEl.appendChild(hotspot);
            }
        });
    }

    private createCollectibleHotspot(item: ItemData, x: number, y: number, scale: number) {
        return dom('button', {
            className: [gs['hotspot'], gs['collectible-hotspot']],
            'aria-label': t(item.name || '') || item.id,
            style: `
                left: ${x}px;
                top: ${y}px;
                transform: scale(${scale});
                transform-origin: top left;
            `,
            onclick: (e: MouseEvent) => this.handleClick(e, item)
        }, dom('img', {
            src: path(item.imagePath),
            alt: "",
            className: gs['collectible-img']
        }));
    }

    private createFixedHotspot(item: ItemData) {
        const btn = dom('button', {
            className: gs['hotspot'],
            'aria-label': t(item.name || '') || item.id,
            style: `
                left: ${item.x}px;
                top: ${item.y}px;
                width: ${item.width}px;
                height: ${item.height}px;
                ${item.hitbox ? `clip-path: ${item.hitbox};` : ''}
            `,
            onclick: (e: MouseEvent) => this.handleClick(e, item)
        });

        if (item.imagePath) {
            btn.appendChild(dom('img', { src: path(item.imagePath), alt: "", className: gs['hotspot-img'] }));
        }
        return btn;
    }

    private handleClick(e: MouseEvent, item: ItemData) {
        e.stopPropagation();

        log.info(`Kliknięto obiekt: [${item.id}] Typ: ${item.type}`);

        switch (item.type) {
            case 'container':
            case 'wardrobe':
                soundManager.play('drawer');
                if (this._callbacks.onOpenContainer) this._callbacks.onOpenContainer(item);
                break;

            case 'movable':
                soundManager.play('drawer');
                const hotspotBtn = e.currentTarget as HTMLElement;
                if (item.moveOffset) {
                    hotspotBtn.style.transform = `translate(${item.moveOffset.x}px, ${item.moveOffset.y}px)`;
                    hotspotBtn.style.pointerEvents = 'none';
                } else {
                    hotspotBtn.classList.add(gs['moved']); 
                }
                break;
            default:
                soundManager.play('collect');
                const currentItems = this._state.get().collectedItems || [];
                this._state.set({ collectedItems: [...currentItems, item.id] });
                (e.currentTarget as HTMLElement).remove();
                break;
        }
    }
}