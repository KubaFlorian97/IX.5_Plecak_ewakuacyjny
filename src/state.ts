import { Value } from "./nano_core/value";
import { GameState, Difficulty, Threat } from "./types/types";

const defaultState: GameState = {
    collectedItems: [],
    currentRoomId: 'living_room',
    openedContainers: [],
    hasFlashlight: false,
    timeLeft: 0
};

export class State {
    public readonly current = new Value<GameState>({ ...defaultState });

    public get(): GameState {
        return JSON.parse(JSON.stringify(this.current.get()));
    }

    public set(newState: Partial<GameState>): void {
        const updated = { ...this.current.get(), ...newState };
        this.current.set(updated);
    }

    public reset(): void {
        this.current.set({ ...defaultState });
    }
}

export const state = new State();