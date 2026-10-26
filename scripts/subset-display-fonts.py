"""Rebuild optional display subsets with fonttools[woff] (not needed on deploy).

The original Amiri faces stay in the font stack for CMS text outside this set.
All OpenType shaping features, mark positioning and hinting are retained.
"""
from pathlib import Path
import json
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/fonts'
TEXT = 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ تَعَلَّمِ القُرْآن عِلْم'
seed = json.loads((ROOT / 'src/lib/seed-content.json').read_text())

def arabic_strings(value):
    if isinstance(value, dict):
        return ''.join(arabic_strings(item) for key, item in value.items() if key == 'arabic_title' or isinstance(item, (dict, list)))
    if isinstance(value, list):
        return ''.join(arabic_strings(item) for item in value)
    return value if isinstance(value, str) else ''

TEXT += arabic_strings(seed)
OUT.mkdir(exist_ok=True)
for weight in (400, 700):
    source = ROOT / f'node_modules/@fontsource/amiri/files/amiri-arabic-{weight}-normal.woff2'
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.layout_features = ['*']
    options.flavor = 'woff2'
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=TEXT)
    subsetter.subset(font)
    # Give the modified face its own display name while preserving attribution.
    for record in font['name'].names:
        if record.nameID in (1, 4, 6, 16):
            style = 'Bold' if weight == 700 else 'Regular'
            name = f'OQCArabicDisplay-{style}' if record.nameID == 6 else f'OQC Arabic Display {style}' if record.nameID == 4 else 'OQC Arabic Display'
            record.string = name.encode(record.getEncoding())
    font.flavor = 'woff2'
    target = OUT / f'oqc-arabic-display-{weight}.woff2'
    font.save(target)
    print(f'{weight}: {source.stat().st_size} -> {target.stat().st_size} bytes')
(OUT / 'OFL-Amiri.txt').write_text((ROOT / 'node_modules/@fontsource/amiri/LICENSE').read_text())
