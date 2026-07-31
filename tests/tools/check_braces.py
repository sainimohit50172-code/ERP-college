from pathlib import Path
p=Path('src/pages/StudentCertificatesPage.jsx')
s=p.read_text(encoding='utf-8')
counts={'(':0,')':0,'{':0,'}':0,'[':0,']':0}
for i,ch in enumerate(s):
    if ch in counts: counts[ch]+=1
print('counts:',counts)
# Find first mismatch by scanning
stack=[]
pairs={')':'(', '}':'{', ']':'['}
for i,ch in enumerate(s,1):
    if ch in '([{': stack.append((ch,i))
    elif ch in ')]}':
        if not stack:
            print('Unmatched closing',ch,'at',i); break
        last, pos = stack.pop()
        if last != pairs[ch]:
            print('Mismatched',last,'at',pos,'with',ch,'at',i); break
else:
    if stack:
        print('Unmatched openings remain:', stack[:5])
    else:
        print('All matched')
