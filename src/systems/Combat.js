import chalk from 'chalk';

export class CombatSystem {
  constructor(player, enemies) {
    this.player = player;
    this.enemies = Array.isArray(enemies) ? enemies : [enemies];
    this.log = [];
    this.combatStreak = 0;
  }

  async executeTurn() {
    // Player turn
    const targetEnemy = this.enemies[0];
    const damage = this.calculateDamage(this.player);
    const killed = targetEnemy.takeDamage(damage);
    this.addToLog(`You attack ${targetEnemy.name} for ${damage} damage!`);
    
    if (killed) {
      this.enemies.shift();
      this.handleEnemyDeath(targetEnemy);
      
      if (this.enemies.length === 0) {
        return this.handleVictory();
      }
    }

    // Enemies turn with adjusted difficulty
    for (const enemy of this.enemies) {
      const { damage, ability } = enemy.attack();
      const adjustedDamage = this.adjustEnemyDamage(damage, enemy);
      this.player.currentHp -= adjustedDamage;
      this.addToLog(
        `${enemy.name} uses ${ability} for ${adjustedDamage} damage!`
      );
      
      if (this.player.currentHp <= 0) {
        return this.handleDefeat();
      }
    }

    return false;
  }

  adjustEnemyDamage(damage, enemy) {
    // Reduce damage for early game enemies
    if (this.player.level <= 3 && enemy.difficulty <= 2) {
      return Math.floor(damage * 0.8);
    }
    return damage;
  }

  calculateDamage(attacker) {
    const base = attacker.stats?.str || attacker.damage;
    const variance = 0.15; // Reduced variance for more consistent damage
    return Math.floor(base * (1 - variance + Math.random() * (variance * 2)));
  }

  handleEnemyDeath(enemy) {
    this.combatStreak++;
    this.addToLog(chalk.red(`${enemy.name} has been defeated!`));
  }

  calculateRewards() {
    let totalExp = this.calculateTotalExpReward();
    let totalGold = this.enemies.reduce((sum, e) => sum + e.goldValue, 0);
    
    // Streak bonuses
    if (this.combatStreak > 1) {
      const streakBonus = Math.min(1.5, 1 + (this.combatStreak - 1) * 0.1);
      totalExp = Math.floor(totalExp * streakBonus);
      totalGold = Math.floor(totalGold * streakBonus);
      this.addToLog(chalk.blue(`Battle streak x${this.combatStreak}! Bonus rewards!`));
    }
    
    return { exp: totalExp, gold: totalGold };
  }

  handleVictory() {
    const rewards = this.calculateRewards();
    this.player.gainExperience(rewards.exp);
    this.player.gold += rewards.gold;
    
    this.addToLog(chalk.green(`Victory! Gained ${rewards.exp} EXP and ${rewards.gold} gold!`));
    return true;
  }

  handleDefeat() {
    this.combatStreak = 0;
    this.addToLog(chalk.red('You have been defeated!'));
    this.player.respawn();
    this.addToLog(chalk.yellow('You have respawned with full HP!'));
    return true;
  }

  calculateTotalExpReward() {
    return this.enemies.reduce((total, enemy) => {
      // Enhanced rewards for challenging fights
      if (enemy.level > this.player.level) {
        return total + Math.floor(enemy.expValue * (1 + (enemy.level - this.player.level) * 0.15));
      } else if (enemy.level < this.player.level - 4) {
        return total + Math.floor(enemy.expValue * 0.5);
      } else if (enemy.level < this.player.level) {
        return total + Math.floor(enemy.expValue * (1 - (this.player.level - enemy.level) * 0.1));
      }
      
      // Early game bonus
      if (this.player.level <= 5) {
        return total + Math.floor(enemy.expValue * 1.2);
      }
      
      return total + enemy.expValue;
    }, 0);
  }

  addToLog(message) {
    this.log.push(message);
  }
}