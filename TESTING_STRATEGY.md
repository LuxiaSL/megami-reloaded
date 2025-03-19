# Testing Strategy for Megami Quest 2 Remaster

This document outlines a comprehensive testing approach for ensuring that the remastered version of Megami Quest 2 faithfully preserves the original game's mechanics while validating the correctness of the new implementation.

## Testing Philosophy

### Core Principles
- Test behavior, not implementation
- Ensure mathematical precision with the original
- Validate progression curves match the original game
- Confirm that all critical systems interact correctly
- Prioritize edge cases that affect progression balance

## Test Types and Hierarchy

### Unit Tests

#### Critical Formulas
- Test all mathematical formulas in isolation:
  ```javascript
  // Example test for level calculation
  test('calculates correct level from experience', () => {
    // Test values derived from original game
    expect(calculateLevel(100)).toBeCloseTo(5.24);
    expect(calculateLevel(1000)).toBeCloseTo(14.58);
    expect(calculateLevel(10000)).toBeCloseTo(40.53);
  });
  
  // Example test for damage calculation
  test('calculates correct damage values', () => {
    const attacker = { strength: 1000 };
    const defender = { defense: 200 };
    
    // Run calculation multiple times to account for randomness
    const results = Array.from({ length: 100 }, () => 
      calculateDamage(attacker, defender)
    );
    
    // Verify mean is within expected range
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    expect(mean).toBeGreaterThan(790);
    expect(mean).toBeLessThan(810);
    
    // Verify distribution matches expected randomness
    const max = Math.max(...results);
    const min = Math.min(...results);
    expect(max - min).toBeGreaterThan(70); // Ensure randomness is applied
    expect(max - min).toBeLessThan(100); // But within expected bounds
  });
  ```

#### State Transitions
- Test state changes for all core actions:
  ```javascript
  test('correctly updates member state on level up', () => {
    // Arrange
    const initialState = {
      member: {
        level: 10,
        exp: 500,
        stats: { strength: 100, speed: 80, magic: 50 }
      }
    };
    
    // Act
    const action = { type: 'GAIN_EXPERIENCE', payload: 600 };
    const newState = memberReducer(initialState, action);
    
    // Assert
    expect(newState.member.level).toBe(11);
    expect(newState.member.stats.strength).toBeGreaterThan(initialState.member.stats.strength);
  });
  ```

#### Parser Functions
- Test equipment effect string parsing:
  ```javascript
  test('correctly parses effect strings', () => {
    expect(parseEffect('A:strength:10')).toEqual({
      type: 'additive',
      stat: 'strength',
      value: 10
    });
    
    expect(parseEffect('M:speed:1.5')).toEqual({
      type: 'multiplicative',
      stat: 'speed',
      value: 1.5
    });
  });
  ```

### Integration Tests

#### System Interactions
- Test how different systems interact:
  ```javascript
  test('party movement correctly triggers area discovery', async () => {
    // Arrange
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialGameState
    });
    
    // Act
    await store.dispatch(moveParty({
      partyId: 0,
      destination: { x: 3000, y: 4000 }
    }));
    
    // Assert
    const state = store.getState();
    expect(state.world.areas.mountainPass.discovered).toBe(true);
    expect(state.ui.notifications).toContainEqual(
      expect.objectContaining({ type: 'AREA_DISCOVERED' })
    );
  });
  ```

#### Complete Flows
- Test entire gameplay flows:
  ```javascript
  test('complete combat sequence resolves correctly', async () => {
    // Arrange
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: combatInitialState
    });
    
    // Act - Simulate full combat sequence
    await store.dispatch(startCombat({ bossId: 'forestTroll' }));
    
    // Process turns until combat ends
    while (store.getState().combat.active) {
      await store.dispatch(processCombatTurn());
    }
    
    // Assert
    const finalState = store.getState();
    expect(finalState.combat.active).toBe(false);
    expect(finalState.combat.result).toBe('victory');
    expect(finalState.world.bosses.forestTroll.defeated).toBe(true);
    expect(finalState.world.areas.westernForest.completed).toBe(true);
    expect(finalState.resources.gold).toBeGreaterThan(combatInitialState.resources.gold);
  });
  ```

