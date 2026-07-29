const fs = require('fs');
const file = 'src/components/diagnostics/DiagnosticForm.tsx';
let content = fs.readFileSync(file, 'utf8');

const linkedinFind = /<div className=\{\`flex items-stretch border-b transition-all overflow-hidden[^>]+>\s*<div className=\{\`px-4 flex items-center gap-2\.5 border-r select-none[^>]+>\s*<Linkedin className="w-3\.5 h-3\.5" \/>\s*<span className="text-xxs font-sans font-bold tracking-tight">linkedin\.com\/in\/<\/span>\s*<\/div>\s*<Input\s*required\s*className="border-0 h-14 bg-transparent text-base px-4 focus:ring-0 w-full font-medium"/m;

const linkedinReplace = `<div className="flex items-stretch transition-all overflow-hidden border border-zinc-200 rounded-lg bg-white h-11 focus-within:border-zinc-400">
                                    <div className="px-3 flex items-center gap-2 border-r border-zinc-200 select-none bg-zinc-50 text-zinc-500">
                                        <Linkedin className="w-3.5 h-3.5" />
                                        <span className="text-xs font-sans font-medium">linkedin.com/in/</span>
                                    </div>
                                    <Input
                                        required
                                        className="border-0 h-full bg-transparent text-sm px-3 focus:ring-0 w-full font-medium"`;
content = content.replace(linkedinFind, linkedinReplace);
fs.writeFileSync(file, content, 'utf8');
