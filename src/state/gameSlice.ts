import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { calculateOfflineProgression } from '../utils/resourceCalculator'

interface GameState {
  initialized: boolean
  version: string
  counter: number
  gold: number
  totalGold: number
  currentGroup: number
  itemMax: number
  autoSave: boolean
  resetCount: number
  savedDate: number
  numberUnit: string
  drawBg: boolean
  flgMapFollow: boolean
  infiniteLevel: number
  lastResourceTick: number
}

const initialState: GameState = {
  initialized: false,
  version: '2.0.0',
  counter: 0,
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
  infiniteLevel: 1,
  lastResourceTick: 0
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state) => {
      // Try to load saved game data
      try {
        const savedData = localStorage.getItem('megamiQuest2SaveData')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          
          // Calculate offline progress
          const minutesAway = Math.floor((Date.now() - parsedData.game.savedDate) / 60000)
          const offlineProgressData = { minutesAway, parties: parsedData.parties.parties }
          
          // Load saved game state
          return { 
            ...parsedData.game, 
            initialized: true, 
            savedDate: Date.now(),
            lastResourceTick: 0, // Reset resource tick counter
            offlineProgressData // Store for middleware to process
          }
        }
      } catch (error) {
        console.error('Failed to load saved game:', error)
      }

      // Return initialized state for new game
      return { 
        ...initialState, 
        initialized: true, 
        savedDate: Date.now(),
        lastResourceTick: 0
      }
    },
    
    gameTick: (state) => {
      // Increment game counter
      state.counter += 1

      // Update saved date (for offline progress calculation)
      state.savedDate = Date.now()
      
      // Flag for resource generation (every second)
      // This will be used by the resourceGenerationMiddleware
      state.lastResourceTick = state.counter
    },
    
    addGold: (state, action: PayloadAction<number>) => {
      const amount = action.payload
      state.gold += amount
      if (amount > 0) {
        state.totalGold += amount
      }
    },
    
    spendGold: (state, action: PayloadAction<number>) => {
      const amount = action.payload
      if (state.gold >= amount) {
        state.gold -= amount
      }
    },
    
    toggleAutoSave: (state) => {
      state.autoSave = !state.autoSave
    },
    
    setCurrentGroup: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload <= 2) {
        state.currentGroup = action.payload
      }
    },
    
    extendItemMax: (state, action: PayloadAction<number>) => {
      if (action.payload > state.itemMax) {
        state.itemMax = action.payload
      }
    },
    
    setInfiniteLevel: (state, action: PayloadAction<number>) => {
      state.infiniteLevel = action.payload
    },
    
    incrementResetCount: (state) => {
      state.resetCount += 1
    },
    
    toggleMapFollow: (state) => {
      state.flgMapFollow = !state.flgMapFollow
    },
    
    toggleDrawBg: (state) => {
      state.drawBg = !state.drawBg
    },
    
    setNumberUnit: (state, action: PayloadAction<string>) => {
      state.numberUnit = action.payload
    },
    
    processOfflineProgress: (state, action: PayloadAction<{ treasureValue: number, timeToAdd: number }>) => {
      const { treasureValue, timeToAdd } = action.payload
      
      // Add time to game counter
      state.counter += timeToAdd
      
      // Add treasureValue to state for middleware to create treasure item
      return {
        ...state,
        offlineTreasureValue: treasureValue
      }
    }
  }
})

export const {
  initializeGame,
  gameTick,
  addGold,
  spendGold,
  toggleAutoSave,
  setCurrentGroup,
  extendItemMax,
  setInfiniteLevel,
  incrementResetCount,
  toggleMapFollow,
  toggleDrawBg,
  setNumberUnit,
  processOfflineProgress
} = gameSlice.actions

export default gameSlice.reducer