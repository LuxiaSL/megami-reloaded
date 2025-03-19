import { describe, it, expect } from 'vitest'
import { formatNumber } from './formatters'

describe('formatNumber', () => {
  it('should format numbers less than 1000 without unit suffixes', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(9)).toBe('9')
    expect(formatNumber(42)).toBe('42')
    expect(formatNumber(999)).toBe('999')
  })
  
  it('should format numbers with appropriate precision', () => {
    expect(formatNumber(1.5)).toBe('1.5')
    expect(formatNumber(9.99)).toBe('9.99')
    expect(formatNumber(10.99)).toBe('11')
    expect(formatNumber(99.5)).toBe('99.5')
    expect(formatNumber(100.5)).toBe('101')
  })
  
  it('should format thousands with k suffix', () => {
    expect(formatNumber(1000)).toBe('1k')
    expect(formatNumber(1500)).toBe('1.5k')
    expect(formatNumber(9999)).toBe('10k')
    expect(formatNumber(10000)).toBe('10k')
    expect(formatNumber(999999)).toBe('1000k')
  })
  
  it('should format millions with m suffix', () => {
    expect(formatNumber(1000000)).toBe('1m')
    expect(formatNumber(1500000)).toBe('1.5m')
    expect(formatNumber(999999999)).toBe('1000m')
  })
  
  it('should format billions with g suffix', () => {
    expect(formatNumber(1000000000)).toBe('1g')
    expect(formatNumber(1500000000)).toBe('1.5g')
  })
  
  it('should format trillions with t suffix', () => {
    expect(formatNumber(1000000000000)).toBe('1t')
    expect(formatNumber(1500000000000)).toBe('1.5t')
  })
  
  it('should handle very large numbers', () => {
    expect(formatNumber(1e15)).toBe('1p')
    expect(formatNumber(1.5e15)).toBe('1.5p')
  })
  
  it('should format numbers without units when units=false', () => {
    expect(formatNumber(1000, false)).toBe('1,000')
    expect(formatNumber(1000000, false)).toBe('1,000,000')
  })
  
  it('should remove trailing zeros from decimal numbers', () => {
    expect(formatNumber(1.50)).toBe('1.5')
    expect(formatNumber(1.00)).toBe('1')
    expect(formatNumber(10.0)).toBe('10')
  })
})