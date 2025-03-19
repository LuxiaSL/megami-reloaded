import { Area, AreaType } from '../state/worldSlice'

// Basic starting area data for the game - will be expanded with full content later
export const areaData: Record<number, Area> = {
  // Idavoll Plain (Starting Area)
  16: {
    id: 16,
    areaType: AreaType.Field,
    areaName: 'Idavoll Plain',
    positionX: 1750,
    positionY: 4500,
    searchRemain: 0, // Already discovered at game start
    base: 2, // Base difficulty
    giveGold: 1, // Gold per tick
    giveExp: 1, // Experience per tick
    giveItem: [], // No drops for starter area
    speedEffect: 1,
    imgUrl: 'idavoll.png',
    fntClr: '#008800',
    wayEvents: []
  },
  
  // Asgard Village (First Town)
  12: {
    id: 12,
    areaType: AreaType.Town,
    areaName: 'Asgard Village',
    positionX: 1850,
    positionY: 4400,
    searchRemain: 100, // Must be discovered through exploration
    base: 0, // Towns have no difficulty
    giveGold: 0,
    giveExp: 0,
    giveItem: [],
    speedEffect: 1,
    imgUrl: 'asgard.png',
    fntClr: '#0000ff',
    wayEvents: [],
    shopItems: [
      { itemId: 1, price: 50 }, // Basic potion
      { itemId: 2, price: 100 } // Basic weapon
    ],
    barInfos: []
  },
  
  // Yggdrasil Forest (Second Area)
  18: {
    id: 18,
    areaType: AreaType.Field,
    areaName: 'Yggdrasil Forest',
    positionX: 1650,
    positionY: 4400,
    searchRemain: 100, // Must be discovered through exploration
    base: 5, // Slightly harder than starting area
    giveGold: 2,
    giveExp: 3,
    giveItem: [
      { itemId: 3, probability: 0.01 }, // 1% chance of basic drop
    ],
    speedEffect: 0.8, // Slower movement due to forest
    imgUrl: 'forest.png',
    fntClr: '#006600',
    wayEvents: []
  },
  
  // First Dungeon
  25: {
    id: 25,
    areaType: AreaType.Dungeon,
    areaName: 'Mimir Cave',
    positionX: 1900,
    positionY: 4550,
    searchRemain: 200, // Harder to explore fully
    base: 10,
    giveGold: 5,
    giveExp: 8,
    giveItem: [
      { itemId: 4, probability: 0.02 }, // 2% chance of better drop
    ],
    speedEffect: 0.6, // Even slower in dungeon
    imgUrl: 'cave.png',
    fntClr: '#993300',
    wayEvents: [],
    boss: 1 // First boss
  }
}

// Export function to get area by ID with error handling
export function getAreaById(id: number): Area | undefined {
  return areaData[id]
}