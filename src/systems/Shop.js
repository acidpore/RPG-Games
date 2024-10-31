import inquirer from 'inquirer';
import chalk from 'chalk';

export class ShopSystem {
  constructor() {
    this.inventory = {
      weapons: [
        {
          name: 'Iron Sword',
          type: 'weapon',
          cost: 100,
          stats: { str: 5 },
          requirement: { level: 1, class: ['Warrior', 'Rogue'] }
        },
        {
          name: 'Wooden Staff',
          type: 'weapon',
          cost: 100,
          stats: { int: 5 },
          requirement: { level: 1, class: ['Mage'] }
        },
        {
          name: 'Steel Dagger',
          type: 'weapon',
          cost: 100,
          stats: { dex: 5 },
          requirement: { level: 1, class: ['Rogue'] }
        },
        {
          name: 'Steel Sword',
          type: 'weapon',
          cost: 250,
          stats: { str: 10 },
          requirement: { level: 5, class: ['Warrior', 'Rogue'] }
        },
        {
          name: 'Crystal Staff',
          type: 'weapon',
          cost: 250,
          stats: { int: 10, mp: 20 },
          requirement: { level: 5, class: ['Mage'] }
        }
      ],
      armor: [
        {
          name: 'Leather Armor',
          type: 'armor',
          cost: 80,
          stats: { def: 3, hp: 10 },
          requirement: { level: 1 }
        },
        {
          name: 'Chain Mail',
          type: 'armor',
          cost: 200,
          stats: { def: 8, hp: 25 },
          requirement: { level: 5 }
        }
      ],
      accessories: [
        {
          name: 'Ring of Health',
          type: 'accessory',
          cost: 150,
          stats: { hp: 20 },
          requirement: { level: 1 }
        },
        {
          name: 'Magic Amulet',
          type: 'accessory',
          cost: 150,
          stats: { mp: 20 },
          requirement: { level: 1 }
        }
      ]
    };
  }

  async openShop(player) {
    while (true) {
      const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: `Welcome to the shop! You have ${player.gold} gold.`,
        choices: ['Buy', 'Sell', 'Exit']
      });

      if (action === 'Exit') break;

      if (action === 'Buy') {
        await this.buyItem(player);
      } else {
        await this.sellItem(player);
      }
    }
  }

  async buyItem(player) {
    const availableItems = Object.values(this.inventory)
      .flat()
      .filter(item => 
        item.requirement.level <= player.level &&
        (!item.requirement.class || item.requirement.class.includes(player.className))
      );

    const { itemIndex } = await inquirer.prompt({
      type: 'list',
      name: 'itemIndex',
      message: 'What would you like to buy?',
      choices: [
        ...availableItems.map((item, index) => ({
          name: `${item.name} (${item.cost} gold) - ${Object.entries(item.stats)
            .map(([stat, value]) => `${stat.toUpperCase()}: +${value}`)
            .join(', ')}`,
          value: index
        })),
        { name: 'Cancel', value: -1 }
      ]
    });

    if (itemIndex === -1) return;

    const item = availableItems[itemIndex];
    if (player.gold < item.cost) {
      console.log(chalk.red('\nNot enough gold!'));
      return;
    }

    player.gold -= item.cost;
    player.inventory.push(item);
    console.log(chalk.green(`\nBought ${item.name}!`));
  }

  async sellItem(player) {
    if (player.inventory.length === 0) {
      console.log(chalk.yellow('\nYour inventory is empty!'));
      return;
    }

    const { itemIndex } = await inquirer.prompt({
      type: 'list',
      name: 'itemIndex',
      message: 'What would you like to sell?',
      choices: [
        ...player.inventory.map((item, index) => ({
          name: `${item.name} (${Math.floor(item.cost * 0.5)} gold)`,
          value: index
        })),
        { name: 'Cancel', value: -1 }
      ]
    });

    if (itemIndex === -1) return;

    const item = player.inventory[itemIndex];
    const sellPrice = Math.floor(item.cost * 0.5);
    
    player.gold += sellPrice;
    player.inventory.splice(itemIndex, 1);
    console.log(chalk.green(`\nSold ${item.name} for ${sellPrice} gold!`));
  }
}