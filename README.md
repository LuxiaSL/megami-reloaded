# Megami Quest 2 Reloaded

A faithful modern remaster of the idle incremental RPG "Megami Quest 2" built with React, TypeScript, and Redux Toolkit.

## Project Overview

Megami Quest 2 Reloaded preserves the original game's mechanics while updating the implementation with contemporary web development practices. Lead your party of members on quests across a fantasy world, gathering resources, defeating bosses, and gradually restoring peace.

## Features

- **Multiple Parties**: Manage several adventuring parties simultaneously
- **Character Progression**: Level up members through experience, fusion, and attribute distribution
- **World Exploration**: Discover new areas as you progress through the game
- **Resource Generation**: Accumulate gold and experience based on party strength and area difficulty
- **Combat System**: Strategic turn-based battles against powerful bosses
- **Equipment System**: Enhance your party with special items and equipment
- **Prestige System**: Long-term progression through game resets

## Core Game Systems

- Tick-based progression (1 second intervals)
- Level calculation using power function: `Level = EXP^level_index`
- Resource generation based on party strength vs. area difficulty
- Turn-based combat with speed-dependent turn order
- Customizable power distribution (strength, speed, magic)
- Fusion system for combining and enhancing members
- Equipment effects through specialized string parsing

## Technical Implementation

- **Framework**: React with functional components
- **Language**: TypeScript for type safety
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **Testing**: Vitest

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Project Structure

- `src/data/`: Game entity definitions
- `src/state/`: Redux state management
- `src/utils/`: Pure calculation functions
- `src/components/`: UI components
- `src/systems/`: Game system implementations

## Implementation Progress

- ✅ Core engine and game architecture
- ✅ Resource generation system
- ✅ Character progression system
- 🔄 Inventory and equipment system
- 🔄 Area discovery mechanics
- 🔄 Map rendering and movement
- ⬜ Combat system
- ⬜ Party management UI
- ⬜ Special systems (Fusion, Ragnarok)
- ⬜ Prestige reset system

## Documentation

See the markdown files in the project root for detailed documentation on various game systems:

- `CORE_GAME_SYSTEMS.md`: Game loop and state management
- `RESOURCE_GENERATION.md`: Gold/exp mechanics
- `COMBAT_SYSTEM.md`: Battle mechanics
- `MAP_MOVEMENT_SYSTEM.md`: World navigation
- `PARTY_MANAGEMENT_SYSTEM.md`: Character progression
- `ITEM_EQUIPMENT_SYSTEM.md`: Items and effects
- `AREA_DISCOVERY_PROGRESSION.md`: Game progression
- `MODERNIZED_ARCHITECTURE.md`: Technical architecture