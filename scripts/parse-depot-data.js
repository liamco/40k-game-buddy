/**
 * Parse Depot Data Script
 * 
 * Processes JSON files in the depotdata directory, converting string values to numbers,
 * transforming data formats, and extracting effects from ability descriptions.
 * 
 * Usage:
 *   npm run parse-depot-data
 * 
 * For AI-based effects extraction, use the separate script:
 *   npm run extract-effects
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
  
    // Strip all apostrophes (straight ', curly ', and other quotation mark variants) and convert to lowercase for matching
    // Matches: U+0027 (APOSTROPHE), U+2018 (LEFT SINGLE QUOTATION MARK), U+2019 (RIGHT SINGLE QUOTATION MARK)
    const normalizedKey = turnKey.toLowerCase().replace(/[''\u2018\u2019]/g, '');
  
    // Map each turn string to uppercase GameTurn value
    // Use lowercase keys without apostrophes to handle case-insensitive matching and apostrophe variations
    const turnMap = {
      "your turn": 'YOURS',
      "opponents turn": 'OPPONENTS',
      "either players turn": 'EITHER'
    };

    // Return mapped value if found, otherwise return original value
    return turnMap[normalizedKey] || value;
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
    const normalized = value.trim().toLowerCase();
        
    // Split on " or " to handle multiple phases
    const phases = normalized.split(/\s+or\s+/i);
    
    // Map each phase to uppercase GamePhase value
    const phaseMap = {
      'any phase': 'ANY',
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
 * Recursively processes a JSON object to convert string numbers
 * Ignores 'id' properties to preserve them as strings
 */

const ignoredProperties = ['id','factionId','datasheetId','sourceId'];

async function processObject(obj) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => processObject(item)));
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
        } else if ((key === 'abilities' || key === 'enhancements' || key === 'stratagems' || key === 'detachmentAbilities') && Array.isArray(obj[key])) {
          // Special handling for abilities, enhancements, stratagems, and detachmentAbilities arrays
          // Process each item and add effects if found
          const itemType = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
          console.log(`\n📋 Processing ${obj[key].length} ${itemType.toLowerCase()}...`);
          
          processed[key] = await Promise.all(obj[key].map(async (item, index) => {
            const processedItem = await processObject(item);
            return processedItem;
          }));
        } else if (key === 'm') {
          // Special handling for movement property - convert "7\"" to 7
          processed[key] = convertMovementValue(obj[key]);
        } else if (key === 'invSv') {
          // Special handling for invSv property - convert "-" to null
          processed[key] = obj[key] === '-' ? null : await processObject(obj[key]);
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
            processed[key] = await processObject(obj[key]);
          }
        } else if (key === 'phase') {
          // Special handling for phase property in stratagem objects
          // Check if this object looks like a stratagem (has cpCost and phase properties)
          const isStratagem = obj.hasOwnProperty('cpCost') && obj.hasOwnProperty('phase');
          if (isStratagem && typeof obj[key] === 'string') {
            processed[key] = convertPhaseValue(obj[key]);
          } else {
            processed[key] = await processObject(obj[key]);
          }
        } else if (key === 'turn') {
          // Special handling for turn property in stratagem objects
          // Check if this object looks like a stratagem (has cpCost and phase properties)
          const isStratagem = obj.hasOwnProperty('cpCost') && obj.hasOwnProperty('phase');
          if (isStratagem && typeof obj[key] === 'string') {
            processed[key] = convertTurnValue(obj[key]);
          } else {
            processed[key] = await processObject(obj[key]);
          }
        } else {
          processed[key] = await processObject(obj[key]);
        }
      }
    }
    
    return processed;
  } else {
    return convertValue(obj);
  }
}

/**
 * Checks if a file path is a unit datasheet file (not a faction file)
 * Datasheet files are in the datasheets subdirectory
 * Faction files are named "faction.json" in the faction root directory
 * @param {string} filePath - Full path to the file
 * @param {string} depotdataPath - Base path to depotdata directory
 * @returns {boolean} - True if file is a datasheet file
 */
function isDatasheetFile(filePath, depotdataPath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedDepotPath = depotdataPath.replace(/\\/g, '/');
  const relativePath = normalizedPath.replace(normalizedDepotPath + '/', '');
  
  // Check if the file is in a datasheets subdirectory
  // Path structure: factions/{faction-name}/datasheets/{id}.json
  const pathParts = relativePath.split('/');
  
  // Check if path contains "datasheets" directory
  if (pathParts.includes('datasheets')) {
    return true;
  }
  
  // Faction files are named "faction.json" and are in the faction root
  // Path structure: factions/{faction-name}/faction.json
  if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'faction.json') {
    return false;
  }
  
  // Default: if it's not clearly a faction file, assume it's a datasheet
  // (though this shouldn't happen with the current structure)
  return false;
}

/**
 * Removes stratagems property from a datasheet object
 * @param {object} obj - The object to process
 * @returns {object} - The object with stratagems removed
 */
function removeStratagemsFromDatasheet(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const cleaned = { ...obj };
    if (cleaned.hasOwnProperty('stratagems')) {
      delete cleaned.stratagems;
    }
    return cleaned;
  }
  return obj;
}

/**
 * Removes detachmentAbilities property from a datasheet object
 * @param {object} obj - The object to process
 * @returns {object} - The object with detachmentAbilities removed
 */
function removeDetachmentAbilitiesFromDatasheet(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const cleaned = { ...obj };
    if (cleaned.hasOwnProperty('detachmentAbilities')) {
      delete cleaned.detachmentAbilities;
    }
    return cleaned;
  }
  return obj;
}

/**
 * Removes enhancements property from a datasheet object
 * @param {object} obj - The object to process
 * @returns {object} - The object with enhancements removed
 */
function removeEnhancementsFromDatasheet(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const cleaned = { ...obj };
    if (cleaned.hasOwnProperty('enhancements')) {
      delete cleaned.enhancements;
    }
    return cleaned;
  }
  return obj;
}

/**
 * Processes a single JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {string} depotdataPath - Base path to depotdata directory
 */
async function processJsonFile(filePath, depotdataPath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Process the data
    let processedData = await processObject(data);
    
    // Remove stratagems, detachmentAbilities, and enhancements from datasheet files (but keep them in faction files)
    const isDatasheet = isDatasheetFile(filePath, depotdataPath);
    if (isDatasheet) {
      processedData = removeStratagemsFromDatasheet(processedData);
      processedData = removeDetachmentAbilitiesFromDatasheet(processedData);
      processedData = removeEnhancementsFromDatasheet(processedData);
    }
    
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
async function main() {
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
  
  console.log(`📁 Found ${jsonFiles.length} JSON files to process...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let fileIndex = 0;
  
  for (const jsonFile of jsonFiles) {
    fileIndex++;
    const relativePath = path.relative(depotdataPath, jsonFile);
    
    console.log(`[${fileIndex}/${jsonFiles.length}] Processing: ${relativePath}`);
    
    if (await processJsonFile(jsonFile, depotdataPath)) {
      successCount++;
      console.log(`✅ Completed: ${relativePath}\n`);
    } else {
      errorCount++;
      console.log(`❌ Failed: ${relativePath}\n`);
    }
  }
  
  console.log('═'.repeat(50));
  console.log(`📊 Processing Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📄 Total: ${jsonFiles.length}`);
  console.log('═'.repeat(50));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

