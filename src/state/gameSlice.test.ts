import { describe, it, expect } from 'vitest'
import gameReducer, { 
  initializeGame, 
  gameTick, 
  addGold, 
  spendGold,
  toggleAutoSave,
  setCurrentGroup,
  extendItemMax
} from './gameSlice'

describe('Game Slice', () => {
  it('should initialize game state', () => {
    const initialState = {
      initialized: false,
      version: '2.0.0',
      counter: 0,
      gold: 0,
      totalGold: 0,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: 0,
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, initializeGame())
    
    expect(result.initialized).toBe(true)
    expect(result.savedDate).toBeGreaterThan(0)
  })
  
  it('should increment counter on game tick', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 0,
      totalGold: 0,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, gameTick())
    
    expect(result.counter).toBe(11)
    expect(result.savedDate).toBeGreaterThanOrEqual(initialState.savedDate)
  })
  
  it('should add gold correctly', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 100,
      totalGold: 200,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, addGold(50))
    
    expect(result.gold).toBe(150)
    expect(result.totalGold).toBe(250)
  })
  
  it('should spend gold correctly when sufficient funds', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 100,
      totalGold: 200,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, spendGold(50))
    
    expect(result.gold).toBe(50)
    expect(result.totalGold).toBe(200) // Total gold shouldn't change
  })
  
  it('should toggle auto save', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 100,
      totalGold: 200,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, toggleAutoSave())
    
    expect(result.autoSave).toBe(false)
  })
  
  it('should set current group', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 100,
      totalGold: 200,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, setCurrentGroup(1))
    
    expect(result.currentGroup).toBe(1)
  })
  
  it('should extend item max', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 100,
      totalGold: 200,
      currentGroup: 0,
      itemMax: 5,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, extendItemMax(10))
    
    expect(result.itemMax).toBe(10)
  })
  
  it('should not extend item max if new value is smaller', () => {
    const initialState = {
      initialized: true,
      version: '2.0.0',
      counter: 10,
      gold: 100,
      totalGold: 200,
      currentGroup: 0,
      itemMax: 10,
      autoSave: true,
      resetCount: 0,
      savedDate: Date.now(),
      numberUnit: '',
      drawBg: true,
      flgMapFollow: true,
      infiniteLevel: 1
    }
    
    const result = gameReducer(initialState, extendItemMax(5))
    
    expect(result.itemMax).toBe(10) // Should remain unchanged
  })
})