#### Persistence
- Test save/load functionality:
  ```javascript
  test('game state correctly persists and loads', () => {
    // Arrange
    const initialState = createComplexGameState();
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState
    });
    
    // Act
    store.dispatch(saveGame());
    
    // Create new store with empty state
    const newStore = configureStore({
      reducer: rootReducer
    });
    
    newStore.dispatch(loadGame());
    
    // Assert
    expect(newStore.getState()).toEqual(initialState);
  });
  ```

### Simulation Tests

#### Automated Gameplay
- Create bot players that simulate real gameplay:
  ```javascript
  test('bot player can reach endgame within expected timeframe', async () => {
    // Arrange
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: newGameState
    });
    
    const bot = createGameBot({
      strategy: 'optimal',
      speedFactor: 1000, // Accelerated simulation
      targetArea: 'goldenPalace'
    });
    
    // Act
    const result = await bot.playUntilTargetReached(store);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.gameTime).toBeLessThan(14 * 24 * 60 * 60); // 14 game days
    expect(result.actionCount).toBeLessThan(10000);
    expect(store.getState().world.areas.goldenPalace.discovered).toBe(true);
  });
  ```

#### Balance Validation
- Test progression curves match original:
  ```javascript
  test('resource generation matches expected curves', () => {
    const results = [];
    
    // Simulate 7 days of gameplay in 1-hour increments
    for (let hour = 0; hour < 168; hour++) {
      const state = simulateGameplay(hour);
      results.push({
        hour,
        gold: state.resources.gold,
        partyStrength: calculatePartyStrength(state.parties[0])
      });
    }
    
    // Assert gold generation follows expected curve
    const goldCurve = results.map(r => r.gold);
    expect(fitCurveToExponential(goldCurve)).toEqual({
      base: expect.closeTo(1.08, 0.02),
      coefficient: expect.closeTo(100, 20)
    });
    
    // Assert strength progression follows expected curve
    const strengthCurve = results.map(r => r.partyStrength);
    expect(fitCurveToExponential(strengthCurve)).toEqual({
      base: expect.closeTo(1.045, 0.01),
      coefficient: expect.closeTo(50, 10)
    });
  });
  ```

#### Performance Testing
- Test performance under various conditions:
  ```javascript
  test('maintains acceptable performance with large party', () => {
    // Arrange
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: largePartyState // State with 20+ party members
    });
    
    // Act
    const startTime = performance.now();
    for (let i = 0; i < 60; i++) {
      store.dispatch(gameTick());
    }
    const endTime = performance.now();
    
    // Assert
    expect(endTime - startTime).toBeLessThan(100); // Less than 100ms for 60 ticks
  });
  ```

## Verification Examples

### Core System Tests

#### 1. Resource Generation
```javascript
test('verifies resource generation rates', () => {
  // Test data from original game
  const scenarios = [
    {
      party: {
        members: [
          { type: 'fighter', level: 10, attributes: { power: 0.7, speed: 0.2, magic: 0.1 } }
        ]
      },
      area: { id: 'plains', difficulty: 1, goldRate: 10, expRate: 5 },
      expected: { gold: 50, exp: 25 }
    },
    {
      party: {
        members: [
          { type: 'fighter', level: 50, attributes: { power: 0.7, speed: 0.2, magic: 0.1 } },
          { type: 'mage', level: 45, attributes: { power: 0.1, speed: 0.3, magic: 0.6 } }
        ]
      },
      area: { id: 'forest', difficulty: 10, goldRate: 100, expRate: 50 },
      expected: { gold: 1250, exp: 625 }
    }
  ];
  
  scenarios.forEach(scenario => {
    const result = calculateResourceGeneration(scenario.party, scenario.area);
    expect(result.gold).toBeCloseTo(scenario.expected.gold, 0);
    expect(result.exp).toBeCloseTo(scenario.expected.exp, 0);
  });
});
```

