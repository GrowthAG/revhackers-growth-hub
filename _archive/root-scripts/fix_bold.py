import re

filepath = '/Users/giullianoalves/Projects/active/RevHackers/repository/src/pages/admin/RevenueCockpit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(r'font-bold', r'font-semibold', content)
content = re.sub(r'font-black', r'font-semibold', content)

with open(filepath, 'w') as f:
    f.write(content)

