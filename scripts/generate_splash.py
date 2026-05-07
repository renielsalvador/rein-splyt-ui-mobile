#!/usr/bin/env python3
"""Generates android/app/src/main/res/drawable/splash.png.

Composites the Splyt white logo and bold "Splyt" text onto a transparent
canvas. The layer-list drawable (splash_bg.xml) provides the green background.
"""
import os
from PIL import Image, ImageDraw, ImageFont

LOGO_SIZE = 200
TEXT = "Splyt"
FONT_SIZE = 72
GAP = 24
PADDING = 48

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

logo_path = os.path.join(project_root, 'assets', 'branding', 'splyt-app-icon-no-bg-white.png')
out_path = os.path.join(
    project_root, 'android', 'app', 'src', 'main', 'res', 'drawable', 'splash.png'
)

logo = Image.open(logo_path).convert('RGBA')
logo = logo.resize((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)

font_candidates = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]
font = None
for fp in font_candidates:
    try:
        font = ImageFont.truetype(fp, FONT_SIZE)
        print(f'Font: {fp}')
        break
    except (IOError, OSError):
        continue
if font is None:
    font = ImageFont.load_default()
    print('Warning: using default font')

probe = Image.new('RGBA', (1, 1))
bbox = ImageDraw.Draw(probe).textbbox((0, 0), TEXT, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]

canvas_w = max(LOGO_SIZE, text_w) + PADDING * 2
canvas_h = LOGO_SIZE + GAP + text_h + PADDING * 2
canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

logo_x = (canvas_w - LOGO_SIZE) // 2
canvas.paste(logo, (logo_x, PADDING), logo)

draw = ImageDraw.Draw(canvas)
text_x = (canvas_w - text_w) // 2
text_y = PADDING + LOGO_SIZE + GAP - bbox[1]
draw.text((text_x, text_y), TEXT, font=font, fill=(255, 255, 255, 255))

os.makedirs(os.path.dirname(out_path), exist_ok=True)
canvas.save(out_path, 'PNG')
print(f'Saved: {out_path} ({canvas_w}x{canvas_h}px)')
