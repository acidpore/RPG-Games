export class Character {
  constructor(name, className) {
    this.name = name;
    this.className = className;
    this.level = 1;
    this.experience = 0;
    this.gold = 100; // Starting gold
    this.inventory = [];
    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null
    };
    
    // Enhanced base stats based on class
    const baseStats = {
      Warrior: { hp: 100, mp: 50, str: 15, dex: 10, int: 5, def: 12 },
      Mage: { hp: 70, mp: 100, str: 5, dex: 10, int: 15, def: 8 },
      Rogue: { hp: 85, mp: 70, str: 10, dex: 15, int: 8, def: 10 }
    };
    
    this.stats = baseStats[className];
    this.currentHp = this.stats.hp;
    this.currentMp = this.stats.mp;
    this.skills = this.initializeSkills();
  }

  initializeSkills() {
    const skillSets = {
      Warrior: [
        {
          name: 'Power Strike',
          mpCost: 10,
          damage: () => Math.floor(this.stats.str * 1.5),
          description: 'A powerful strike that deals 150% STR damage'
        },
        {
          name: 'Shield Block',
          mpCost: 15,
          effect: () => Math.floor(this.stats.def * 2),
          description: 'Doubles DEF for one turn'
        }
      ],
      Mage: [
        {
          name: 'Fireball',
          mpCost: 20,
          damage: () => Math.floor(this.stats.int * 2),
          description: 'Launches a fireball dealing 200% INT damage'
        },
        {
          name: 'Ice Shield',
          mpCost: 25,
          effect: () => Math.floor(this.stats.int * 0.5),
          description: 'Creates a protective shield based on INT'
        }
      ],
      Rogue: [
        {
          name: 'Backstab',
          mpCost: 15,
          damage: () => Math.floor(this.stats.dex * 1.8),
          description: 'Sneaky attack dealing 180% DEX damage'
        },
        {
          name: 'Dodge',
          mpCost: 20,
          effect: () => Math.floor(this.stats.dex * 0.8),
          description: 'Increases evasion based on DEX'
        }
      ]
    };
    
    return skillSets[this.className];
  }

  useSkill(skillIndex, target) {
    const skill = this.skills[skillIndex];
    if (!skill || this.currentMp < skill.mpCost) {
      return { success: false, message: 'Not enough MP!' };
    }

    this.currentMp -= skill.mpCost;
    
    if (skill.damage) {
      const damage = skill.damage();
      target.takeDamage(damage);
      return {
        success: true,
        damage,
        message: `Used ${skill.name} for ${damage} damage!`
      };
    }
    
    if (skill.effect) {
      const effect = skill.effect();
      return {
        success: true,
        effect,
        message: `Used ${skill.name}!`
      };
    }
  }

  equipItem(item) {
    if (!item.type || !this.equipment.hasOwnProperty(item.type)) {
      return false;
    }

    // Remove old equipment stats
    if (this.equipment[item.type]) {
      Object.entries(this.equipment[item.type].stats).forEach(([stat, value]) => {
        this.stats[stat] -= value;
      });
    }

    // Add new equipment stats
    Object.entries(item.stats).forEach(([stat, value]) => {
      this.stats[stat] += value;
    });

    this.equipment[item.type] = item;
    return true;
  }

  unequipItem(type) {
    if (!this.equipment[type]) {
      return false;
    }

    Object.entries(this.equipment[type].stats).forEach(([stat, value]) => {
      this.stats[stat] -= value;
    });

    this.equipment[type] = null;
    return true;
  }

  gainExperience(amount) {
    const levelDiffMultiplier = this.level <= 10 ? 1.5 : 1;
    this.experience += Math.floor(amount * levelDiffMultiplier);
    
    while (this.experience >= this.getNextLevelExp()) {
      this.levelUp();
    }
  }

  getNextLevelExp() {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  levelUp() {
    this.level++;
    
    const statGains = {
      Warrior: { hp: 15, mp: 5, str: 3, dex: 2, int: 1, def: 2 },
      Mage: { hp: 8, mp: 15, str: 1, dex: 2, int: 3, def: 1 },
      Rogue: { hp: 10, mp: 8, str: 2, dex: 3, int: 1, def: 1 }
    };
    
    const gains = statGains[this.className];
    Object.keys(gains).forEach(stat => {
      this.stats[stat] += gains[stat];
    });
    
    this.currentHp = this.stats.hp;
    this.currentMp = this.stats.mp;
  }

  rest() {
    this.currentHp = this.stats.hp;
    this.currentMp = this.stats.mp;
    return true;
  }

  respawn() {
    this.currentHp = this.stats.hp;
    this.currentMp = this.stats.mp;
    this.experience = Math.floor(this.experience * 0.9);
    this.gold = Math.floor(this.gold * 0.9);
    return true;
  }
}