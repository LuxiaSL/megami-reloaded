# Megami Quest 2: Resource Generation System

## Overview

The resource generation system is the core economic loop of Megami Quest 2. It determines how the player earns gold and experience points over time, creating the incremental gameplay that allows progression while idle.

## Critical Invariants vs. Implementation Details

### Critical Invariants (Must Preserve Exactly)
- Resource generation formula: `area.resource * strength_multiplier * Math.max(strong_member_num, 1)`
- Strength multiplier calculation: `party_strength/area_difficulty` (capped between 0.5 and 5)
- Stamina thresholds and their effects (0%, 1-25%, 26-50%, 51-100%)
- Experience distribution formula with remainder allocation
- Level calculation from experience: `Level = EXP^level_index` (where level_index is 0.36-0.42)
- Idle progression reward capped at 60 minutes and calculated at 2x hourly rate
- Item drop rate calculations and probabilities
- Multi-party system with up to 3 simultaneous resource-generating parties

### Implementation Flexibility (Can Be Modernized)
- Method of displaying resource gains (animations, number formatting)
- UI for showing resource generation rates and projections
- Implementation of the main_func() tick timing (can use requestAnimationFrame)
- Visualization of stamina and its effects on production
- Method of calculating and displaying offline progress rewards
- Storage mechanism for resource values (as long as precision is maintained)

## Key Resources

### Gold
- Primary currency for purchasing items, summoning members, and other actions
- Accumulated automatically based on area and party strength
- Stored as floating point number, but displayed rounded down
- Tracked as both current gold and total gold earned (lifetime)

### Experience Points
- Used to level up party members
- Distributed among active members in the party
- Each member stores their own experience value
- Level determined by formula: `Level = EXP^level_index`

### Special Resources
- Blood of Ymir: Enhances member strength attribute
- Saliva of Fenrir: Enhances member speed attribute
- Flame of Surtr: Enhances member magic attribute
- These are rare drops from specific areas or bosses

## Resource Generation Algorithm

The resource generation happens in the `main_func()` function and follows these steps:

1. For each party in a non-moving state:
   - Calculate party's total strength, speed, and number of valid members
   - Compare total strength to area's base difficulty

2. If party is strong enough (total strength > area base difficulty):
   - Gold Generation: `area.give_gold * Math.max(strong_member_num, 1)`
   - EXP Generation: `area.give_exp` divided among valid members
   - Item Drops: Random chance based on area's give_item probability table

3. If party is too weak (total strength < area base difficulty):
   - Decrease member stamina: `give_member_stamina(a, c, 2 * -(1 - e))`
   - No resources are generated

### Strength Multiplier
The amount of resources gained is modified by a multiplier based on the party's strength relative to the area's difficulty:

```javascript
var e = d.valid_total_strength / area_data[b].base;
if (e > 5) e = 5;  // Cap at 5x
if (e < 0.5) e = 0.5;  // Minimum of 0.5x
```

This creates a scaling system where:
- At exactly matching strength (1:1), resources are generated at base rate
- At 5x strength or higher, resources are generated at 5x the base rate
- Below 0.5x strength, no resources are generated and stamina decreases

### Member Strength Thresholds

A member is considered "strong" for an area if their individual strength exceeds the area's base difficulty. This affects both gold generation (multiplier) and stamina consumption.

## Experience Distribution

Experience is distributed evenly among active members, with remainder going to members in order:

```javascript
var f = Math.floor(g / d.valid_member_num),
    m = g % d.valid_member_num;

// For each member
if (isFine(k[l])) {
    var n = Number(f);
    if (0 < m) {
        n++;
        m--;
    }
    give_member_exp(a, c, n);
}
```

## Resource Balancing

The game's resources are balanced through several mechanisms:

1. **Area Scaling**: Areas have increasing base difficulties and resource values
   - Early areas: 0.1-1 gold, 1-5 exp per second
   - Mid-game areas: 10-50 gold, 30-100 exp per second
   - Late-game areas: 100+ gold, 500+ exp per second

