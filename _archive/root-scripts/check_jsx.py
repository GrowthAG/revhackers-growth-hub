import re

filepath = '/Users/giullianoalves/Projects/active/RevHackers/repository/src/pages/admin/RevenueCockpit.tsx'
with open(filepath, 'r') as f:
    lines = f.readlines()

def count_braces():
    stack = []
    for i, line in enumerate(lines):
        for char in line:
            if char in '{[(<':
                stack.append((char, i+1))
            elif char in '}])>':
                if not stack:
                    print(f"Unmatched closing {char} at line {i+1}")
                    return
                top = stack.pop()
                # don't do full validation because it's tricky with strings and jsx

count_braces()
