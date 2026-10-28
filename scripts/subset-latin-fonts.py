"""Optional fonttools[woff] task. Outputs are committed, not rebuilt on deploy.

Retain variable axes, shaping and metrics. The original Latin and extended
fonts remain on-demand fallbacks for names/characters outside this common set.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
out = root / 'public/fonts'
text = ''.join(map(chr, range(32, 127))) + '\u00a0\u202f£€©®™’‘“”–—…·•×÷✓→½¼¾éáíóúüöäñçøå'
for name in ('inter', 'outfit'):
    source = root / f'node_modules/@fontsource-variable/{name}/files/{name}-latin-wght-normal.woff2'
    original = TTFont(source, recalcTimestamp=False)
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.layout_features = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)
    for record in font['name'].names:
        if record.nameID in (1, 4, 6, 16):
            label = f'OQC{name.title()}Text' if record.nameID == 6 else f'OQC {name.title()} Text'
            record.string = label.encode(record.getEncoding())
    font.flavor = 'woff2'
    target = out / f'oqc-{name}-text-v1.woff2'
    font.save(target)
    # Verify the generated file's default advances and variable weight range.
    generated = TTFont(target)
    for code, glyph in generated.getBestCmap().items():
        original_glyph = original.getBestCmap()[code]
        assert generated['hmtx'][glyph] == original['hmtx'][original_glyph], (name, code)
    assert [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in generated['fvar'].axes] == [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in original['fvar'].axes]
    (out / f'OFL-{name.title()}.txt').write_text((root / f'node_modules/@fontsource-variable/{name}/LICENSE').read_text())
    print(f'{name}: {source.stat().st_size} -> {target.stat().st_size} bytes; glyph metrics and axes match')
