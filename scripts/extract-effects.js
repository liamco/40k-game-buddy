/**
 * Extract Effects Script - OpenAI Version
 * 
 * Uses OpenAI API to extract structured effects from Warhammer 40k game rule descriptions.
 * Processes all depotdata JSON files to extract effects from:
 * - Detachment abilities (in faction.json files)
 * - Enhancements (in faction.json files)
 * - Stratagems (in faction.json files and core-stratagems.json)
 * - Unit abilities (in datasheet JSON files)
 * 
 * Usage:
 *   1. Set OPENAI_API_KEY in your .env file
 *   2. Optionally set OPENAI_MODEL (defaults to "gpt-4o-mini")
 *   3. Optionally set SKIP_EXISTING_EFFECTS (defaults to "true")
 * 
 *   Process all files:
 *     npm run extract-effects:openai
 * 
 *   Process specific files (for testing):
 *     npm run extract-effects:openai "factions/tyranids/faction.json" "factions/space-marines/datasheets/000000060.json"
 * 
 *   Or use environment variable:
 *     FILES_TO_PROCESS='["factions/tyranids/faction.json"]' npm run extract-effects:openai
 *     FILES_TO_PROCESS="factions/tyranids/faction.json,factions/space-marines/faction.json" npm run extract-effects:openai
 * 
 *   For single description test:
 *     npm run extract-effects:openai "<description>" [itemName]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

/**
 * Extracts structured effects from a Warhammer 40k game rule description using OpenAI
 * @param {string} description - The description text to analyze
 * @param {string} itemName - Optional name/identifier of the item being processed (for logging)
 * @returns {Promise<Array|null>} - Array of structured effects or null
 */
