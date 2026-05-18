import { Component } from "~/nano_core/component";
import { dom } from "~/nano_core/dom";
import * as ui from "../ui.css";
import { FocusTrap } from "~/utils/focus-trap";

export interface ModalProps {
    title: string;
    description?: string;
    content?: HTMLElement | HTMLElement[];
    actions?: HTMLElement | HTMLElement[];
    className?: string | string[];
}

export class Modal extends Component {
    private _focusTrap: FocusTrap;

    constructor(props: ModalProps) {
        super(dom('div', {
            className: ui['modal-overlay'],
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': 'modal-title'
        }));

        const extraClasses = Array.isArray(props.className) ? props.className : [props.className];

        const windowEl = dom('div', { className: [ ui['modal-window'], ...extraClasses ] });
        windowEl.appendChild(dom('h2', { className: ui['modal-title'], id: 'modal-title' }, props.title));
        
        if (props.description) {
            windowEl.appendChild(dom('p', {}, props.description));
        }

        if (props.content) {
            const contents = Array.isArray(props.content) ? props.content : [props.content];
            contents.forEach(c => windowEl.appendChild(c));
        }

        if (props.actions) {
            const actionContainer = dom('div', { className: ui['modal-actions'] });
            const actions = Array.isArray(props.actions) ? props.actions : [props.actions];
            actions.forEach(a => actionContainer.appendChild(a));
            windowEl.appendChild(actionContainer);
        }

        this.element.appendChild(windowEl);
        this._focusTrap = new FocusTrap(this.element);
    }

    public render() {
        this._focusTrap.activate();
    }

    public dispose() {
        this._focusTrap.deactivate();
        super.dispose();
    }
}