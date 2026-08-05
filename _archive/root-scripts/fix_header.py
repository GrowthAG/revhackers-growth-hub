import re

filepath = '/Users/giullianoalves/Projects/active/RevHackers/repository/src/pages/admin/RevenueCockpit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix Header typography
content = re.sub(
    r'<h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-zinc-900">',
    r'<h1 className="text-2xl font-semibold tracking-tight text-zinc-900">',
    content
)
content = re.sub(
    r'text-xs font-semibold text-zinc-400 mb-1',
    r'text-[13px] font-medium text-zinc-500 mb-2',
    content
)
content = re.sub(
    r'text-zinc-900 font-bold">Cockpit de Receita',
    r'text-zinc-900 font-semibold">Cockpit de Receita',
    content
)
content = re.sub(
    r'text-xs font-mono font-bold gap-1\.5',
    r'text-[13px] font-medium gap-2',
    content
)
content = re.sub(
    r'bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg h-9 px-4 text-sm font-medium shadow-none border border-zinc-200 flex items-center gap-2',
    r'bg-zinc-900 text-white hover:bg-zinc-800 rounded-md h-9 px-4 text-[13px] font-medium shadow-sm flex items-center gap-2',
    content
)

# Fix Filters
content = re.sub(
    r'text-xs font-bold border px-3 py-1\.5 transition-colors cursor-pointer',
    r'text-[13px] font-medium border rounded-md px-3 py-1.5 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-zinc-900/10',
    content
)

with open(filepath, 'w') as f:
    f.write(content)

