export function calculateStats(template, level) {
  // Progressive scaling based on level ranges
  const getLevelMultiplier = (level) => {
    if (level <= 5) return 1 + (level - 1) * 0.08; // Gentler early game scaling
    if (level <= 10) return 1.4 + (level - 5) * 0.1; // Medium scaling
    return 1.9 + (level - 10) * 0.12; // Steeper late game scaling
  };

  const typeMultipliers = {
    normal: 1,
    undead: 1.1,
    brute: 1.2,
    magic: 1.15,
    boss: 1.5
  };

  const levelMultiplier = getLevelMultiplier(level);
  const multiplier = levelMultiplier * typeMultipliers[template.type];

  // Adjusted reward scaling for better progression
  const calculateReward = (baseValue) => {
    const rewardMultiplier = level <= 5 ? 1.2 : 1; // Bonus rewards for early levels
    return Math.floor(baseValue * multiplier * rewardMultiplier);
  };

  return {
    hp: Math.floor(template.baseHp * multiplier),
    damage: Math.floor(template.baseDmg * multiplier),
    expValue: calculateReward(template.expValue),
    goldValue: calculateReward(template.goldValue)
  };
}