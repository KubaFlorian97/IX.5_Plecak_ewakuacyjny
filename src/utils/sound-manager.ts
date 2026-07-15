import { path } from "@/zpe-port"
import { t } from "./localization";

export class SoundManager {
    // Cache przechowujący dźwięki na podstawie ich pełnego URL
    private static _sounds: Map<string, HTMLAudioElement> = new Map();
    private static _isUnlocked: boolean = false;
    
    private static _globalMuted: boolean = false;
    
    // SFX
    private static _sfxVolume: number = 1.0;
    private static _sfxMuted: boolean = false;
    private static _activeSfx: HTMLAudioElement[] = [];

    // Music
    private static _musicVolume: number = 0.2; 
    private static _musicMuted: boolean = false;
    private static _currentMusic: HTMLAudioElement | null = null;
    private static _pendingMusicSrc: string | null = null;

    private static _musicFadeInterval: any = null;

    // Voiceover
    private static _currentVoiceover: HTMLAudioElement | null = null;

    // System subskrypcji dla UI (np. TopBar, SettingsModal)
    private static _listeners: (() => void)[] = [];

    // --- ORYGINALNE ALIASY ---
    private static _aliases: Record<string, string> = {
        'click': 'audio/ui_click.mp3',
        'theme_loop': 'audio/theme_loop.mp3'
    };

    // --- SUBSKRYPCJE ZDARZEŃ ---
    public static subscribe(listener: () => void) {
        this._listeners.push(listener);
    }

    public static unsubscribe(listener: () => void) {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    private static notifyListeners() {
        this._listeners.forEach(cb => cb());
    }

    // --- ODBLOKOWANIE AUDIO ---
    public static unlockAudio() {
        // Zabezpieczenie przed blokowaniem autoplay: puszczamy oczekującą muzykę po kliknięciu
        if (this._pendingMusicSrc) {
            this.playMusic(this._pendingMusicSrc);
            this._pendingMusicSrc = null;
        }
    }

    // --- PRELOAD DLA ASSETLOADERA ---
    public static load(src: string): Promise<void> {
        return new Promise((resolve) => {
            const audio = new Audio();
            let isResolved = false;

            const finish = () => {
                if (isResolved) return;
                isResolved = true;
                this._sounds.set(src, audio); // Zapis do cache pod pełnym adresem
                resolve();
            };

            audio.addEventListener('canplaythrough', finish, { once: true });
            audio.addEventListener('error', finish, { once: true });
            
            audio.preload = "auto";
            audio.src = src;
            audio.load();

            setTimeout(finish, 3000); // 3-sekundowy bezpiecznik
        });
    }

    // --- ODTWARZANIE SFX ---
    public static play(id: string) {
        if (document.hidden) return;
        
        // Odkodowanie aliasu, jeśli istnieje
        const aliasPath = this._aliases[id] || id;
        const fullUrl = (window as any).ZPE ? (window as any).ZPE.path(aliasPath) : path(aliasPath);
        
        let baseAudio = this._sounds.get(fullUrl);
        if (!baseAudio) {
            baseAudio = new Audio(fullUrl);
            this._sounds.set(fullUrl, baseAudio);
        }
        
        const audio = baseAudio.cloneNode() as HTMLAudioElement;
        audio.volume = this._sfxMuted ? 0 : this._sfxVolume;
        this._activeSfx.push(audio);
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.warn("[SoundManager] SFX play blocked", e));
        }
        
