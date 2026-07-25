import re

filepath = '/Users/giullianoalves/Projects/active/RevHackers/repository/src/pages/admin/RevenueCockpit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix Metric Card
content = re.sub(
    r'<div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex flex-col justify-between hover:border-zinc-300 transition-all duration-200 shadow-\[0_1px_2px_rgba\(0,0,0,0\.03\)\]">',
    r'<div className="bg-white border border-zinc-200/60 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-300 transition-all duration-200 shadow-sm relative overflow-hidden group">',
    content
)
content = re.sub(
    r'<p className="text-xs font-semibold text-zinc-500 mb-1">\{label\}</p>',
    r'<p className="text-xs font-medium text-zinc-500 mb-2">{label}</p>',
    content
)
content = re.sub(
    r'<p className="text-2xl font-bold text-zinc-900 tracking-tight tabular-nums">\{value\}</p>',
    r'<p className="text-[26px] font-semibold text-zinc-900 tracking-tight tabular-nums leading-none mb-1">{value}</p>',
    content
)
content = re.sub(
    r'\{sub && <p className="text-xs text-zinc-500 font-normal mt-1 border-t border-zinc-100 pt-1\.5">\{sub\}</p>\}',
    r'{sub && <p className="text-[11px] text-zinc-400 font-medium">{sub}</p>}',
    content
)

# Fix Copilot
content = re.sub(
    r'bg-white border border-zinc-200/80 rounded-xl p-4\.5 shadow-\[0_1px_3px_rgba\(0,0,0,0\.03\)\]',
    r'bg-white border border-zinc-200/60 rounded-xl p-4 shadow-sm',
    content
)
content = re.sub(
    r"type === 'alert' \? 'bg-amber-500' : type === 'success' \? 'bg-emerald-500' : 'bg-zinc-300'",
    r"type === 'alert' ? 'bg-amber-400' : type === 'success' ? 'bg-[#00CC6A]' : 'bg-zinc-300'",
    content
)
content = re.sub(
    r'<div className="p-2 rounded-lg bg-zinc-100/80 text-zinc-700 shrink-0 mt-0\.5">',
    r'<div className="p-1.5 rounded-md bg-zinc-50 text-zinc-600 shrink-0 mt-0.5 border border-zinc-100">',
    content
)

# Fix Tabs and Buttons
content = re.sub(
    r'text-xs font-mono font-bold uppercase tracking-wider',
    r'text-sm font-medium',
    content
)
content = re.sub(
    r'text-xs font-mono font-bold tracking-wider uppercase',
    r'text-[13px] font-medium',
    content
)
content = re.sub(
    r'bg-zinc-950 text-white border border-zinc-950',
    r'bg-white text-zinc-900 shadow-sm',
    content
)
content = re.sub(
    r'bg-emerald-600 text-white border border-emerald-600',
    r'bg-white text-emerald-700 shadow-sm',
    content
)
content = re.sub(
    r'bg-zinc-900 text-white border border-zinc-900',
    r'bg-white text-zinc-900 shadow-sm',
    content
)

# Fix View Switcher
content = re.sub(
    r'<div className="flex items-center gap-1 border border-zinc-200 p-0\.5">',
    r'<div className="flex items-center gap-1 border border-zinc-200/60 p-1 bg-zinc-50 rounded-lg">',
    content
)
content = re.sub(
    r"vendasView === key\s*\?\s*'bg-zinc-900 text-white'\s*:\s*'text-zinc-400 hover:text-zinc-600'",
    r"vendasView === key ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/30'",
    content
)
content = re.sub(
    r"flex items-center gap-1\.5 px-3 py-1\.5 text-xs font-bold transition-colors",
    r"flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all",
    content
)

with open(filepath, 'w') as f:
    f.write(content)

