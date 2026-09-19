"""Genera piezas PNG de PowerPOS a partir de capturas reales de demostración."""

from pathlib import Path
from shutil import copyfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
SHOTS = ROOT / "landing" / "dist" / "assets"
NEW_ICON = ROOT / "marketing" / "logos-v2" / "icono-01-minimalista.png"
OFFICIAL_LOGO = ROOT / "marketing" / "logo-powerpos-oficial.png"
FONT = Path("C:/Windows/Fonts/segoeui.ttf")
BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")

INK = "#102b27"
ORANGE = "#ff713d"
CREAM = "#f5f7f4"
MUTED = "#b9cec3"
WHITE = "#ffffff"


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def logo(canvas, draw, x, y, size=100):
    draw.rounded_rectangle((x, y, x + size, y + size), radius=size * .22, fill=WHITE)
    pad = round(size * .11)
    icon = Image.open(NEW_ICON).convert("RGBA").resize((size-pad*2, size-pad*2), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icon, (x+pad, y+pad))


def brand(canvas, draw, x, y, height):
    art = Image.open(OFFICIAL_LOGO).convert("RGBA")
    art_h = height - 20
    art_w = round(art.width * art_h / art.height)
    art = art.resize((art_w, art_h), Image.Resampling.LANCZOS)
    draw.rounded_rectangle((x, y, x + art_w + 32, y + height), radius=18, fill=WHITE)
    canvas.alpha_composite(art, (x + 16, y + 10))


def wordmark(draw, x, y, size=48, color=WHITE):
    f = font(size, True)
    draw.text((x, y), "Power", font=f, fill=color)
    width = draw.textlength("Power", font=f)
    draw.text((x + width, y), "POS", font=f, fill=ORANGE)


def lines(draw, xy, content, size, spacing, color=WHITE, bold=True):
    f = font(size, bold)
    x, y = xy
    for row in content:
        draw.text((x, y), row, font=f, fill=color)
        y += spacing


def screenshot(canvas, name, box, angle=-3):
    raw = Image.open(SHOTS / f"{name}.png").convert("RGB")
    x, y, width, height = box
    content = Image.new("RGBA", (width + 34, height + 34), (0, 0, 0, 0))
    sh = Image.new("RGBA", content.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle((16, 16, width + 16, height + 16), radius=26, fill=(0, 0, 0, 100))
    content.alpha_composite(sh.filter(ImageFilter.GaussianBlur(16)))
    frame = Image.new("RGBA", (width, height), WHITE)
    d = ImageDraw.Draw(frame)
    d.rounded_rectangle((0, 0, width-1, height-1), radius=20, fill=WHITE)
    d.rounded_rectangle((0, 0, width-1, 42), radius=20, fill="#e9eee9")
    for i, c in enumerate((ORANGE, "#d3ddd5", "#d3ddd5")):
        d.ellipse((17+i*19, 16, 27+i*19, 26), fill=c)
    crop = raw.crop((0, 0, raw.width, min(raw.height, int(raw.width * .57))))
    crop = crop.resize((width, height-43), Image.Resampling.LANCZOS)
    frame.alpha_composite(crop.convert("RGBA"), (0, 43))
    content.alpha_composite(frame, (16, 16))
    rotated = content.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    canvas.alpha_composite(rotated, (x, y))


def post(filename, label, headline, detail, shot, n):
    im = Image.new("RGBA", (1080, 1080), INK)
    d = ImageDraw.Draw(im)
    d.ellipse((760, -210, 1230, 260), fill="#19483e")
    brand(im, d, 66, 58, 95)
    d.text((68, 173), label.upper(), font=font(22, True), fill=ORANGE)
    lines(d, (65, 219), headline, 70, 79)
    lines(d, (68, 408), detail, 29, 40, MUTED, False)
    screenshot(im, shot, (86, 560, 920, 470))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((68, 985, 450, 1041), radius=13, fill=ORANGE)
    d.text((91, 995), "Solicita una demo", font=font(27, True), fill=INK)
    d.text((819, 1003), f"0{n} / 03", font=font(21, True), fill=WHITE)
    im.convert("RGB").save(OUT / filename, optimize=True)


def cover():
    im = Image.new("RGBA", (1640, 624), INK)
    d = ImageDraw.Draw(im)
    d.ellipse((1100, -340, 1830, 390), fill="#19483e")
    brand(im, d, 110, 72, 100)
    lines(d, (110, 206), ["Tu negocio.", "Todo bajo control."], 62, 75)
    lines(d, (113, 375), ["Ventas, caja y reportes en un solo sistema.", "Conoce PowerPOS en una demo personalizada."], 27, 42, MUTED, False)
    d.rounded_rectangle((110, 507, 550, 574), radius=13, fill=ORANGE)
    d.text((138, 521), "Escríbenos para una demo", font=font(27, True), fill=INK)
    screenshot(im, "pos", (1010, 162, 680, 390), -4)
    im.convert("RGB").save(OUT / "portada-facebook-oficial.png", optimize=True)


def story():
    im = Image.new("RGBA", (1080, 1920), INK)
    d = ImageDraw.Draw(im)
    d.ellipse((620, -290, 1400, 500), fill="#19483e")
    brand(im, d, 85, 110, 108)
    d.text((86, 309), "DE LA VENTA A LA DECISIÓN", font=font(25, True), fill=ORANGE)
    lines(d, (80, 370), ["Tu negocio.", "Todo bajo", "control."], 102, 119)
    lines(d, (88, 790), ["Ventas, caja y reportes", "en un solo sistema."], 43, 61, MUTED, False)
    screenshot(im, "reportes", (85, 1040, 1040, 590), -3)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((84, 1740, 735, 1840), radius=18, fill=ORANGE)
    d.text((121, 1763), "Solicita una demo", font=font(43, True), fill=INK)
    im.convert("RGB").save(OUT / "historia-vertical-oficial.png", optimize=True)


def avatar():
    copyfile(ROOT / "marketing" / "perfil-powerpos-oficial.png", OUT / "perfil-powerpos-final.png")


def horizontal_logo():
    copyfile(ROOT / "marketing" / "logo-powerpos-oficial.png", OUT / "logo-powerpos-horizontal-final.png")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    avatar()
    horizontal_logo()
    cover()
    post("post-01-presentacion-oficial.png", "Conoce PowerPOS", ["Más claridad", "en cada venta."], ["Registra ventas y organiza tus productos", "desde un mismo punto de venta."], "pos", 1)
    post("post-02-cocina-oficial.png", "Para negocios gastronómicos", ["Caja y cocina", "conectadas."], ["Sigue los pedidos en la pantalla de cocina", "y actualiza su estado en tiempo real."], "cocina", 2)
    post("post-03-reportes-oficial.png", "Decide con información", ["Entiende mejor", "tu operación."], ["Consulta ventas y reportes para seguir", "el movimiento de tu negocio."], "reportes", 3)
    story()
