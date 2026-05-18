import { translations, Language } from "../lang/translations";

export class Localization {
    private static _currentLang: Language = 'pl';
    static setLanguage(lang: Language) { this._currentLang = lang; }
    static getLanguage() { return this._currentLang; }
    static t(key: string, replacements?: Record<string, string | number>): string {
        const keys = key.split('.');
        let value: any = translations[this._currentLang];
        for (const k of keys) {
            if (value && value[k]) value = value[k];
            else return key;
        }
        if (typeof value === 'string' && replacements) {
            for (const p in replacements) value = value.replace(`{${p}}`, replacements[p].toString());
        }
        return value as string;
    }
}
export const t = Localization.t.bind(Localization);