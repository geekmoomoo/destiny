import re, pathlib, textwrap
path = pathlib.Path('App.tsx')
text = path.read_text(encoding='utf-8')
pattern = re.compile(r"if \(currentStep !== 'playing'[^\n]*\n.*?\[currentRound, currentStep, selectedCategory, aiSessionData\]\);", re.S)
new_block = textwrap.dedent('''    if (currentStep !== "playing" || !selectedCategory) return;
    const styles = generateCategoryStyles(selectedCategory).slice(0, 4);
    let title = "", desc = "", txts: string[] = [], summaries: string[] = [];
    if (aiSessionData && aiSessionData[currentRound - 1]) {
        const d = aiSessionData[currentRound - 1]; title = d.title; desc = d.question; txts = d.cardTexts; summaries = d.cardSummaries || [];
        setSessionThemes(p => { const n = [...p]; n[currentRound-1] = {title, desc}; return n; });
    } else {
        const f = getGameThemes()[currentRound - 1]; title = f.title; desc = selectedCategory.focusQuestions[currentRound-1] || f.desc;
        txts = generateRoundTexts(currentRound, 4, selectedCategory.id);
        summaries = txts;
    }
    setCurrentRoundInfo({
        roundNumber: currentRound, title, description: desc,
        cards: styles.map((s, i) => ({ ...s, id: f"{s.id}_r{currentRound}", text: txts[i] or "고요", summary: summaries[i] or "" }))
    });
  }, [currentRound, currentStep, selectedCategory, aiSessionData]);''')
if not pattern.search(text):
    raise SystemExit('pattern not found')
text_new = pattern.sub(new_block, text, count=1)
path.write_text(text_new, encoding='utf-8')
print('patched')