export async function extractStructuredEffectsWithOpenAI(description, itemName = 'Unknown') {
  if (!description || typeof description !== 'string') {
    return null;
  }

  // Remove HTML tags for cleaner analysis
  const cleanDescription = description
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanDescription) {
    return null;
  }

  // OpenAI configuration
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.error(`[OpenAI] ❌ OPENAI_API_KEY not found in environment variables`);
    console.error(`[OpenAI]    Please set OPENAI_API_KEY in your .env file or as an environment variable`);
    return null;
  }

  // Truncate description for logging (first 100 chars)
  const descriptionPreview = cleanDescription.length > 100 
    ? cleanDescription.substring(0, 100) + '...' 
    : cleanDescription;
  
  console.log(`\n[OpenAI] Analyzing: ${itemName}`);
  console.log(`[OpenAI] Description: ${descriptionPreview}`);

  const startTime = Date.now();

  // Prompt from scratch.tsx
  const prompt = `Analyze the following Warhammer 40k game rule description and extract structured mechanics in JSON format.

Description: "${cleanDescription}"

Extract all mechanics including dice roll modifiers (hit, wound, save, damage, AP), defensive abilities (Feel No Pain, invulnerable saves), keyword additions, and ability additions. Return them as a JSON array following this exact structure:

"mechanics": [ {
  entity:<what does this mechanic target>,
  effect:<what does this mechanic do>,
  attribute?: <any base attributes this mechanic can modify>,
  abilities?: <any abilities this mechanic can add>,
  keywords?: <any keywords this mechanic can add>,
  state?: <information about the state of the entity>,
  value: <a boolean, number, or string value>,
  conditions: [
    {
      entity:<what entity does this condition rely on>,
      attribute?: <any base attributes this condition needs to check>,
      abilities?: <any abilities this condition needs to check>,
      state?: <any states this condition needs to check>,
      keywords?: <any keywords this condition needs to check>,
      operator: <how to compare the value to the condition>,
      value: <can be a boolean, number, or string>,
    }
  ]
} ]

Rules:

- "entity" must be one of:
  * "thisArmy" - the unit/model's army
  * "thisUnit" - the unit/model itself
  * "thisModel" - this specific model
  * "opponentArmy" - the opponent's army
  * "opposingUnit" - A unit from the opponent's army
  * "opposingModel" - A model from the opponent's army

- "effect" must match the type:
  * "rollBonus" - adds a value to a dice roll
  * "rollPenalty" - subtracts a value from a dice roll
  * "staticNumber" - sets a static number for a roll or a damage value
  * "addsKeyword" - adds a keyword to the entity
  * "addsAbility" - adds an ability to the entity
  
- "attribute" must be one of:
  * "h" - modifies Hit rolls
  * "w" - modifies Wound rolls
  * "s" - modifies Save rolls
  * "d" - modifies a damage value
  * "ap" - modifies an Armour Penetration characteristic
  * "inRangeOfAnyObjective" - is the entity in range of any objective, regardless of whether it is friendly, enemy, or contested
  * "inRangeOfFriendlyObjective" - is the entity in range of a friendly objective
  * "inRangeOfEnemyObjective" - is the entity in range of an enemy objective
  * "inRangeOfContestedObjective" - is the entity in range of a contested objective
  * "inEngagementRange" - is the entity in engagement range
  * "isBattleShocked" - is the entity battle-shocked
  * "hasKeyword" - is the entity having a specific keyword

- "keywords" is optional - only include if the mechanic adds a keyword to the entity
- "keywords" should be an array of strings

- "abilities" is optional - only include if the mechanic adds an ability to the entity
- "abilities" should be an array of strings

- "state" is optional - only include if the mechanic adds a state to the entity
- "state" should be an array of strings

- "value" should usually be an integer (even if it's negative), but can be a string e.g. "D3", "SUSTAINED HITS 1"

- "conditions" is optional - only include if the mechanic needs specific conditions to trigger (e.g., "if target is battle-shocked", "while leading a unit")
- Condition entities, attributes, and values are the same as the entity, attribute, and value for the main mechanic.

- "conditions.operator" should be one of: "equals", "notEquals", "greaterThan", "greaterThanOrEqualTo", "lessThan", "lessThanOrEqualTo"

Special cases:
- Saving throw modifications: The higher the number, the worse the save. A roll bonus should be a negative number and a roll penalty should be a positive number.
- When adding an ability which carries a number e.g. "SUSTAINED HITS 1" or "FEEL NO PAIN 5+", the value should be the number as an integer.

Examples:
- "this model gets +1 to Hit rolls" → {entity:"thisModel", effect:"rollBonus", attribute:"h", value:1}
- "this model gets a 5+ Feel No Pain" → {entity:"thisModel", effect:"addsAbility", abilities:"FEEL NO PAIN", value:5}
- "this model gets a 4+ invulnerable save" → {entity:"thisModel", effect:"staticNumber", attributes:"invSv", value:4}
- "+1 to Wound if target is battle-shocked" → {entity:"thisModel", "effect":"rollBonus", "attribute":"w"  "value":1, "conditions": [{"entity": "targetUnit", "attribute": "battleShock", "value": true}]}
- "gains the INFANTRY keyword" → {entity:"thisModel", "effect": "addsKeyword", "keywords": ["INFANTRY"]}
- "has the Deep Strike ability" → {entity:"thisModel", "effect": "addsAbility", "abilities": ["DEEP STRIKE"]}
- "While this model is leading a unit, add 1 to Hit rolls" → {entity:"thisUnit", "effect": "rollBonus", "attribute":"h", "value":1, "conditions":[{"entity":"thisUnit", "state":"hasLeader", "value": true}]}

If no mechanics are found, return: {"mechanics": []}`;

  const fullPrompt = `You are a helpful assistant that extracts structured game rule effects from Warhammer 40k descriptions. Always return valid JSON only.\n\n${prompt}`;

  try {
    console.log(`[OpenAI] Calling OpenAI API (${model})...`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!content) {
      console.log(`[OpenAI] ⚠️  No content in response (${elapsed}s)`);
      return null;
    }

    // Parse JSON response
    let jsonContent = content;
    // Handle markdown code blocks if present (though response_format: json_object should prevent this)
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonContent);
    
    if (parsed.mechanics && Array.isArray(parsed.mechanics) && parsed.mechanics.length > 0) {
      console.log(`[OpenAI] ✅ Extracted ${parsed.mechanics.length} mechanic(s) (${elapsed}s)`);
      parsed.mechanics.forEach((mechanic, idx) => {
        const conditions = mechanic.conditions && mechanic.conditions.length > 0 
          ? ` [conditions: ${mechanic.conditions.length}]` 
          : '';
        
        // Build display string for the mechanic
        let displayParts = [];
        
        // Entity
        displayParts.push(`entity:${mechanic.entity}`);
        
        // Effect type
        displayParts.push(`effect:${mechanic.effect}`);
        
        // Attribute (if present)
        if (mechanic.attribute) {
          displayParts.push(`attribute:${mechanic.attribute}`);
        }
        
        // Format value display based on effect type
        if (mechanic.effect === 'addsKeyword' && mechanic.keywords && Array.isArray(mechanic.keywords)) {
          displayParts.push(`keywords:[${mechanic.keywords.join(', ')}]`);
        } else if (mechanic.effect === 'addsAbility' && mechanic.abilities && Array.isArray(mechanic.abilities)) {
          const abilitiesDisplay = mechanic.abilities.join(', ');
          if (mechanic.value !== undefined && mechanic.value !== null) {
            displayParts.push(`abilities:[${abilitiesDisplay}] value:${mechanic.value}`);
          } else {
            displayParts.push(`abilities:[${abilitiesDisplay}]`);
          }
        } else if (mechanic.effect === 'staticNumber') {
          displayParts.push(`value:${mechanic.value}+`);
        } else if (mechanic.effect === 'rollBonus') {
          displayParts.push(`value:+${mechanic.value}`);
        } else if (mechanic.effect === 'rollPenalty') {
          displayParts.push(`value:-${mechanic.value}`);
        } else if (mechanic.value !== undefined && mechanic.value !== null) {
          displayParts.push(`value:${mechanic.value}`);
        }
        
        // State (if present)
        if (mechanic.state && Array.isArray(mechanic.state) && mechanic.state.length > 0) {
          displayParts.push(`state:[${mechanic.state.join(', ')}]`);
        }
        
        console.log(`[OpenAI]   ${idx + 1}. ${displayParts.join(' ')}${conditions}`);
      });
      return parsed.mechanics;
    }

    console.log(`[OpenAI] ℹ️  No mechanics found (${elapsed}s)`);
    return null;

  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const errorMessage = error?.message || error?.toString() || String(error);
    
    console.error(`[OpenAI] ❌ Error extracting mechanics (${elapsed}s): ${errorMessage}`);
    
    if (errorMessage.includes('API key')) {
      console.error(`[OpenAI]    Check that OPENAI_API_KEY is set correctly in your .env file`);
    } else if (errorMessage.includes('rate limit')) {
      console.error(`[OpenAI]    Rate limit exceeded. Please wait before retrying.`);
    } else if (errorMessage.includes('insufficient_quota')) {
      console.error(`[OpenAI]    Insufficient quota. Check your OpenAI account billing.`);
    }
    
    return null;
  }
}

