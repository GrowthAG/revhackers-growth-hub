const fs = require('fs');
const file = 'src/components/diagnostics/DiagnosticLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

// Section variant change
content = content.replace(
    /variant=\{isDark \? 'dark' : 'light'\}/,
    'variant="light"'
);

// Upper case tracking change
content = content.replace(
    /<p className="text-\[#00CC6A\] text-xs font-semibold tracking-wider uppercase">Diagnóstico<\/p>/,
    '<p className="text-[#00CC6A] text-xs font-medium">Diagnóstico</p>'
);

fs.writeFileSync(file, content, 'utf8');