        audio.onended = () => {
            this._activeSfx = this._activeSfx.filter(a => a !== audio);
        };
    }

    // --- ODTWARZANIE MUZYKI W TLE ---
    public static playMusic(alias: string, fadeTimeMs: number = 1000) {
        const src = this._aliases[alias];
        if (!src) return;

        // Tutaj pobieramy plik z pamięci cache (zależnie od tego, jak zapisujesz klucze w AssetLoader, 
        // może tu być potrzebne użycie funkcji path(src))
        const nextMusic = this._sounds.get(src) || this._sounds.get(path(src));
        if (!nextMusic) return;

        // Jeśli ten sam utwór już gra, nie robimy nic, żeby go nie zrestartować
        if (this._currentMusic === nextMusic && !nextMusic.paused) return;

        // Jeśli w trakcie było inne przenikanie, anulujemy je
        if (this._musicFadeInterval) {
            clearInterval(this._musicFadeInterval);
            this._musicFadeInterval = null;
        }

        const isSameMusic = this._currentMusic === nextMusic;
        const prevMusic = isSameMusic ? null : this._currentMusic;
        this._currentMusic = nextMusic;

        // Przygotowujemy nowy utwór (od zera jeśli to nowy utwór)
        this._currentMusic.loop = true;
        if (!isSameMusic) {
            this._currentMusic.volume = 0; 
        }
        
        // Jeśli nie jest globalnie wyciszone, odpalamy odtwarzanie
        if (!this._musicMuted && !this._globalMuted) {
            if (!document.hidden) {
                this._currentMusic.play().catch(e => {
                    console.warn("Błąd autoodtwarzania audio:", e);
                    this._pendingMusicSrc = alias;
                });
            } else {
                this._pendingMusicSrc = alias;
            }
        }

        // Ustalamy docelową głośność i parametry kroku
        const targetVolume = (this._musicMuted || this._globalMuted) ? 0 : this._musicVolume;
        const steps = 20; // Rozdzielczość animacji
        const stepTime = fadeTimeMs / steps;
        
        let currentStep = 0;
        let startPrevVolume = prevMusic ? prevMusic.volume : 0;

        // Główna pętla przenikania (Crossfade)
        this._musicFadeInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            // Ściszanie starego utworu
            if (prevMusic) {
                prevMusic.volume = Math.max(0, startPrevVolume * (1 - progress));
            }

            // Pogłaśnianie nowego utworu
            if (this._currentMusic) {
                this._currentMusic.volume = targetVolume * progress;
            }

            // Zakończenie przenikania
            if (currentStep >= steps) {
                clearInterval(this._musicFadeInterval);
                this._musicFadeInterval = null;

                if (prevMusic) {
                    prevMusic.pause();
                    prevMusic.currentTime = 0; // Przewijamy stary utwór do początku
                }
                
                if (this._currentMusic) {
                    this._currentMusic.volume = targetVolume; // Wyrównanie dla pewności
                }
            }
        }, stepTime);
    }

    // --- USTAWIENIA GŁOŚNOŚCI I WYCISZENIA ---
    public static getGlobalMute(): boolean {
        return this._globalMuted;
    }

    public static setGlobalMute(mute: boolean) {
        this._globalMuted = mute;
        this._musicMuted = mute;
        this._sfxMuted = mute;

        if (this._currentMusic) {
            this._currentMusic.volume = this._musicMuted ? 0 : this._musicVolume;
        }
        
        this._activeSfx.forEach(audio => {
            audio.volume = this._sfxMuted ? 0 : this._sfxVolume;
        });
        
        if (this._currentVoiceover) {
            this._currentVoiceover.volume = this._sfxMuted ? 0 : this._sfxVolume;
        }

        this.notifyListeners();

        const audioMute = mute ? 'wyłączone' : 'włączone';
    }

    public static setMusicVolume(volume: number) {
        this._musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this._globalMuted) this._globalMuted = false;
        this._musicMuted = false;

        if (this._currentMusic) {
            this._currentMusic.volume = this._musicMuted ? 0 : this._musicVolume;
        }
        this.notifyListeners();
    }

    public static setSfxVolume(volume: number) {
        this._sfxVolume = Math.max(0, Math.min(1, volume));
        
        if (this._globalMuted) this._globalMuted = false;
        this._sfxMuted = false;

        this._activeSfx.forEach(audio => {
            audio.volume = this._sfxMuted ? 0 : this._sfxVolume;
        });
        if (this._currentVoiceover) {
            this._currentVoiceover.volume = this._sfxMuted ? 0 : this._sfxVolume;
        }
        this.notifyListeners();
    }

    public static setMusicMute(mute: boolean) {
        if (this._musicFadeInterval) clearInterval(this._musicFadeInterval);
        
        this._musicMuted = mute;
        if (!mute && this._globalMuted) this._globalMuted = false;
        
        if (this._currentMusic) {
            this._currentMusic.volume = this._musicMuted ? 0 : this._musicVolume;
        }
        this.notifyListeners();
        const musicLabel = this._musicMuted ? 'włączone' : 'wyłączone';
    }

    public static setSfxMute(mute: boolean) {
        this._sfxMuted = mute;
        if (!mute && this._globalMuted) this._globalMuted = false;

        this._activeSfx.forEach(audio => {
            audio.volume = this._sfxMuted ? 0 : this._sfxVolume;
        });
        if (this._currentVoiceover) {
            this._currentVoiceover.volume = this._sfxMuted ? 0 : this._sfxVolume;
        }
        this.notifyListeners();
        const sfxLabel = this._sfxMuted ? 'włączone' : 'wyłączone';
    }

    public static getMusicVolume(): number { return this._musicVolume; }
    public static getSfxVolume(): number { return this._sfxVolume; }
    public static getMusicMute(): boolean { return this._musicMuted; }
    public static getSfxMute(): boolean { return this._sfxMuted; }

    public static stopAll() {
        if (this._currentMusic) {
            this._currentMusic.pause();
            this._currentMusic = null;
        }
        this._activeSfx.forEach(a => a.pause());
        this._activeSfx = [];
    }

    public static pauseAll() {
        if (this._currentMusic && !this._currentMusic.paused) {
            this._currentMusic.pause();
        }
        this._activeSfx.forEach(a => {
            if (!a.paused) a.pause();
        });
        if (this._currentVoiceover && !this._currentVoiceover.paused) {
            this._currentVoiceover.pause();
        }
    }

    public static resumeAll() {
        if (!this._globalMuted) {
            if (this._currentMusic && !this._musicMuted && this._currentMusic.paused) {
                this._currentMusic.play().catch(e => console.warn(e));
            }
            if (!this._sfxMuted) {
                this._activeSfx.forEach(a => {
                    if (a.paused && !a.ended) a.play().catch(e => console.warn(e));
                });
                if (this._currentVoiceover && this._currentVoiceover.paused && !this._currentVoiceover.ended) {
                    this._currentVoiceover.play().catch(e => console.warn(e));
                }
            }
        }
    }

    public static setupAutoplayUnlock() {
        if (this._isUnlocked) return;

        const unlock = () => {
            if (this._isUnlocked) return;

            if (this._pendingMusicSrc) {
                this.playMusic(this._pendingMusicSrc);
                this._pendingMusicSrc = null;
            }

            if (this._currentMusic && this._currentMusic.paused && !this._musicMuted && !this._globalMuted) {
                const playPromise = this._currentMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this._isUnlocked = true;
                        cleanup();
                    }).catch(e => console.warn("Audio nadal zablokowane:", e));
                }
            } else if (!this._currentMusic || (!this._currentMusic.paused && !this._musicMuted && !this._globalMuted)) {
                this._isUnlocked = true;
                cleanup();
            }
        };

        const cleanup = () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock);
        };

        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        document.addEventListener('touchstart', unlock);
    }
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        SoundManager.pauseAll();
    } else {
        SoundManager.resumeAll();
    }
});