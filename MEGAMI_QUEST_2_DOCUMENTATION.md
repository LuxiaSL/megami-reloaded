# Megami Quest 2 - Comprehensive Documentation

## Overview
Megami Quest 2 is a browser-based incremental idle RPG game where players lead a party of characters (called "members") on quests across a fantasy world. The goal is to explore, strengthen your party, discover new areas, defeat bosses, and eventually restore peace to the world.

## Core Game Mechanics

### Game State & Progression
- The game maintains its state in a `game` object stored in local storage
- Players control up to 3 parties of characters that can explore different areas simultaneously
- Game runs on a timer that advances every second via the `main_func()` function
- As players explore and defeat enemies, they discover new areas, gather members, and collect items

### Map & Movement
- The world is a large map (`mapSize = 6000`) divided into different areas:
  - Fields (area_type: 0) - Wilderness areas for travel and gathering resources
  - Towns (area_type: 1) - Safe areas with shops and information sources
  - Dungeons (area_type: 2) - Areas with enemies, bosses, and treasures
  - Shrines (area_type: 3) - Special locations for summoning new members
  - Fusion (area_type: 4) - Special area for fusing members to make them stronger
- Players move by clicking on destination points on the map
- Movement speed depends on:
  - Speed attributes of party members
  - Terrain effects of the current area (speed_effect)
- After completing an area, new areas are discovered with `discovery_new_area()`

### Party Management
- Each party can have multiple members
- Members can be:
  - Added via summoning (`summon_member()`) or found through exploration
  - Equipped with items to enhance their attributes
  - Set to active or waiting status
  - Fired to gain gold based on their experience and attributes
  - Fused together to create stronger members
- Each member has:
  - Stats: Strength, Speed, Magic, Stamina
  - Attributes: Values that multiply their base stats
  - A level that increases with experience
  - A class determined by their attribute distribution

### Resource Generation
- Gold is earned automatically from explored areas
- Experience points are distributed to party members
- Resources are generated based on:
  - Area's base values (`give_gold`, `give_exp`)
  - Party's total strength vs. area's base difficulty
  - Number of strong members in the party
- Resources are only generated if the party's strength exceeds the area's base difficulty

### Combat System
- Bosses guard certain areas and must be defeated to progress
- Combat is turn-based but mostly automatic
- Combat participants take actions based on their speed
- Combat factors:
  - Strength affects damage dealt
  - Speed affects number of attacks
  - Magic affects special attacks and healing
- Combat rewards include discovering new areas and items

### Item System
- Items can be:
  - Equipment to enhance member attributes (use_type: 2)
  - Consumables that give temporary boosts (use_type: 1)
  - Special items that unlock features (use_type: 0)
- Items are transferred by drag-and-drop
- Equipment can modify stats with additive (A) or multiplicative (M) effects
- Inventory has a limit that can be expanded with special items

### Special Features
- Ragnarok: A special feature allowing sacrifice of high-level members for powerful weapons
- Fusion: Combining members to create stronger ones
- Infinite Cave: Special dungeon that scales infinitely for end-game challenge
- Abyss: Final boss area leading to game completion

## Technical Architecture

### File Structure
- **main.js**: Entry point, initializes game and contains main loop
- **func.js**: Contains core utility functions, state management, and UI helpers
- **member.js**: Member-related logic including stats, fusion, and party management
- **item.js**: Item management, effects, and usage
- **boss.js**: Boss combat and related systems
- **map.js**: Map rendering, area definition, and movement
- **field.js**: Field exploration and resource generation
- **event.js**: Event systems including towns, shops, and special events
- **lang_en.js**: English language text content

### Core Functions
- **initialize()**: Sets up the initial game state and UI
- **main_func()**: Main game loop that runs every second
- **game_save()**: Saves game state to localStorage
- **game_load()**: Loads game state from localStorage
- **update_disp_worldmap()**: Updates the display of the world map
- **update_area_info()**: Updates information about the current area
- **update_disp_members()**: Updates the display of party members
- **complete_area()**: Triggers completion of an area

### Game Initialization
1. The `first_load()` function creates a new game state with default values
2. The `initialize()` function loads saved data or creates new data
3. The game starts with `start_game()` which initiates the main game loop

### Game Loop (main_func)
The main loop processes every party:
1. Calculates resource generation based on party strength vs area difficulty
2. Handles movement if a party is traveling
3. Checks for way events during travel
4. Updates UI elements to reflect current game state
5. Autosaves the game periodically if enabled

### Save System
- Game state is stored in browser's localStorage
- Players can manually save, export, and import game data
- Auto-save occurs every 60 seconds if enabled

## Game Content