#### 2. Combat System
```javascript
test('verifies combat outcomes match original game', () => {
  const scenarios = [
    {
      party: [
        { type: 'fighter', level: 20, strength: 500, speed: 300, magic: 100 }
      ],
      boss: { name: 'Goblin Chief', hp: 2000, strength: 300, defense: 100, speed: 200 },
      expected: { victory: true, turnsRequired: 5, partyDamageTaken: 600 }
    },
    {
      party: [
        { type: 'healer', level: 15, strength: 100, speed: 200, magic: 600 },
        { type: 'archer', level: 18, strength: 400, speed: 500, magic: 200 }
      ],
      boss: { name: 'Stone Golem', hp: 5000, strength: 600, defense: 400, speed: 100 },
      expected: { victory: true, turnsRequired: 12, partyDamageTaken: 2000 }
    }
  ];
  
  scenarios.forEach(scenario => {
    const result = simulateCombat(scenario.party, scenario.boss);
    expect(result.victory).toBe(scenario.expected.victory);
    expect(result.turns).toBeCloseTo(scenario.expected.turnsRequired, 1);
    expect(result.totalDamageTaken).toBeCloseTo(scenario.expected.partyDamageTaken, -1);
  });
});
```

#### 3. Leveling System
```javascript
test('verifies level calculations match original game', () => {
  const testCases = [
    { exp: 100, expectedLevel: 5.24 },
    { exp: 1000, expectedLevel: 14.58 },
    { exp: 10000, expectedLevel: 40.53 },
    { exp: 100000, expectedLevel: 112.67 },
    { exp: 1000000, expectedLevel: 313.27 }
  ];
  
  testCases.forEach(testCase => {
    expect(calculateLevel(testCase.exp)).toBeCloseTo(testCase.expectedLevel, 1);
  });
});
```

#### 4. Equipment System
```javascript
test('verifies equipment effects match original game', () => {
  const scenarios = [
    {
      member: { type: 'fighter', strength: 100, speed: 50, magic: 20 },
      equipment: [
        { type: 'sword', effects: ['A:strength:50', 'M:speed:0.8'] },
        { type: 'armor', effects: ['A:strength:20', 'A:magic:10'] }
      ],
      expected: { strength: 170, speed: 40, magic: 30 }
    },
    {
      member: { type: 'mage', strength: 30, speed: 40, magic: 100 },
      equipment: [
        { type: 'staff', effects: ['A:magic:30', 'M:magic:1.5'] },
        { type: 'robe', effects: ['A:speed:20', 'M:strength:0.5'] }
      ],
      expected: { strength: 15, speed: 60, magic: 195 }
    }
  ];
  
  scenarios.forEach(scenario => {
    const result = calculateEquippedStats(scenario.member, scenario.equipment);
    expect(result.strength).toBeCloseTo(scenario.expected.strength);
    expect(result.speed).toBeCloseTo(scenario.expected.speed);
    expect(result.magic).toBeCloseTo(scenario.expected.magic);
  });
});
```

## Edge Cases and Regression Tests

### Edge Cases
```javascript
test('handles extreme values correctly', () => {
  // Zero resource generation
  expect(calculateResourceGeneration({ members: [] }, { goldRate: 10 })).toEqual({ gold: 0, exp: 0 });
  
  // Negative defense (should be treated as zero)
  expect(calculateDamage({ strength: 100 }, { defense: -50 })).toBeGreaterThan(100);
  
  // Extremely high level (should not overflow)
  expect(calculateLevel(Number.MAX_SAFE_INTEGER)).toBeGreaterThan(0);
  
  // Extremely low stats
  const lowStatMember = { strength: 1, speed: 1, magic: 1 };
  const result = simulateCombat([lowStatMember], { hp: 10, strength: 10, defense: 10, speed: 10 });
  expect(result.victory).toBeDefined(); // Should not crash
});
```

### Regression Tests
```javascript
test('regression: fix for issue #123 - incorrect damage calculation', () => {
  // Previous bug caused damage to be reduced by defense twice
  const attacker = { strength: 1000 };
  const defender = { defense: 200 };
  const damage = calculateDamage(attacker, defender);
  
  // Should be approximately 800, not 600
  expect(damage).toBeGreaterThan(750);
  expect(damage).toBeLessThan(850);
});

test('regression: fix for issue #145 - resource overflow', () => {
  // Arrange
  const state = {
    resources: { gold: Number.MAX_SAFE_INTEGER - 1000 },
    parties: [{ /* strong party */ }],
    areas: { forest: { /* resource-rich area */ } }
  };
  
  // Act
  const newState = resourceReducer(state, { 
    type: 'GENERATE_RESOURCES',
    payload: { amount: 2000 }
  });
  
  // Assert - should cap at MAX_SAFE_INTEGER, not overflow
  expect(newState.resources.gold).toBe(Number.MAX_SAFE_INTEGER);
});
```

