import os
import re

files_to_check = [
    "src/pages/RevenueScore.tsx",
    "src/pages/FounderScore.tsx",
    "src/pages/SiteScore.tsx",
    "src/pages/GrowthScore.tsx",
    "src/pages/GrowthMap.tsx",
    "src/pages/REI-Consulting.tsx",
    "src/pages/Downloads.tsx",
    "src/pages/MaterialLanding.tsx",
    "src/pages/PartnerDetail.tsx",
    "src/pages/PartnerEnics.tsx",
    "src/pages/ThankYou.tsx",
    "src/pages/SchedulingSuccess.tsx",
    "src/pages/NotFound.tsx",
    "src/components/home/ComparisonSection.tsx",
    "src/components/layout/Footer.tsx"
]

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic class replacements
    content = re.sub(r'\btext-[4-9]xl\b', 'text-3xl', content)
    content = re.sub(r'\bmd:text-[4-9]xl\b', 'md:text-3xl', content)
    content = re.sub(r'\bfont-black\b', 'font-bold', content)
    content = re.sub(r'\btracking-tighter\b', 'tracking-tight', content)
    content = re.sub(r'\btracking-widest\b', '', content)
    content = re.sub(r'\btracking-\[0\.\d+em\]\b', '', content)
    content = re.sub(r'\bfont-mono\b', 'font-sans', content)
    content = re.sub(r'\bfont-serif\b', 'font-sans', content)
    content = re.sub(r'\brounded-none\b', 'rounded-lg', content)
    
    # Clean up multiple spaces that might result from removals
    content = re.sub(r'className="([^"]*)"', lambda m: 'className="' + ' '.join(m.group(1).split()) + '"', content)
    
    # GROWTHHUB badge removal (GrowthMap has this)
    content = re.sub(r'<span[^>]*>[\s\n]*GROWTHHUB ENGINE[\s\n]*</span>', '', content)
    # Sparkles icon removal (GrowthMap)
    content = re.sub(r'<Sparkles[^>]*/>', '', content)
    
    # Handle clamp sizes > 2.5rem (approx 40px)
    # This is a bit tricky, let's just replace any clamp with a max > 2.5rem with something standard
    # e.g., text-[clamp(1rem,5vw,3rem)] -> text-[clamp(1rem,3vw,1.875rem)] or just remove if we can
    content = re.sub(r'text-\[clamp\([^,]+,[^,]+,([3-9]|\d{2,})rem\)\]', 'text-2xl md:text-3xl', content)

    # Footer social link borders (should be rounded-lg not square)
    # Let's just make sure "rounded-none" or "rounded-sm" isn't there for socials, but we already did rounded-none -> rounded-lg
    
    # Update Hero section H1s
    # Often they are text-3xl md:text-3xl now due to regex. We want text-2xl md:text-3xl font-bold text-white tracking-tight
    # I'll just rely on the manual fixes for hero sections if needed, or see if it's close enough.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for file in files_to_check:
    process_file(file)

print("Done")
