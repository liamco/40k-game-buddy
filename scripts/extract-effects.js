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
  const prompt = `Analyze the following Warhammer 40k game rule description and extract structured effects in JSON format.

Description: "${cleanDescription}"

Extract all effects including dice roll modifiers (hit, wound, save, damage, AP), defensive abilities (Feel No Pain, invulnerable saves), keyword additions, and ability additions. Return them as a JSON array following this exact format:

{
  "effects": [
    {
      "type": "hit|wound|save|feelNoPain|invSv|damage|ap|addsKeyword|addsAbility",
      "effect": "rollBonus|rollPenalty|staticNumber|addsKeyword|addsAbility",
      "value": <number|string>,
      "conditions": [
        {
          "entity": "target|attacker|unit|model|attack|friendlyObjective|enemyObjective|friendlyUnitWithKeyword|enemyUnitWithKeyword",
          "status": "<condition property name>",
          "value": <boolean|string|number>
        }
      ]
    }
  ]
}

Rules:
- "type" must be one of:
  * "hit" - modifies Hit rolls
  * "wound" - modifies Wound rolls
  * "save" - modifies Save rolls
  * "feelNoPain" - Feel No Pain ability (use staticNumber effect)
  * "invSv" - invulnerable save (use staticNumber effect)
  * "damage" - modifies Damage characteristic
  * "ap" - modifies Armour Penetration characteristic
  * "addsKeyword" - adds a keyword to the unit/model
  * "addsAbility" - grants an ability to the unit/model

- "effect" must match the type:
  * For roll modifiers (hit, wound, save, damage, ap): use "rollBonus" (+modifier) or "rollPenalty" (-modifier)
  * For static values (feelNoPain, invSv): use "staticNumber" (the threshold value, e.g., 5 for "5+")
  * For keyword additions: use "addsKeyword" and value should be the keyword name as a string
  * For ability additions: use "addsAbility" and value should be the ability name/ID as a string

- "value" format:
  * For rollBonus/rollPenalty: numeric modifier amount (always positive, effect indicates direction)
  * For staticNumber: the threshold value (e.g., 5 for "5+", 4 for "4+")
  * For addsKeyword: the keyword name as a string (e.g., "INFANTRY", "CHARACTER")
  * For addsAbility: the ability name or ID as a string

- "conditions" is optional - only include if the effect has specific conditions (e.g., "if target is battle-shocked", "while leading a unit")

- "conditions.subject" should be one of: "target", "attacker", "unit", "model", "attack", "friendlyObjective", "enemyObjective", "anyObjective",  "friendlyUnitWithKeyword", "enemyUnitWithKeyword"
- "conditions.property" should be one of: "leadingUnit", "battleShocked", "withinRangeOf", "damage", or a relevant keyword. If none of these are a suitable, a single word or phrase that describes the condition.
- "conditions.value" should be a boolean or number.

Special cases:
- AP modifications: use type "ap" with effect "rollBonus" (worsen AP = bonus to save) or "rollPenalty" (improve AP = penalty to save)
- Feel No Pain: type "feelNoPain", effect "staticNumber", value is the roll needed (e.g., 5+ = value 5)
- Invulnerable save: type "invSv", effect "staticNumber", value is the save value (e.g., 4+ = value 4)
- Battle-shocked condition: property "battle-shocked", subject "target", value true
- Leading a unit: property "leading", subject "unit", value true
- Objective you control: subject "friendlyObjective"

Examples:
- "+1 to Hit rolls" → {"type": "hit", "effect": "rollBonus", "value": 1}
- "5+ Feel No Pain" → {"type": "feelNoPain", "effect": "staticNumber", "value": 5}
- "4+ invulnerable save" → {"type": "invSv", "effect": "staticNumber", "value": 4}
- "+1 to Wound if target is battle-shocked" → {"type": "wound", "effect": "rollBonus", "value": 1, "conditions": [{"property": "battle-shocked", "subject": "target", "value": true}]}
- "gains the INFANTRY keyword" → {"type": "addsKeyword", "effect": "addsKeyword", "value": "INFANTRY"}
- "has the Deep Strike ability" → {"type": "addsAbility", "effect": "addsAbility", "value": "Deep Strike"}
- "While this model is leading a unit, add 1 to Hit rolls" → {"type": "hit", "effect": "rollBonus", "value": 1, "conditions": [{"property": "leading", "subject": "unit", "value": true}]}

If no effects are found, return: {"effects": []}`;

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
    
    if (parsed.effects && Array.isArray(parsed.effects) && parsed.effects.length > 0) {
      console.log(`[OpenAI] ✅ Extracted ${parsed.effects.length} effect(s) (${elapsed}s)`);
      parsed.effects.forEach((effect, idx) => {
        const conditions = effect.conditions && effect.conditions.length > 0 
          ? ` [conditions: ${effect.conditions.length}]` 
          : '';
        // Format value display based on effect type
        let valueDisplay = '';
        if (effect.effect === 'staticNumber') {
          valueDisplay = `${effect.value}+`;
        } else if (effect.effect === 'rollBonus') {
          valueDisplay = `+${effect.value}`;
        } else if (effect.effect === 'rollPenalty') {
          valueDisplay = `-${effect.value}`;
        } else if (effect.effect === 'addsKeyword' || effect.effect === 'addsAbility') {
          valueDisplay = `"${effect.value}"`;
        } else {
          valueDisplay = effect.value;
        }
        console.log(`[OpenAI]   ${idx + 1}. ${effect.type} ${effect.effect} ${valueDisplay}${conditions}`);
      });
      return parsed.effects;
    }

    console.log(`[OpenAI] ℹ️  No effects found (${elapsed}s)`);
    return null;

  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const errorMessage = error?.message || error?.toString() || String(error);
    
    console.error(`[OpenAI] ❌ Error extracting effects (${elapsed}s): ${errorMessage}`);
    
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
function shouldExtractEffects(obj) {
  return obj && typeof obj === 'object' && obj.description && typeof obj.description === 'string';
}

