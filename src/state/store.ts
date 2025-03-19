import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './gameSlice'
import partiesReducer from './partiesSlice'
import worldReducer from './worldSlice'
import inventoryReducer from './inventorySlice'
import uiReducer from './uiSlice'
import resourceGenerationMiddleware from './middleware/resourceGenerationMiddleware'

export const store = configureStore({
  reducer: {
    game: gameReducer,
    parties: partiesReducer,
    world: worldReducer,
    inventory: inventoryReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(resourceGenerationMiddleware)
})

// Save game state to localStorage whenever state changes
store.subscribe(() => {
  const state = store.getState()
  if (state.game.initialized && state.game.autoSave) {
    localStorage.setItem('megamiQuest2SaveData', JSON.stringify(state))
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch