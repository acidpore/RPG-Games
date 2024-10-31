export class TimeSystem {
  constructor() {
    this.phases = ['Morning', 'Afternoon', 'Evening', 'Night'];
    this.currentPhaseIndex = 0;
  }

  getCurrentPhase() {
    return this.phases[this.currentPhaseIndex];
  }

  advance() {
    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
    return this.getCurrentPhase();
  }

  getEnemiesForPhase() {
    // Progressive difficulty based on time of day
    const enemies = {
      Morning: ['Slime', 'Goblin'],
      Afternoon: ['Goblin', 'Skeleton'],
      Evening: ['Skeleton', 'Orc', 'DarkMage'],
      Night: ['DarkMage', 'Dragon']
    };
    return enemies[this.getCurrentPhase()];
  }

  getDifficultyMultiplier() {
    // Increased challenge during later phases
    const multipliers = {
      Morning: 1.0,
      Afternoon: 1.1,
      Evening: 1.2,
      Night: 1.3
    };
    return multipliers[this.getCurrentPhase()];
  }
}