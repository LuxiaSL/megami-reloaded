# Megami Quest 2: Remaster Implementation Guidelines

## Overview

This document provides guidelines for implementing a remastered version of Megami Quest 2, focusing on preserving the core gameplay while modernizing the technology and interface. The original game is a browser-based idle RPG that combines resource management, party building, exploration, and combat into a cohesive incremental game experience.

## Core Game Loop

The remastered version should maintain the original's core gameplay loop:

1. **Idle Resource Generation**: Parties automatically generate gold and experience based on their strength relative to the current area
2. **Member Development**: Experience leads to level growth, increasing member stats
3. **Equipment Acquisition**: Resources spent on equipment enhance member capabilities
4. **Area Exploration**: Stronger parties explore new areas, defeat bosses, and discover content
5. **Repeat**: Newly discovered areas provide more resources, enabling further growth

This creates a positive feedback loop with multiple progression paths that can be played both actively and idly.

## System Implementation Priorities

### 1. Core Engine
Implement the basic game loop and state management:

- Tick-based game loop (1 tick per second)
- Save/load system using local storage
- Basic UI framework with area, party, and inventory views
- State object structure following the original's pattern

### 2. Character System
Implement the member stat calculation and progression:

- Level calculation using power function
- Stat derivation from level, attributes, and power distribution
- Class determination based on attribute distribution
- Equipment modification system

### 3. Resource System
Implement the resource generation mechanics:

- Area-based gold and experience generation
- Party strength vs. area difficulty calculations
- Stamina system affecting resource generation
- Multi-party resource generation

### 4. Map System
Implement the world map and movement mechanics:

- Area definitions with positions and properties
- Movement based on party speed and area effects
- Area discovery through exploration and events
- UI for map navigation and interaction

### 5. Combat System
Implement the boss battle mechanics:

- Turn-based combat based on speed
- Damage calculation with variance
- Multiple attacks based on speed ratio
- Magic damage and healing

### 6. Item System
Implement the equipment and item mechanics:

- Effect string parsing and application
- Equipment restrictions and stat modifications
- Inventory management with expandable capacity
- Special item functions

### 7. Progression System
Implement the game progression mechanics:

- Area completion through exploration and boss defeat
- Difficulty scaling through area and boss stats
- Special systems like Fusion and Ragnarok
- End-game content like Infinite Cave and Abyss

## Balance Considerations

The remastered version should maintain the original's progression balance:

### Early Game (0-1 hour)
- Start with 0-10 base strength
- Areas with 0-100 difficulty
- Gold generation of 0-1 per second
- Simple equipment with +10-50 strength bonuses

### Mid Game (1-8 hours)
- Party strength around 1,000-10,000
- Areas with 1,000-10,000 difficulty
- Gold generation of 10-100 per second
- Equipment with +1,000-10,000 strength bonuses
- Access to member fusion

### Late Game (8-24 hours)
- Party strength around 100,000-1,000,000
- Areas with 100,000-1,000,000 difficulty
- Gold generation of 1,000-10,000 per second
- Equipment with multiplicative effects (1.2x-2.0x)
- Access to Ragnarok system

### End Game (24+ hours)
- Party strength of 10,000,000+
- Infinite scaling difficulty in Infinite Cave
- Completion of main story through Abyss
- Collection completion (all members and items)

## Modernization Opportunities

While preserving the core mechanics, a remaster can improve the following areas:

### User Interface
- Replace jQuery with modern frameworks (React, Vue, etc.)
- Implement responsive design for various screen sizes
- Add quality-of-life features like sorting, filtering, and batch operations
- Modernize graphics while maintaining aesthetic style

### Game Mechanics
- Add offline progression tracking beyond the current 1-hour limit
- Implement cloud save functionality
- Add achievement system to track milestones
- Introduce optional systems to reduce grinding

### Performance
- Optimize calculations for large numbers
- Implement efficient rendering of map and UI elements
- Use web workers for background processing
- Implement lazy loading for resources

### Accessibility
- Add colorblind modes
- Implement keyboard shortcuts
- Add text scaling options
- Include alternative control schemes

## Technical Specifications

Recommended technical approach for remastering:

