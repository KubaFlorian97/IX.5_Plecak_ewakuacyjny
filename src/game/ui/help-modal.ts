import { dom } from "~/nano_core/dom";
import * as ui from "./ui.css";
import { t } from "~/utils/localization";
import { createButton } from "./components/button";
import { Modal } from "./components/modal";

export function createHelpModal(onClose: () => void): Modal {
    const buildList = (items: { control: string, desc: string }[]) => {
        return dom('ul', {
            className: ui['help-list'],
            style: 'text-align: left; margin-bottom: 1.5rem;'
        }, ...items.map(item => dom('li', { style: 'margin-bottom: 0.5rem' },
            dom('strong', { style: `color: var(--c-secondary);` }, `${item.control}: `),
            item.desc
        )));
    };

    const buildAccesabilityList = (items: string[]) => {
        return dom('ul', {
            className: ui['help-list'],
            style: 'text-align: left; margin-bottom: 1.5rem;'
        }, ...items.map(item => dom('li', { style: 'margin-bottom: 0.5rem' }, item)));
    };

    const content = dom('div', { className: ui['help-content'] },
        dom('h3', { style: 'margin-top: 0;' }, t('help.sec_how_to_play')),
        dom('span', { style: 'margin-bottom: 1.5rem;' }, t('help.txt_how_to_play')),

        dom('h3', { }, t('help.sec_controls')),
        buildList(Object.values(t('help.list_controls')) as any),

        dom('h3', { }, t('help.sec_hotkey')),
        buildList(Object.values(t('help.list_hotkey')) as any),

        dom('h3', { }, t('help.sec_accessability')),
        buildAccesabilityList(t('help.list_accessability') as unknown as string[]),

        dom('h3', { }, t('help.sec_sounds')),
        dom('span', { style: 'margin-bottom: 1.5rem' }, t('help.txt_sounds'))
    );

    return new Modal({
        title: t('help.title'),
        content: content,
        actions: createButton({
            label: t('help.btn_close'),
            variant: 'primary',
            onClick: onClose
        }),
        className: ui['modal-help']
    });
}