/**
 * Checks if an object should have effects extracted (has description)
 */
function shouldExtractMechanics(obj) {
  return obj && typeof obj === 'object' && obj.description && typeof obj.description === 'string';
}

/**
 * Recursively processes a JSON object to extract effects from abilities, enhancements, stratagems, and detachmentAbilities
 * @param {object} obj - The object to process
 * @param {boolean} skipExistingMechanics - Whether to skip items that already have effects
 * @returns {Promise<object>} - The processed object with effects added
 */
async function processObjectForEffects(obj, skipExistingMechanics = true) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => processObjectForEffects(item, skipExistingMechanics)));
  } else if (obj !== null && typeof obj === 'object') {
    const processed = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Special handling for abilities, enhancements, stratagems, and detachmentAbilities arrays
        if ((key === 'abilities' || key === 'enhancements' || key === 'stratagems' || key === 'detachmentAbilities') && Array.isArray(obj[key])) {
          const itemType = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
          console.log(`\n📋 Processing ${obj[key].length} ${itemType.toLowerCase()}...`);
          
          processed[key] = await Promise.all(obj[key].map(async (item, index) => {
            const itemName = item.name || item.id || `${itemType} ${index + 1}`;
            const processedItem = await processObjectForEffects(item, skipExistingMechanics);
            
            // Extract effects from the description
            if (processedItem.description) {
              // Skip if item already has effects and skipExistingMechanics is enabled
              const hasExistingEffects = processedItem.mechanics && Array.isArray(processedItem.mechanics) && processedItem.mechanics.length > 0;
              
              if (hasExistingEffects && skipExistingMechanics) {
                console.log(`[OpenAI] ⏭️  Skipping ${itemName} (already has ${processedItem.mechanics.length} effect(s))`);
              } else {
                // Extract structured effects with OpenAI
                const structuredEffects = await extractStructuredEffectsWithOpenAI(
                  processedItem.description, 
                  itemName
                );
                if (structuredEffects && structuredEffects.length > 0) {
                  processedItem.mechanics = structuredEffects;
                }
              }
            }
            return processedItem;
          }));
        } else {
          // Check if this object should have effects extracted
          if (shouldExtractMechanics(obj[key]) && typeof obj[key] === 'object') {
            processed[key] = await processObjectForEffects(obj[key], skipExistingMechanics);
            
            // Extract structured effects if this is a stratagem, ability, enhancement, or detachmentAbility
            if (obj[key].description) {
              // Check if we should skip items that already have effects
              const hasExistingEffects = processed[key].mechanics && Array.isArray(processed[key].mechanics) && processed[key].mechanics.length > 0;
              
              if (hasExistingEffects && skipExistingMechanics) {
                const itemName = obj[key].name || obj[key].id || 'Unknown item';
                console.log(`[OpenAI] ⏭️  Skipping ${itemName} (already has ${processed[key].mechanics.length} effect(s))`);
              } else if (!hasExistingEffects) {
                const itemName = obj[key].name || obj[key].id || 'Unknown item';
                const structuredEffects = await extractStructuredEffectsWithOpenAI(
                  obj[key].description, 
                  itemName
                );
                if (structuredEffects && structuredEffects.length > 0) {
                  processed[key].mechanics = structuredEffects;
                }
              }
            }
          } else {
            processed[key] = await processObjectForEffects(obj[key], skipExistingMechanics);
          }
        }
      }
    }
    
    return processed;
  } else {
    return obj;
  }
}

