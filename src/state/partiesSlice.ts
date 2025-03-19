import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateMemberStats as updateStats, calculateFusionResult } from '../utils/characterProgressionCalculator'
import { createMember, getMemberGoldValue } from '../data/memberData'

// Member Types
export interface MemberStats {
  strength: number
  speed: number
  magic: number
}

export interface MemberAttributes {
  attrStrength: number
  attrSpeed: number
  attrMagic: number
}

export interface MemberPowerDistribution {
  ratioSpeed: number
  ratioMagic: number
}

export interface MemberEquipment {
  weapon: string | null
  armor: string | null
  accessory: string | null
}

export interface Member {
  id: string
  type: string
  name: string
  imgUrl: string
  rare: number
  level: number
  exp: number
  nextLevel: number
  baseStrength: number
  
  // Power distribution
  ratioSpeed: number
  ratioMagic: number
  
  // Attribute multipliers
  attrStrength: number
  attrSpeed: number
  attrMagic: number
  
  // Derived stats
  strength: number
  speed: number
  magic: number
  
  stamina: number
  levelIndex: number
  valid: boolean
  equipment: string | null
  
  // Temporary stat modifiers
  aStrength: number
  aSpeed: number
  aMagic: number
  mStrength: number
  mSpeed: number
  mMagic: number
}

export interface PartyLocation {
  areaId: number
  targetAreaId: number
  moving: boolean
  position: { x: number, y: number }
}

export interface Party {
  id: number
  groupName: string
  members: Member[]
  items: string[]
  location: PartyLocation
}

interface PartiesState {
  parties: Party[]
  foundMembers: Record<string, boolean>
  // Track summoning data
  summonHistory: {
    totalSummons: number
    rankSummonCounts: number[]
  }
  // Track fusion data
  fusionHistory: {
    totalFusions: number
    highestLevel: number
  }
}

const initialState: PartiesState = {
  parties: [
    {
      id: 0,
      groupName: 'Party 1',
      members: [],
      items: [],
      location: {
        areaId: 16, // Idavoll Plain (starting area)
        targetAreaId: 16,
        moving: false,
        position: { x: 1750, y: 4500 }
      }
    }
  ],
  foundMembers: {},
  summonHistory: {
    totalSummons: 0,
    rankSummonCounts: [0, 0, 0, 0] // Counts for each rank 0-3
  },
  fusionHistory: {
    totalFusions: 0,
    highestLevel: 1
  }
}

// Create a default starter party with Megami
const createInitialParty = (): Party => {
  // Create Megami using the member data system
  const starterMember = createMember('megami')
  
  if (!starterMember) {
    throw new Error("Failed to create starter member 'megami'")
  }
  
  // Initialize stats
  updateStats(starterMember)
  
  return {
    id: 0,
    groupName: 'Party 1',
    members: [starterMember],
    items: [],
    location: {
      areaId: 16, // Idavoll Plain (starting area)
      targetAreaId: 16,
      moving: false,
      position: { x: 1750, y: 4500 }
    }
  }
}

