"""Comprobaciones estáticas de la web de Brisa (solo librería estándar).

Uso:  python tests/check_site.py
Sale con código 1 si algo falla.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "privacidad.html", "aviso-legal.html", "404.html"]
REQUIRED_IDS = ["inicio", "metodo", "por-que", "primera-clase", "clases",
                "testimonios", "reserva", "contacto"]
PALETTE = {"#f3ece4", "#faf7f3", "#a9b8a5", "#e3c7be", "#c98f7b", "#3b3532"}


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.imgs, self.refs, self.tags = set(), [], [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "img":
            self.imgs.append(a)
        for key in ("href", "src"):
            if key in a and a[key]:
                self.refs.append(a[key])


def parse(name):
    c = Collector()
    c.feed((ROOT / name).read_text(encoding="utf-8"))
    return c


def main():
    errors = []
    existing = [p for p in PAGES if (ROOT / p).exists()]
    if "index.html" not in existing:
        errors.append("falta index.html")
    for page in existing:
        c = parse(page)
        for img in c.imgs:
            if not img.get("alt", "").strip():
                errors.append(f"{page}: imagen sin alt: {img.get('src')}")
        for ref in c.refs:
            if re.match(r"^(https?:|mailto:|tel:|data:|javascript:)", ref):
                continue
            path, _, frag = ref.partition("#")
            if path and not (ROOT / path.lstrip("/")).exists():
                errors.append(f"{page}: enlace roto: {ref}")
            if frag and not path and frag not in c.ids:
                errors.append(f"{page}: ancla inexistente: #{frag}")
        if page == "index.html":
            for i in REQUIRED_IDS:
                if i not in c.ids:
                    errors.append(f"index.html: falta la sección #{i}")
        if "lang" not in dict(next(a for t, a in c.tags if t == "html")):
            errors.append(f"{page}: <html> sin lang")

    css = (ROOT / "styles.css").read_text(encoding="utf-8").lower()
    for hexcol in set(re.findall(r"#[0-9a-f]{3,6}\b", css)):
        if hexcol not in PALETTE:
            errors.append(f"styles.css: color fuera de paleta {hexcol}")

    for e in errors:
        print("FAIL", e)
    print(f"{len(existing)} páginas revisadas, {len(errors)} errores")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