/**
 * Processes a single JSON file to extract effects
 * @param {string} filePath - Path to the JSON file
 * @param {boolean} skipExistingMechanics - Whether to skip items that already have effects
 */
async function processJsonFileForEffects(filePath, skipExistingMechanics) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Process the data
    const processedData = await processObjectForEffects(data, skipExistingMechanics);
    
    // Write back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2), 'utf-8');
    
    return { processed: true };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { processed: false, error: error.message };
  }
}

/**
 * Filters JSON files based on provided file paths or patterns
 * @param {string[]} allFiles - All found JSON files
 * @param {string[]} fileFilters - Array of file paths or patterns to match
 * @param {string} depotdataPath - Base path to depotdata directory
 * @returns {string[]} - Filtered array of file paths
 */
function filterFiles(allFiles, fileFilters, depotdataPath) {
  if (!fileFilters || fileFilters.length === 0) {
    return allFiles;
  }

  const normalizedDepotPath = depotdataPath.replace(/\\/g, '/');
  const filtered = [];

  for (const filePath of allFiles) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const relativePath = normalizedPath.replace(normalizedDepotPath + '/', '');

    // Check if this file matches any of the filters
    const matches = fileFilters.some(filter => {
      const normalizedFilter = filter.replace(/\\/g, '/');
      
      // Exact match (relative path)
      if (relativePath === normalizedFilter || relativePath.endsWith('/' + normalizedFilter)) {
        return true;
      }
      
      // Partial match (contains filter)
      if (relativePath.includes(normalizedFilter)) {
        return true;
      }
      
      // Absolute path match
      if (normalizedPath === normalizedFilter || normalizedPath.endsWith('/' + normalizedFilter)) {
        return true;
      }
      
      // Filename match
      const fileName = path.basename(normalizedPath);
      if (fileName === normalizedFilter || fileName === path.basename(normalizedFilter)) {
        return true;
      }
      
      return false;
    });

    if (matches) {
      filtered.push(filePath);
    }
  }

  return filtered;
}

/**
 * Main function to extract effects from all JSON files in depotdata
 * @param {string[]} fileFilters - Optional array of file paths/patterns to process (if empty, processes all)
 */
