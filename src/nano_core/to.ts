export const to = {
    boolean(value: any): boolean {
        return value === true ||
            value === 'true' ||
            value === 1 ||
            value === '1';
    },
    
    number(value: any, fallback: number = 0): number {
        const parsed = Number(value);
        return isNaN(parsed) ? fallback : parsed;
    },

    string(value: any, fallback: string = ''): string {
        return value != null ? String(value) : fallback;
    }
}