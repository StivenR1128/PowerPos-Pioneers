from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
folder = root / 'logos-v2'
board = Image.new('RGB', (1200, 1180), '#edf2ef')
draw = ImageDraw.Draw(board)
bold = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 33)
regular = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 22)
draw.text((60, 42), 'PowerPOS / propuestas de logo', font=bold, fill='#102b27')
names = [
    ('01 / Minimalista y tecnológico', '01-minimalista'),
    ('02 / Elegante y sobrio', '02-elegante'),
    ('03 / Enérgico y llamativo', '03-energico'),
]
for i, (label, suffix) in enumerate(names):
    y = 120 + i * 340
    draw.rounded_rectangle((48, y, 1152, y + 300), radius=24, fill='#ffffff')
    draw.text((84, y + 25), label, font=regular, fill='#5b6b65')
    logo = Image.open(folder / f'logo-{suffix}.png').convert('RGBA')
    logo.thumbnail((960, 190), Image.Resampling.LANCZOS)
    board.paste(logo, (90, y + 92 + (190-logo.height)//2), logo)
board.save(root / 'comparativa-logos-v2.png', optimize=True)