async function processAllFiles(fileFilters = []) {
  const depotdataPath = path.join(__dirname, '..', 'src', 'app', 'depotdata');
  
  if (!fs.existsSync(depotdataPath)) {
    console.error(`Error: ${depotdataPath} does not exist`);
    process.exit(1);
  }
  
  // Configuration
  const skipExistingMechanics = process.env.SKIP_EXISTING_EFFECTS !== 'false'; // Default to true
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.error('   Please set OPENAI_API_KEY in your .env file or as an environment variable');
    process.exit(1);
  }
  
  console.log('🤖 OpenAI Effects Extraction Script');
  console.log(`⏭️  Skip existing effects: ${skipExistingMechanics ? 'enabled' : 'disabled'}`);
  console.log(`🤖 OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  if (fileFilters.length > 0) {
    console.log(`📌 Filtering to ${fileFilters.length} file(s):`);
    fileFilters.forEach(filter => console.log(`   - ${filter}`));
  }
  console.log('');
  
  // Find all JSON files recursively
  const allJsonFiles = [];
  
  function findJsonFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findJsonFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        allJsonFiles.push(fullPath);
      }
    }
  }
  
  findJsonFiles(depotdataPath);
  
  // Filter files if filters provided
  const jsonFiles = filterFiles(allJsonFiles, fileFilters, depotdataPath);
  
  if (fileFilters.length > 0 && jsonFiles.length === 0) {
    console.error(`❌ No files found matching the provided filters`);
    console.error(`   Searched ${allJsonFiles.length} files`);
    process.exit(1);
  }
  
  console.log(`📁 Found ${jsonFiles.length} JSON file(s) to process (out of ${allJsonFiles.length} total)...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let fileIndex = 0;
  
  for (const jsonFile of jsonFiles) {
    fileIndex++;
    const relativePath = path.relative(depotdataPath, jsonFile);
    
    console.log(`[${fileIndex}/${jsonFiles.length}] Processing: ${relativePath}`);
    
    const result = await processJsonFileForEffects(jsonFile, skipExistingMechanics);
    
    if (result.processed) {
      successCount++;
      console.log(`✅ Completed: ${relativePath}\n`);
    } else {
      errorCount++;
      console.log(`❌ Failed: ${relativePath}${result.error ? ` (${result.error})` : ''}\n`);
    }
  }
  
  console.log('═'.repeat(50));
  console.log(`📊 Processing Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📄 Total: ${jsonFiles.length}`);
  console.log('═'.repeat(50));
}

/**
 * CLI interface for running the function directly
 */
async function main() {
  // Get arguments from command line
  const args = process.argv.slice(2);
  
  // Check for file filters in environment variable
  let fileFilters = [];
  if (process.env.FILES_TO_PROCESS) {
    try {
      // Try parsing as JSON array first
      fileFilters = JSON.parse(process.env.FILES_TO_PROCESS);
      if (!Array.isArray(fileFilters)) {
        fileFilters = [fileFilters];
      }
    } catch {
      // If not JSON, treat as comma-separated list
      fileFilters = process.env.FILES_TO_PROCESS.split(',').map(f => f.trim()).filter(f => f);
    }
  }
  
  // Check if first argument looks like a description (starts with quote or is a short string)
  // vs a file path (contains slashes or ends with .json)
  const firstArg = args[0];
  const looksLikeDescription = firstArg && (
    firstArg.startsWith('"') || 
    firstArg.startsWith("'") ||
    (!firstArg.includes('/') && !firstArg.includes('\\') && !firstArg.endsWith('.json') && firstArg.length < 200)
  );
  
  // If arguments provided and looks like description, run single description test
  if (args.length > 0 && looksLikeDescription) {
    const description = process.env.DESCRIPTION || args[0];
    const itemName = args[1] || 'CLI Test';

    if (!description) {
      console.error('❌ Error: No description provided');
      console.error('   Provide description as argument or set DESCRIPTION environment variable');
      process.exit(1);
    }

    console.log('🤖 OpenAI Effects Extraction (Single Test)');
    console.log('═'.repeat(50));
    
    const mechanics = await extractStructuredEffectsWithOpenAI(description, itemName);
    
    console.log('\n═'.repeat(50));
    
    if (mechanics && mechanics.length > 0) {
      console.log('\n📋 Final Result:');
      console.log(JSON.stringify({ mechanics }, null, 2));
      process.exit(0);
    } else {
      console.log('\n⚠️  No effects extracted');
      process.exit(0);
    }
  } else {
    // Treat arguments as file paths if provided
    if (args.length > 0) {
      fileFilters = [...fileFilters, ...args];
    }
    
    // Process files (all if no filters, filtered if filters provided)
    await processAllFiles(fileFilters);
  }
}

// Run if called directly (check if this file is being executed)
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('extract-effects.js') || 
  process.argv[1].replace(/\\/g, '/').endsWith('extract-effects.js')
);

if (isMainModule) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

