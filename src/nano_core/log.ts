export const log = {
    info(message: string, ...args: any[]) {
        console.log(`%c[ZPE INFO] ${message}`, 'color: #007bff; font-weight: bold', ...args);
    },
    success(message: string, ...args: any[]) {
        console.log(`%c[ZPE SUCCESS] ${message}`, 'color: #28a745; font-weight: bold', ...args);
    },
    error(message: string, ...args: any[]) {
        console.log(`%c[ZPE ERROR] ${message}`, 'color: #dc3545; font-weight: bold', ...args);
    }
}