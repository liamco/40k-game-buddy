import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts a string value to a number if it's numeric or ends with "+"
 * Examples:
 * - "5" -> 5
 * - "5+" -> 5
 * - "-3" -> -3
 * - "-3+" -> -3
 * - "abc" -> "abc" (unchanged)
 */
function convertValue(value) {
  if (typeof value === 'string') {
    // Handle strings with plus sign at the end (e.g., "5+", "3+")
    if (value.endsWith('+') && value.length > 1) {
      const numPart = value.slice(0, -1).trim();
      // Check if the part before "+" is a number
      if (/^-?\d+$/.test(numPart)) {
        return parseInt(numPart, 10);
      }
    }
    
    // Handle pure numeric strings (integers)
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
  }
  
  return value;
}

/**
 * Converts movement ("m") property from string with quote to number
 * Examples:
 * - "7\"" -> 7
 * - "8\"" -> 8
 * - "6\"" -> 6
 */
function convertMovementValue(value) {
  if (typeof value === 'string') {
    // Remove quote character and extract number
    // Handles formats like "7\"", "8\"", etc.
    const match = value.match(/^(-?\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return value;
}

/**
 * Converts wargear description strings to arrays of uppercase strings
 * Examples:
 * - "assault, heavy" -> ["ASSAULT", "HEAVY"]
 * - "pistol" -> ["PISTOL"]
 * - "ignores cover, pistol, torrent" -> ["IGNORES COVER", "PISTOL", "TORRENT"]
 * - "" -> []
 */
function convertWargearDescription(value) {
  if (typeof value === 'string') {
    // If empty string, return empty array
    if (value.trim() === '') {
      return [];
    }
    // Split by comma, trim each part, convert to uppercase, and filter out empty strings
    return value
      .split(',')
      .map(item => item.trim().toUpperCase())
      .filter(item => item.length > 0);
  }
  return value;
}

/**
 * Converts turn strings to standarised uppercased strings inline with typescript enum values
 * Examples:
 * - "Your turn" -> "YOURS"  
 * - "Opponent's turn" -> "OPPONENTS"
 * - "Either player's turn" -> "EITHER"
 * - Already converted values ("YOURS", "OPPONENTS", "EITHER") are returned as-is
 */
function convertTurnValue(value) {
  if (typeof value === 'string') {
    const turnKey = value.trim();
  
    // If already in the correct format, return as-is
    const validValues = ['YOURS', 'OPPONENTS', 'EITHER'];
    if (validValues.includes(turnKey)) {
      return turnKey;
    }
  
    // Map each turn string to uppercase GameTurn value
    const turnMap = {
      'Your turn': 'YOURS',
      "Opponent's turn": 'OPPONENTS',
      "Either player's turn": 'EITHER'
    };

    // Return mapped value if found, otherwise return original value
    return turnMap[turnKey] || value;
  }
  return value;
}

/**
 * Converts phase strings to arrays of GamePhase values or "ANY"
 * Examples:
 * - "Fight phase" -> ["FIGHT"]
 * - "Shooting phase" -> ["SHOOTING"]
 * - "Any phase" -> ["ANY"]
 * - "Movement or Charge phase" -> ["MOVEMENT", "CHARGE"]
 * - "Shooting or Fight phase" -> ["SHOOTING", "FIGHT"]
 */
function convertPhaseValue(value) {
  if (typeof value === 'string') {
    const normalized = value.trim();
    
    // Handle "Any phase" specially
    if (normalized.toLowerCase() === 'any phase') {
      return ['ANY'];
    }
    
    // Split on " or " to handle multiple phases
    const phases = normalized.split(/\s+or\s+/i);
    
    // Map each phase to uppercase GamePhase value
    const phaseMap = {
      'command': 'COMMAND',
      'movement': 'MOVEMENT',
      'shooting': 'SHOOTING',
      'charge': 'CHARGE',
      'fight': 'FIGHT'
    };
    
    return phases
      .map(phase => {
        // Remove " phase" suffix and convert to lowercase for mapping
        const phaseKey = phase.replace(/\s+phase$/i, '').trim().toLowerCase();
        return phaseMap[phaseKey] || phase.toUpperCase();
      })
      .filter(phase => phase.length > 0);
  }
  return value;
}

/**
 * Extracts effects from a single ability description
 * Looks for effect names in various HTML patterns:
 * 1. <p class="impact18">Effect Name</p> - Common pattern for listed effects
 * 2. <b>Effect Name:</b> - Bold text followed by colon (effect names in lists)
 * Returns an array of effect names, or null if no effects found
 * Examples:
 * - Extracts "Tactical Doctrine", "Assault Doctrine", "Devastator Doctrine" from Combat Doctrines ability
 * - Extracts "Eliminate At All Costs", "Acquire At All Costs" from Imperialis Fleet ability
 * - Extracts "Sanguinary Grace", "Carmine Wrath", "Their Appointed Hour" from Angelic Inheritors ability
 */
function extractAbilityEffects(description) {
  if (!description || typeof description !== 'string') {
    return null;
  }

  const effects = [];
  
  // Pattern 1: Extract text from <p class="impact18">Effect Name</p> tags
  // This is the most common pattern for listed effects/options
  const impact18Pattern = /<p[^>]*class="impact18"[^>]*>([^<]+)<\/p>/gi;
  const impact18Matches = [...description.matchAll(impact18Pattern)];
  
  if (impact18Matches && impact18Matches.length > 0) {
    impact18Matches.forEach(match => {
      if (match[1]) {
        const effectName = match[1].trim();
        // Convert to uppercase and add to effects
        effects.push(effectName.toUpperCase());
      }
    });
  }
  
  // Pattern 2: Extract text from <b>Effect Name:</b> patterns
  // These are effect names in bold followed by a colon
  // Only extract if it's not a stratagem keyword (WHEN, TARGET, EFFECT, RESTRICTIONS)
  const boldPattern = /<b>([^<]+):<\/b>/gi;
  const boldMatches = [...description.matchAll(boldPattern)];
  
  if (boldMatches && boldMatches.length > 0) {
    const stratagemKeywords = ['WHEN', 'TARGET', 'EFFECT', 'RESTRICTIONS', 'DESIGNER\'S NOTE'];
    
    boldMatches.forEach(match => {
      if (match[1]) {
        const effectName = match[1].trim();
        const upperName = effectName.toUpperCase();
        
        // Skip if it's a stratagem keyword
        if (!stratagemKeywords.includes(upperName)) {
          effects.push(upperName);
        }
      }
    });
  }
  
  // Remove duplicates
  const uniqueEffects = [...new Set(effects)];
  
  // Define preferred order for specific effects (like doctrines)
  const preferredOrder = ['TACTICAL DOCTRINE', 'ASSAULT DOCTRINE', 'DEVASTATOR DOCTRINE'];
  
  // Sort effects according to preferred order, then alphabetically for others
  const sortedEffects = uniqueEffects.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    
    // If both are in the preferred order, sort by their index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only one is in the preferred order, it comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // Otherwise, sort alphabetically
    return a.localeCompare(b);
  });
  
  if (sortedEffects.length > 0) {
    return sortedEffects;
  }
  
  return null;
}

/**
 * Recursively processes a JSON object to convert string numbers
 * Ignores 'id' properties to preserve them as strings
 */

const ignoredProperties = ['id','factionId','datasheetId','sourceId'];

function processObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => processObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    // Check if this is a detachment object
    // Detachments have slug, name, and typically have abilities, enhancements, and/or stratagems
    const isDetachment = obj.hasOwnProperty('slug') && 
                        obj.hasOwnProperty('name') && 
                        (obj.hasOwnProperty('abilities') || obj.hasOwnProperty('enhancements') || obj.hasOwnProperty('stratagems'));
    
    const processed = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip conversion for 'id' properties - keep them as strings
        if (ignoredProperties.includes(key)) {
          processed[key] = obj[key];
        } else if (key === 'effects' && isDetachment) {
          // Skip effects at detachment level - they should be in ability objects instead
          continue;
        } else if (key === 'abilities' && isDetachment && Array.isArray(obj[key])) {
          // Special handling for abilities array in detachments
          // Process each ability and add effects if found
          processed[key] = obj[key].map(ability => {
            const processedAbility = processObject(ability);
            // Extract effects from the ability description
            if (processedAbility.description) {
              const effects = extractAbilityEffects(processedAbility.description);
              if (effects) {
                processedAbility.effects = effects;
              }
            }
            return processedAbility;
          });
        } else if (key === 'm') {
          // Special handling for movement property - convert "7\"" to 7
          processed[key] = convertMovementValue(obj[key]);
        } else if (key === 'invSv') {
          // Special handling for invSv property - convert "-" to null
          processed[key] = obj[key] === '-' ? null : processObject(obj[key]);
        } else if (key === 'description') {
          // Special handling for description property in wargear profiles
          // Check if this object looks like a wargear profile (has range, type, a, bsWs, s, ap, d properties)
          const isWargearProfile = obj.hasOwnProperty('range') && 
                                   obj.hasOwnProperty('type') && 
                                   (obj.hasOwnProperty('a') || obj.hasOwnProperty('bsWs'));
          if (isWargearProfile && typeof obj[key] === 'string') {
            // Rename 'description' to 'attributes' and convert to uppercase array
            processed['attributes'] = convertWargearDescription(obj[key]);
          } else {
            processed[key] = processObject(obj[key]);
          }
        } else if (key === 'phase') {
          // Special handling for phase property in stratagem objects
          // Check if this object looks like a stratagem (has cpCost and phase properties)
          const isStratagem = obj.hasOwnProperty('cpCost') && obj.hasOwnProperty('phase');
          if (isStratagem && typeof obj[key] === 'string') {
            processed[key] = convertPhaseValue(obj[key]);
          } else {
            processed[key] = processObject(obj[key]);
          }
        } else if (key === 'turn') {
          // Special handling for turn property in stratagem objects
          // Check if this object looks like a stratagem (has cpCost and phase properties)
          const isStratagem = obj.hasOwnProperty('cpCost') && obj.hasOwnProperty('turn');
          if (isStratagem && typeof obj[key] === 'string') {
            processed[key] = convertTurnValue(obj[key]);
          } else {
            processed[key] = processObject(obj[key]);
          }
        } else {
          processed[key] = processObject(obj[key]);
        }
      }
    }
    
    return processed;
  } else {
    return convertValue(obj);
  }
}

/**
 * Processes a single JSON file
 */
function processJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Process the data
    const processedData = processObject(data);
    
    // Write back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2), 'utf-8');
    
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function to process all JSON files in depotdata
 */
function main() {
  const depotdataPath = path.join(__dirname, '..', 'src', 'app', 'depotdata');
  
  if (!fs.existsSync(depotdataPath)) {
    console.error(`Error: ${depotdataPath} does not exist`);
    process.exit(1);
  }
  
  // Find all JSON files recursively
  const jsonFiles = [];
  
  function findJsonFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findJsonFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(fullPath);
      }
    }
  }
  
  findJsonFiles(depotdataPath);
  
  console.log(`Found ${jsonFiles.length} JSON files to process...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const jsonFile of jsonFiles) {
    if (processJsonFile(jsonFile)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`\nProcessing complete:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
}

// Run the script
main();

