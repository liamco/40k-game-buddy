/**
 * Mechanic Audit Script
 * 
 * Analyzes all enhancements, abilities, and stratagems in the space-marines faction
 * to identify common patterns and categorize them by similar mechanics.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to strip HTML tags
function stripHtml(html) {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper function to normalize text
function normalize(text) {
    return text.toLowerCase().trim();
}

// Pattern matchers for common mechanics
const patterns = {
    // Leader/Unit interactions
    leaderGrantsAbility: /(?:while|when).*leading.*unit.*(?:has|get|gain|gains).*(?:ability|keyword)/i,
    leaderGrantsKeyword: /(?:while|when).*leading.*unit.*(?:has|get|gain|gains).*keyword/i,
    unitGetsFromLeader: /(?:while|when).*unit.*(?:is|are).*led.*(?:by|has).*leader/i,
    
    // Range-based effects
    rangeBasedBonus: /(?:within|range).*\d+\".*(?:add|subtract|get|gain|has).*\d+.*(?:hit|wound|save|attack|strength|toughness|leadership|oc)/i,
    rangeBasedAbility: /(?:within|range).*\d+\".*(?:has|get|gain|gains).*(?:ability|keyword)/i,
    
    // Hit/Wound modifiers
    hitBonus: /(?:add|subtract).*\d+.*(?:hit|to hit|hit roll)/i,
    woundBonus: /(?:add|subtract).*\d+.*(?:wound|to wound|wound roll)/i,
    saveBonus: /(?:add|subtract).*\d+.*(?:save|armour save|saving throw)/i,
    
    // Weapon ability grants
    sustainedHits: /(?:has|get|gain|gains).*(?:sustained hits|\[sustained hits)/i,
    lethalHits: /(?:has|get|gain|gains).*(?:lethal hits|\[lethal hits)/i,
    precision: /(?:has|get|gain|gains).*(?:precision|\[precision)/i,
    torrent: /(?:has|get|gain|gains).*(?:torrent|\[torrent)/i,
    blast: /(?:has|get|gain|gains).*(?:blast|\[blast)/i,
    ignoresCover: /(?:has|get|gain|gains).*(?:ignores cover|\[ignores cover)/i,
    
    // Movement/Deployment
    deepStrike: /(?:has|get|gain|gains).*(?:deep strike|\[deep strike)/i,
    scout: /(?:has|get|gain|gains).*(?:scout|\[scout)/i,
    infiltrators: /(?:has|get|gain|gains).*(?:infiltrators|\[infiltrators)/i,
    
    // Phase-based effects
    commandPhase: /(?:command phase|start of.*command phase)/i,
    movementPhase: /(?:movement phase|during.*movement phase)/i,
    shootingPhase: /(?:shooting phase|during.*shooting phase)/i,
    chargePhase: /(?:charge phase|during.*charge phase)/i,
    fightPhase: /(?:fight phase|during.*fight phase)/i,
    
    // Conditional effects
    ifDestroyed: /(?:if|when).*(?:destroyed|killed|dies)/i,
    ifWounded: /(?:if|when).*(?:wounded|suffers.*wound)/i,
    ifInRange: /(?:if|when).*(?:within|range|in range)/i,
    ifOnObjective: /(?:if|when).*(?:on|controls|within range of).*(?:objective)/i,
    
    // Re-rolls
    rerollHit: /(?:re-roll|reroll).*(?:hit|hit roll)/i,
    rerollWound: /(?:re-roll|reroll).*(?:wound|wound roll)/i,
    rerollSave: /(?:re-roll|reroll).*(?:save|saving throw)/i,
    rerollAll: /(?:re-roll|reroll).*(?:all|any|one).*(?:roll|dice)/i,
    
    // Damage/Strength modifiers
    strengthModifier: /(?:add|subtract|improve|increase|reduce).*\d+.*(?:strength|s\s*characteristic)/i,
    damageModifier: /(?:add|subtract|improve|increase|reduce).*\d+.*(?:damage|d\s*characteristic)/i,
    apModifier: /(?:add|subtract|improve|increase|reduce).*\d+.*(?:armour penetration|ap|armor penetration)/i,
    
    // Attacks modifiers
    attacksModifier: /(?:add|subtract|improve|increase|reduce).*\d+.*(?:attacks|a\s*characteristic)/i,
    
    // Battle-shock/Leadership
    battleshock: /(?:battle-shock|battleshock|leadership test)/i,
    leadershipModifier: /(?:add|subtract|improve|increase|reduce).*\d+.*(?:leadership|ld\s*characteristic)/i,
    
    // Objective Control
    ocModifier: /(?:add|subtract|improve|increase|reduce).*\d+.*(?:objective control|oc\s*characteristic)/i,
    
    // Feel No Pain/Invulnerable saves
    feelNoPain: /(?:feel no pain|fnp|saving throw).*\d+/i,
    invulnerableSave: /(?:invulnerable save|invuln|inv\s*save)/i,
    
    // Once per battle
    oncePerBattle: /(?:once per battle|once per game)/i,
    oncePerTurn: /(?:once per turn|once per phase)/i,
    
    // Stratagem cost reduction
    stratagemCostReduction: /(?:stratagem|cp).*(?:for|cost).*\d+cp/i,
    
    // Unit/model restoration
    restoreModels: /(?:return|restore|resurrect).*(?:destroyed|dead).*(?:model|models)/i,
    
    // Aura effects
    aura: /(?:aura|while.*within|models within)/i,
    
    // Psychic
    psychic: /(?:psychic|warp charge|manifest)/i,
};

// Categories for organizing mechanics
const categories = {
    leaderInteractions: [],
    rangeBasedEffects: [],
    hitWoundModifiers: [],
    weaponAbilityGrants: [],
    movementDeployment: [],
    phaseBasedEffects: [],
    conditionalEffects: [],
    rerolls: [],
    characteristicModifiers: [],
    battleshockLeadership: [],
    objectiveControl: [],
    defensiveAbilities: [],
    limitedUse: [],
    stratagemRelated: [],
    unitRestoration: [],
    auraEffects: [],
    psychicAbilities: [],
    other: []
};

function categorizeDescription(description, source, type, name) {
    const stripped = stripHtml(description);
    const normalized = normalize(stripped);
    
    const matches = [];
    
    // Check each pattern
    for (const [patternName, pattern] of Object.entries(patterns)) {
        if (pattern.test(stripped) || pattern.test(normalized)) {
            matches.push(patternName);
        }
    }
    
    const entry = {
        name,
        type,
        source,
        description: stripped,
        fullDescription: stripped,
        matches
    };
    
    // Categorize based on matches
    if (matches.length === 0) {
        categories.other.push(entry);
        return;
    }
    
    // Priority-based categorization
    if (matches.some(m => m.includes('leader'))) {
        categories.leaderInteractions.push(entry);
    } else if (matches.some(m => m.includes('range') || m.includes('within'))) {
        categories.rangeBasedEffects.push(entry);
    } else if (matches.some(m => m.includes('hit') || m.includes('wound'))) {
        categories.hitWoundModifiers.push(entry);
    } else if (matches.some(m => m.includes('sustained') || m.includes('lethal') || m.includes('precision') || m.includes('torrent') || m.includes('blast'))) {
        categories.weaponAbilityGrants.push(entry);
    } else if (matches.some(m => m.includes('deep') || m.includes('scout') || m.includes('infiltrat'))) {
        categories.movementDeployment.push(entry);
    } else if (matches.some(m => m.includes('phase'))) {
        categories.phaseBasedEffects.push(entry);
    } else if (matches.some(m => m.includes('if') || m.includes('when') || m.includes('conditional'))) {
        categories.conditionalEffects.push(entry);
    } else if (matches.some(m => m.includes('reroll'))) {
        categories.rerolls.push(entry);
    } else if (matches.some(m => m.includes('strength') || m.includes('damage') || m.includes('ap') || m.includes('attacks'))) {
        categories.characteristicModifiers.push(entry);
    } else if (matches.some(m => m.includes('battleshock') || m.includes('leadership'))) {
        categories.battleshockLeadership.push(entry);
    } else if (matches.some(m => m.includes('oc') || m.includes('objective'))) {
        categories.objectiveControl.push(entry);
    } else if (matches.some(m => m.includes('feel') || m.includes('invuln'))) {
        categories.defensiveAbilities.push(entry);
    } else if (matches.some(m => m.includes('once'))) {
        categories.limitedUse.push(entry);
    } else if (matches.some(m => m.includes('stratagem'))) {
        categories.stratagemRelated.push(entry);
    } else if (matches.some(m => m.includes('restore') || m.includes('return'))) {
        categories.unitRestoration.push(entry);
    } else if (matches.some(m => m.includes('aura'))) {
        categories.auraEffects.push(entry);
    } else if (matches.some(m => m.includes('psychic'))) {
        categories.psychicAbilities.push(entry);
    } else {
        categories.other.push(entry);
    }
}

function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findJsonFiles(filePath, fileList);
        } else if (file.endsWith('.json')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function analyzeFile(filePath, basePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const relativePath = path.relative(basePath, filePath);
        
        // Analyze enhancements (in faction files)
        if (data.enhancements && Array.isArray(data.enhancements)) {
            data.enhancements.forEach(enhancement => {
                if (enhancement.description) {
                    categorizeDescription(
                        enhancement.description,
                        relativePath,
                        'Enhancement',
                        enhancement.name || 'Unknown'
                    );
                }
            });
        }
        
        // Analyze detachment abilities (in faction files)
        if (data.detachments && Array.isArray(data.detachments)) {
            data.detachments.forEach(detachment => {
                if (detachment.abilities && Array.isArray(detachment.abilities)) {
                    detachment.abilities.forEach(ability => {
                        if (ability.description) {
                            categorizeDescription(
                                ability.description,
                                relativePath,
                                `Detachment Ability (${detachment.name || 'Unknown'})`,
                                ability.name || 'Unknown'
                            );
                        }
                    });
                }
                
                // Also check enhancements in detachments
                if (detachment.enhancements && Array.isArray(detachment.enhancements)) {
                    detachment.enhancements.forEach(enhancement => {
                        if (enhancement.description) {
                            categorizeDescription(
                                enhancement.description,
                                relativePath,
                                `Enhancement (${detachment.name || 'Unknown'})`,
                                enhancement.name || 'Unknown'
                            );
                        }
                    });
                }
                
                // Check stratagems in detachments
                if (detachment.stratagems && Array.isArray(detachment.stratagems)) {
                    detachment.stratagems.forEach(stratagem => {
                        if (stratagem.description) {
                            categorizeDescription(
                                stratagem.description,
                                relativePath,
                                `Stratagem (${detachment.name || 'Unknown'})`,
                                stratagem.name || 'Unknown'
                            );
                        }
                    });
                }
            });
        }
        
        // Analyze stratagems (in faction files)
        if (data.stratagems && Array.isArray(data.stratagems)) {
            data.stratagems.forEach(stratagem => {
                if (stratagem.description) {
                    categorizeDescription(
                        stratagem.description,
                        relativePath,
                        'Stratagem',
                        stratagem.name || 'Unknown'
                    );
                }
            });
        }
        
        // Analyze unit abilities (in datasheet files)
        if (data.abilities && Array.isArray(data.abilities)) {
            data.abilities.forEach(ability => {
                if (ability.description) {
                    categorizeDescription(
                        ability.description,
                        relativePath,
                        'Unit Ability',
                        ability.name || 'Unknown'
                    );
                }
            });
        }
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

function generateMarkdownReport() {
    const report = [];
    
    report.push('# Mechanic Audit Report');
    report.push('');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push('');
    report.push('## Summary');
    report.push('');
    
    const totalEntries = Object.values(categories).reduce((sum, cat) => sum + cat.length, 0);
    report.push(`Total entries analyzed: ${totalEntries}`);
    report.push('');
    
    report.push('### Category Breakdown');
    report.push('');
    for (const [categoryName, entries] of Object.entries(categories)) {
        if (entries.length > 0) {
            report.push(`- **${categoryName.replace(/([A-Z])/g, ' $1').trim()}**: ${entries.length} entries`);
        }
    }
    report.push('');
    report.push('---');
    report.push('');
    
    // Generate detailed sections for each category
    for (const [categoryName, entries] of Object.entries(categories)) {
        if (entries.length === 0) continue;
        
        const displayName = categoryName.replace(/([A-Z])/g, ' $1').trim();
        report.push(`## ${displayName.charAt(0).toUpperCase() + displayName.slice(1)} (${entries.length} entries)`);
        report.push('');
        
        // Group by pattern matches
        const patternGroups = {};
        entries.forEach(entry => {
            const key = entry.matches.join(', ') || 'No specific pattern';
            if (!patternGroups[key]) {
                patternGroups[key] = [];
            }
            patternGroups[key].push(entry);
        });
        
        // Sort groups by size
        const sortedGroups = Object.entries(patternGroups).sort((a, b) => b[1].length - a[1].length);
        
        for (const [patternGroup, groupEntries] of sortedGroups) {
            report.push(`### Pattern: ${patternGroup}`);
            report.push('');
            report.push(`**Total entries**: ${groupEntries.length}`);
            report.push('');
            
            // Deduplicate entries by name and description
            const uniqueEntries = new Map();
            groupEntries.forEach(entry => {
                // Create a key from name and description
                const key = `${entry.name}|${entry.fullDescription}`;
                if (!uniqueEntries.has(key)) {
                    uniqueEntries.set(key, {
                        name: entry.name,
                        type: entry.type,
                        description: entry.fullDescription,
                        sources: [],
                        count: 0
                    });
                }
                const uniqueEntry = uniqueEntries.get(key);
                uniqueEntry.sources.push(entry.source);
                uniqueEntry.count++;
            });
            
            // Sort unique entries by count (most common first)
            const sortedUniqueEntries = Array.from(uniqueEntries.values())
                .sort((a, b) => b.count - a.count);
            
            report.push(`**Unique entries**: ${sortedUniqueEntries.length}`);
            report.push('');
            
            // Show unique entries with counts
            sortedUniqueEntries.forEach((entry, idx) => {
                report.push(`${idx + 1}. **${entry.name}** (${entry.type})`);
                report.push(`   - Count: ${entry.count} occurrence(s)`);
                if (entry.sources.length <= 5) {
                    report.push(`   - Sources: ${entry.sources.join(', ')}`);
                } else {
                    report.push(`   - Sources: ${entry.sources.slice(0, 5).join(', ')}, ... and ${entry.sources.length - 5} more`);
                }
                report.push(`   - Description: ${entry.description}`);
                report.push('');
            });
            
            report.push('---');
            report.push('');
        }
    }
    
    return report.join('\n');
}

async function main() {
    const depotdataPath = path.join(__dirname, '..', 'src', 'app', 'depotdata', 'factions', 'space-marines');
    
    if (!fs.existsSync(depotdataPath)) {
        console.error(`Error: ${depotdataPath} does not exist`);
        process.exit(1);
    }
    
    console.log('🔍 Scanning space-marines folder...');
    const jsonFiles = findJsonFiles(depotdataPath);
    console.log(`📁 Found ${jsonFiles.length} JSON files`);
    
    console.log('📊 Analyzing files...');
    let processed = 0;
    for (const file of jsonFiles) {
        analyzeFile(file, depotdataPath);
        processed++;
        if (processed % 50 === 0) {
            console.log(`   Processed ${processed}/${jsonFiles.length} files...`);
        }
    }
    
    console.log('📝 Generating report...');
    const report = generateMarkdownReport();
    
    // Ensure audits directory exists
    const auditsDir = path.join(__dirname, '..', 'audits');
    if (!fs.existsSync(auditsDir)) {
        fs.mkdirSync(auditsDir, { recursive: true });
    }
    
    const reportPath = path.join(auditsDir, 'mechanic-audit.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log('✅ Report generated successfully!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log('');
    console.log('Summary:');
    for (const [categoryName, entries] of Object.entries(categories)) {
        if (entries.length > 0) {
            console.log(`  ${categoryName}: ${entries.length} entries`);
        }
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

