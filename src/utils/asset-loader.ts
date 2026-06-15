import { path } from "@/zpe-port";
import { SoundManager } from "./sound-manager";
import { _gameWrapper } from "~/app";

export class AssetLoader {
    private static _imageCache: Map<string, HTMLImageElement> = new Map();
    private static _isHighContrast: boolean = false;

    private static imagesToLoad: string[] = [

    ];

    private static soundsToLoad: string[] = [

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