2. **Stamina System**: Members with low stamina produce fewer resources
   - 0% stamina = 0% production
   - 1-25% stamina = 25% production
   - 26-50% stamina = 50% production
   - 51-100% stamina = 100% production

3. **Multi-Party System**: Up to 3 parties can generate resources simultaneously
   - Each party can operate in a different area
   - Allows specialized optimization of parties for specific resource types

4. **Item Drops**: Random chance for valuable items
   - Basic drops have ~1% chance
   - Rare drops have ~0.1-0.01% chance
   - Some areas have unique item drops

## Idle Progression System

The game handles offline progression through a time-based reward system:

```javascript
// When loading the game after being away
var b = ((new Date).getTime() - game.saveddate) / 6E4;  // Minutes away
if (b > 60) b = 60;  // Cap at 60 minutes
if (b > 5) {  // If away more than 5 minutes
    // Calculate reward based on time away
    item_data[30].price = Math.floor(totalReward * b * 120);
    if (0 < item_data[30].price) {
        add_item(item_data[30]);  // Add treasure item
    }
    game.counter += Math.floor(60 * b);  // Add time to counter
}
```

This creates a treasure item worth approximately 2 hours of resource generation for every hour the player was away (capped at 60 minutes).

## Verification Examples

### 1. Basic Resource Generation
- **Setup**: Party with 3 members, each having 50 strength, in an area with base difficulty 30 and rewards of 10 gold, 5 exp
- **Expected Results**:
  - Strength multiplier: 5.0 (capped at maximum)
  - Gold generation: 10 gold * 5.0 multiplier * 3 members = 150 gold per tick
  - Exp generation: 5 exp * 5.0 multiplier = 25 exp per tick (divided among members)
  - Each member receives 8-9 exp per tick (due to remainder distribution)

### 2. Stamina Effect Verification
- **Setup**: Party with 2 members, one at 100% stamina and one at 40% stamina, in an area with base difficulty 10
- **Expected Results**:
  - 100% stamina member contributes full strength
  - 40% stamina member contributes 50% of their strength
  - Resource generation reduced proportionally
  - If both members have equal base strength, total production should be 75% of maximum

### 3. Multiple Party Generation
- **Setup**: 3 parties in different areas
- **Expected Results**:
  - Each party generates resources independently
  - Total gold income equals sum of all parties' individual generation
  - Experience points remain within each party (not shared across parties)

### 4. Offline Progression
- **Setup**: Player away for 2 hours
- **Expected Results**:
  - Treasure item worth: (hourly generation rate * 2 hours * 2) capped at 60 minutes
  - Game counter increased by 120 minutes (60 minutes * 2 hours)
  - Resources immediately available upon collecting the treasure

## User Experience Recommendations

### Original Pain Points
- No clear visualization of resource generation rate
- Difficult to determine optimal area for resource farming
- No breakdown of which members contribute to production
- Offline rewards system capped at 1 hour regardless of time away
- No way to see projected earnings over time

### Improvement Opportunities
- Add real-time resource rate display (gold/sec, exp/sec)
- Implement resource generation forecast based on current rates
- Show visual indicators of which areas offer optimal returns based on party strength
- Display member contribution breakdown to help optimization
- Create a more flexible offline progression system with diminishing returns instead of hard cap
- Add achievements or milestones for resource collection
- Implement optional notifications for significant resource thresholds

## Extension Points

- The resource generation system could be extended to include:
  - Additional resource types beyond gold and exp
  - Specialized members that boost specific resource generation
  - Equipment that enhances resource generation rates
  - Time-limited resource generation boosts
  - Special areas with unique resource generation patterns (e.g., random bonuses)
  - Alternative offline progression calculations
  - Resource conversion mechanics (trading between resource types)
  - Strategic choices between immediate vs. delayed rewards

## Implementation Requirements

To replicate this resource system in a remastered version:

1. Maintain the balance between active and idle play
2. Preserve the strength vs. difficulty scaling system
3. Keep the multi-party system for parallel resource generation
4. Implement the stamina system for long-term sustainability
5. Balance item drop rates to maintain rarity but ensure progression