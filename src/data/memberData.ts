/**
 * Member data definitions for Megami Quest 2 Remaster
 * Contains member types, starting attributes, and level indices
 */

import { Member } from '../state/partiesSlice'
import { v4 as uuidv4 } from 'uuid'

// Define the base attributes for different member types
export interface MemberTypeData {
  type: string
  name: string
  imgUrl: string
  rare: number  // 0=common, 1=uncommon, 2=rare, 3=legendary
  levelIndex: number
  // Base attribute multipliers
  attrStrength: number
  attrSpeed: number
  attrMagic: number
  // Starting power distribution
  ratioSpeed: number
  ratioMagic: number
}

// Available member type data
export const memberTypes: Record<string, MemberTypeData> = {
  // Legendary (Rank 3) - 0.38-0.40 level index
  megami: {
    type: 'megami',
    name: 'Megami',
    imgUrl: 'megami.png',
    rare: 3,
    levelIndex: 0.40,
    attrStrength: 1.0,
    attrSpeed: 1.0,
    attrMagic: 1.0,
    ratioSpeed: 0.3,
    ratioMagic: 0.3
  },
  thor: {
    type: 'thor',
    name: 'Thor',
    imgUrl: 'thor.png',
    rare: 3,
    levelIndex: 0.39,
    attrStrength: 1.3,
    attrSpeed: 0.9,
    attrMagic: 0.8,
    ratioSpeed: 0.2,
    ratioMagic: 0.1
  },
  odin: {
    type: 'odin',
    name: 'Odin',
    imgUrl: 'odin.png',
    rare: 3,
    levelIndex: 0.38,
    attrStrength: 0.9,
    attrSpeed: 0.8,
    attrMagic: 1.3,
    ratioSpeed: 0.1,
    ratioMagic: 0.5
  },
  
  // Rare (Rank 2) - 0.40-0.42 level index
  einherjar: {
    type: 'einherjar',
    name: 'Einherjar',
    imgUrl: 'einherjar.png',
    rare: 2,
    levelIndex: 0.42,
    attrStrength: 1.2,
    attrSpeed: 1.0,
    attrMagic: 0.8,
    ratioSpeed: 0.3,
    ratioMagic: 0.1
  },
  vidar: {
    type: 'vidar',
    name: 'Vidar',
    imgUrl: 'vidar.png',
    rare: 2,
    levelIndex: 0.41,
    attrStrength: 1.0,
    attrSpeed: 1.2,
    attrMagic: 0.8,
    ratioSpeed: 0.4,
    ratioMagic: 0.1
  },
  freyja: {
    type: 'freyja',
    name: 'Freyja',
    imgUrl: 'freyja.png',
    rare: 2,
    levelIndex: 0.40,
    attrStrength: 0.8,
    attrSpeed: 1.0,
    attrMagic: 1.2,
    ratioSpeed: 0.2,
    ratioMagic: 0.4
  },
  
  // Uncommon (Rank 1) - 0.41-0.43 level index
  dis: {
    type: 'dis',
    name: 'Dis',
    imgUrl: 'dis.png',
    rare: 1,
    levelIndex: 0.43,
    attrStrength: 1.1,
    attrSpeed: 0.9,
    attrMagic: 1.0,
    ratioSpeed: 0.2,
    ratioMagic: 0.3
  },
  magni: {
    type: 'magni',
    name: 'Magni',
    imgUrl: 'magni.png',
    rare: 1,
    levelIndex: 0.42,
    attrStrength: 1.2,
    attrSpeed: 0.9,
    attrMagic: 0.9,
    ratioSpeed: 0.2,
    ratioMagic: 0.2
  },
  hermod: {
    type: 'hermod',
    name: 'Hermod',
    imgUrl: 'hermod.png',
    rare: 1,
    levelIndex: 0.41,
    attrStrength: 0.9,
    attrSpeed: 1.2,
    attrMagic: 0.9,
    ratioSpeed: 0.4,
    ratioMagic: 0.2
  },
  
  // Common (Rank 0) - 0.42-0.44 level index
  embla: {
    type: 'embla',
    name: 'Embla',
    imgUrl: 'embla.png',
    rare: 0,
    levelIndex: 0.44,
    attrStrength: 1.0,
    attrSpeed: 1.0,
    attrMagic: 1.0,
    ratioSpeed: 0.3,
    ratioMagic: 0.3
  },
  askr: {
    type: 'askr',
    name: 'Askr',
    imgUrl: 'askr.png',
    rare: 0,
    levelIndex: 0.43,
    attrStrength: 1.1,
    attrSpeed: 1.0,
    attrMagic: 0.9,
    ratioSpeed: 0.3,
    ratioMagic: 0.2
  },
  mardoll: {
    type: 'mardoll',
    name: 'Mardoll',
    imgUrl: 'mardoll.png',
    rare: 0,
    levelIndex: 0.42,
    attrStrength: 0.9,
    attrSpeed: 1.0,
    attrMagic: 1.1,
    ratioSpeed: 0.2,
    ratioMagic: 0.4
  }
}

