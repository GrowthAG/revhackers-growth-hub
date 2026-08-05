import re

filepath = '/Users/giullianoalves/Projects/active/RevHackers/repository/src/pages/admin/RevenueCockpit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Header & Typography
content = re.sub(
    r'text-2xl md:text-3xl font-serif font-semibold tracking-tight text-zinc-900',
    r'text-2xl font-semibold tracking-tight text-zinc-900',
    content
)
content = re.sub(r'text-zinc-900 font-bold">Cockpit', r'text-zinc-900 font-semibold">Cockpit', content)

# 2. Tabs / Switchers
# Old: text-xs font-mono font-bold uppercase tracking-wider
content = re.sub(
    r'text-xs font-mono font-bold uppercase tracking-wider',
    r'text-[13px] font-medium tracking-tight',
    content
)
# Old: text-xs font-mono font-bold tracking-wider uppercase
content = re.sub(
    r'text-xs font-mono font-bold tracking-wider uppercase',
    r'text-[13px] font-medium tracking-tight',
    content
)
content = re.sub(r'bg-zinc-950 text-white', r'bg-white text-zinc-900 shadow-sm border-zinc-200', content)
content = re.sub(r'hover:bg-zinc-800', r'hover:bg-zinc-50', content)
content = re.sub(r'bg-emerald-600 text-white border border-emerald-600', r'bg-white text-emerald-700 shadow-sm border border-emerald-200/50', content)
content = re.sub(r'bg-zinc-900 text-white border border-zinc-900', r'bg-white text-zinc-900 shadow-sm', content)
content = re.sub(r'bg-zinc-900 text-white', r'bg-white text-zinc-900 shadow-sm', content)

# 3. View Switcher Container
content = re.sub(
    r'<div className="flex items-center gap-1 border border-zinc-200 p-0\.5">',
    r'<div className="flex items-center gap-1 border border-zinc-200/60 p-1 bg-zinc-50 rounded-lg">',
    content
)

# 4. Filter Selects
content = re.sub(
    r'text-xs font-bold border px-3 py-1\.5 transition-colors cursor-pointer',
    r'text-[13px] font-medium border rounded-md px-3 py-1.5 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-zinc-900/10',
    content
)

# 5. MetricCard
content = re.sub(
    r'<div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex flex-col justify-between hover:border-zinc-300 transition-all duration-200 shadow-\[0_1px_2px_rgba\(0,0,0,0\.03\)\]">',
    r'<div className="bg-white border border-zinc-200/60 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-300 transition-all duration-200 shadow-sm relative overflow-hidden group">',
    content
)
content = re.sub(
    r'<p className="text-xs font-semibold text-zinc-500 mb-1">\{label\}</p>',
    r'<p className="text-[13px] font-medium text-zinc-500 mb-2">{label}</p>',
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

# 6. Copilot
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
content = re.sub(r'Análise de Inteligência Operacional</span>', r'Análise Operacional</span>', content)
content = re.sub(r'text-\[10px\] font-semibold px-2 py-0\.5 rounded-full border', r'text-[10px] font-medium px-1.5 py-0.5 rounded-sm border', content)

# 7. Kanban Board Cards
content = re.sub(
    r'className="bg-white border border-zinc-200 p-3 hover:shadow-sm transition-shadow cursor-pointer"',
    r'className="bg-white border border-zinc-200/80 rounded-lg p-3 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"',
    content
)
content = re.sub(
    r'<p className="text-sm font-bold text-zinc-900 truncate mb-1">\{p\.display_name\}</p>',
    r'<p className="text-[13px] font-semibold text-zinc-900 truncate mb-1">{p.display_name}</p>',
    content
)
content = re.sub(
    r'<span className="text-xxs font-medium text-zinc-400">',
    r'<span className="text-[11px] font-medium text-zinc-400">',
    content
)
content = re.sub(
    r'<span className="text-xs font-medium text-zinc-600">',
    r'<span className="text-[11px] font-medium text-zinc-600">',
    content
)

# 8. All other `font-bold` and `font-black` -> `font-semibold`
content = re.sub(r'font-bold', r'font-semibold', content)
content = re.sub(r'font-black', r'font-semibold', content)

with open(filepath, 'w') as f:
    f.write(content)

