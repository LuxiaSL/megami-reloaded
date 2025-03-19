# Prestige Reset System

This document describes the reset/prestige mechanics in Megami Quest 2, including what persists across resets, how long-term progression is achieved, and the relevant mathematical systems.

## Core Mechanics

### Reset Trigger and Process
- Reset is available after reaching the final area (Golden Palace) or unlocking the Infinite Cave
- Reset completely wipes all progress: party members, equipment, gold, area completion
- Player must actively choose to reset; no automatic resets occur
- Reset process requires confirmation to prevent accidental progress loss

### Persistent Elements

#### Critical Invariants (Must Preserve Exactly)
- Found Lists persistence (foundMembers, foundItems, foundAreas)
- Special "Legendary" items are retained across resets
- All percentile bonuses from the Legendary equipment system
- Reset counter and total play time statistics

#### Implementation Flexibility (Can Be Modernized)
- Reset confirmation UI and visualization
- Method of tracking persistent elements
- Presentation of benefits gained from previous resets

### Reset Benefits

#### Global Multipliers
- Each reset provides a permanent +3% gold multiplier
- Each reset provides a permanent +2% experience multiplier
- Multipliers are applied to all resource generation calculations
- Formula: `resource_gain * (1 + (reset_count * multiplier))`

#### Unlockable Content
- Certain members become available only after specific numbers of resets
- Some areas reveal hidden paths only after multiple resets
- Legendary equipment pieces have higher discovery chance with more resets

## Mathematical System

### Multiplier Calculation
```javascript
// Original implementation
function calculate_reset_bonus(resource_type) {
  if (resource_type === "gold") {
    return 1 + (game.reset_count * 0.03); // 3% per reset
  } else if (resource_type === "exp") {
    return 1 + (game.reset_count * 0.02); // 2% per reset
  }
  return 1;
}
```

### Progression Curve
- First reset typically occurs around 1-2 weeks of active play
- Each subsequent reset becomes approximately 30% faster
- After 5 resets, player can reach endgame in approximately 2-3 days
- Reset progression is not linear but exponential with diminishing returns
- Expected formula: `days_to_completion = initial_days * (0.7 ^ reset_count)`

## Verification Examples

1. **First Reset Scenario**:
   - Player with 0 previous resets should have no gold/exp multipliers
   - After resetting once, a 100 gold drop should become 103 gold
   - After resetting once, 100 exp gain should become 102 exp

2. **Multiple Reset Scenario**:
   - Player with 5 previous resets should have +15% gold and +10% exp multipliers
   - The same member/area combination should generate resources 10-15% faster
   - Areas should be completable in proportionally less time

3. **Edge Cases**:
   - Maximum multiplier should be capped at 30 resets (90% gold, 60% exp)
   - If reset count somehow becomes negative, multiplier should default to 1.0 (no bonus)

## User Experience Recommendations

### Original Pain Points
- No visual indication of current multiplier values on resource generation screen
- No detailed statistics about benefits gained from previous resets
- No preview of what will be retained vs. lost during reset
- Confirmation dialog is minimal and could be clicked through accidentally

### Improvement Opportunities
- Add detailed reset benefits screen showing exact multiplier values
- Provide visual forecast of post-reset progression speed
- Create comprehensive reset confirmation with itemized list of what will be kept vs. lost
- Add optional "mock reset" to let players see what a new run would look like
- Implement achievement system tied to reset milestones

## Extension Points

- The reset system could be expanded to include selective persistence (keeping certain members or items)
- Additional multiplier types could be added (movement speed, combat advantage, etc.)
- Special challenge modes could be unlocked after specific reset counts
- "Branching" reset paths could offer different multiplier choices (focus on gold vs. exp)
- Meta-progression achievements could provide special bonuses

## Integration with Other Systems

### Member System
- The member "found" list persists across resets, showing which members have been discovered
- Member fusion recipes remain unlocked across resets
- Member appearance rates are unaffected by reset count

### Item System
- The item "found" list persists across resets, tracking all discovered items
- Legendary items physically remain in inventory across resets
- Equipment crafting recipes remain available after reset

### Area Discovery
- Areas remain on the "found" list but return to undiscovered state
- Area unlock requirements remain unchanged regardless of reset count
- Area completion bonuses are fully reset

## Implementation Notes

- The reset system uses the same localStorage persistence as the main game state
- Reset state is stored in the `game.reset_count` and related properties
- Legendary items are flagged with the `legendary: true` property to persist
- Found lists use object properties with boolean values to track discoveries