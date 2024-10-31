import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class SaveManager {
  constructor() {
    this.savePath = './saves';
    this.ensureSaveDirectory();
  }

  ensureSaveDirectory() {
    if (!fs.existsSync(this.savePath)) {
      fs.mkdirSync(this.savePath, { recursive: true });
    }
  }

  generatePlayerId() {
    return uuidv4();
  }

  saveGame(player, timeSystem) {
    const saveData = {
      player: {
        id: player.id || this.generatePlayerId(),
        name: player.name,
        className: player.className,
        level: player.level,
        experience: player.experience,
        gold: player.gold,
        stats: player.stats,
        inventory: player.inventory,
        equipment: player.equipment
      },
      timeSystem: {
        currentPhaseIndex: timeSystem.currentPhaseIndex
      },
      timestamp: new Date().toISOString()
    };

    const fileName = `${saveData.player.id}.json`;
    fs.writeFileSync(
      `${this.savePath}/${fileName}`,
      JSON.stringify(saveData, null, 2)
    );

    return saveData.player.id;
  }

  loadGame(playerId) {
    try {
      const saveData = JSON.parse(
        fs.readFileSync(`${this.savePath}/${playerId}.json`, 'utf8')
      );
      return saveData;
    } catch (error) {
      return null;
    }
  }

  listSaves() {
    try {
      return fs.readdirSync(this.savePath)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const saveData = JSON.parse(
            fs.readFileSync(`${this.savePath}/${file}`, 'utf8')
          );
          return {
            id: saveData.player.id,
            name: saveData.player.name,
            level: saveData.player.level,
            className: saveData.player.className,
            timestamp: saveData.timestamp
          };
        });
    } catch (error) {
      return [];
    }
  }
}