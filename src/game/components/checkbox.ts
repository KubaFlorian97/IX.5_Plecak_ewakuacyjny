import * as styles from "./inputs.css";

export interface CheckboxProps {
    srOnly?: string;
    checked?: boolean;
    changeFn?: () => void
}

export function createCheckbox(props: CheckboxProps): { wrapper: HTMLElement, input: HTMLInputElement } {
    const chkWrapper = document.createElement("div");
    chkWrapper.className = styles["checkbox-wrapper"];

    const chkContainer = document.createElement("label");
    chkContainer.className = styles["chk-container"];

    const chk = document.createElement("input");
    chk.type = "checkbox";
    if (props.srOnly) chk.ariaLabel = props.srOnly;
    chk.checked = props.checked || false;
    if (props.changeFn) chk.onclick = props.changeFn;
    chkContainer.appendChild(chk);

    const checkmark = document.createElement("div");
    checkmark.className = styles["checkmark"];
    chkContainer.appendChild(checkmark);

    chkWrapper.appendChild(chkContainer);

    return { wrapper: chkWrapper, input: chk };
}