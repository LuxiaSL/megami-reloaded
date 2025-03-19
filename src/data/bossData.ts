import { Boss } from '../state/worldSlice'

// Basic boss data for the game - will be expanded with full content later
export const bossData: Record<number, Boss> = {
  // First boss
  1: {
    id: 1,
    bossName: 'Guardian Golem',
    rank: 1,
    hp: 100,
    attack: 15,
    speed: 5,
    defence: 20,
    mdefence: 10,
    imgUrl: 'golem.png'
  },
  
  // Second boss
  2: {
    id: 2,
    bossName: 'Forest Dragon',
    rank: 2,
    hp: 300,
    attack: 30,
    speed: 15,
    defence: 25,
    mdefence: 40,
    imgUrl: 'dragon.png'
  }
}

// Export function to get boss by ID with error handling
export function getBossById(id: number): Boss | undefined {
  return bossData[id]
}