### Frontend
- **Framework**: React or Vue.js for component-based UI
- **State Management**: Redux or Vuex for game state
- **Rendering**: Canvas-based map rendering for performance
- **Storage**: LocalStorage with optional cloud sync
- **Build Tools**: Webpack, Babel, TypeScript

### Game Logic
- Convert the original formulas to maintainable, testable code
- Implement proper class structure for game entities
- Use numerical libraries to handle large number calculations
- Implement proper separation of concerns between systems

### Data Structure
- Convert the original JavaScript objects to typed structures
- Implement proper validation for game state
- Design extensible data schemas for future content

### Testing
- Unit tests for core formulas and mechanics
- Integration tests for system interactions
- Performance tests for resource-intensive operations
- Playtest scenarios for progression balance

## State Management Architecture

### Recommended Redux Store Structure

```javascript
{
  "gameState": {
    "version": "2.0.0",
    "firstPlayedDate": 1685467200000,
    "lastPlayedDate": 1685553600000,
    "playTime": 86400,
    "resetCount": 0,
    "gold": 1000,
    "totalGold": 10000,
    "currentGroup": 0,
    "unlocks": {
      "maxParties": 1,
      "fusion": false,
      "ragnarok": false,
      "infiniteCave": false
    },
    "settings": {
      "battleTempo": 1,
      "notificationsEnabled": true,
      "autoSaveInterval": 60
    }
  },
  
  "discoveries": {
    "members": {
      "fighter": true,
      "mage": true,
      "healer": false
      // etc.
    },
    "items": {
      "bronzeSword": true,
      "woodenStaff": true,
      "legendaryHelm": false
      // etc.
    },
    "areas": {
      "startingVillage": true,
      "westernForest": true,
      "volcano": false
      // etc.
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
          "hp": 100,
          "maxHp": 100,
          "stamina": 100,
          "maxStamina": 100,
          "stats": {
            "strength": 50,
            "speed": 30,
            "magic": 10
          },
          "attributes": {
            "ratioStrength": 0.7,
            "ratioSpeed": 0.2,
            "ratioMagic": 0.1
          },
          "equipment": {
            "weapon": "bronzeSword_1",
            "armor": null,
            "accessory": null
          }
        }
        // More members...
      ],
      "location": {
        "areaId": "startingVillage",
        "position": { "x": 1750, "y": 4500 },
        "destination": null,
        "exploring": true,
        "completedTime": 0
      }
    }
    // More parties...
  ],
  
  "world": {
    "areas": {
      "startingVillage": {
        "id": "startingVillage",
        "name": "Starting Village",
        "position": { "x": 1750, "y": 4500 },
        "discovered": true,
        "completed": false,
        "difficulty": 1,
        "resources": {
          "gold": 10,
          "exp": 5
        },
        "itemDropRates": {
          "healingPotion": 0.01,
          "bronzeSword": 0.005
        },
        "requiredStrength": 0,
        "connections": ["westernForest", "easternMeadow"]
      }
      // More areas...
    },
    "bosses": {
      "forestTroll": {
        "id": "forestTroll",
        "areaId": "westernForest",
        "name": "Forest Troll",
        "defeated": false,
        "stats": {
          "hp": 1000,
          "maxHp": 1000,
          "strength": 30,
          "defense": 20,
          "speed": 15,
          "magicDefense": 5
        }
      }
      // More bosses...
    }
  },
  
  "inventory": {
    "capacity": 20,
    "items": [
      {
        "id": "healingPotion_1",
        "type": "healingPotion",
        "count": 5,
        "usable": true
      }
      // More consumable items...
    ],
    "equipment": [
      {
        "id": "bronzeSword_1",
        "type": "bronzeSword",
        "equipped": true,
        "equippedBy": "fighter_1",
        "effects": ["A:strength:10", "M:speed:0.9"]
      }
      // More equipment...
    ]
  },
  
  "combat": {
    "active": false,
    "partyId": null,
    "bossId": null,
    "turnQueue": [],
    "partyHp": 0,
    "partyMaxHp": 0,
    "bossHp": 0,
    "turnCounter": 0,
    "logs": [],
    "status": "idle"
  },
  
  "ui": {
    "activeTab": "map",
    "selectedMember": null,
    "selectedItem": null,
    "mapZoom": 1.0,
    "notifications": [],
    "modals": {
      "isOpen": false,
      "type": null,
      "data": null
    }
  }
}
```

