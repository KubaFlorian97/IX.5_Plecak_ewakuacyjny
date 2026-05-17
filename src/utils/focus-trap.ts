export class FocusTrap {
    private static _activeTraps: FocusTrap[] = [];
    
    // --- NOWOŚĆ: Referencja do kontenera gry i strażnika focusa ---
    private static _sharedParent: HTMLElement | null = null;
    
    public priority: number = 0; 

    private _modalElement: HTMLElement;
    private _isActive: boolean = false;
    private _lastFocusedElement: HTMLElement | null = null;
    private _windowElement: HTMLElement | null = null;
    
    private _boundKeyDown: (e: KeyboardEvent) => void;

    constructor(element: HTMLElement) {
        this._modalElement = element;
        this._windowElement = element.firstElementChild as HTMLElement;
        this._boundKeyDown = this.handleKeyDown.bind(this);
    }

    public activate(initialFocus?: HTMLElement) {
        if (this._isActive) return;
        this._isActive = true;

        this._modalElement.addEventListener('keydown', this._boundKeyDown);

        this._lastFocusedElement = document.activeElement as HTMLElement;
        if (this._lastFocusedElement) {
            this._lastFocusedElement.blur();
        }

        FocusTrap._activeTraps = FocusTrap._activeTraps.filter(t => t !== this);
        FocusTrap._activeTraps.push(this);
        FocusTrap.updateDOM();

        if (initialFocus) {
            setTimeout(() => initialFocus.focus(), 100);
        } else if (this._windowElement) {
            setTimeout(() => {
                if (this._windowElement) this._windowElement.focus();
            }, 100);
        }
    }

    public deactivate() {
        if (!this._isActive) return;
        this._isActive = false;

        this._modalElement.removeEventListener('keydown', this._boundKeyDown);

        FocusTrap._activeTraps = FocusTrap._activeTraps.filter(t => t !== this);
        FocusTrap.updateDOM();

        if (this._lastFocusedElement && this._lastFocusedElement.isConnected) {
            this._lastFocusedElement.focus();
        }
    }

    public refresh(newContext?: HTMLElement) {
        if (newContext) {
            this._modalElement = newContext;
            this._windowElement = newContext.firstElementChild as HTMLElement;
            if (this._isActive) FocusTrap.updateDOM();
        }
    }

    private static updateDOM() {
        // 1. Zdejmujemy wszystkie blokady z elementów w tle
        const managedElements = document.querySelectorAll('[data-trap-managed]');
        managedElements.forEach(el => {
            el.removeAttribute('inert');
            el.removeAttribute('aria-hidden');
            el.removeAttribute('data-trap-managed');
            (el as HTMLElement).style.pointerEvents = ''; // Zdejmujemy blokadę myszy

            const originalPointer = el.getAttribute('data-original-pointer-events');
            if (originalPointer !== null) {
                (el as HTMLElement).style.pointerEvents = originalPointer;
                el.removeAttribute('data-original-pointer-events');
            } else {
                (el as HTMLElement).style.pointerEvents = '';
            }
        });

        // 2. Jeśli nie ma pułapek, sprzątamy strażnika focusa z kontenera
        if (FocusTrap._activeTraps.length === 0) {
            if (FocusTrap._sharedParent) {
                FocusTrap._sharedParent.removeEventListener('focusin', FocusTrap.handleFocusIn);
                FocusTrap._sharedParent = null;
            }
            return;
        }

        const sortedTraps = [...FocusTrap._activeTraps].sort((a, b) => a.priority - b.priority);
        const topTrap = sortedTraps[sortedTraps.length - 1];
        const parent = topTrap._modalElement.parentElement;
        
        if (!parent) return;

        // 3. Podpinamy strażnika focusa (focusin) TYLKO do lokalnego kontenera
        if (FocusTrap._sharedParent !== parent) {
            if (FocusTrap._sharedParent) {
                FocusTrap._sharedParent.removeEventListener('focusin', FocusTrap.handleFocusIn);
            }
            FocusTrap._sharedParent = parent;
            parent.addEventListener('focusin', FocusTrap.handleFocusIn);
        }

        // 4. Blokujemy wszystko inne
        Array.from(parent.children).forEach(child => {
            const isGlobalFocus = child.getAttribute('data-global-focus') === 'true';
            const shouldKeepActive = isGlobalFocus && topTrap.priority < 50;

            if (child === topTrap._modalElement ||
                child.tagName === 'SCRIPT' ||
                child.tagName === 'STYLE' ||
                shouldKeepActive) {
                return; 
            }

            child.setAttribute('data-trap-managed', 'true');
            child.setAttribute('inert', '');
            child.setAttribute('aria-hidden', 'true');
            
            const htmlChild = child as HTMLElement;
            if (!child.hasAttribute('data-original-pointer-events')) {
                htmlChild.setAttribute('data-original-pointer-events', htmlChild.style.pointerEvents);
            }
            htmlChild.style.pointerEvents = 'none';
        });
    }

    // --- NOWOŚĆ: Lokalny Strażnik Focusa (Focus Guardian) ---
    private static handleFocusIn = (e: FocusEvent) => {
        if (FocusTrap._activeTraps.length === 0) return;
        const topTrap = FocusTrap._activeTraps[FocusTrap._activeTraps.length - 1];
        
        // Działa tylko dla modali Ustawień/Pomocy
        if (topTrap.priority < 50) return;

        const target = e.target as HTMLElement;
        const modal = topTrap._modalElement;

        // Jeśli sfokusowano element wewnątrz modala -> wszystko gra
        if (modal.contains(target)) return;

        // Jeśli to dozwolony pasek globalny (TopBar) -> gra (chociaż zablokowaliśmy go dla priority > 50)
        let isGlobal = false;
        let current = target;
        while (current && current !== FocusTrap._sharedParent) {
            if (current.getAttribute('data-global-focus') === 'true') {
                isGlobal = true; break;
            }
            current = current.parentElement as HTMLElement;
        }
        if (isGlobal && topTrap.priority < 50) return;

        // W każdym innym przypadku (gdy focus wpadł do StartScreen itp.) -> KRADNIEMY GO Z POWROTEM!
        e.preventDefault();
        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors))
            .filter(el => !el.hasAttribute('disabled') && !el.closest('[inert]'));

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            modal.focus();
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key !== 'Tab' || !this._isActive) return;

        const isTopTrap = FocusTrap._activeTraps[FocusTrap._activeTraps.length - 1] === this;
        if (!isTopTrap || this.priority < 50) return;

        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(this._modalElement.querySelectorAll<HTMLElement>(focusableSelectors))
            .filter(el => !el.hasAttribute('disabled') && !el.closest('[inert]'));

        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { 
            if (document.activeElement === firstElement || document.activeElement === this._modalElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else { 
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
}