## UI Component Testing

### Render Tests
```javascript
test('renders combat UI correctly', () => {
  // Arrange
  const combatState = {
    active: true,
    boss: { name: 'Dragon', hp: 5000, maxHp: 10000 },
    party: [
      { name: 'Fighter', hp: 800, maxHp: 1000 },
      { name: 'Mage', hp: 400, maxHp: 500 }
    ]
  };
  
  // Act
  render(<CombatView state={combatState} />);
  
  // Assert
  expect(screen.getByText('Dragon')).toBeInTheDocument();
  expect(screen.getByText('HP: 5000/10000')).toBeInTheDocument();
  expect(screen.getByText('Fighter')).toBeInTheDocument();
  expect(screen.getByText('Mage')).toBeInTheDocument();
});
```

### Interaction Tests
```javascript
test('item equip button correctly dispatches action', async () => {
  // Arrange
  const mockDispatch = jest.fn();
  render(
    <DispatchContext.Provider value={mockDispatch}>
      <ItemCard item={{ id: 'sword', name: 'Iron Sword' }} />
    </DispatchContext.Provider>
  );
  
  // Act
  await userEvent.click(screen.getByText('Equip'));
  
  // Assert
  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'EQUIP_ITEM',
    payload: { itemId: 'sword' }
  });
});
```

## Accessibility Testing

```javascript
test('game interface meets accessibility standards', async () => {
  // Arrange
  const { container } = render(<App />);
  
  // Act & Assert
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Platform-Specific Tests

```javascript
// Testing mobile layout
test('adjusts layout for mobile screens', () => {
  // Mock mobile viewport
  window.innerWidth = 375;
  window.innerHeight = 667;
  
  // Trigger resize event
  fireEvent(window, new Event('resize'));
  
  render(<App />);
  
  // Check that mobile layout is used
  expect(screen.getByTestId('mobile-navigation')).toBeVisible();
  expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument();
});

// Testing offline functionality
test('works offline', async () => {
  // Mock offline status
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  
  render(<App />);
  
  // Check offline message is shown
  expect(screen.getByText('You are currently offline')).toBeInTheDocument();
  
  // Check that game functionality still works
  await userEvent.click(screen.getByText('Continue Playing'));
  expect(screen.getByTestId('game-container')).toBeInTheDocument();
});
```

## Test Environment Setup

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/mocks/**',
    '!src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Mock Data
```javascript
// Sample mock data for testing
export const mockGameState = {
  resources: {
    gold: 1000,
    exp: 500
  },
  parties: [
    {
      id: 0,
      members: [
        {
          id: 'fighter_1',
          type: 'fighter',
          level: 10,
          exp: 1000,
          stats: { strength: 100, speed: 80, magic: 50 }
        }
      ]
    }
  ],
  world: {
    areas: {
      plains: {
        id: 'plains',
        name: 'Grassy Plains',
        discovered: true,
        completed: false,
        difficulty: 1
      }
    }
  }
};
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Check coverage
        run: npm run test:coverage
      - name: Run E2E tests
        run: npm run test:e2e
```

## Manual Test Cases

### Progression Testing
1. Start new game and verify initial state
2. Progress through first few areas and verify resource generation rates
3. Defeat first boss and verify rewards and area unlocks
4. Level members to trigger stat distributions
5. Apply and verify equipment effects
6. Test party size limits and member removal
7. Verify save/load functionality preserves exact state

### Reset/Prestige Testing
1. Progress to reset point
2. Verify reset confirmation dialog
3. Complete reset and verify all expected data is retained
4. Verify bonuses from previous reset are applied correctly
5. Verify progression is faster after reset

### Visual Testing
1. Verify all UI states render correctly
2. Test responsive layouts at different screen sizes
3. Verify animations and transitions
4. Test color schemes and accessibility modes

## Testing Calendar

### Weekly Testing
- Run full automated test suite
- Run simulation tests to verify progression curves
- Manual testing of new features

### Monthly Testing
- Full playthrough testing
- Cross-platform compatibility testing
- Performance benchmarking

### Pre-Release Testing
- Extended beta testing with real users
- Stress testing with maximized game state
- Comparison playthrough with original game to verify matching progress rates