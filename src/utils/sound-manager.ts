import { path } from "@/zpe-port";
import { _gameWrapper } from "~/app";
import { Emitter } from "~/nano_core/emitter";
import { log } from "~/nano_core/log";

class SoundManager {
    private _sounds = new Map<string, HTMLAudioElement>();
    private _isUnlocked = false;

    private _sfxVolume = 1.0;
    private _musicVolume = 0.2;
    
    public sfxMuted = false;
    public musicMuted = false;

    public readonly onStateChanged = new Emitter<void>();

    private _activeSfx: HTMLAudioElement[] = [];
    private _currentMusic: HTMLAudioElement | null = null;
    private _currentVoiceover: HTMLAudioElement | null = null;

    private _aliases: Record<string, string> = {
        'drawer': 'audio/drawer.mp3',
        'collect': 'audio/item_collect.mp3',
        'drop': 'audio/item_drop.mp3',
        'click': 'audio/ui_click.mp3',
        'theme': 'audio/theme_loop.mp3',
        'intro': 'audio/intro.mp3',
        'darkness': 'audio/darkness_theme.mp3',
        'hardcore': 'audio/hardcore.mp3'
    };

    public setupAutoplayUnlock() {
        if (this._isUnlocked) return;
        const unlock = () => {
            this._isUnlocked = true;
            log.success("Audio odblokowane przez interakcję użytkownika.");

            if (this._currentMusic && this._currentMusic.paused && !this.musicMuted) {
                this._currentMusic.play().catch(e => log.error("Autoplay nadal zablokowane", e));
            }

            _gameWrapper.removeEventListener('click', unlock);
            _gameWrapper.removeEventListener('keydown', unlock);
            _gameWrapper.removeEventListener('touchstart', unlock);
        };

        _gameWrapper.addEventListener('click', unlock);
        _gameWrapper.addEventListener('keydown', unlock);
        _gameWrapper.addEventListener('touchstart', unlock);
    }

    public play(urlOrAlias: string, loop = false): HTMLAudioElement | null {
        const url = this._aliases[urlOrAlias] || urlOrAlias;
        const fullUrl = path(url);
        

        let baseAudio = this._sounds.get(fullUrl);
        if (!baseAudio) {
            baseAudio = new Audio(fullUrl);
            this._sounds.set(fullUrl, baseAudio);
        }

        const clone = baseAudio.cloneNode() as HTMLAudioElement;
        clone.loop = loop;
        clone.volume = this.sfxMuted ? 0 : this._sfxVolume;

        if (this._isUnlocked) {
            clone.play().catch(() => {});
        }

        this._activeSfx.push(clone);
        clone.addEventListener('ended', () => {
            this._activeSfx = this._activeSfx.filter(s => s !== clone);
        });
        return clone;
    }

    public playMusic(urlOrAlias: string) {
        if (this._currentMusic) this._currentMusic.pause();
        
        const url = this._aliases[urlOrAlias] || urlOrAlias;
        this._currentMusic = new Audio(path(url));
        this._currentMusic.loop = true;
        this._currentMusic.volume = this.musicMuted ? 0 : this._musicVolume;
        
        if (this._isUnlocked) {
            this._currentMusic.play().catch(() => {});
        }
    }

    public stopMusic() {
        if (this._currentMusic) {
            this._currentMusic.pause();
            this._currentMusic = null;
        }
    }

    public playVoiceover(url: string) {
        this.stopVoiceover();
        this._currentVoiceover = new Audio(path(url));
        this._currentVoiceover.volume = this.sfxMuted ? 0 : this._sfxVolume;

        if (this._isUnlocked) {
            this._currentVoiceover.play().catch(() => {});
        }
    }

    public stopVoiceover() {
        if (this._currentVoiceover) {
            this._currentVoiceover.pause();
            this._currentVoiceover = null;
        }
    }

    public toggleSfxMute() {
        this.sfxMuted = !this.sfxMuted;
        const vol = this.sfxMuted ? 0 : this._sfxVolume;
        this._activeSfx.forEach(s => s.volume = vol);
        if (this._currentVoiceover) this._currentVoiceover.volume = vol;
        this.onStateChanged.emmit();
    }

    public toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        if (this._currentMusic) this._currentMusic.volume = this.musicMuted ? 0 : this._musicVolume;
        this.onStateChanged.emmit();
    }

    public get sfxVolume() { return this._sfxVolume; }
    public get musicVolume() { return this._musicVolume; }

    public setSfxVolume(vol: number) {
        this._sfxVolume = vol;
        const actualVol = this.sfxMuted ? 0 : vol;
        this._activeSfx.forEach(a => a.volume = actualVol);
        if (this._currentVoiceover) this._currentVoiceover.volume = actualVol;
    }

    public setMusicVolume(vol: number) {
        this._musicVolume = vol;
        if (this._currentMusic) this._currentMusic.volume = this.musicMuted ? 0 : vol;
    }
}

export const soundManager = new SoundManager();