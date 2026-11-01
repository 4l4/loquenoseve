"""Extracts text from plot.svg (Miro export) as positioned lines and text blocks.

Usage: python3 scripts/plot_extract.py [plot.svg] [out.json]

Each block = consecutive lines of one Miro sticker/box. Lines that Miro renders with a
yellow highlight rectangle (#fff6b6) are marked as "hl": that is how edits are flagged on the board.
Prints the blocks in reading order (top to bottom, then left to right).
"""
import json
import re
import sys
import xml.etree.ElementTree as ET

SRC = sys.argv[1] if len(sys.argv) > 1 else 'plot.svg'
OUT = sys.argv[2] if len(sys.argv) > 2 else None
HIGHLIGHT = '#fff6b6'
NS = '{http://www.w3.org/2000/svg}'


def translate(el):
    m = re.search(r'translate\(\s*([-\d.e]+)[ ,]+([-\d.e]+)', el.get('transform', ''))
    return (float(m.group(1)), float(m.group(2))) if m else (0.0, 0.0)


lines = []


def walk(el, ox, oy):
    dx, dy = translate(el)
    ox, oy = ox + dx, oy + dy
    highlighted_rows = set()
    for child in el:
        tag = child.tag.replace(NS, '')
        if tag == 'rect' and child.get('fill') == HIGHLIGHT:
            highlighted_rows.add(round(translate(child)[1]))
        elif tag == 'text':
            text = re.sub(r'\s+', ' ', ''.join(child.itertext()).replace('​', '')).strip()
            if not text:
                continue
            x, y = float(child.get('x', 0)), float(child.get('y', 0))
            size = float(child.get('font-size', 16))
            top = round(y - size)  # the highlight rect starts at the line top
            hl = any(abs(top - r) <= size for r in highlighted_rows)
            lines.append({
                'x': round(ox + x), 'y': round(oy + y), 'w': round(float(child.get('width', 0))),
                'size': size, 'bold': child.get('font-weight') == 'bold', 'hl': hl, 't': text,
            })
        elif tag not in ('style', 'defs', 'clipPath'):
            walk(child, ox, oy)


walk(ET.parse(SRC).getroot(), 0, 0)
lines.sort(key=lambda l: (l['y'], l['x']))

# Group into blocks: next line close below and horizontally overlapping, or same baseline right after.
blocks = []
for ln in lines:
    for b in reversed(blocks[-12:]):
        last = b[-1]
        below = 0 < ln['y'] - last['y'] <= last['size'] * 1.6
        overlap = not (ln['x'] > last['x'] + last['w'] or ln['x'] + ln['w'] < last['x'])
        same_row = ln['y'] == last['y'] and 0 <= ln['x'] - (last['x'] + last['w']) < 30
        if (below and overlap) or same_row:
            b.append(ln)
            break
    else:
        blocks.append([ln])

result = [{
    'x': b[0]['x'], 'y': b[0]['y'],
    'text': ' '.join(l['t'] for l in b),
    'bold_first': b[0]['bold'],
    'hl': any(l['hl'] for l in b),
} for b in blocks]

if OUT:
    json.dump(result, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for i, b in enumerate(result):
    print(f"{i:3} {'*' if b['hl'] else ' '} y={b['y']:6} x={b['x']:5}  {b['text']}")
