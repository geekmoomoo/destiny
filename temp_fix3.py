from pathlib import Path
p=Path('App.tsx')
text=p.read_text(encoding='utf-8')
text=text.replace('text: txts[i] || "����"', 'text: txts[i] || "고요"')
p.write_text(text, encoding='utf-8')
print('replaced fallback')
