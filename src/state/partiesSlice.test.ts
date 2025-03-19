import { describe, it, expect, vi } from 'vitest'
import partiesReducer, {
  initializeParties,
  addMember,
  summonMember,
  addMemberExp,
  updateMemberDistribution,
  increaseAttribute,
  fuseMember,
  Member
} from './partiesSlice'
import { v4 as uuidv4 } from 'uuid'

// Import mocked modules
import { updateMemberStats } from '../utils/characterProgressionCalculator'

// Mock member creation function
vi.mock('../data/memberData', () => ({
  createMember: (type: string): Member => ({
    id: uuidv4(),
    type: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    imgUrl: `${type}.png`,
    rare: type === 'megami' ? 3 : 1,
    level: 1,
    exp: 1,
    nextLevel: 7,
    baseStrength: 0,
    ratioSpeed: 0.3,
    ratioMagic: 0.3,
    attrStrength: 1.0,
    attrSpeed: 1.0,
    attrMagic: 1.0,
    strength: 0,
    speed: 0,
    magic: 0,
    stamina: 100,
    levelIndex: 0.4,
    valid: true,
    equipment: null,
    aStrength: 0,
    aSpeed: 0,
    aMagic: 0,
    mStrength: 1,
    mSpeed: 1,
    mMagic: 1
  }),
  getMemberGoldValue: () => 500,
  summonMember: (rank: number) => ({
    id: uuidv4(),
    type: 'summoned',
    name: 'Summoned',
    imgUrl: 'summoned.png',
    rare: rank,
    level: 1,
    exp: 1,
    nextLevel: 7,
    baseStrength: 0,
    ratioSpeed: 0.3,
    ratioMagic: 0.3,
    attrStrength: 1.0,
    attrSpeed: 1.0,
    attrMagic: 1.0,
    strength: 0,
    speed: 0,
    magic: 0,
    stamina: 100,
    levelIndex: 0.4,
    valid: true,
    equipment: null,
    aStrength: 0,
    aSpeed: 0,
    aMagic: 0,
    mStrength: 1,
    mSpeed: 1,
    mMagic: 1
  })
}))


// Mock character progression calculator
vi.mock('../utils/characterProgressionCalculator', () => ({
  updateMemberStats: vi.fn((member: Member) => {
    // Mock implementation for testing
    member.level = 2
    member.baseStrength = 3
    member.strength = 2
    member.speed = 1
    member.magic = 1
    member.nextLevel = 7
  }),
  calculateFusionResult: (baseMember: Member, sacrificeMember: Member) => {
    // Simple mock implementation for testing
    const result = JSON.parse(JSON.stringify(baseMember))
    result.attrStrength = 1.1
    result.attrSpeed = 1.1
    result.attrMagic = 1.1
    result.level = 3
    result.baseStrength = 5
    result.strength = 3
    result.speed = 1
    result.magic = 1
    
    return result
  }
}))

