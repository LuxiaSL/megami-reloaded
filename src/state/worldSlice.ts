import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { areaData } from '../data/areaData'
import { bossData } from '../data/bossData'

export enum AreaType {
  Field = 0,
  Town = 1,
  Dungeon = 2,
  Shrine = 3,
  Fusion = 4
}

export interface AreaDropTable {
  itemId: number
  probability: number
}

export interface WayEvent {
  ratio: number
  func: string // This will be a function name that we'll map to actual functions
}

export interface ShopItem {
  itemId: number
  price: number
}

export interface BarInfo {
  areaId: number
  price: number
}

export interface Area {
  id: number
  areaType: AreaType
  areaName: string
  positionX: number
  positionY: number
  searchRemain: number // -1 if completed, > 0 if exploring
  base: number // Difficulty
  giveGold: number
  giveExp: number
  giveItem: AreaDropTable[]
  speedEffect: number
  imgUrl: string
  fntClr: string
  wayEvents: WayEvent[]
  // Type-specific properties
  boss?: number // Boss ID for dungeons
  shopItems?: ShopItem[] // For towns
  barInfos?: BarInfo[] // For towns
  summonRank?: number // For shrines
}

export interface Boss {
  id: number
  bossName: string
  rank: number
  hp: number
  attack: number
  speed: number
  defence: number
  mdefence: number
  imgUrl: string
}

interface WorldState {
  mapSize: number
  minMapX: number
  minMapY: number
  maxMapX: number
  maxMapY: number
  areas: Record<number, Area>
  bosses: Record<number, Boss>
  foundAreas: Record<number, number> // AreaId -> searchRemain (-1 if completed)
}

const initialState: WorldState = {
  mapSize: 6000,
  minMapX: 1500,
  minMapY: 3800,
  maxMapX: 2300,
  maxMapY: 4800,
  areas: {},
  bosses: {},
  foundAreas: {}
}

export const worldSlice = createSlice({
  name: 'world',
  initialState,
  reducers: {
    initializeWorld: (state) => {
      // Load area data from imported data files
      state.areas = areaData
      
      // Load boss data from imported data files
      state.bosses = bossData
      
      // Set starting area as discovered (Idavoll Plain)
      state.foundAreas[16] = 0
    },
    
    discoverArea: (state, action: PayloadAction<number>) => {
      const areaId = action.payload
      
      if (!state.foundAreas[areaId] && state.areas[areaId]) {
        state.foundAreas[areaId] = state.areas[areaId].searchRemain
        
        // Expand visible map when discovering non-field areas
        if (state.areas[areaId].areaType !== AreaType.Field) {
          const posX = state.areas[areaId].positionX
          const posY = state.areas[areaId].positionY
          
          state.minMapX = Math.max(Math.min(state.minMapX, posX - 200), 0)
          state.minMapY = Math.max(Math.min(state.minMapY, posY - 200), 0)
          state.maxMapX = Math.min(Math.max(state.maxMapX, posX + 200), state.mapSize)
          state.maxMapY = Math.min(Math.max(state.maxMapY, posY + 200), state.mapSize)
        }
      }
    },
    
    exploreArea: (state, action: PayloadAction<{ areaId: number, progress: number }>) => {
      const { areaId, progress } = action.payload
      
      if (state.foundAreas[areaId] > 0) {
        state.foundAreas[areaId] -= progress
        
        // Check if exploration is complete
        if (state.foundAreas[areaId] <= 0) {
          state.foundAreas[areaId] = 0
        }
      }
    },
    
    completeArea: (state, action: PayloadAction<number>) => {
      const areaId = action.payload
      
      if (state.foundAreas[areaId] !== undefined && state.foundAreas[areaId] !== -1) {
        state.foundAreas[areaId] = -1
        
        // Trigger area discovery effects based on the completed area
        // This would be expanded with all area completion effects
        switch (areaId) {
          case 16: // Idavoll Plain
            // Completing Idavoll reveals Asgard Village (12) and Yggdrasil Forest (18)
            if (!state.foundAreas[12]) state.foundAreas[12] = state.areas[12].searchRemain
            if (!state.foundAreas[18]) state.foundAreas[18] = state.areas[18].searchRemain
            break;
          
          case 18: // Yggdrasil Forest
            // Completing Yggdrasil reveals Mimir Cave (25)
            if (!state.foundAreas[25]) state.foundAreas[25] = state.areas[25].searchRemain
            break;
            
          // Additional area completion effects would be added here
        }
      }
    },
    
    expandMap: (state, action: PayloadAction<{ minX: number, minY: number, maxX: number, maxY: number }>) => {
      const { minX, minY, maxX, maxY } = action.payload
      
      state.minMapX = Math.max(minX, 0)
      state.minMapY = Math.max(minY, 0)
      state.maxMapX = Math.min(maxX, state.mapSize)
      state.maxMapY = Math.min(maxY, state.mapSize)
    },
    
    revealFullMap: (state) => {
      state.minMapX = 0
      state.minMapY = 0
      state.maxMapX = state.mapSize
      state.maxMapY = state.mapSize
    },
    
    // New action to reveal adjacent areas based on current area
    revealAdjacentAreas: (state, action: PayloadAction<number>) => {
      const areaId = action.payload
      
      // This would be expanded with a proximity calculation
      // For now, use hardcoded adjacency
      const adjacencyMap: Record<number, number[]> = {
        16: [12, 18], // Idavoll Plain is adjacent to Asgard Village and Yggdrasil Forest
        12: [16, 25], // Asgard Village is adjacent to Idavoll Plain and Mimir Cave
        18: [16, 25], // Yggdrasil Forest is adjacent to Idavoll Plain and Mimir Cave
        25: [12, 18]  // Mimir Cave is adjacent to Asgard Village and Yggdrasil Forest
      }
      
      const adjacentAreas = adjacencyMap[areaId] || []
      
      // Reveal adjacent areas (but don't mark as discovered)
      adjacentAreas.forEach(adjId => {
        if (state.areas[adjId] && !state.foundAreas[adjId]) {
          // Show on map but don't discover yet
          // Expansion would show them as "?" on the map
        }
      })
    }
  }
})

export const {
  initializeWorld,
  discoverArea,
  exploreArea,
  completeArea,
  expandMap,
  revealFullMap,
  revealAdjacentAreas
} = worldSlice.actions

export default worldSlice.reducer