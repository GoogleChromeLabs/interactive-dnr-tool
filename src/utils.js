// Checks validity of URLFilter string
export function isValidURLFilter(urlFilterString) {
  // Ensure only valid constructs are present
  const validConstructs = /^[*|^a-zA-Z0-9_\-.%?/;=@&:]+$/
  if (!validConstructs.test(urlFilterString)) {
    return false // Invalid constructs present
  }
  // Check for ASCII characters
  for (let i = 0; i < urlFilterString.length; i++) {
    if (urlFilterString.charCodeAt(i) > 127) {
      return false // Non-ASCII character found
    }
  }
  if (urlFilterString.startsWith('||*')) {
    return false // Cannot start with ||* - use only * at the beginning for the intended effect.
  }
  if (urlFilterString.includes('|') && !urlFilterString.includes('||')) {
    if (!urlFilterString.startsWith('|') && !urlFilterString.endsWith('|')) {
      return false // Cannot start or end without |.
    }
    if (urlFilterString.length === 1) {
      return false // Cannot have only |.
    }
  }
  if (urlFilterString.includes('||')) {
    if (!urlFilterString.startsWith('||')) {
      return false // Cannot have || in the middle.
    }
    if (urlFilterString.length === 2) {
      return false // Cannot have only ||.
    }
    if (urlFilterString.slice(2).includes('|') && !urlFilterString.endsWith('|')) {
      return false // Cannot have | in the middle.
    }
  }
  if (urlFilterString.slice(1, -1).includes('|') && urlFilterString.slice(0, 2) !== '||') {
    return false // Cannot have | in the middle.
  }
  return true
}
