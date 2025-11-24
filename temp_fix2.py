from pathlib import Path
p = Path('App.tsx')
text = p.read_text(encoding='utf-8')
text = text.replace('id: f"{s.id}_r{currentRound}"', 'id: `${s.id}_r${currentRound}`')
text = text.replace('text: txts[i] or "고요"', 'text: txts[i] || "고요"')
text = text.replace('summary: summaries[i] or ""', 'summary: summaries[i] || ""')
p.write_text(text, encoding='utf-8')
print('fixed')
