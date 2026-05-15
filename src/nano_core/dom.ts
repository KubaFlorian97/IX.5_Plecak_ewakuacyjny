export function dom<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: Record<string, string | boolean> = {},
    ...children: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') element.className = value as string;
        else if (typeof value === 'boolean' && value) element.setAttribute(key, '');
        else element.setAttribute(key, value as string);
    }

    children.forEach(child => {
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else element.appendChild(child);
    });

    return element;
}