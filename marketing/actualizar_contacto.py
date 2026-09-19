"""Actualiza el número comercial en la landing y el kit social."""

from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
files = [
    root / "landing" / "README.md",
    root / "landing" / "dist" / "index.html",
    root / "landing" / "dist" / "app.js",
    root / "marketing" / "guia-publicacion.md",
]

if len(sys.argv) != 3:
    raise SystemExit("Uso: actualizar_contacto.py NUMERO_ANTERIOR NUMERO_NUEVO (dígitos con indicativo)")

old, new = sys.argv[1:]
if not (old.isdigit() and new.isdigit() and len(new) >= 10):
    raise SystemExit("Usa números completos en dígitos, sin + ni espacios.")

def display(number):
    if number.startswith("57") and len(number) == 12:
        return f"+57 {number[2:5]} {number[5:8]} {number[8:]}"
    return f"+{number}"

total = 0
for path in files:
    content = path.read_text(encoding="utf-8")
    updated = content.replace(old, new).replace(display(old), display(new))
    count = content.count(old) + content.count(display(old))
    if count:
        path.write_text(updated, encoding="utf-8")
    print(f"{path.relative_to(root)}: {count}")
    total += count

if not total:
    raise SystemExit("No encontré el número anterior; no hubo cambios.")
