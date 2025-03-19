/**
 * Format a number with commas and optional unit prefixes.
 * @param value The number to format
 * @param units Whether to use unit prefixes (k, m, g, etc.)
 * @returns The formatted number as a string
 */
export function formatNumber(value: number, units = true): string {
  if (!units) {
    // Format with commas only
    return value.toLocaleString()
  }
  
  // Format with unit prefixes
  const unitPrefixes = ['', 'k', 'm', 'g', 't', 'p']
  let unitIndex = 0
  let scaledValue = value
  
  // Scale the value down until it's less than 1000
  while (scaledValue >= 1000 && unitIndex < unitPrefixes.length - 1) {
    scaledValue /= 1000
    unitIndex++
  }
  
  // Format with appropriate precision
  let formattedValue: string
  if (scaledValue < 10) {
    formattedValue = scaledValue.toFixed(2)
  } else if (scaledValue < 100) {
    formattedValue = scaledValue.toFixed(1)
  } else {
    // Round to next integer for large numbers like 999.9 -> 1000
    formattedValue = Math.round(scaledValue).toString()
  }
  
  // Remove trailing zeros after decimal point
  formattedValue = formattedValue.replace(/\.0+$/, '')
  
  // Also remove trailing zero after non-zero decimal (1.50 -> 1.5)
  formattedValue = formattedValue.replace(/(\.\d+)0+$/, '$1')
  
  // Add the unit prefix
  return `${formattedValue}${unitPrefixes[unitIndex]}`
}