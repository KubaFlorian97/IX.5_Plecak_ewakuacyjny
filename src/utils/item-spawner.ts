import { log } from "~/nano_core/log";
import { Scenario, SpawnPoint } from "~/types/types";

export function generateItemPlacements(scenario: Scenario): Record<string, SpawnPoint> {
    const placements: Record<string, SpawnPoint> = {};

    scenario.rooms.forEach(room => {
        const collectibles = room.items.filter(item => item.type === 'collectible' || item.type === undefined);
        
        let availablePoints: (SpawnPoint & { containerId?: string })[] = [];

        if (room.spawnPoints) {
            availablePoints.push(...room.spawnPoints);
        }

        room.items.forEach(item => {
            if ((item.type === 'container' || item.type === 'wardrobe') && item.spawnPoints) {
                item.spawnPoints.forEach(sp => {
                    availablePoints.push({ ...sp, containerId: item.id });
                });
            }
        });

        availablePoints.sort(() => Math.random() - 0.5);

        collectibles.forEach(item => {
            const pointIdx = availablePoints.findIndex(sp => {
                if (sp.containerId) {
                    const container = room.items.find(i => i.id === sp.containerId);
                    return container?.contents?.includes(item.id);
                } else {
                    return !sp.avoid?.includes(item.id);
                }
            });

            if (pointIdx !== -1) {
                placements[item.id] = availablePoints[pointIdx];
                availablePoints.splice(pointIdx, 1);
            } else {
                log.warn(`[Spawner] Nie znaleziono pasującego punktu dla ${item.id}`);
            }
        });
    });

    log.success("Wygenerowano nową losową mapę przedmiotów!");
    return placements;
}