export const partiesSlice = createSlice({
  name: 'parties',
  initialState,
  reducers: {
    initializeParties: (state, action: PayloadAction<Record<string, never>>) => {
      // If no parties exist, create initial party
      if (state.parties.length === 0) {
        state.parties = [createInitialParty()]
      }
      
      // Initialize found members with Megami
      state.foundMembers = { megami: true }
      
      // Calculate stats for all members
      state.parties.forEach(party => {
        party.members.forEach(member => {
          updateMemberStats(member)
        })
      })
    },
    
    addMember: (state, action: PayloadAction<{ partyId: number, member: Member }>) => {
      const { partyId, member } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        // Update member stats before adding
        updateMemberStats(member)
        party.members.push(member)
        
        // Add to found members list
        state.foundMembers[member.type] = true
      }
    },
    
    summonMember: (state, action: PayloadAction<{ partyId: number, memberType: string }>) => {
      const { partyId, memberType } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        // Create a new member from the member data
        const newMember = createMember(memberType)
        
        if (newMember) {
          // Update member stats
          updateMemberStats(newMember)
          
          // Add to party
          party.members.push(newMember)
          
          // Add to found members list
          state.foundMembers[memberType] = true
          
          // Update summoning history
          state.summonHistory.totalSummons++
          state.summonHistory.rankSummonCounts[newMember.rare]++
        }
      }
    },
    
    removeMember: (state, action: PayloadAction<{ partyId: number, memberId: string }>) => {
      const { partyId, memberId } = action.payload
      const partyIndex = state.parties.findIndex(p => p.id === partyId)
      
      if (partyIndex >= 0) {
        const memberIndex = state.parties[partyIndex].members.findIndex(m => m.id === memberId)
        
        if (memberIndex >= 0) {
          // Check if member has equipment
          if (state.parties[partyIndex].members[memberIndex].equipment !== null) {
            return // Cannot remove member with equipment
          }
          
          // Check if this is the last member
          if (state.parties[partyIndex].members.length <= 1) {
            return // Cannot remove last member
          }
          
          // Remove member
          state.parties[partyIndex].members.splice(memberIndex, 1)
        }
      }
    },
    
    dismissMember: (state, action: PayloadAction<{ partyId: number, memberId: string }>) => {
      const { partyId, memberId } = action.payload
      const partyIndex = state.parties.findIndex(p => p.id === partyId)
      
      if (partyIndex >= 0) {
        const memberIndex = state.parties[partyIndex].members.findIndex(m => m.id === memberId)
        
        if (memberIndex >= 0) {
          const member = state.parties[partyIndex].members[memberIndex]
          
          // Check if member has equipment
          if (member.equipment !== null) {
            return
          }
          
          // Check if this is the last member
          if (state.parties[partyIndex].members.length <= 1) {
            return
          }
          
          // Calculate gold reward
          const goldReward = getMemberGoldValue(member)
          
          // Remove member
          state.parties[partyIndex].members.splice(memberIndex, 1)
          
          // Add gold in gameSlice - we'll handle this via middleware
        }
      }
    },
    
    toggleMemberValid: (state, action: PayloadAction<{ partyId: number, memberId: string }>) => {
      const { partyId, memberId } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        const member = party.members.find(m => m.id === memberId)
        if (member) {
          member.valid = !member.valid
        }
      }
    },
    
    addMemberExp: (state, action: PayloadAction<{ partyId: number, memberId: string, amount: number }>) => {
      const { partyId, memberId, amount } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        const member = party.members.find(m => m.id === memberId)
        if (member) {
          member.exp += amount
          updateMemberStats(member)
          
          // Track highest level for achievements
          if (member.level > state.fusionHistory.highestLevel) {
            state.fusionHistory.highestLevel = member.level
          }
        }
      }
    },
    
    moveTo: (state, action: PayloadAction<{ partyId: number, areaId: number, position: { x: number, y: number } }>) => {
      const { partyId, areaId } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        party.location.targetAreaId = areaId
        party.location.moving = true
        // Position will be updated each tick until destination is reached
      }
    },
    
    updatePartyPosition: (state, action: PayloadAction<{ partyId: number, position: { x: number, y: number } }>) => {
      const { partyId, position } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        party.location.position = position
      }
    },
    
    setPartyLocation: (state, action: PayloadAction<{ partyId: number, areaId: number, position: { x: number, y: number } }>) => {
      const { partyId, areaId, position } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        party.location.areaId = areaId
        party.location.targetAreaId = areaId
        party.location.moving = false
        party.location.position = position
      }
    },
    
    addMemberStamina: (state, action: PayloadAction<{ partyId: number, memberId: string, amount: number }>) => {
      const { partyId, memberId, amount } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        const member = party.members.find(m => m.id === memberId)
        if (member) {
          member.stamina = Math.max(0, Math.min(100, member.stamina + amount))
        }
      }
    },
    
    setAllMemberStamina: (state, action: PayloadAction<{ partyId: number, amount: number }>) => {
      const { partyId, amount } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        // Set stamina for all members
        party.members.forEach(member => {
          member.stamina = Math.max(0, Math.min(100, amount))
        })
      }
    },
    
    updateMemberDistribution: (state, action: PayloadAction<{ partyId: number, memberId: string, ratioSpeed: number, ratioMagic: number }>) => {
      const { partyId, memberId, ratioSpeed, ratioMagic } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        const member = party.members.find(m => m.id === memberId)
        if (member && ratioSpeed + ratioMagic <= 1.0) {
          member.ratioSpeed = ratioSpeed
          member.ratioMagic = ratioMagic
          updateMemberStats(member)
        }
      }
    },
    
    increaseAttribute: (state, action: PayloadAction<{ partyId: number, memberId: string, attribute: 'attrStrength' | 'attrSpeed' | 'attrMagic', amount: number }>) => {
      const { partyId, memberId, attribute, amount } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        const member = party.members.find(m => m.id === memberId)
        if (member) {
          // @ts-ignore
          member[attribute] += amount
          // Round to 2 decimal places to prevent floating point issues
          member[attribute] = Math.round(member[attribute] * 100) / 100
          updateMemberStats(member)
        }
      }
    },
    
    fuseMember: (state, action: PayloadAction<{ partyId: number, baseMemberId: string, sacrificeMemberId: string }>) => {
      const { partyId, baseMemberId, sacrificeMemberId } = action.payload
      const partyIndex = state.parties.findIndex(p => p.id === partyId)
      
      if (partyIndex >= 0) {
        const party = state.parties[partyIndex]
        const baseIndex = party.members.findIndex(m => m.id === baseMemberId)
        const sacrificeIndex = party.members.findIndex(m => m.id === sacrificeMemberId)
        
        if (baseIndex >= 0 && sacrificeIndex >= 0) {
          const baseMember = party.members[baseIndex]
          const sacrificeMember = party.members[sacrificeIndex]
          
          // Check if either member has equipment
          if (baseMember.equipment !== null || sacrificeMember.equipment !== null) {
            return
          }
          
          // Check if this would leave the party empty
          if (party.members.length <= 2) {
            return
          }
          
          // Calculate fusion result
          const fusionResult = calculateFusionResult(baseMember, sacrificeMember)
          
          // Remove the sacrificed member
          state.parties[partyIndex].members.splice(sacrificeIndex, 1)
          
          // Update base member with fusion result
          state.parties[partyIndex].members[baseIndex] = fusionResult
          
          // Update fusion history
          state.fusionHistory.totalFusions++
          if (fusionResult.level > state.fusionHistory.highestLevel) {
            state.fusionHistory.highestLevel = fusionResult.level
          }
        }
      }
    },
    
    createParty: (state) => {
      // Check if max parties reached (3 is the max in original game)
      if (state.parties.length >= 3) {
        return
      }
      
      // Create a new party with default values
      const newParty: Party = {
        id: state.parties.length,
        groupName: `Party ${state.parties.length + 1}`,
        members: [],
        items: [],
        location: {
          areaId: 16, // Idavoll Plain (starting area)
          targetAreaId: 16,
          moving: false,
          position: { x: 1750, y: 4500 }
        }
      }
      
      state.parties.push(newParty)
    },
    
    renameParty: (state, action: PayloadAction<{ partyId: number, name: string }>) => {
      const { partyId, name } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        party.groupName = name
      }
    },
    
    renameMember: (state, action: PayloadAction<{ partyId: number, memberId: string, name: string }>) => {
      const { partyId, memberId, name } = action.payload
      const party = state.parties.find(p => p.id === partyId)
      
      if (party) {
        const member = party.members.find(m => m.id === memberId)
        if (member) {
          member.name = name
        }
      }
    }
  }
})

// Use imported utility function instead of local implementation
function updateMemberStats(member: Member) {
  // Delegate to the utility function
  updateStats(member)
}

export const {
  initializeParties,
  addMember,
  summonMember,
  removeMember,
  dismissMember,
  toggleMemberValid,
  addMemberExp,
  moveTo,
  updatePartyPosition,
  setPartyLocation,
  addMemberStamina,
  setAllMemberStamina,
  updateMemberDistribution,
  increaseAttribute,
  fuseMember,
  createParty,
  renameParty,
  renameMember
} = partiesSlice.actions

export default partiesSlice.reducer