describe('parties reducer', () => {
  // Initial state setup
  const initialState = {
    parties: [],
    foundMembers: {},
    summonHistory: {
      totalSummons: 0,
      rankSummonCounts: [0, 0, 0, 0]
    },
    fusionHistory: {
      totalFusions: 0,
      highestLevel: 1
    }
  }
  
  it('should handle initialization', () => {
    const state = partiesReducer(initialState, initializeParties({}))
    
    expect(state.parties.length).toBe(1)
    expect(state.parties[0].members.length).toBe(1)
    expect(state.parties[0].members[0].type).toBe('megami')
    expect(state.foundMembers.megami).toBe(true)
  })
  
  it('should handle adding a member', () => {
    const state = partiesReducer(initialState, initializeParties({}))
    
    const newMember: Member = {
      id: uuidv4(),
      type: 'test',
      name: 'Test Member',
      imgUrl: 'test.png',
      rare: 1,
      level: 1,
      exp: 1,
      nextLevel: 0,
      baseStrength: 0,
      ratioSpeed: 0.3,
      ratioMagic: 0.3,
      attrStrength: 1.0,
      attrSpeed: 1.0,
      attrMagic: 1.0,
      strength: 0,
      speed: 0,
      magic: 0,
      stamina: 100,
      levelIndex: 0.4,
      valid: true,
      equipment: null,
      aStrength: 0,
      aSpeed: 0,
      aMagic: 0,
      mStrength: 1,
      mSpeed: 1,
      mMagic: 1
    }
    
    const newState = partiesReducer(state, addMember({ partyId: 0, member: newMember }))
    
    expect(newState.parties[0].members.length).toBe(2)
    expect(newState.parties[0].members[1].type).toBe('test')
    expect(newState.foundMembers.test).toBe(true)
  })
  
  it('should handle summoning a member', () => {
    const state = partiesReducer(initialState, initializeParties({}))
    
    const newState = partiesReducer(state, summonMember({ partyId: 0, memberType: 'testMember' }))
    
    expect(newState.parties[0].members.length).toBe(2)
    expect(newState.foundMembers.testMember).toBe(true)
    expect(newState.summonHistory.totalSummons).toBe(1)
  })
  
  it('should handle adding experience to a member', () => {
    const state = partiesReducer(initialState, initializeParties({}))
    const memberId = state.parties[0].members[0].id
    
    const newState = partiesReducer(state, addMemberExp({ partyId: 0, memberId, amount: 31 }))
    
    // Check that exp was added
    expect(newState.parties[0].members[0].exp).toBe(32) // 1 + 31
    
    // Check that stats were updated with mocked values
    expect(newState.parties[0].members[0].level).toBe(2)
    expect(newState.parties[0].members[0].baseStrength).toBe(3)
  })
  
  it('should handle updating member power distribution', () => {
    const state = partiesReducer(initialState, initializeParties({}))
    const memberId = state.parties[0].members[0].id
    
    // Change to strength focus (10% speed, 10% magic)
    const newState = partiesReducer(
      state, 
      updateMemberDistribution({ partyId: 0, memberId, ratioSpeed: 0.1, ratioMagic: 0.1 })
    )
    
    const member = newState.parties[0].members[0]
    
    // Check that ratios were updated
    expect(member.ratioSpeed).toBe(0.1)
    expect(member.ratioMagic).toBe(0.1)
    
    // With mock implementation, stats are fixed values
    expect(member.strength).toBe(2)
    expect(member.speed).toBe(1)
    expect(member.magic).toBe(1)
  })
  
  it('should handle increasing member attributes', () => {
    const state = partiesReducer(initialState, initializeParties({}))
    const memberId = state.parties[0].members[0].id
    
    // Create a modified mock implementation for this test
    vi.mocked(updateMemberStats).mockImplementationOnce((member: Member) => {
      member.level = 2
      member.baseStrength = 3
      member.strength = 3 // Higher strength for attribute increase test
      member.speed = 1
      member.magic = 1
      member.nextLevel = 7
    })
    
    // Increase strength attribute by 0.2
    const newState = partiesReducer(
      state, 
      increaseAttribute({ partyId: 0, memberId, attribute: 'attrStrength', amount: 0.2 })
    )
    
    const member = newState.parties[0].members[0]
    
    // Check that attribute was increased
    expect(member.attrStrength).toBe(1.2)
    
    // Check that stats were updated per our mock
    expect(member.strength).toBe(3)
  })
  
  it('should handle fusing members', () => {
    // Create a state with two members
    let state = partiesReducer(initialState, initializeParties({}))
    
    const newMember: Member = {
      id: uuidv4(),
      type: 'test',
      name: 'Test Member',
      imgUrl: 'test.png',
      rare: 1,
      level: 1,
      exp: 1,
      nextLevel: 0,
      baseStrength: 0,
      ratioSpeed: 0.3,
      ratioMagic: 0.3,
      attrStrength: 1.0,
      attrSpeed: 1.0,
      attrMagic: 1.0,
      strength: 0,
      speed: 0,
      magic: 0,
      stamina: 100,
      levelIndex: 0.4,
      valid: true,
      equipment: null,
      aStrength: 0,
      aSpeed: 0,
      aMagic: 0,
      mStrength: 1,
      mSpeed: 1,
      mMagic: 1
    }
    
    // Add a third member to avoid "last members" check
    const extraMember = { ...newMember, id: uuidv4() }
    
    state = partiesReducer(state, addMember({ partyId: 0, member: newMember }))
    state = partiesReducer(state, addMember({ partyId: 0, member: extraMember }))
    
    // Fuse the first two members
    const baseMemberId = state.parties[0].members[0].id
    const sacrificeMemberId = state.parties[0].members[1].id
    
    const newState = partiesReducer(
      state, 
      fuseMember({ partyId: 0, baseMemberId, sacrificeMemberId })
    )
    
    // Check that sacrifice member was removed
    expect(newState.parties[0].members.length).toBe(2)
    expect(newState.parties[0].members.find(m => m.id === sacrificeMemberId)).toBeUndefined()
    
    // Check that fusion history was updated
    expect(newState.fusionHistory.totalFusions).toBe(1)
  })
})