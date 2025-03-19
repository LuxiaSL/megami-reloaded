# Modernized Architecture

This document outlines a proposed architecture for a modernized implementation of Megami Quest 2, including component organization, state management, data flow patterns, and testing strategies.

## System Architecture Overview

### Core Architecture Principles
- Maintain separation between game logic and presentation
- Use immutable state management with predictable updates
- Implement reactive programming patterns for UI updates
- Design for testability through dependency injection
- Support cross-platform deployment

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       UI Layer                              │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────────┤
│  Map    │ Party   │ Combat  │ Items   │ Status  │ Settings │
│  View   │ Manager │ Display │ Manager │ Display │ Panel    │
└────┬────┴────┬────┴────┬────┴────┬────┴────┬────┴─────┬────┘
     │         │         │         │         │          │
     │         │         │         │         │          │
┌────▼────┬────▼────┬────▼────┬────▼────┬────▼────┬─────▼────┐
│  Map    │ Party   │ Combat  │ Item    │ Stats   │ Settings │
│ Service │ Service │ Service │ Service │ Service │ Service  │
└────┬────┴────┬────┴────┬────┴────┬────┴────┬────┴─────┬────┘
     │         │         │         │         │          │
     │         │         │         │         │          │
┌────▼────────▼────────▼─────────▼─────────▼──────────▼─────┐
│                    State Management                        │
├───────────────┬─────────────────┬────────────────────┬────┤
│ Game State    │ UI State        │ Combat State       │    │
├───────────────┼─────────────────┼────────────────────┼────┤
│ - Resources   │ - Active Tab    │ - Current Battle   │    │
│ - Parties     │ - Selections    │ - Turn Queue       │    │
│ - Areas       │ - Modal States  │ - Action History   │    │
│ - Discoveries │ - Animations    │ - Damage Calc      │    │
└───────────────┴─────────────────┴────────────────────┴────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Layer                         │
├─────────────────┬─────────────────────┬─────────────────────┤
│   Local Save    │    Cloud Save       │   Import/Export     │
└─────────────────┴─────────────────────┴─────────────────────┘
```

## State Management Approach

### Redux Store Structure

```json
{
  "game": {
    "version": "2.0.0",
    "resetCount": 0,
    "playTime": 86400,
    "activePartyId": 0,
    "unlocks": {
      "maxParties": 1,
      "fusion": false,
      "legendary": false
    },
    "resources": {
      "gold": 1000,
      "dungeonKeys": 0
    }
  },
  "discoveries": {
    "members": {
      "fighter": true,
      "mage": true,
      "healer": false
    },
    "items": {
      "bronzeSword": true,
      "woodenStaff": true,
      "legendaryHelm": false
    },
    "areas": {
      "startingVillage": true,
      "westernForest": true,
      "volcano": false
    }
  },
  "parties": [
    {
      "id": 0,
      "name": "Party 1",
      "members": [
        {
          "id": "fighter_1",
          "type": "fighter",
          "level": 5,
          "exp": 100,
          "stats": {
            "strength": 50,
            "speed": 30,
            "magic": 10
          },
          "equipment": {
            "weapon": "bronzeSword",
            "armor": null,
            "accessory": null
          }
        }
      ],
      "location": {
        "areaId": "startingVillage",
        "position": { "x": 1750, "y": 4500 },
        "exploring": true
      }
    }
  ],
  "world": {
    "areas": {
      "startingVillage": {
        "id": "startingVillage",
        "name": "Starting Village",
        "discovered": true,
        "completed": false,
        "difficulty": 1,
        "resources": {
          "gold": 10,
          "exp": 5
        },
        "requiredStrength": 0,
        "connections": ["westernForest", "easternMeadow"]
      }
    },
    "bosses": {
      "forestTroll": {
        "id": "forestTroll",
        "areaId": "westernForest",
        "name": "Forest Troll",
        "defeated": false,
        "stats": {
          "hp": 1000,
          "strength": 30,
          "defense": 20,
          "speed": 15
        }
      }
    }
  },
  "inventory": {
    "items": [
      {
        "id": "healthPotion_1",
        "type": "healthPotion",
        "count": 5
      }
    ],
    "equipment": [
      {
        "id": "bronzeSword_1",
        "type": "bronzeSword",
        "equipped": true,
        "equippedBy": "fighter_1",
        "effects": ["A:strength:10", "M:speed:0.9"]
      }
    ]
  },
  "combat": {
    "active": false,
    "bossId": null,
    "turnQueue": [],
    "partyMembers": [],
    "status": "idle"
  },
  "ui": {
    "activeTab": "map",
    "selectedMember": null,
    "selectedItem": null,
    "mapZoom": 1.0,
    "notifications": []
  }
}
```

### Key Reducers

```javascript
// Sample reducer structure (pseudocode)
const partyReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MEMBER':
      // Add member to party
    case 'REMOVE_MEMBER':
      // Remove member from party
    case 'LEVEL_UP':
      // Handle level up logic
    case 'EQUIP_ITEM':
      // Equip item to member
    // etc.
  }
};

const resourceReducer = (state, action) => {
  switch (action.type) {
    case 'GENERATE_RESOURCES':
      // Calculate resources based on party strength and area
    case 'SPEND_GOLD':
      // Handle gold spending 
    // etc.
  }
};

