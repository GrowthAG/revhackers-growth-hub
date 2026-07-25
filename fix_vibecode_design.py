import os
import glob
import re

directory = '/Users/giullianoalves/Projects/active/RevHackers/repository/src/pages/admin'

replacements = [
    (r'text-xxs font-black uppercase tracking-\[0.25em\]', 'text-xs font-medium'),
    (r'text-xs font-black uppercase tracking-widest', 'text-[13px] font-medium'),
    (r'text-2xs font-black uppercase tracking-widest', 'text-xs font-medium text-zinc-500'),
    (r'text-\[10px\] font-black uppercase tracking-widest', 'text-xs font-medium'),
    (r'text-xs font-black uppercase tracking-widest', 'text-xs font-medium'),
    (r'text-xxs font-black uppercase tracking-widest', 'text-xs font-medium'),
    (r'text-xs font-black uppercase', 'text-xs font-medium'),
    (r'text-sm font-black uppercase tracking-tight', 'text-sm font-medium'),
    (r'text-sm font-black tabular-nums', 'text-sm font-semibold tabular-nums'),
    (r'text-xs font-black text-zinc-400 uppercase tracking-widest', 'text-[13px] font-medium text-zinc-500'),
    (r'text-xs font-black', 'text-xs font-semibold'),
    (r'text-sm font-black', 'text-sm font-semibold'),
    (r'text-lg font-black', 'text-lg font-semibold'),
    (r'text-xl font-black', 'text-xl font-semibold'),
    (r'text-2xl font-black', 'text-2xl font-semibold'),
    (r'text-3xl font-black', 'text-3xl font-semibold'),
    (r'text-xxs font-black', 'text-xs font-medium'),
    (r'bg-zinc-50\b', 'bg-white shadow-sm'),
    (r'border-zinc-800', 'border-zinc-200'),
    (r'font-black', 'font-semibold')
]

for filepath in glob.glob(os.path.join(directory, '*.tsx')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

print("Done")