/**
 * Recursively processes a JSON object to extract effects from abilities, enhancements, stratagems, and detachmentAbilities
 * @param {object} obj - The object to process
 * @param {boolean} skipExistingEffects - Whether to skip items that already have effects
 * @returns {Promise<object>} - The processed object with effects added
 */
async function processObjectForEffects(obj, skipExistingEffects = true) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => processObjectForEffects(item, skipExistingEffects)));
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
            const processedItem = await processObjectForEffects(item, skipExistingEffects);
            
            // Extract effects from the description
            if (processedItem.description) {
              // Skip if item already has effects and skipExistingEffects is enabled
              const hasExistingEffects = processedItem.effects && Array.isArray(processedItem.effects) && processedItem.effects.length > 0;
              
              if (hasExistingEffects && skipExistingEffects) {
                console.log(`[OpenAI] ⏭️  Skipping ${itemName} (already has ${processedItem.effects.length} effect(s))`);
              } else {
                // Extract structured effects with OpenAI
                const structuredEffects = await extractStructuredEffectsWithOpenAI(
                  processedItem.description, 
                  itemName
                );
                if (structuredEffects && structuredEffects.length > 0) {
                  processedItem.effects = structuredEffects;
                }
              }
            }
            return processedItem;
          }));
        } else {
          // Check if this object should have effects extracted
          if (shouldExtractEffects(obj[key]) && typeof obj[key] === 'object') {
            processed[key] = await processObjectForEffects(obj[key], skipExistingEffects);
            
            // Extract structured effects if this is a stratagem, ability, enhancement, or detachmentAbility
            if (obj[key].description) {
              // Check if we should skip items that already have effects
              const hasExistingEffects = processed[key].effects && Array.isArray(processed[key].effects) && processed[key].effects.length > 0;
              
              if (hasExistingEffects && skipExistingEffects) {
                const itemName = obj[key].name || obj[key].id || 'Unknown item';
                console.log(`[OpenAI] ⏭️  Skipping ${itemName} (already has ${processed[key].effects.length} effect(s))`);
              } else if (!hasExistingEffects) {
                const itemName = obj[key].name || obj[key].id || 'Unknown item';
                const structuredEffects = await extractStructuredEffectsWithOpenAI(
                  obj[key].description, 
                  itemName
                );
                if (structuredEffects && structuredEffects.length > 0) {
                  processed[key].effects = structuredEffects;
                }
              }
            }
          } else {
            processed[key] = await processObjectForEffects(obj[key], skipExistingEffects);
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
 * @param {boolean} skipExistingEffects - Whether to skip items that already have effects
 */
async function processJsonFileForEffects(filePath, skipExistingEffects) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Process the data
    const processedData = await processObjectForEffects(data, skipExistingEffects);
    
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
  const skipExistingEffects = process.env.SKIP_EXISTING_EFFECTS !== 'false'; // Default to true
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.error('   Please set OPENAI_API_KEY in your .env file or as an environment variable');
    process.exit(1);
  }
  
  console.log('🤖 OpenAI Effects Extraction Script');
  console.log(`⏭️  Skip existing effects: ${skipExistingEffects ? 'enabled' : 'disabled'}`);
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
    
    const result = await processJsonFileForEffects(jsonFile, skipExistingEffects);
    
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
    
    const effects = await extractStructuredEffectsWithOpenAI(description, itemName);
    
    console.log('\n═'.repeat(50));
    
    if (effects && effects.length > 0) {
      console.log('\n📋 Final Result:');
      console.log(JSON.stringify({ effects }, null, 2));
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