const combatReducer = (state, action) => {
  switch (action.type) {
    case 'START_COMBAT':
      // Initialize combat with boss
    case 'PROCESS_TURN':
      // Handle turn processing
    case 'APPLY_DAMAGE':
      // Apply damage calculations
    // etc.
  }
};

const worldReducer = (state, action) => {
  switch (action.type) {
    case 'DISCOVER_AREA':
      // Mark area as discovered
    case 'COMPLETE_AREA':
      // Mark area as completed
    case 'MOVE_PARTY':
      // Update party position
    // etc.
  }
};
```

## Data Flow Patterns

### Resource Generation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Game Tick   │───>│ Calculate   │───>│ Update      │
│ (1 second)  │    │ Resources   │    │ State       │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                  │
                          ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ Check for   │    │ Update UI   │
                   │ Thresholds  │    │ Components  │
                   └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Trigger     │
                   │ Events      │
                   └─────────────┘
```

### Combat Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Initiate    │───>│ Determine   │───>│ Execute     │
│ Combat      │    │ Turn Order  │    │ Turn        │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Update      │<───│ Apply       │<───│ Calculate   │
│ Combat UI   │    │ Effects     │    │ Damage      │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ Check       │───>│ End Combat  │
│ Win/Loss    │    │ (if needed) │
└─────────────┘    └─────────────┘
```

## UI Component Hierarchy

```
App
├── Header
│   ├── ResourceDisplay
│   └── NavigationTabs
├── MainView
│   ├── MapView
│   │   ├── WorldMap
│   │   │   ├── AreaNode
│   │   │   ├── PartyMarker
│   │   │   └── ConnectionLine
│   │   └── AreaInfo
│   ├── PartyView
│   │   ├── PartySelector
│   │   ├── MemberList
│   │   │   └── MemberCard
│   │   └── MemberDetail
│   │       ├── StatDisplay
│   │       ├── EquipmentSlots
│   │       └── ActionButtons
│   ├── CombatView
│   │   ├── BattleScene
│   │   │   ├── PartyDisplay
│   │   │   └── BossDisplay
│   │   ├── ActionMenu
│   │   └── CombatLog
│   ├── InventoryView
│   │   ├── ItemCategories
│   │   ├── ItemList
│   │   │   └── ItemCard
│   │   └── ItemDetail
│   │       ├── EffectDisplay
│   │       └── ActionButtons
│   └── StatsView
│       ├── ProgressStats
│       ├── DiscoveryLists
│       └── AchievementTracker
└── Footer
    ├── GameControls
    │   ├── SaveButton
    │   └── SettingsButton
    └── GameStatus
```

## Testing Strategy

### Unit Tests
- Test all core calculation functions:
  - Level calculation from experience
  - Damage formulas
  - Resource generation rates
  - Movement speed calculations
- Test state transitions:
  - Member level progression
  - Area discovery mechanics
  - Equipment effects application
  - Combat resolution
- Test reducer functions for predictable state changes

### Integration Tests
- Test complete flows across multiple systems:
  - Party creation through combat and rewards
  - Member progression through multiple levels
  - Area discovery chains and unlocks
  - Full combat sequences
- Test persistence and save/load functionality

### Simulation Tests
- Create automated players that:
  - Progress through the game at varying play styles
  - Verify overall progression curve matches original
  - Test performance under various device conditions
  - Validate balance across different party compositions

## Performance Considerations

### Critical Performance Areas
- Resource calculation tick (runs every second)
- Combat calculation (potentially many entities)
- Map rendering (large world with many areas)
- Animation systems (should be opt-out for performance)

### Optimization Strategies
- Memoize expensive calculations
- Implement batched updates for state changes
- Use virtual scrolling for long lists
- Optimize rendering through React.memo and useMemo
- Implement worker threads for intensive calculations

## Cross-Platform Considerations

### Target Platforms
- Web (desktop and mobile browsers)
- Native mobile (iOS/Android via React Native)
- Desktop (Electron)

### Platform-Specific Adaptations
- Touch controls vs. mouse/keyboard
- Screen size adaptations
- Offline functionality
- Push notifications
- Battery usage optimization

## Implementation Technologies

### Recommended Stack
- Core: TypeScript for type safety
- Framework: React with functional components
- State: Redux with Redux Toolkit
- Side Effects: Redux-Saga
- Styling: Styled Components
- Testing: Jest + React Testing Library
- Build: Vite
- Mobile: React Native 

## Migration Path

### Phase 1: Core Systems
- Implement state management
- Create core calculation engines
- Build data models
- Implement persistence

### Phase 2: UI Framework
- Develop component library
- Implement layout system
- Create navigation structure
- Build responsive design system

### Phase 3: Game Systems
- Implement party management
- Create combat system
- Build area discovery and map
- Develop equipment and item systems

### Phase 4: Polish and Optimization
- Add animations and transitions
- Implement sound effects
- Optimize performance
- Add quality-of-life features

## Extension Considerations

### Future Features
- Cloud save synchronization
- Achievements system
- Social features (friend comparisons)
- Additional content beyond original game
- Modding support

### Backward Compatibility
- Import original game saves
- Maintain game balance from original
- Support legacy browsers where possible