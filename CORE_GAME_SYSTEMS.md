# Megami Quest 2: Core Game Systems

## Game State Management

The game manages its state through a global `game` object that contains all player progress, characters, items, and world state information. The game state has several key components:

### Game State Object Structure
```javascript
game = {
  currentGroup: 0,                   // Currently selected party (0-2)
  group: [                           // Array of parties
    {
      group_name: "Party1",          // Party name
      members: [],                   // Party members
      items: [],                     // Party inventory
      location: 16,                  // Current area ID
      target_area_id: 16,            // Target area when moving
      moving: 0,                     // 0 = not moving, 1 = moving
      position: {x: 1750, y: 4500}   // Position on world map
    },
    {...},                           // Party 2
    {...}                            // Party 3
  ],
  gold: 0,                           // Player's gold
  foundareas: {},                    // Discovered areas
  counter: 0,                        // Game turns counter
  total_gold: 0,                     // Total gold earned
  found_members: {},                 // Discovered members
  found_items: {},                   // Discovered items
  item_max: 5,                       // Max inventory size
  saveddate: timestamp,              // Last save timestamp
  flg_map_follow: 1,                 // Auto follow current party
  number_unit: "",                   // Display format for numbers
  auto_save: 1,                      // Auto save enabled
  draw_bg: 1,                        // Draw backgrounds
  infinite_level: 1                  // Infinite dungeon level
}
```

### Game Loop
The game runs on a timer-based loop (`main_func()`) that executes every second:

1. For each party:
   - Calculate resource generation if party is strong enough
   - Handle movement if party is traveling
   - Update member statistics and stamina
   - Process way events during travel
   - Handle combat encounters
   - Update UI elements
2. Perform auto-save if enabled

### Saving/Loading
- The game state is saved to the browser's localStorage
- Can be manually exported/imported as a base64 encoded string
- Auto-save occurs every 60 seconds (if enabled)

### Initialization
The game begins with:
- `first_load()` to set default values
- `initialize()` to load saved data or create new data
- `start_game()` to start the main game loop

## Math & Scaling Systems

The game employs several mathematical patterns for game progression and balance:

### Number Formatting
Large numbers are formatted with unit prefixes to keep the UI clean:
- k (thousands), m (millions), g (billions), etc.
- Example: 1,500,000 displays as "1.5m"

### Resource Calculation
The game uses exponential scaling for resources:
- Base resources are multiplied by number of strong members
- A member is considered "strong" if their strength > area's base difficulty
- Resource generation is capped at a maximum of 5x the base amount

### Level Calculation
Member level is derived from experience using a power function:
```javascript
level = Math.floor(Math.pow(exp, level_index))
```
Where `level_index` varies by character but is typically around 0.36-0.42.

## Time & Progression Systems

The game measures time in turns, each turn representing one second of real time:

### Game Counter
- The `game.counter` increments each turn
- Used to track game time and trigger events
- Displayed to player as days/hours (8760 turns = 1 year)

### Progression Gates
Progress is gated by:
- Area discovery (gradually expanding the map)
- Resource requirements (gold costs scale exponentially)
- Boss encounters (require sufficient party strength)
- Special items (unlock new areas or features)

## UI Management System

The UI is built with jQuery and handles several key functions:

### Display Updates
- `update_disp_all()` refreshes all UI elements
- `update_disp_worldmap()` updates the map view
- `update_disp_members()` refreshes party member display
- `update_disp_items()` updates inventory display

### Interactive Elements
- Drag-and-drop for item management
- Sortable lists for party ordering
- Clickable map for movement
- Configurable settings

## Randomness & Seeding

The game uses a seeded pseudo-random number generator for consistent results:

### Random Number Generation
```javascript
function getSaveSeededRandom(seedIndex) {
  game.random_seed[seedIndex] = (9301 * game.random_seed[seedIndex] + 49297) % 233280;
  return game.random_seed[seedIndex] / 233280;
}
```

This allows for deterministic randomness in:
- Item drops
- Member summoning
- Combat outcomes
- Random events

## Configuration Management

The game includes several configurable options:

- Number formatting (k, m, g, etc.)
- Auto-save
- Background display
- Map following behavior

These provide quality-of-life improvements without affecting core gameplay.