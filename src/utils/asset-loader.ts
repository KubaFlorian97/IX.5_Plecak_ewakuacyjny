import { path } from "@/zpe-port";
import { SoundManager } from "./sound-manager";
import { _gameWrapper } from "~/app";

export class AssetLoader {
    private static _imageCache: Map<string, HTMLImageElement> = new Map();
    private static _isHighContrast: boolean = false;

    private static imagesToLoad: string[] = [
        'images/icons/icon_contamination.webp',
        'images/icons/icon_crisis.webp',
        'images/icons/icon_custom.webp',
        'images/icons/icon_easy.webp',
        'images/icons/icon_extreme.webp',
        'images/icons/icon_fire.webp',
        'images/icons/icon_flood.webp',
        'images/icons/icon_hard.webp',
        'images/icons/icon_hardcore.webp',
        'images/icons/icon_uxo.webp',
        'images/icons/magnifying_glass.webp',
        // ====
        'images/items/batteries.webp',
        'images/items/blanket.webp',
        'images/items/book.webp',
        'images/items/can_opener.webp',
        'images/items/clothes.webp',
        'images/items/compas.webp',
        'images/items/console.webp',
        'images/items/cosmetics_set.webp',
        'images/items/crowbar.webp',
        'images/items/dishes.webp',
        'images/items/docs.webp',
        'images/items/filters.webp',
        'images/items/flashlight.webp',
        'images/items/food.webp',
        'images/items/gps.webp',
        'images/items/iron.webp',
        'images/items/jacket.webp',
        'images/items/knife.webp',
        'images/items/lighter.webp',
        'images/items/liquid_soap.webp',
        'images/items/map.webp',
        'images/items/mask.webp',
        'images/items/matches.webp',
        'images/items/medkit.webp',
        'images/items/multitool.webp',
        'images/items/pencil.webp',
        'images/items/pendrive.webp',
        'images/items/phone.webp',
        'images/items/pillow.webp',
        'images/items/radio.webp',
        'images/items/sleeping_bag.webp',
        'images/items/soap_bar.webp',
        'images/items/spices.webp',
        'images/items/toilet_paper.webp',
        'images/items/towel.webp',
        'images/items/trash_bag.webp',
        'images/items/wallet.webp',
        'images/items/water.webp',
        // ====
        'images/rooms/containers/zoomed/bathroom_drawer.webp',
        'images/rooms/containers/zoomed/bedroom_drawer.webp',
        'images/rooms/containers/zoomed/bedroom_girl_drawer.webp',
        'images/rooms/containers/zoomed/bedroom_teen_drawer.webp',
        'images/rooms/containers/zoomed/bedroom_wardrobe_left.webp',
        'images/rooms/containers/zoomed/bedroom_wardrobe_right.webp',
        'images/rooms/containers/zoomed/kitchen_cabinet1.webp',
        'images/rooms/containers/zoomed/kitchen_cabinet2.webp',
        'images/rooms/containers/zoomed/kitchen_drawer.webp',
        'images/rooms/containers/zoomed/lv_cabinet.webp',
        'images/rooms/containers/zoomed/lv_drawer_zoomed.webp',
        'images/rooms/containers/zoomed/wc_cabinet.webp',
        // ====
        'images/rooms/containers/bathroom_drawer.webp',
        'images/rooms/containers/bedroom_drawer1.webp',
        'images/rooms/containers/bedroom_drawer2.webp',
        'images/rooms/containers/bedroom_girl_drawer.webp',
        'images/rooms/containers/bedroom_teen_drawer.webp',
        'images/rooms/containers/bedroom_wardrobe.webp',
        'images/rooms/containers/kitchen_cabinet1.webp',
        'images/rooms/containers/kitchen_cabinet2.webp',
        'images/rooms/containers/kitchen_drawer.webp',
        'images/rooms/containers/living_room_cabinet1.webp',
        'images/rooms/containers/living_room_chair.webp',
        'images/rooms/containers/living_room_drawer.webp',
        'images/rooms/containers/wc_cabinet.webp',
        // ====
        'images/rooms/movable/bedroom_teen_chair.webp',
        'images/rooms/movable/living_room_chair.webp',
        // ====
        'images/rooms/bathroom.webp',
        'images/rooms/bedroom_girl.webp',
        'images/rooms/bedroom_teen.webp',
        'images/rooms/bedroom.webp',
        'images/rooms/kitchen.webp',
        'images/rooms/living_room.webp',
        'images/rooms/wc.webp',
        // ====
        'images/ui/backpack_icon.webp',
        'images/ui/btn_close.webp',
        'images/ui/btn_fullscreen_exit.webp',
        'images/ui/btn_fullscreen.webp',
        'images/ui/btn_help.webp',
        'images/ui/btn_settings.webp',
        'images/ui/icon_bullhorn.webp',
        'images/ui/icon_sound_off.webp',
        'images/ui/icon_sound_on.webp',
        'images/ui/minimap.webp'
    ];

    private static soundsToLoad: string[] = [
        'audio/descriptions/contamination_desc.mp3',
        'audio/descriptions/fire_desc.webp',
        'audio/descriptions/flood_desc.webp',
        'audio/descriptions/uxo_desc.webp',
        // ====
        'audio/darkness_theme.mp3',
        'audio/drawer.mp3',
        'audio/hardcore.mp3',
        'audio/intro.mp3',
        'audio/item_collect.mp3',
        'audio/item_drop.mp3',
        'audio/theme_loop.mp3',
        'audio/ui_click.mp3'
    ];

    public static async preloadAll(onProgress: (percent: number) => void): Promise<void> {
        const totalAssets = this.imagesToLoad.length + this.soundsToLoad.length;
        let loadedAssets = 0;

        if (totalAssets === 0) {
            onProgress(100);
            return;
        }

        const updateProgress = () => {
            loadedAssets++;
            const percent = Math.floor((loadedAssets / totalAssets) * 100);
            onProgress(percent);
        };

        const imagePromises = this.imagesToLoad.map(img =>
            this.preloadImage(path(img)).then(updateProgress)
        );

        const soundPromises = this.soundsToLoad.map(sound =>
            SoundManager.load(path(sound)).then(updateProgress)
        );

        await Promise.all([...imagePromises, ...soundPromises]);
    }

    private static preloadImage(src: string): Promise<void> {
        return new Promise((resolve) => {
            if (this._imageCache.has(src)) {
                resolve();
                return;
            }

            const img = new Image();
            img.onload = () => {
                this._imageCache.set(src, img);
                resolve();
            };
            img.onerror = () => {
                console.warn(`[AssetLoader] Nie udało się załadować obrazu: ${src}`);
                resolve();
            };
            img.src = src;
        });
    }

    public static get isHighContrast(): boolean {
        return this._isHighContrast;
    }

    public static setHighContrast(enabled: boolean) {
        this._isHighContrast = enabled;
        _gameWrapper.dispatchEvent(new CustomEvent('hc-changed', { detail: enabled }));
    }

    public static getImagePath(src: string): string {
        if (this._isHighContrast && src.startsWith('images/') && !src.startsWith('images/hc/')) {
            return src.replace('images/', 'images/hc/');
        }
        return src;
    }

    public static bindImage(imgElement: HTMLImageElement, src: string) {
        const updateImage = () => {
            const finalSrc = path(this.getImagePath(src));

            if (this._imageCache.has(finalSrc)) {
                imgElement.src = this._imageCache.get(finalSrc)!.src;
            } else {
                imgElement.src = finalSrc;
            }
        };
        updateImage();
        _gameWrapper.addEventListener('hc-changed', updateImage);
    }
}