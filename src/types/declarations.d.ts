declare module "*.css" {
    export const content: { [className: string]: string };
}

declare module "*.json" {
    const value: any;
    export default value;
}

interface HTMLElement {
    webkitRequestFullscreen?: () => Promise<void>;
}

interface Document {
    webkitFullscreenElement?: Element;
    webkitExitFullscreen?: () => Promise<void>;
    webkitFullscreenEnabled?: boolean;
}
