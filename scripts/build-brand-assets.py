"""Build portable, outlined brand vectors from the canonical mark and pinned font.
Optional authoring dependency: fonttools[woff]. Runtime/build does not require Python.
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[1]
identity = json.loads((ROOT / 'src/brand/identity.json').read_text())
output = ROOT / 'public/brand'
font = TTFont(ROOT / 'node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
scale = 48 / font['head'].unitsPerEm
x = 82
paths = []
for char in identity['name']:
    glyph = cmap[ord(char)]
    pen = SVGPathPen(glyphs)
    glyphs[glyph].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 56)))
    paths.append(pen.getCommands())
    x += font['hmtx'][glyph][0] * scale - 1
wordmark = ''.join(paths)
width = round(x + 8)
mark = identity['markPath']
colours = identity['palette']
for variant, symbol, text in [('forest', colours['pine'], colours['ink']),('reverse',colours['mint'],'#EBF4EE'),('black','#000000','#000000'),('white','#FFFFFF','#FFFFFF')]:
    content = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 80" role="img" aria-label="Ambientis"><path transform="translate(4 8)" d="{mark}" fill="{symbol}"/><path d="{wordmark}" fill="{text}"/></svg>'
    (output/f'ambientis-logo-{variant}.svg').write_text(content)
    (output/f'ambientis-symbol-{variant}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Ambientis"><path d="{mark}" fill="{symbol}"/></svg>')
adaptive=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 80" aria-hidden="true"><style>.mark{{fill:{colours["pine"]}}}.name{{fill:{colours["ink"]}}}@media(prefers-color-scheme:dark){{.mark{{fill:{colours["mint"]}}}.name{{fill:#EBF4EE}}}}</style><path class="mark" transform="translate(4 8)" d="{mark}"/><path class="name" d="{wordmark}"/></svg>'
(output/'ambientis-logo-adaptive.svg').write_text(adaptive)
app=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="{colours["pine"]}"/><path transform="translate(24 22) scale(1.25)" d="{mark}" fill="{colours["paper"]}"/></svg>'
(output/'ambientis-app-icon.svg').write_text(app)
(ROOT/'src/app/icon.svg').write_text(app)
# All glyphs are paths; the wordmark remains portable without font installation.
(output/'ambientis-contour-pattern.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="{colours["pine"]}"/><g fill="none" stroke="{colours["mint"]}" stroke-width="2" opacity=".45">'+''.join(f'<path transform="translate({430-i*12} {-100+i*12}) scale({8+i*.15})" d="{mark}"/>' for i in range(9))+'</g></svg>')
print(f'Brand vectors built: {width}×80 outlined lockup and 64×64 symbol')
