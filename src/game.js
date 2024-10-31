import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { Character } from './models/Character.js';
import { Enemy } from './models/Enemy.js';
import { CombatSystem } from './systems/Combat.js';
import { TimeSystem } from './systems/TimeSystem.js';
import { SaveManager } from './utils/saveManager.js';
import { ShopSystem } from './systems/Shop.js';

class Game {
  constructor() {
    this.player = null;
    this.timeSystem = new TimeSystem();
    this.saveManager = new SaveManager();
    this.shopSystem = new ShopSystem();
  }

  async start() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('Node RPG', { horizontalLayout: 'full' })));
    
    const saves = this.saveManager.listSaves();
    let initialChoice = 'New Game';
    
    if (saves.length > 0) {
      const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'Choose an option:',
        choices: ['New Game', 'Load Game']
      });
      initialChoice = choice;
    }

    if (initialChoice === 'Load Game') {
      await this.loadGame();
    } else {
      await this.createNewGame();
    }
    
    await this.mainMenu();
  }

  async createNewGame() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter your character name:',
        validate: input => input.length > 0
      },
      {
        type: 'list',
        name: 'class',
        message: 'Choose your class:',
        choices: ['Warrior', 'Mage', 'Rogue']
      }
    ]);

    this.player = new Character(answers.name, answers.class);
    this.player.id = this.saveManager.generatePlayerId();
    console.log(chalk.green('\nCharacter created successfully!'));
    this.saveManager.saveGame(this.player, this.timeSystem);
  }

  async loadGame() {
    const saves = this.saveManager.listSaves();
    const { saveId } = await inquirer.prompt({
      type: 'list',
      name: 'saveId',
      message: 'Choose a save file:',
      choices: saves.map(save => ({
        name: `${save.name} (Level ${save.level} ${save.className})`,
        value: save.id
      }))
    });

    const saveData = this.saveManager.loadGame(saveId);
    if (saveData) {
      this.player = new Character(saveData.player.name, saveData.player.className);
      Object.assign(this.player, saveData.player);
      this.timeSystem.currentPhaseIndex = saveData.timeSystem.currentPhaseIndex;
      console.log(chalk.green('\nGame loaded successfully!'));
    }
  }

  async mainMenu() {
    while (true) {
      const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: `[${this.timeSystem.getCurrentPhase()}] What would you like to do?`,
        choices: [
          'View Status',
          'Battle',
          'Rest',
          'Shop',
          'Inventory',
          'Save Game',
          'Exit'
        ]
      });

      switch (choice) {
        case 'View Status':
          this.showStatus();
          break;
        case 'Battle':
          await this.startBattle();
          break;
        case 'Rest':
          await this.rest();
          break;
        case 'Shop':
          await this.shopSystem.openShop(this.player);
          break;
        case 'Inventory':
          await this.manageInventory();
          break;
        case 'Save Game':
          this.saveGame();
          break;
        case 'Exit':
          console.log(chalk.yellow('Thanks for playing!'));
          return;
      }
    }
  }

  async manageInventory() {
    if (this.player.inventory.length === 0) {
      console.log(chalk.yellow('\nYour inventory is empty!'));
      return;
    }

    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Inventory Management:',
      choices: ['Equip Item', 'Unequip Item', 'Back']
    });

    if (action === 'Back') return;

    if (action === 'Equip Item') {
      const { itemIndex } = await inquirer.prompt({
        type: 'list',
        name: 'itemIndex',
        message: 'Choose an item to equip:',
        choices: [
          ...this.player.inventory.map((item, index) => ({
            name: `${item.name} - ${Object.entries(item.stats)
              .map(([stat, value]) => `${stat.toUpperCase()}: +${value}`)
              .join(', ')}`,
            value: index
          })),
          { name: 'Cancel', value: -1 }
        ]
      });

      if (itemIndex !== -1) {
        const item = this.player.inventory[itemIndex];
        if (this.player.equipItem(item)) {
          this.player.inventory.splice(itemIndex, 1);
          console.log(chalk.green(`\nEquipped ${item.name}!`));
        }
      }
    } else {
      const { slot } = await inquirer.prompt({
        type: 'list',
        name: 'slot',
        message: 'Choose equipment slot to unequip:',
        choices: Object.entries(this.player.equipment)
          .filter(([_, item]) => item !== null)
          .map(([slot, item]) => ({
            name: `${slot}: ${item.name}`,
            value: slot
          }))
      });

      const unequippedItem = this.player.equipment[slot];
      if (this.player.unequipItem(slot)) {
        this.player.inventory.push(unequippedItem);
        console.log(chalk.green(`\nUnequipped ${unequippedItem.name}!`));
      }
    }
  }

  showStatus() {
    console.clear();
    console.log(chalk.cyan('\n=== Character Status ==='));
    console.log(chalk.white(`Time: ${this.timeSystem.getCurrentPhase()}`));
    console.log(chalk.white(`Name: ${this.player.name}`));
    console.log(chalk.white(`Class: ${this.player.className}`));
    console.log(chalk.white(`Level: ${this.player.level}`));
    console.log(chalk.white(`HP: ${this.player.currentHp}/${this.player.stats.hp}`));
    console.log(chalk.white(`MP: ${this.player.currentMp}/${this.player.stats.mp}`));
    console.log(chalk.white(`EXP: ${this.player.experience}/${this.player.getNextLevelExp()}`));
    console.log(chalk.white(`Gold: ${this.player.gold}`));
    console.log('\nStats:');
    Object.entries(this.player.stats).forEach(([stat, value]) => {
      console.log(chalk.white(`${stat.toUpperCase()}: ${value}`));
    });
    
    console.log('\nEquipment:');
    Object.entries(this.player.equipment).forEach(([slot, item]) => {
      console.log(chalk.white(`${slot}: ${item ? item.name : 'Empty'}`));
    });
    
    console.log('\nSkills:');
    this.player.skills.forEach(skill => {
      console.log(chalk.white(`${skill.name} (MP: ${skill.mpCost}) - ${skill.description}`));
    });
    
    console.log('\n');
  }

  async startBattle() {
    const enemyCount = Math.floor(1 + Math.random() * 2);
    const availableEnemies = this.timeSystem.getEnemiesForPhase();
    const enemies = [];

    for (let i = 0; i < enemyCount; i++) {
      const enemyType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
      const levelVariance = Math.floor(Math.random() * 3) - 1;
      const enemyLevel = Math.max(1, this.player.level + levelVariance);
      enemies.push(new Enemy(enemyType, enemyLevel));
    }
    
    console.clear();
    console.log(chalk.red(`\n${enemies.length} enemies appear in the ${this.timeSystem.getCurrentPhase()}!`));
    enemies.forEach(enemy => {
      console.log(chalk.red(`Level ${enemy.level} ${enemy.name} appears!`));
    });
    
    const combat = new CombatSystem(this.player, enemies);
    
    while (true) {
      console.log(chalk.white(`\nYour HP: ${this.player.currentHp}/${this.player.stats.hp}`));
      console.log(chalk.white(`Your MP: ${this.player.currentMp}/${this.player.stats.mp}`));
      enemies.forEach(enemy => {
        console.log(chalk.white(`${enemy.name}'s HP: ${enemy.currentHp}/${enemy.hp}`));
      });

      const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Choose your action:',
        choices: [
          'Attack',
          ...this.player.skills.map(skill => 
            `Use ${skill.name} (MP: ${skill.mpCost})`
          )
        ]
      });

      let battleEnd = false;

      if (action === 'Attack') {
        battleEnd = await combat.executeTurn();
        combat.log.forEach(message => console.log(message));
        combat.log = [];
      } else {
        const skillIndex = this.player.skills.findIndex(
          skill => `Use ${skill.name} (MP: ${skill.mpCost})` === action
        );
        const result = this.player.useSkill(skillIndex, enemies[0]);
        
        if (result.success) {
          console.log(chalk.green(result.message));
          if (enemies[0].currentHp <= 0) {
            const defeatedEnemy = enemies.shift();
            console.log(chalk.red(`${defeatedEnemy.name} has been defeated!`));
            
            if (enemies.length === 0) {
              battleEnd = true;
              const rewards = combat.calculateRewards();
              console.log(chalk.green(`\nVictory! Gained ${rewards.exp} EXP and ${rewards.gold} gold!`));
              this.player.gainExperience(rewards.exp);
              this.player.gold += rewards.gold;
            }
          }
          
          if (!battleEnd) {
            // Enemy turn
            for (const enemy of enemies) {
              const { damage, ability } = enemy.attack();
              const adjustedDamage = combat.adjustEnemyDamage(damage, enemy);
              this.player.currentHp -= adjustedDamage;
              console.log(chalk.red(`${enemy.name} uses ${ability} for ${adjustedDamage} damage!`));
              
              if (this.player.currentHp <= 0) {
                battleEnd = true;
                console.log(chalk.red('\nYou have been defeated!'));
                this.player.respawn();
                console.log(chalk.yellow('You have respawned with full HP!'));
                break;
              }
            }
          }
        } else {
          console.log(chalk.red(result.message));
        }
      }

      if (battleEnd) {
        this.saveManager.saveGame(this.player, this.timeSystem);
        break;
      }
    }
  }

  async rest() {
    console.clear();
    this.player.rest();
    this.timeSystem.advance();
    console.log(chalk.green('\nYou rest and recover all HP and MP.'));
    console.log(chalk.yellow(`Time advances to ${this.timeSystem.getCurrentPhase()}.`));
    this.saveManager.saveGame(this.player, this.timeSystem);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  saveGame() {
    const playerId = this.saveManager.saveGame(this.player, this.timeSystem);
    console.log(chalk.green('\nGame saved successfully!'));
  }
}

const game = new Game();
game.start();