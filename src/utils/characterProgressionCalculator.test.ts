import { describe, it, expect } from 'vitest'
import {
  calculateLevelFromExp,
  calculateExpForNextLevel,
  calculateBaseStrength,
  calculateDerivedStats,
  calculatePartyCombatEffectiveness,
  getStaminaModifier,
  updateMemberStats,
  calculateFusionResult
} from './characterProgressionCalculator'
import { Member } from '../state/partiesSlice'

describe('Character Progression Calculator', () => {
  
  describe('calculateLevelFromExp', () => {
    it('calculates correct level from experience', () => {
      // Test with levelIndex = 0.4
      expect(calculateLevelFromExp(1, 0.4)).toBe(1)
      expect(calculateLevelFromExp(32, 0.4)).toBe(4)
      expect(calculateLevelFromExp(1000, 0.4)).toBe(10)
      expect(calculateLevelFromExp(100000, 0.4)).toBe(31)
      
      // Test with different levelIndex values
      expect(calculateLevelFromExp(100, 0.35)).toBe(5)
      expect(calculateLevelFromExp(100, 0.42)).toBe(6)
    })
  })
  
  describe('calculateExpForNextLevel', () => {
    it('calculates correct exp required for next level', () => {
      // Test with levelIndex = 0.4
      expect(calculateExpForNextLevel(1, 0.4)).toBe(7) // From level 1 to 2
      expect(calculateExpForNextLevel(4, 0.4)).toBe(33) // From level 4 to 5
      expect(calculateExpForNextLevel(10, 0.4)).toBe(1001) // From level 10 to 11
      
      // Test with different levelIndex values
      expect(calculateExpForNextLevel(5, 0.35)).toBe(101) // From level 5 to 6 with 0.35 index
      expect(calculateExpForNextLevel(6, 0.42)).toBe(106) // From level 6 to 7 with 0.42 index
    })
  })
  
  describe('calculateBaseStrength', () => {
    it('calculates correct base strength from level', () => {
      expect(calculateBaseStrength(1)).toBe(1) // Level 1
      expect(calculateBaseStrength(2)).toBe(3) // Level 2 = 2*2*0.5+1 = 3
      expect(calculateBaseStrength(5)).toBe(13) // Level 5 = 5*5*0.5+1 = 13
      expect(calculateBaseStrength(10)).toBe(51) // Level 10 = 10*10*0.5+1 = 51
      expect(calculateBaseStrength(100)).toBe(5001) // Level 100 = 100*100*0.5+1 = 5001
    })
  })
  
  describe('calculateDerivedStats', () => {
    it('calculates correct derived stats with balanced distribution', () => {
      // Base strength 50, even 1/3 distribution, neutral attributes
      const stats = calculateDerivedStats(50, 0.33, 0.33, 1.0, 1.0, 1.0)
      
      // Approximations due to floating point math and rounding
      expect(stats.strength).toBe(17) // ~(50 * 0.34 * 1.0)
      expect(stats.speed).toBe(16) // ~(50 * 0.33 * 1.0)
      expect(stats.magic).toBe(16) // ~(50 * 0.33 * 1.0)
    })
    
    it('calculates correct derived stats with strength focus', () => {
      // Base strength 50, strength focus, neutral attributes
      const stats = calculateDerivedStats(50, 0.1, 0.1, 1.0, 1.0, 1.0)
      
      expect(stats.strength).toBe(40) // 50 * 0.8 * 1.0
      expect(stats.speed).toBe(5) // 50 * 0.1 * 1.0
      expect(stats.magic).toBe(5) // 50 * 0.1 * 1.0
    })
    
    it('applies attribute multipliers correctly', () => {
      // Base strength 50, even distribution, varied attributes
      const stats = calculateDerivedStats(50, 0.33, 0.33, 1.2, 0.8, 1.5)
      
      expect(stats.strength).toBe(20) // ~(50 * 0.34 * 1.2)
      expect(stats.speed).toBe(13) // ~(50 * 0.33 * 0.8)
      expect(stats.magic).toBe(24) // ~(50 * 0.33 * 1.5)
    })
    
    it('handles extreme distribution values', () => {
      // Base strength 50, all speed, neutral attributes
      const stats = calculateDerivedStats(50, 1.0, 0.0, 1.0, 1.0, 1.0)
      
      expect(stats.strength).toBe(0) // 50 * 0 * 1.0
      expect(stats.speed).toBe(50) // 50 * 1.0 * 1.0
      expect(stats.magic).toBe(0) // 50 * 0 * 1.0
    })
    
    it('applies stat modifiers correctly', () => {
      // Test multiplicative modifiers
      const statsWithMult = calculateDerivedStats(
        50, 0.33, 0.33, 1.0, 1.0, 1.0, 1.5, 1.2, 1.0
      )
      
      expect(statsWithMult.strength).toBe(25) // ~(50 * 0.34 * 1.0 * 1.5)
      expect(statsWithMult.speed).toBe(19) // ~(50 * 0.33 * 1.0 * 1.2)
      expect(statsWithMult.magic).toBe(16) // ~(50 * 0.33 * 1.0 * 1.0)
      
      // Test additive modifiers
      const statsWithAdd = calculateDerivedStats(
        50, 0.33, 0.33, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 10, 5, 15
      )
      
      expect(statsWithAdd.strength).toBe(27) // ~(50 * 0.34 * 1.0) + 10
      expect(statsWithAdd.speed).toBe(21) // ~(50 * 0.33 * 1.0) + 5
      expect(statsWithAdd.magic).toBe(31) // ~(50 * 0.33 * 1.0) + 15
    })
  })
  
  describe('calculatePartyCombatEffectiveness', () => {
    it('calculates correct party effectiveness with one member', () => {
      const members: Member[] = [
        createTestMember({
          strength: 100,
          speed: 50,
          magic: 25,
          valid: true,
          stamina: 100
        })
      ]
      
      const effectiveness = calculatePartyCombatEffectiveness(members)
      
      expect(effectiveness.strength).toBe(100)
      expect(effectiveness.speed).toBe(50)
      expect(effectiveness.magic).toBe(25)
      // (100 * 1.0) + (50 * 0.8) + (25 * 0.6) = 100 + 40 + 15 = 155
      expect(effectiveness.effectiveTotal).toBe(155)
    })
    
    it('ignores invalid members', () => {
      const members: Member[] = [
        createTestMember({
          strength: 100,
          speed: 50,
          magic: 25,
          valid: true,
          stamina: 100
        }),
        createTestMember({
          strength: 200,
          speed: 100,
          magic: 50,
          valid: false, // Inactive member
          stamina: 100
        })
      ]
      
      const effectiveness = calculatePartyCombatEffectiveness(members)
      
      expect(effectiveness.strength).toBe(100)
      expect(effectiveness.speed).toBe(50)
      expect(effectiveness.magic).toBe(25)
      expect(effectiveness.effectiveTotal).toBe(155)
    })
    
    it('applies stamina modifiers correctly', () => {
      const members: Member[] = [
        createTestMember({
          strength: 100,
          speed: 50,
          magic: 25,
          valid: true,
          stamina: 40 // 50% effectiveness
        }),
        createTestMember({
          strength: 100,
          speed: 50,
          magic: 25,
          valid: true,
          stamina: 20 // 25% effectiveness
        })
      ]
      
      const effectiveness = calculatePartyCombatEffectiveness(members)
      
      // First member: 50% of stats
      // Second member: 25% of stats
      expect(effectiveness.strength).toBe(50 + 25)
      expect(effectiveness.speed).toBe(25 + 12.5)
      expect(effectiveness.magic).toBe(12.5 + 6.25)
      
      // (75 * 1.0) + (37.5 * 0.8) + (18.75 * 0.6) = 75 + 30 + 11.25 = 116.25
      expect(Math.round(effectiveness.effectiveTotal)).toBe(116)
    })
  })
  
  describe('getStaminaModifier', () => {
    it('returns correct stamina modifiers', () => {
      expect(getStaminaModifier(0)).toBe(0) // 0% effectiveness
      expect(getStaminaModifier(10)).toBe(0.25) // 25% effectiveness
      expect(getStaminaModifier(25)).toBe(0.25) // 25% effectiveness
      expect(getStaminaModifier(26)).toBe(0.5) // 50% effectiveness
      expect(getStaminaModifier(50)).toBe(0.5) // 50% effectiveness
      expect(getStaminaModifier(51)).toBe(1.0) // 100% effectiveness
      expect(getStaminaModifier(75)).toBe(1.0) // 100% effectiveness
      expect(getStaminaModifier(100)).toBe(1.0) // 100% effectiveness
    })
  })
  
  describe('updateMemberStats', () => {
    it('updates all member stats correctly', () => {
      const member = createTestMember({
        exp: 32,
        levelIndex: 0.4,
        ratioSpeed: 0.3,
        ratioMagic: 0.2,
        attrStrength: 1.2,
        attrSpeed: 0.9,
        attrMagic: 1.5,
        mStrength: 1,
        mSpeed: 1,
        mMagic: 1,
        aStrength: 0,
        aSpeed: 0,
        aMagic: 0
      })
      
      updateMemberStats(member)
      
      // Level = 32^0.4 = 4
      expect(member.level).toBe(4)
      
      // Base strength = 4*4*0.5+1 = 9
      expect(member.baseStrength).toBe(9)
      
      // Strength = 9 * 0.5 * 1.2 = 5.4 => 5
      expect(member.strength).toBe(5)
      
      // Speed = 9 * 0.3 * 0.9 = 2.43 => 2
      expect(member.speed).toBe(2)
      
      // Magic = 9 * 0.2 * 1.5 = 2.7 => 2
      expect(member.magic).toBe(2)
      
      // Next level exp = 5^(1/0.4) + 1 = 33
      expect(member.nextLevel).toBe(33)
    })
  })
  
  describe('calculateFusionResult', () => {
    it('combines experience for low level sacrifice', () => {
      const baseMember = createTestMember({
        exp: 100,
        levelIndex: 0.4,
        level: 6,
        attrStrength: 1.0,
        attrSpeed: 1.0,
        attrMagic: 1.0
      })
      
      const sacrificeMember = createTestMember({
        exp: 50,
        level: 5, // Below 500, so exp is combined
        attrStrength: 1.2,
        attrSpeed: 0.9,
        attrMagic: 1.1
      })
      
      const result = calculateFusionResult(baseMember, sacrificeMember)
      
      // Experience combined
      expect(result.exp).toBe(150)
      
      // No attribute changes for low level sacrifice
      expect(result.attrStrength).toBe(1.0)
      expect(result.attrSpeed).toBe(1.0)
      expect(result.attrMagic).toBe(1.0)
    })
    
    it('enhances attributes for high level sacrifice', () => {
      const baseMember = createTestMember({
        exp: 10000,
        levelIndex: 0.4,
        level: 10,
        attrStrength: 1.0,
        attrSpeed: 1.0,
        attrMagic: 1.0
      })
      
      const sacrificeMember = createTestMember({
        exp: 100000000,
        level: 1000, // High level sacrifice gives attribute bonus
        attrStrength: 1.2,
        attrSpeed: 0.9,
        attrMagic: 1.1
      })
      
      const result = calculateFusionResult(baseMember, sacrificeMember)
      
      // Experience unchanged for high level sacrifice
      expect(result.exp).toBe(10000)
      
      // Attributes enhanced (10% bonus) - expect some values due to rounding
      expect(result.attrStrength).toBeCloseTo(1.12, 2) // 1.0 * (1 + 1.2 * 0.1)
      expect(result.attrSpeed).toBeCloseTo(1.09, 2) // 1.0 * (1 + 0.9 * 0.1)
      expect(result.attrMagic).toBeCloseTo(1.11, 2) // 1.0 * (1 + 1.1 * 0.1)
    })
  })
})

// Helper function to create test members
function createTestMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'test-id',
    type: 'test-type',
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
    mMagic: 1,
    ...overrides
  }
}