### World
The game world is divided into various named regions:
- Fields like Idavoll Plain, Muspel Desert, Nilf Snowfield
- Towns like Sheratan Village, Valhalla, Land of Dead
- Dungeons like Old Trail, Black Valley, Infinite Cave

### Characters
The game features a variety of characters (members) that players can recruit:
- Starting with Megami (the main character)
- Common members like Embla, Askr, Norn
- Rare members like Sol, Valkyrie, Sigurd
- Legendary members like Woden, Frigg, Tor

### Items
Items range from basic equipment to legendary artifacts:
- Weapons: Bronze Sword, Claymore, Bow of Ullr
- Special items: Ring of Nibelung, Gungnir, Mjolnir
- Consumables: Herbs, Life Extract, Mead of Poetry
- Utility items: Worldmap, Bags, Control Books

### Bosses
Bosses of increasing difficulty guard progress:
- Early bosses: Harpy, Pleyone, Maia
- Mid-game bosses: Fefnir, Fenrir, Nidhogg
- Final bosses: King of Abyss, Cthylla

## Game Systems in Detail

### Member Growth System
1. Members gain experience when in active state in strong enough parties
2. Leveling is based on the formula: Level = EXP^level_index
3. Base strength increases with level
4. Attributes can be improved with special items
5. Power distribution can be adjusted with the "Self Control Book"

### Area Progression
1. Initial areas are automatically open
2. As players complete areas, adjacent ones become discoverable
3. Defeating bosses often reveals new areas
4. Special items can discover hidden areas
5. Completing all areas (except Infinite Cave) leads to the ending

### Resource Economy
1. Gold is the primary resource used to:
   - Buy items from shops
   - Purchase information in taverns
   - Summon new members
   - Perform member fusion
2. Experience points are used to level up members
3. Special resources like Blood of Ymir can enhance member attributes

### Summoning System
- Members are summoned at Shrines
- Summon costs increase with rarity tier
- Results are pseudo-random but follow rarity distributions
- Players can reuse summoning to get different members
- Later game allows summoning from the found list

### Boss Combat Mechanics
1. Combat involves up to 4 members against 1 boss
2. Actions are determined by relative speed
3. Members can attack (based on strength) and heal (based on magic)
4. Bosses have HP, attack power, defense, and magic defense
5. Fast-forward feature allows speeding up combat
6. Winning rewards include area completion and potential items

## Implementation Notes

### Efficiency Patterns
- The game uses timers to create the illusion of continuous progression
- Resources are only calculated when needed, not for every tick
- UI updates are optimized to avoid unnecessary redraws
- The map system uses dynamic loading/unloading of map elements

### State Management
- The `game` object contains all persistent state data
- Deep copying is used for objects to avoid reference problems
- Format functions handle display of large numbers with unit prefixes

### User Interface
- jQuery and jQuery UI for most UI operations
- Drag and drop for items and member management
- Custom animations for combat and effects
- Map navigation with zoom and pan controls

### Mathematics
- Resource generation is exponential with power-law scaling
- Level progression follows a power function (EXP^level_index)
- Member attributes have weighted contributions to overall power
- Random number generation uses linear congruential generators with seeding

## How to Play (Design Philosophy)

1. **Starting Out**:
   - Begin with Megami in your party
   - Explore nearby areas to gather gold and items
   - Visit towns to purchase items and gather information

2. **Mid-Game Strategy**:
   - Balance between exploration and strengthening your party
   - Use summoning to acquire stronger members
   - Equip members with appropriate items
   - Optimize party composition for different activities

3. **Advanced Play**:
   - Use member fusion to create powerful characters
   - Sacrifice high-level members in Ragnarok for powerful weapons
   - Use multiple parties in different areas simultaneously
   - Challenge increasingly difficult bosses

4. **End-Game Content**:
   - Complete the main storyline by defeating the King of Abyss
   - Challenge the Infinite Cave for endless scaling difficulty
   - Collect all members and items for 100% completion

## Replication Guide

To recreate this game, you would need to implement:

1. **Core Engine**:
   - Game loop that processes progress every second
   - Save/load system using localStorage
   - Resource calculation based on party vs area strength

2. **Map System**:
   - World map with various area types
   - Area discovery and progression system
   - Movement mechanics based on party speed

3. **Party System**:
   - Member creation and management
   - Statistics and attribute calculations
   - Experience and leveling mechanisms

4. **Combat System**:
   - Turn-based combat logic
   - Attack, defense, and special ability calculations
   - Boss behavior and stats scaling

5. **Item System**:
   - Equipment effects and application
   - Inventory management
   - Shop and acquisition mechanics

6. **Special Features**:
   - Fusion, Ragnarok and other special mechanics
   - Summoning with rarity tiers
   - Infinite scaling challenges

The game uses a mix of procedural and object-oriented programming patterns, with heavy use of JavaScript objects to represent game state and entities.