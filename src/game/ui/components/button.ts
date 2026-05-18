import { dom } from "~/nano_core/dom";
import * as ui from "../ui.css";

export interface ButtonProps {
    label: string;
    onClick: (e: MouseEvent) => void;
    variant?: 'primary' | 'secondary' | 'active';
    className?: string | string[];
    ariaLabel?: string;
}

export function createButton(props: ButtonProps): HTMLButtonElement {
    const variantClass = props.variant === 'secondary' ? ui['btn-secondary'] : props.variant === 'active' ? ui['btn-active'] : ui['btn-primary'];
    const extraClasses = Array.isArray(props.className)
        ? props.className
        : (props.className ? [props.className] : []);
    
    return dom('button', {
        className: [ui['btn'], variantClass, ...extraClasses],
        onclick: props.onClick,
        'aria-label': props.ariaLabel || props.label
    }, props.label);
}