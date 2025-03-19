# Megami Quest 2: Combat System

## Overview

The combat system in Megami Quest 2 is a turn-based battle mechanic that pits the player's party members against boss enemies. Combat is primarily initiated when a player attempts to complete an area guarded by a boss, and the outcome determines progression through the game.

## Critical Invariants vs. Implementation Details

### Critical Invariants (Must Preserve Exactly)
- Turn order based strictly on speed stat (highest goes first)
- Multi-attack calculation: `Math.ceil(Math.random() * (member_speed/boss_speed))` with min 1, max 4
- Damage formula: `(member_strength - boss_defence) + (10 * (member_magic - boss_magic_defence))`
- Damage variance: ±5% using the `damage_margin()` function
- Healing formula: `5 * member_magic * healing_factor` with decreasing effectiveness
- Stamina effect thresholds (0%, 1-25%, 26-50%, 51-100%) and their stat multipliers
- Boss stat scaling in Infinite Cave using the power function `stat * level^2.5 * random_factor`

### Implementation Flexibility (Can Be Modernized)
- Visual representation of combat participants and their stats
- Animation system for attacks, healing, and damage
- User interface for combat controls and information display
- Method of displaying turn order queue
- Visual effects for critical hits, misses, and special attacks
- Implementation of the combat loop (can use modern frameworks/patterns)
- Fast-forward feature implementation (can use modern animation timing controls)

## Combat Participants

### Party Members
- Up to 4 members from the current party can participate in combat
- Only members with positive stamina and "active" status can join battles
- Each member has key combat stats: Strength, Speed, Magic, and Stamina

### Bosses
- Defined in the `boss_data` object with specific attributes
- Each boss has: HP, Attack, Speed, Defence, Magic Defence
- Bosses have rank values (0-2) determining their difficulty and rewards
- The Infinite Cave has special scaling bosses based on the current level

## Combat Flow

1. **Initialization**
   - Set battle participants and display their stats
   - Set initial HP values for both sides
   - Sort all participants by speed to determine turn order

2. **Turn-Based Execution**
   - Participants take turns in order of speed (highest speed goes first)
   - Actions depend on the participant type (member or boss)
   - Combat continues until one side is defeated (HP reduced to 0)

3. **Resolution**
   - If player wins: Area is completed, rewards given, possible area discovery
   - If boss wins: Party members lose stamina, player must try again

## Action Mechanics

### Member Actions
Members can perform two types of actions:

1. **Attack**: 
   - Base damage = `get_member_total_status(member, "strength") - boss.defence`
   - Magic damage = `10 * (get_member_total_status(member, "magic") - boss.mdefence)`
   - Total damage is the sum of physical and magical damage
   - Miss chance based on speed ratio: `Math.random() > 2 * (member_speed/boss_speed)`

2. **Heal** (automatic after attacks):
   - Healing amount = `5 * get_member_total_status(member, "magic") * healing_factor`
   - Healing factor decreases with each heal (starts at 0.99, multiplied by 1.2 each time)

### Boss Actions
Bosses perform a single attack action:
- Damage = `damage_margin(boss.attack)`
- Applies to all party members collectively (shared HP pool)

### Multi-Attack System
Based on speed ratio, members can attack multiple times per turn:
```javascript
var q = get_member_total_status(member, "speed") / boss.speed;
c = Math.ceil(Math.random() * q);
if (c > 4) c = 4;  // Maximum 4 attacks per turn
if (c == 0) c = 1; // Minimum 1 attack per turn
```

## Damage Calculation

The `damage_margin()` function adds variance to damage amounts:
```javascript
function damage_margin(a) {
    return Math.round(a + Math.random() * (a / 10) - a / 10 / 2);
}
```

This creates a damage range of approximately ±5% of the base damage value.

## Stats Influence

### Strength
- Primary determinant of physical damage
- Calculated as: `base_strength * (1 - ratio_speed - ratio_magic) * attr_strength`
- Reduced by boss defence value

### Speed
- Determines turn order
- Affects number of attacks per turn
- Calculated as: `base_strength * ratio_speed * attr_speed`

### Magic
- Determines magic damage and healing power
- Calculated as: `base_strength * ratio_magic * attr_magic`
- Reduced by boss magic defence value

### Stamina
- Affects overall combat effectiveness
- 0% = No participation in combat
- 1-25% = 25% of normal stats
- 26-50% = 50% of normal stats
- 51-100% = 100% of normal stats