// Member summoning pools by rarity rank
export const summonRankPools = [
  // Rank 0 (common)
  [
    { type: 'embla', probability: 0.4 },
    { type: 'askr', probability: 0.4 },
    { type: 'mardoll', probability: 0.2 }
  ],
  
  // Rank 1 (uncommon)
  [
    { type: 'dis', probability: 0.4 },
    { type: 'magni', probability: 0.3 },
    { type: 'hermod', probability: 0.3 }
  ],
  
  // Rank 2 (rare)
  [
    { type: 'einherjar', probability: 0.4 },
    { type: 'vidar', probability: 0.3 },
    { type: 'freyja', probability: 0.3 }
  ],
  
  // Rank 3 (legendary) - Special events only
  [
    { type: 'thor', probability: 0.6 },
    { type: 'odin', probability: 0.4 }
  ]
]

// Summoning costs by rank
export const summonRankCosts = [20, 1000, 200000, 10000000]

/**
 * Creates a new member instance based on member type
 */
export function createMember(type: string): Member | null {
  const memberTypeData = memberTypes[type]
  if (!memberTypeData) return null
  
  const member: Member = {
    id: uuidv4(),
    type: memberTypeData.type,
    name: memberTypeData.name,
    imgUrl: memberTypeData.imgUrl,
    rare: memberTypeData.rare,
    level: 1,
    exp: 1,
    nextLevel: 0,
    baseStrength: 0,
    
    // Power distribution
    ratioSpeed: memberTypeData.ratioSpeed,
    ratioMagic: memberTypeData.ratioMagic,
    
    // Attribute multipliers
    attrStrength: memberTypeData.attrStrength,
    attrSpeed: memberTypeData.attrSpeed,
    attrMagic: memberTypeData.attrMagic,
    
    // Derived stats (will be calculated)
    strength: 0,
    speed: 0,
    magic: 0,
    
    stamina: 100,
    levelIndex: memberTypeData.levelIndex,
    valid: true,
    equipment: null,
    
    // Temporary stat modifiers
    aStrength: 0,
    aSpeed: 0,
    aMagic: 0,
    mStrength: 1,
    mSpeed: 1,
    mMagic: 1
  }
  
  return member
}

/**
 * Performs a member summoning from the specified rank pool
 */
export function summonMember(rank: number): Member | null {
  if (rank < 0 || rank >= summonRankPools.length) {
    return null
  }
  
  const pool = summonRankPools[rank]
  const random = Math.random()
  let cumulativeProbability = 0
  
  for (const entry of pool) {
    cumulativeProbability += entry.probability
    if (random <= cumulativeProbability) {
      return createMember(entry.type)
    }
  }
  
  // Fallback to first member in pool (should not happen with proper probabilities)
  return createMember(pool[0].type)
}

/**
 * Calculate member class based on attribute distribution
 */
export function getMemberClass(member: Member): string {
  // Weight attributes to determine specialization
  const strWeight = member.attrStrength * (1 - member.ratioSpeed - member.ratioMagic)
  const spdWeight = member.attrSpeed * member.ratioSpeed
  const magWeight = member.attrMagic * member.ratioMagic
  
  // Find the highest weighted attribute
  const maxWeight = Math.max(strWeight, spdWeight, magWeight)
  
  // Normalize weights
  const strNorm = strWeight / maxWeight
  const spdNorm = spdWeight / maxWeight
  const magNorm = magWeight / maxWeight
  
  // Determine class based on attribute ratios
  // 0.7 threshold is from original game
  if (spdNorm < 0.7 && magNorm < 0.7) return 'Warrior' // Strength
  if (strNorm < 0.7 && magNorm < 0.7) return 'Scout' // Speed
  if (strNorm < 0.7 && spdNorm < 0.7) return 'Mage' // Magic
  if (magNorm < 0.7) return 'Ranger' // Strength+Speed
  if (spdNorm < 0.7) return 'Paladin' // Strength+Magic
  if (strNorm < 0.7) return 'Sage' // Speed+Magic
  if (strWeight > 5) return 'Battle-Mage' // Balanced (high strength)
  return 'Generalist' // Balanced
}

/**
 * Calculate gold value when dismissing a member
 */
export function getMemberGoldValue(member: Member): number {
  // Use the formula from the original game
  const baseValue = Math.floor(Math.pow(member.exp, 0.7))
  const attributeMultiplier = (
    member.attrStrength * 1.0 + 
    member.attrSpeed * 0.8 + 
    member.attrMagic * 1.2
  )
  
  return Math.floor(baseValue * attributeMultiplier)
}