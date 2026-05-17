export function dom<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: Record<string, any> = {},
    ...children: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            if (Array.isArray(value)) element.className = value.filter(Boolean).join(' ');
            else if (typeof value === 'string') element.className = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            (element as any)[key] = value;
        } else if (typeof value === 'boolean') {
            if (value) element.setAttribute(key, '');
        } else if (value !== null && value !== undefined) {
            element.setAttribute(key, String(value));
        }
    }

    children.forEach(child => {
        if (!child) return;
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else element.appendChild(child as Node);
    });

    return element;
}