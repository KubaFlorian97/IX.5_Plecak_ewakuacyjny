export type ItemType = 'collectible' | 'container' | 'wardrobe' | 'movable' | 'static';

export interface SpawnPoint {
    x: number;
    y: number;
    scale?: number;
    containerId?: string;
    zx?: number;
    zy?: number;
    zscale?: number;
    avoid?: string[];
    side?: 'left' | 'right';
}

export interface RoomEntityData extends ItemData {
    openSide?: 'left' | 'right';
}

export interface ItemData {
    id: string;
    type?: ItemType;
    imagePath: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    hitbox?: string;
    openHitbox?: string;
    scale?: number;
    isCorrect?: boolean;
    containerOpenImage?: string;
    zoomViewImage?: string;
    zoomAltImage?: string;
    zoomViewImageRight?: string;
    zoomDoorHitbox?: string;
    zoomAltHitbox?: string;
    contents?: string[];
    spawnPoints?: SpawnPoint[];
    isOpen?: boolean;
    name?: string;
    description?: string;
    feedback?: string;
    moveOffset?: { x: number, y: number };
}

export interface ItemPhonetics {
    name?: string;
    desc?: string;
}

export interface RoomData {
    id: string;
    name: string;
    background: string;
    items: ItemData[];
    spawnPoints: SpawnPoint[];
    darknessLevel?: number;
}

export interface Difficulty {
    id: string;
    name: string;
    timeLimit: number; 
    hintsEnabled: boolean;
    flashlightRadius: number;
    darknessEnabled?: boolean;
}

export interface Threat {
    id: string;
    name: string;
    description: string;
    alertMessage: string;
    icon: string;
    briefingAudio?: string;
    requiredItems: string[];
}

export interface Scenario {
    rooms: RoomData[];
    startRoomId: string;
    difficulties: Difficulty[];
    threats: Threat[];
}

export interface GameState {
    collectedItems: string[]; 
    currentRoomId: string;
    threatId?: string;       
    difficultyId?: string;   
    openedContainers?: string[]; 
    hasFlashlight?: boolean;
    timeLeft?: number;
    customDifficulty?: Difficulty;
    itemPlacements?: Record<string, SpawnPoint>;
}

export interface EngineSetting {
    id: string;
    enabled: boolean;
}

export interface TeacherSettings {
    difficulties: EngineSetting[];
    threats: EngineSetting[];
    rooms: { id: string, items: EngineSetting[] }[];
}