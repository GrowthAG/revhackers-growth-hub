const fs = require('fs');
const path = require('path');

// We are going to find all tsx files in src/components/diagnostics
// and maybe src/components/quem-somos (except HeroSection.tsx)
const filesToFix = [
    'src/components/diagnostics/ScoreGauge.tsx',
    'src/components/diagnostics/QuestionProgressBar.tsx',
    'src/components/diagnostics/TechStackCard.tsx',
    'src/components/diagnostics/DiagnosticActionSection.tsx',
    'src/components/diagnostics/DiagnosticBookingEmbed.tsx',
    'src/components/meetings/MeetingTimeline.tsx',
    'src/components/quem-somos/CTASection.tsx',
    'src/components/quem-somos/HistorySection.tsx',
    'src/components/quem-somos/TimelineSection.tsx',
    'src/components/quem-somos/ValuesSection.tsx',
    'src/components/client/HubNpsBlocker.tsx',
    'src/components/legal/SignatureEngine.tsx'
];

filesToFix.forEach(relPath => {
    const filePath = path.join(__dirname, relPath);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${filePath}, not found.`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Typography replacements
    content = content.replace(/font-black/g, 'font-bold');
    content = content.replace(/text-4xl md:text-5xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-4xl md:text-6xl lg:text-7xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-4xl md:text-6xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-5xl md:text-7xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-6xl md:text-\[6rem\]/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-8xl md:text-9xl/g, 'text-3xl');
    content = content.replace(/text-4xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-5xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-6xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-7xl/g, 'text-2xl md:text-3xl');
    
    content = content.replace(/tracking-tighter/g, 'tracking-tight');
    content = content.replace(/tracking-widest/g, 'tracking-wider');
    content = content.replace(/tracking-\[0\.[345]em\]/g, 'tracking-wider');
    
    content = content.replace(/font-mono-tech/g, 'font-sans');
    content = content.replace(/font-mono/g, 'font-sans');
    
    // Background replacements
    content = content.replace(/bg-zinc-950/g, 'bg-black');
    content = content.replace(/bg-\[radial-gradient\([^)]+\)\]/g, '');
    
    // Badges / Sparkles
    content = content.replace(/<div className="inline-block bg-black text-white px-4 py-1\.5 text-2xs font-sans uppercase tracking-wider font-bold">([^<]+)<\/div>/g, '<p className="text-[#00CC6A] text-xs font-semibold tracking-wider uppercase">$1</p>');
    
    // Remove <Sparkles /> components and imports
    content = content.replace(/<Sparkles[^>]*\/>/g, '');
    content = content.replace(/import\s+\{?\s*Sparkles\s*\}?\s+from\s+['"][^'"]+['"];?/g, '');
    content = content.replace(/import\s+Sparkles\s+from\s+['"][^'"]+['"];?/g, '');
    content = content.replace(/,\s*Sparkles\s*/g, '');
    content = content.replace(/Sparkles\s*,\s*/g, '');

    // Cleanup double spaces inside classNames
    content = content.replace(/className="([^"]+)"/g, (match, p1) => {
        return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
});
