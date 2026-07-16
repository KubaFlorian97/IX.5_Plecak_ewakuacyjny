import * as global from "~/style/style.css";
import * as styles from "./components.css";

export interface ButtonProps {
    label?: string;
    onClick?: (e: MouseEvent) => void;
    className?: string | string[];
    variant?: 'action' | 'icon' | 'settings' | 'active' | 'toggle' | 'color';
    srOnly?: string;
    style?: string;
    img?: string;
    ariaPressed?: boolean;
}

export interface ImgButtonProps {
    onClick?: (e: MouseEvent) => void;
    className?: string | string[];
    srOnly: string;
    style?: string;
    img: string;
    alt?: string;
    dataTooltip?: string;
}

export function createButton(props: ButtonProps): HTMLButtonElement {
    const variantClass = props.variant === 'icon'
        ? styles['icon-btn']
        : props.variant === 'settings'
            ? styles['settings-btn']
            : props.variant === 'active'
                ? styles['active-btn']
                : props.variant === 'toggle'
                    ? `${styles['settings-btn']} ${styles['settings-toggle']}`
                    : props.variant === 'color'
                        ? styles['color-btn']
                        : styles['action-btn'];

    const classes = [variantClass, ...(Array.isArray(props.className) ? props.className : (props.className ? [props.className] : []))];

    const btn = document.createElement('button');
    btn.className = classes.join(' ');
    if (props.style) btn.style = props.style;
    if (props.onClick) btn.onclick = props.onClick;
    if (props.variant && props.variant === 'icon') btn.style.backgroundImage = `url(${props.img})`;
    if (props.label) btn.innerHTML = props.label;
    if (props.srOnly) {
        const srOnly = document.createElement('div');
        srOnly.className = global['sr-only'];
        srOnly.textContent = props.srOnly;
        btn.appendChild(srOnly);
    }
    if (props.ariaPressed !== undefined) {
        btn.setAttribute("aria-pressed", props.ariaPressed ? "true" : "false");
    }
    
    return btn;
}

export function createImgButton(props: ImgButtonProps) {
    const className = Array.isArray(props.className)
        ? props.className
        : (props.className ? [props.className] : []);

    const btn = document.createElement('button');
    btn.className = className.join(' ');
    if (props.style) btn.style = props.style;
    if (props.onClick) btn.onclick = props.onClick;
    if (props.srOnly) {
        const srOnly = document.createElement('div');
        srOnly.className = global['sr-only'];
        srOnly.textContent = props.srOnly;
        btn.appendChild(srOnly);
    }

    if (props.dataTooltip) {
        const tooltip = document.createElement('span');
        tooltip.className = styles['visible-tooltip'];
        tooltip.textContent = props.dataTooltip;
        tooltip.ariaHidden = 'true';
        btn.appendChild(tooltip);
    }

    if (props.img) {
        const img = document.createElement('img');
        img.src = props.img;
        img.alt = props.alt || '';
        btn.appendChild(img);
        if (props.srOnly) img.ariaHidden = 'true';
    }
    
    return btn;
}