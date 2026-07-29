const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const componentDir = path.join(__dirname, 'src', 'components', 'diagnostics');
const pagesDir = path.join(__dirname, 'src', 'pages');

const filesToFix = [
    'DiagnosticForm.tsx',
    'DiagnosticLayout.tsx',
    'ScoreGauge.tsx',
    'MetricCard.tsx',
    'BenchmarkBar.tsx',
    'ShareButtons.tsx',
    'DiagnosticBookingModal.tsx',
    'CallDiagnosticModal.tsx',
    'GovernanceFooter.tsx',
    'DiagnosticBookingEmbed.tsx',
    'QuestionProgressBar.tsx',
    'TechStackCard.tsx',
    'DiagnosticActionSection.tsx',
];

const pageFiles = [
    'GrowthScore.tsx',
    'RevenueScore.tsx',
    'FounderScore.tsx',
    'SiteScore.tsx'
];

// Global replacements across all these files
const globalReplacements = [
    // Backgrounds & text colors in Results
    [/bg-black/g, 'bg-white'],
    [/bg-zinc-950/g, 'bg-white'],
    [/bg-zinc-900/g, 'bg-white'],
    [/bg-zinc-800/g, 'bg-zinc-50'], // often used for cards on dark
    [/text-white/g, 'text-zinc-900'],
    [/text-zinc-400/g, 'text-zinc-500'],
    [/text-zinc-300/g, 'text-zinc-600'],
    
    // Borders
    [/border-zinc-800/g, 'border-zinc-200'],
    [/border-zinc-700/g, 'border-zinc-200'],
    [/border-zinc-900/g, 'border-zinc-200'],
    [/border-white\/10/g, 'border-zinc-200'],
    
    // Fonts
    [/font-mono/g, 'font-sans'],
    [/font-black/g, 'font-bold'],
    
    // Specific text changes
    [/LIBERAR RELATÓRIO OFICIAL/g, 'Liberar Relatório'],
    [/ANÁLISE FINALIZADA/g, 'Análise Finalizada'],
    
    // Remove uppercase tracking strings globally for labels
    [/uppercase tracking-widest/g, ''],
    [/uppercase tracking-wider/g, ''],
    [/uppercase tracking-tight/g, ''],
    [/uppercase tracking-tighter/g, ''],
    [/uppercase tracking-\[[^\]]+\]/g, ''],
];

filesToFix.forEach(f => replaceInFile(path.join(componentDir, f), globalReplacements));
pageFiles.forEach(f => replaceInFile(path.join(pagesDir, f), globalReplacements));

console.log('Global replacements done. Will do specific adjustments.');