## Boss Difficulty Progression

Bosses increase in difficulty throughout the game:
- Early bosses: HP 100-1000, Attack 5-100
- Mid-game bosses: HP 10,000-100,000, Attack 1,000-10,000
- Late-game bosses: HP 1,000,000+, Attack 100,000+
- Final boss (King of Abyss): HP 150,000,000, Attack 7,000,000

### Infinite Cave Scaling

The Infinite Cave features infinitely scaling bosses:
```javascript
a.hp = getJustNum(Math.round(a.hp * Math.pow(game.infinite_level, 2.5) * c));
a.attack = getJustNum(Math.round(a.attack * Math.pow(game.infinite_level, 2.5) * b));
a.speed = getJustNum(Math.round(a.speed * Math.pow(game.infinite_level, 2.5) * e));
```

This creates an endgame challenge that scales exponentially with the player's progress.

## Combat Rewards

### Victory Rewards
- Area completion (marking area as complete)
- Discovering new areas
- Special items from certain bosses
- Experience and gold from completing the area

### Defeat Penalties
- Loss of stamina (approximately 10 points per member)
- No progression in area completion

## Visual Effects

The combat system includes several visual effects to enhance the experience:
- Member attack animations (position shifts)
- Boss damage animations (position shifts)
- Damage number displays with easing effects
- Miss indicators
- Magic effects with particle animations
- Victory/defeat screens with special animations

## Fast Forward Feature

The game includes a "tempo" control to speed up combat:
- Normal tempo: animations play at standard speed
- Fast tempo: animations play at 5x speed (0.2x duration)

## Verification Examples

### 1. Basic Combat Scenario
- **Setup**: Party member with 500 strength, 300 speed, 100 magic vs Boss with 200 defense, 150 speed, 50 magic defense
- **Expected Results**:
  - Physical damage per hit: ~300 (±15)
  - Magic damage per hit: ~500 (±25)
  - Total damage per hit: ~800 (±40)
  - Average attacks per turn: 2 (ranging from 1-3 due to speed ratio of 2:1)
  - Miss chance: ~0% (ratio strongly favors the member)

### 2. Multi-Attack Edge Cases
- **Setup**: Member with extremely high speed (10x boss speed)
- **Expected Results**: 
  - Member should get exactly 4 attacks per turn (capped at maximum)
  - Almost never miss (speed ratio heavily favored)

### 3. Defense Overcoming Attack
- **Setup**: Member with 200 strength vs Boss with 300 defense
- **Expected Results**:
  - Physical damage should be minimal but not zero (should never go below 1)
  - Magic damage becomes the primary source of damage

### 4. Healing Effectiveness
- **Setup**: Member with 1000 magic
- **Expected Results**:
  - First heal: ~4950 HP
  - Second heal: ~4125 HP
  - Third heal: ~3437 HP (diminishing returns pattern)

## User Experience Recommendations

### Original Pain Points
- Combat animations cannot be skipped entirely, only accelerated
- No visual indication of probability for number of attacks
- No preview of expected damage before attacking
- Difficult to gauge relative party strength vs boss difficulty
- No turn queue visualization showing upcoming order

### Improvement Opportunities
- Add option to completely disable animations for ultra-fast combat
- Implement visible turn queue showing upcoming participant order
- Add damage preview indicators when selecting targets
- Display estimated difficulty rating comparing party strength to boss
- Show probability distribution for number of attacks based on speed ratio
- Add detailed combat log for reviewing what happened during battle
- Implement optional auto-battle for grinding scenarios

## Extension Points

- The combat system could be extended to include:
  - Status effects (poison, stun, etc.) for both members and bosses
  - Special abilities beyond basic attacks and healing
  - Consumable items that can be used during combat
  - Different member formations with strategic benefits
  - Boss-specific mechanics that require special strategies
  - Combo attacks between party members
  - Difficulty modifiers that affect drop rates and rewards

## Implementation Requirements

To replicate this combat system in a remastered version:

1. Implement the turn-based combat loop based on speed order
2. Create the damage calculation system with the variance formula
3. Build the multi-attack system based on speed ratios
4. Implement the magic damage and healing mechanics
5. Design boss encounters with appropriate stat scaling
6. Create visual feedback for combat actions and results
7. Include both normal and fast-forward playback options