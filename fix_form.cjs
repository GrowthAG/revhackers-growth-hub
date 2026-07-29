const fs = require('fs');
const file = 'src/components/diagnostics/DiagnosticForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix labelClasses
content = content.replace(
    /const labelClasses = [^;]+;/,
    'const labelClasses = "text-sm font-medium text-zinc-700 block mb-2";'
);

// Fix inputClasses
content = content.replace(
    /const inputClasses = [^;]+;/,
    'const inputClasses = "h-11 w-full text-sm bg-white border border-zinc-200 rounded-lg px-3 focus:border-zinc-400 focus:ring-0 transition-all text-zinc-900 placeholder:text-zinc-400";'
);

// Fix SelectTrigger class
content = content.replace(
    /className=\{\`\$\{inputClasses\} shadow-none ring-0 focus:ring-offset-0 border-b\`\}/,
    'className={inputClasses}'
);

// Fix SelectContent
content = content.replace(
    /className=\{isDark \? "[^"]+" : "[^"]+"}/,
    'className="bg-white border border-zinc-200 text-zinc-900 rounded-lg shadow-sm"'
);

// Fix SelectItem
content = content.replace(
    /className=\{isDark \? "[^"]+" : "[^"]+"}/g,
    'className="cursor-pointer focus:bg-zinc-100 focus:text-zinc-900"'
);

// Fix "BUSCANDO..."
content = content.replace(/> BUSCANDO\.\.\./g, '> Buscando...');

// Fix "Dados verificados" classes
content = content.replace(
    /className="text-\[#00CC6A\] text-xs font-semibold tracking-wider uppercase"/,
    'className="text-[#00CC6A] text-xs font-medium"'
);

// Fix button
content = content.replace(
    /className=\{\`w-full px-16 h-14 font-bold tracking-wider uppercase text-tiny rounded-sm transition-all duration-500 border \$\{isDark[^}]+\}\`/g,
    'className="w-full px-16 h-11 bg-[#00CC6A] text-black font-semibold rounded-lg transition-all border border-[#00CC6A] hover:bg-[#00b35c]"'
);

// Fix processando
content = content.replace(
    /PROCESSANDO_DADOS\.\.\./g,
    'Processando dados...'
);

// Fix Ambiente Seguro
content = content.replace(
    /className="flex items-center gap-2 text-xxs text-zinc-500 font-medium"/,
    'className="flex items-center gap-2 text-xs text-zinc-400"'
);

fs.writeFileSync(file, content, 'utf8');