### Key Reducers

```javascript
// Game state reducer
const gameStateReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT_GOLD':
      return {
        ...state,
        gold: state.gold + action.payload,
        totalGold: state.totalGold + action.payload
      };
    case 'SWITCH_PARTY':
      return {
        ...state,
        currentGroup: action.payload
      };
    case 'UNLOCK_FEATURE':
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          [action.payload]: true
        }
      };
    // More cases...
  }
};

// Party reducer
const partyReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MEMBER':
      return state.map(party => 
        party.id === action.payload.partyId 
          ? { ...party, members: [...party.members, action.payload.member] }
          : party
      );
    case 'LEVEL_UP_MEMBER':
      return state.map(party => ({
        ...party,
        members: party.members.map(member => 
          member.id === action.payload.memberId
            ? { 
                ...member, 
                level: member.level + 1,
                stats: calculateStatsFromLevel(member.level + 1, member.attributes)
              }
            : member
        )
      }));
    case 'MOVE_PARTY':
      return state.map(party => 
        party.id === action.payload.partyId
          ? { 
              ...party, 
              location: {
                ...party.location,
                destination: action.payload.destination,
                exploring: false
              }
            }
          : party
      );
    // More cases...
  }
};

// Resource generation tick
const resourceTickReducer = (state, action) => {
  const { gameState, parties, world } = state;
  
  // Process each party
  const updatedParties = parties.map(party => {
    // If party is exploring and not moving
    if (party.location.exploring && !party.location.destination) {
      const area = world.areas[party.location.areaId];
      const partyStrength = calculatePartyStrength(party);
      
      // Check if party is strong enough
      if (partyStrength >= area.difficulty) {
        // Calculate resource gain
        const strengthRatio = Math.min(partyStrength / area.difficulty, 5);
        const strongMembers = party.members.filter(m => 
          calculateMemberStrength(m) >= area.difficulty
        ).length;
        
        const goldGain = area.resources.gold * strengthRatio * Math.max(strongMembers, 1);
        const expGain = area.resources.exp * strengthRatio;
        
        // Distribute exp among members
        const updatedMembers = distributeExperience(party.members, expGain);
        
        // Process item drops
        const newItems = processItemDrops(area.itemDropRates);
        
        return {
          ...party,
          members: updatedMembers
        };
      } else {
        // Party is too weak, reduce stamina
        return {
          ...party,
          members: party.members.map(m => ({
            ...m,
            stamina: Math.max(0, m.stamina - 2 * (1 - partyStrength / area.difficulty))
          }))
        };
      }
    }
    return party;
  });
  
  return {
    ...state,
    gameState: {
      ...gameState,
      gold: gameState.gold + totalGoldGain,
      totalGold: gameState.totalGold + totalGoldGain
    },
    parties: updatedParties,
    inventory: {
      ...state.inventory,
      items: [...state.inventory.items, ...newItems]
    }
  };
};
```

## Implementation Phases

Recommended development approach:

### Phase 1: Core Engine
- Basic game loop and state management
- Simple UI with debug controls
- Save/load functionality
- Basic resource generation

### Phase 2: World and Characters
- Map implementation with basic areas
- Character system with leveling
- Movement mechanics
- Basic inventory system

### Phase 3: Progression Systems
- Combat implementation
- Area discovery and completion
- Equipment effects
- Basic shop system

### Phase 4: Special Systems
- Fusion system
- Ragnarok system
- Infinite Cave scaling
- End-game content

### Phase 5: Polish and Optimization
- UI improvements and animations
- Performance optimization
- Quality-of-life features
- Balance adjustments

## Conclusion

By following these guidelines, a remastered version of Megami Quest 2 can preserve the original's engaging gameplay while providing a modern experience. The key is maintaining the mathematical balance and progression curve that made the original addictive, while improving the technical implementation and user experience.

The detailed documentation of individual systems (CORE_GAME_SYSTEMS.md, RESOURCE_GENERATION.md, etc.) provides the specific formulas and mechanics needed to implement each component accurately. This guide serves as a high-level roadmap for combining those systems into a cohesive, modernized game.