import { calculateStats } from '../utils/statCalculator.js';

export class Enemy {
  constructor(type, level) {
    const templates = {
      Slime: {
        name: 'Slime',
        baseHp: 30,
        baseDmg: 5,
        expValue: 15,
        goldValue: 8,
        abilities: ['bounce', 'split'],
        type: 'normal',
        difficulty: 1
      },
      Goblin: {
        name: 'Goblin',
        baseHp: 45,
        baseDmg: 7,
        expValue: 25,
        goldValue: 12,
        abilities: ['bite', 'scratch'],
        type: 'normal',
        difficulty: 2
      },
      Skeleton: {
        name: 'Skeleton',
        baseHp: 60,
        baseDmg: 9,
        expValue: 35,
        goldValue: 15,
        abilities: ['boneCrush', 'undeadStrike'],
        type: 'undead',
        difficulty: 3
      },
      Orc: {
        name: 'Orc',
        baseHp: 80,
        baseDmg: 11,
        expValue: 45,
        goldValue: 20,
        abilities: ['rage', 'cleave'],
        type: 'brute',
        difficulty: 4
      },
      DarkMage: {
        name: 'Dark Mage',
        baseHp: 70,
        baseDmg: 13,
        expValue: 55,
        goldValue: 25,
        abilities: ['darkBolt', 'curse'],
        type: 'magic',
        difficulty: 5
      },
      Dragon: {
        name: 'Dragon',
        baseHp: 150,
        baseDmg: 20,
        expValue: 100,
        goldValue: 50,
        abilities: ['fireBreath', 'tailSwipe'],
        type: 'boss',
        difficulty: 6
      }
    };

    const template = templates[type];
    const stats = calculateStats(template, level);

    this.name = template.name;
    this.type = template.type;
    this.level = level;
    this.difficulty = template.difficulty;
    this.abilities = template.abilities;
    this.hp = stats.hp;
    this.damage = stats.damage;
    this.expValue = stats.expValue;
    this.goldValue = stats.goldValue;
    this.currentHp = this.hp;
  }

  attack() {
    const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
    const baseDamage = Math.floor(this.damage * (0.8 + Math.random() * 0.2)); // Reduced variance
    
    const abilityModifiers = {
      bounce: 0.6,
      split: 0.7,
      bite: 0.8,
      scratch: 0.9,
      boneCrush: 1.2,
      undeadStrike: 1.1,
      rage: 1.3,
      cleave: 1.1,
      darkBolt: 1.2,
      curse: 0.9,
      fireBreath: 1.5,
      tailSwipe: 1.2
    };

    return {
      damage: Math.floor(baseDamage * abilityModifiers[ability]),
      ability: ability
    };
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
    return this.currentHp === 0;
  }
}