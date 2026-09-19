"""Crea fichas visuales para el catálogo comercial de PowerPOS."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
LOGO = ROOT / "marketing" / "logo-powerpos-oficial.png"
SHOTS = ROOT / "landing" / "dist" / "assets"
FONT = Path("C:/Windows/Fonts/segoeui.ttf")
BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")
GREEN = "#103b2d"
ORANGE = "#ff6b28"
MINT = "#eaf3ed"
WHITE = "#ffffff"


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def card(filename, eyebrow, title, subtitle, shot, badge):
    im = Image.new("RGB", (1080, 1080), MINT)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((36, 36, 1044, 1044), radius=48, fill=WHITE)
    brand = Image.open(LOGO).convert("RGBA")
    brand.thumbnail((360, 126), Image.Resampling.LANCZOS)
    im.paste(brand, (76, 68), brand)
    d.text((78, 194), eyebrow.upper(), font=font(25, True), fill=ORANGE)
    y = 238
    for line in title:
        d.text((74, y), line, font=font(62, True), fill=GREEN)
        y += 71
    d.text((78, y + 11), subtitle, font=font(28), fill=GREEN)
    left, top, right, bottom = 77, 495, 1003, 891
    width, height = right - left, bottom - top
    raw = Image.open(SHOTS / f"{shot}.png").convert("RGB")
    if shot == "cocina":
        panel = Image.new("RGB", (width, height), "#101720")
        closeup = raw.crop((14, 70, 390, 385))
        closeup = closeup.resize((466, height), Image.Resampling.LANCZOS)
        panel.paste(closeup, (0, 0))
        pd = ImageDraw.Draw(panel)
        pd.text((500, 85), "PEDIDOS", font=font(31, True), fill=ORANGE)
        pd.text((500, 136), "claros para", font=font(38, True), fill=WHITE)
        pd.text((500, 185), "tu cocina", font=font(38, True), fill=WHITE)
        pd.text((500, 265), "Vista del sistema", font=font(25), fill="#b9cec3")
        raw = panel
    else:
        raw = raw.crop((0, 0, raw.width, min(raw.height, 630)))
        raw = raw.resize((width, height), Image.Resampling.LANCZOS)
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width, height), radius=25, fill=255)
    im.paste(raw, (left, top), mask)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((76, 929, 409, 996), radius=22, fill=GREEN)
    d.text((97, 944), badge, font=font(25, True), fill=WHITE)
    d.text((425, 954), "Datos de demostración", font=font(20), fill=GREEN)
    d.text((748, 946), "POWERPOS", font=font(23, True), fill=GREEN)
    im.save(OUT / filename, optimize=True)


if __name__ == "__main__":
    card("01-sistema-pos.png", "Software para negocios", ["PowerPOS", "Sistema POS"], "Ventas, productos, caja y reportes", "pos", "Sistema en piloto")
    card("02-restaurantes-bares.png", "Para gastronomía", ["PowerPOS para", "restaurantes y bares"], "Pedidos y vista de cocina", "cocina", "Vista de cocina")
    card("03-comercios.png", "Para comercio", ["PowerPOS para", "tu comercio"], "Organiza productos y registra ventas", "pos", "Punto de venta")
