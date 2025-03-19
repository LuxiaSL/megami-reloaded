import { Party, Member } from '../state/partiesSlice'
import { Area } from '../state/worldSlice'
import { getAreaById } from '../data/areaData'

/**
 * Calculates the strength multiplier based on party strength vs area difficulty.
 * Follows original game's formula: multiplier = party_strength/area_difficulty,
 * capped between 0.5 and 5.
 */
export function calculateStrengthMultiplier(partyStrength: number, areaDifficulty: number): number {
  let multiplier = partyStrength / areaDifficulty
  
  // Cap multiplier between 0.5 and 5 as per original game
  if (multiplier > 5) multiplier = 5
  if (multiplier < 0.5) multiplier = 0.5
  
  return multiplier
}

/**
 * Counts the number of "strong" members in a party for an area.
 * A member is considered "strong" if their strength exceeds the area's base difficulty.
 */
export function countStrongMembers(members: Member[], areaDifficulty: number): number {
  return members.filter(member => 
    member.valid && member.strength > areaDifficulty
  ).length
}

/**
 * Get the stamina production modifier for a member based on their stamina value.
 * 0% stamina = 0% production
 * 1-25% stamina = 25% production
 * 26-50% stamina = 50% production
 * 51-100% stamina = 100% production
 */
export function getStaminaModifier(stamina: number): number {
  if (stamina <= 0) return 0
  if (stamina <= 25) return 0.25
  if (stamina <= 50) return 0.5
  return 1.0
}

/**
 * Calculate total party strength accounting for valid members and stamina.
 */
export function calculatePartyStrength(party: Party): number {
  let totalStrength = 0
  
  party.members.forEach(member => {
    if (member.valid) {
      // Apply stamina modifier to member's contribution
      totalStrength += member.strength * getStaminaModifier(member.stamina)
    }
  })
  
  return totalStrength
}

/**
 * Count the number of valid (active) members in the party.
 */
export function countValidMembers(party: Party): number {
  return party.members.filter(member => member.valid).length
}

/**
 * Calculate gold generation for a party in an area.
 * Gold Generation: area.giveGold * strength_multiplier * Math.max(strong_member_num, 1)
 */
export function calculateGoldGeneration(party: Party, area: Area): number {
  // Get total party strength
  const totalStrength = calculatePartyStrength(party)
  
  // Get strength multiplier
  const strengthMultiplier = calculateStrengthMultiplier(totalStrength, area.base)
  
  // Count strong members
  const strongMembers = countStrongMembers(party.members, area.base)
  
  // Calculate gold generation using the formula from original game
  const goldGeneration = area.giveGold * strengthMultiplier * Math.max(strongMembers, 1)
  
  return Math.floor(goldGeneration)
}

/**
 * Distribute experience among valid members of a party.
 * Follows original game logic to distribute remainder.
 * Returns an array of { memberId, expGain } objects.
 */
export function distributeExperience(party: Party, totalExp: number): Array<{ memberId: string, expGain: number }> {
  const validMembers = party.members.filter(member => member.valid)
  const validMemberCount = validMembers.length
  
  if (validMemberCount === 0) return []
  
  // Calculate base exp per member (integer division)
  const baseExpPerMember = Math.floor(totalExp / validMemberCount)
  
  // Calculate remainder to distribute
  let remainder = totalExp % validMemberCount
  
  // Distribute experience
  return validMembers.map(member => {
    let expGain = baseExpPerMember
    
    // Distribute remainder one by one
    if (remainder > 0) {
      expGain++
      remainder--
    }
    
    return { memberId: member.id, expGain }
  })
}

/**
 * Calculate experience generation for a party in an area.
 * Exp Generation: area.giveExp * strength_multiplier
 */
export function calculateExpGeneration(party: Party, area: Area): number {
  // Get total party strength
  const totalStrength = calculatePartyStrength(party)
  
  // Get strength multiplier
  const strengthMultiplier = calculateStrengthMultiplier(totalStrength, area.base)
  
  // Calculate total experience generation
  const expGeneration = area.giveExp * strengthMultiplier
  
  return Math.floor(expGeneration)
}

/**
 * Determine if an item drops based on area's drop table.
 * Returns an array of item IDs that dropped.
 */
export function calculateItemDrops(area: Area): number[] {
  const drops: number[] = []
  
  area.giveItem.forEach(dropEntry => {
    // Random check for each possible drop
    if (Math.random() < dropEntry.probability) {
      drops.push(dropEntry.itemId)
    }
  })
  
  return drops
}

/**
 * Calculate resources generated for a party in its current area.
 * Returns null if party is moving or area not found.
 */
export function calculateResourceGeneration(party: Party): {
  gold: number,
  exp: number,
  expDistribution: Array<{ memberId: string, expGain: number }>,
  itemDrops: number[]
} | null {
  // If party is moving, no resources are generated
  if (party.location.moving) {
    return null
  }
  
  // Get current area
  const area = getAreaById(party.location.areaId)
  if (!area) {
    return null
  }
  
  // Calculate gold generation
  const goldGeneration = calculateGoldGeneration(party, area)
  
  // Calculate exp generation and distribution
  const totalExp = calculateExpGeneration(party, area)
  const expDistribution = distributeExperience(party, totalExp)
  
  // Calculate item drops
  const itemDrops = calculateItemDrops(area)
  
  return {
    gold: goldGeneration,
    exp: totalExp,
    expDistribution,
    itemDrops
  }
}

/**
 * Calculate offline progression rewards based on time away.
 * - Caps at 60 minutes as per original game
 * - Creates a treasure with value of approximately 2 hours of resource generation
 *   for every hour away (implementation detail from original)
 */
export function calculateOfflineProgression(
  parties: Party[],
  minutesAway: number
): {
  treasureValue: number,
  timeToAdd: number
} {
  // Cap at 60 minutes as per original
  const cappedMinutes = Math.min(minutesAway, 60)
  
  // Only calculate rewards if away more than 5 minutes (as per original)
  if (cappedMinutes <= 5) {
    return { treasureValue: 0, timeToAdd: 0 }
  }
  
  // Calculate hourly gold generation for all parties
  let hourlyGoldGeneration = 0
  
  parties.forEach(party => {
    // Skip if party is moving
    if (party.location.moving) return
    
    // Get current area
    const area = getAreaById(party.location.areaId)
    if (!area) return
    
    // Calculate gold per second for this party
    const goldPerSecond = calculateGoldGeneration(party, area)
    
    // Add to hourly total (gold per second * 3600 seconds in an hour)
    hourlyGoldGeneration += goldPerSecond * 3600
  })
  
  // Calculate treasure value: hourly rate * time away * 2 (as per original)
  // The factor of 2 is an implementation detail from the original game
  const treasureValue = Math.floor(hourlyGoldGeneration * (cappedMinutes / 60) * 2)
  
  // Add time to game counter (60 min per hour away, as per original)
  const timeToAdd = Math.floor(60 * cappedMinutes)
  
  return {
    treasureValue,
    timeToAdd
  }
}