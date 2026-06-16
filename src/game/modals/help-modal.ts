import { _gameWrapper } from "~/app";
import * as mainCss from "~/styles/main.css";
import * as styles from "./modals.css";
import * as inputs from "../components/inputs.css";
import { FocusTrap } from "~/utils/focus-trap";
import { SoundManager } from "~/utils/sound-manager";
import { t } from "~/utils/localization";
import { createButton } from "../components/button";

interface HelpControlEntry {
    control: string;
    desc: string;
}
type HelpControlsData = Record<string, HelpControlEntry>;

export class HelpModal {
    private _container: HTMLElement;
    private _element: HTMLElement;
    private _modal: HTMLElement;
    private _title!: HTMLElement;
    private _isOpen: boolean = false;
    private _focusTrap: FocusTrap;

    constructor(container: HTMLElement) {
        this._container = container;
        this._element = document.createElement("div");
        this._element.className = styles["modal-overlay"];
        this._element.style.display = "none";

        this._modal = document.createElement("div");
        this._modal.className = styles["modal"];
        this._modal.onclick = (e) => { e.stopPropagation(); };

        this._element.appendChild(this._modal);
        this._element.onclick = (e) => {
            if (e.target === this._element) {
                SoundManager.play('click');
                this.hide();
            }
        };

        this.build();

        this._focusTrap = new FocusTrap(this._modal);
        this._modal.addEventListener('close-modal', () => {
            SoundManager.play('click');
            this.hide();
        });
    }

    public show() {
        this._isOpen = true;
        this._container.appendChild(this._element);
        this._element.style.display = "flex";
        _gameWrapper.dispatchEvent(new CustomEvent('modal-toggled', { detail: { isOpen: true } }));
        this._focusTrap.activate();
    }

    public hide() {
        this._focusTrap.deactivate();
        this._element.style.display = "none";
        if (this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }
        _gameWrapper.dispatchEvent(new CustomEvent('modal-toggled', { detail: { isOpen: false } }));
        this._isOpen = false;
    }

    private build() {
        const modalTitle = document.createElement("h2");
        modalTitle.className = styles["modal-title"];
        modalTitle.textContent = t('help.title');
        this._modal.appendChild(modalTitle);

        const modalContent = document.createElement("div");
        modalContent.className = `${styles["modal-content"]} ${mainCss["scrollable"]}`;
        this._modal.appendChild(modalContent);

        // HELPERS
        const createHeader = (container: HTMLElement, textKey: string) => {
            const h3 = document.createElement("h3");
            h3.textContent = t(textKey);
            container.appendChild(h3);
        };

        const createParagraph = (container: HTMLElement, textKey: string) => {
            const p = document.createElement("span");
            p.textContent = t(textKey);
            container.appendChild(p);
        };

        const createList = (items: string[]) => {
            const ul = document.createElement("ul");
            ul.className = styles["help-list"];
            ul.setAttribute("role", "list");

            items.forEach(itemText => {
                const li = document.createElement("li");
                li.setAttribute("role", "listitem");
                li.textContent = itemText;
                ul.appendChild(li);
            });
            return ul;
        };

        const createListControls = (items: HelpControlEntry[]) => {
            const ul = document.createElement("ul");
            ul.className = styles["help-list"];
            ul.setAttribute("role", "list");

            items.forEach(item => {
                const li = document.createElement("li");
                li.setAttribute("role", "listitem");

                const strong = document.createElement("strong");
                strong.textContent = `${item.control}: `;
                li.appendChild(strong);
                li.appendChild(document.createTextNode(item.desc));
                ul.appendChild(li);
            });
            return ul;
        };

        // HOW TO PLAY
        createHeader(modalContent, 'help.sec_how_to_play');
        createParagraph(modalContent, 'help.txt_how_to_play');

        // CONTROLS
        const rawControls = t('help.list_controls') as unknown as HelpControlsData;
        const controlsList = rawControls ? Object.values(rawControls) : [];

        createHeader(modalContent, 'help.sec_controls');
        if (controlsList.length > 0) {
            modalContent.appendChild(createListControls(controlsList));
        }

        // HOTKEYS
        const rawHotkeys = t('help.list_hotkey') as unknown as HelpControlsData;
        const hotkeysList = rawHotkeys ? Object.values(rawHotkeys) : [];

        createHeader(modalContent, 'help.sec_hotkey');
        if (hotkeysList.length > 0) {
            modalContent.appendChild(createListControls(hotkeysList));
        }

        // ACCESSABILITY
        const accessability = t('help.list_accessability') as unknown as string[];

        createHeader(modalContent, 'help.sec_accessability');
        if (Array.isArray(accessability)) {
            modalContent.appendChild(createList(accessability));
        }

        // SOUNDS
        createHeader(modalContent, 'help.sec_sounds');
        createParagraph(modalContent, 'help.txt_sounds');

        // FOOTER
        const modalFooter = document.createElement('div');
        modalFooter.className = styles["modal-footer"];
        this._modal.appendChild(modalFooter);

        const closeBtn = createButton({
            label: t("help.btn_close"),
            className: inputs["btn-secondary"],
            onClick: () => {
                SoundManager.play('click');
                _gameWrapper.dispatchEvent(new CustomEvent('toggle-help', { bubbles: true }));
            }
        });
        modalFooter.appendChild(closeBtn);
    }

    public get isOpen(): boolean {
        return this._isOpen;
    }
}