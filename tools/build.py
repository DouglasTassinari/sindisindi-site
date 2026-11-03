#!/usr/bin/env python3
"""Build estático do SINDISINDI/RS (sem dependências, roda em qualquer máquina com Python 3).

Uso:  python tools/build.py

O que faz (idempotente, pode rodar quantas vezes quiser):
  1. Troca a URL base (SITE_URL) em canonical, Open Graph, sitemap e robots.
  2. Reaplica partials/header.html e partials/footer.html nas páginas internas
     (marca a página atual com aria-current).
  3. Atualiza o parâmetro ?v= dos CSS/JS pelo hash do arquivo (cache-busting).
  4. Gera sitemap.xml, robots.txt e mapa-do-site.html.
  5. Usa a cartilha local (assets/docs/cartilha-assedio.pdf) se o arquivo existir.

Para trocar de domínio: edite SITE_URL abaixo (ou exporte a variável SITE_URL) e rode o build.
"""
import hashlib
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = os.environ.get("SITE_URL", "https://douglastassinari.github.io/sindisindi-site").rstrip("/")
OLD_URLS = ["https://douglastassinari.github.io/sindisindi-site"]
PRIVATE = {"admin.html", "404.html"}          # fora do sitemap
NO_PARTIALS = {"index.html", "admin.html"}    # home tem layout próprio

HDR = ("<!-- @include header -->", "<!-- @end header -->")
FTR = ("<!-- @include footer -->", "<!-- @end footer -->")
NOSCRIPT = ('<noscript><p style="margin:0;padding:10px 20px;background:#eaf6fa;color:#10364c;'
            'font-size:14px;text-align:center">A pesquisa do site precisa de JavaScript. '
            'Sem ele, use o <a href="mapa-do-site.html" style="text-decoration:underline">'
            'mapa do site</a> ou fale pelo <a href="https://wa.me/5551998843247" '
            'style="text-decoration:underline">WhatsApp</a>.</p></noscript>')
NOSCRIPT_RE = re.compile(r"<noscript><p style=\"margin:0;padding:10px 20px.*?</noscript>", re.S)


def read(p):
    return p.read_text(encoding="utf-8")


def write(p, s):
    if not p.exists() or read(p) != s:
        p.write_text(s, encoding="utf-8", newline="\n")


def digest(rel):
    f = ROOT / rel
    return hashlib.md5(f.read_bytes()).hexdigest()[:8] if f.exists() else None


def title_of(s):
    m = re.search(r"<title>(.*?)</title>", s, re.S)
    return re.sub(r"\s*\|\s*SINDISINDI/RS\s*$", "", m.group(1).strip()) if m else ""


def with_current(header, page):
    header = header.replace(' aria-current="page"', "")
    return re.sub(r'(<a href="%s")' % re.escape(page), r'\1 aria-current="page"', header, count=1)


def lastmod(page):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", page], cwd=ROOT,
                             capture_output=True, text=True).stdout.strip()
        return out or None
    except OSError:
        return None


def main():
    pages = sorted(p for p in ROOT.glob("*.html"))
    header = read(ROOT / "partials/header.html").strip()
    footer = read(ROOT / "partials/footer.html").strip()
    cartilha_local = (ROOT / "assets/docs/cartilha-assedio.pdf").exists()
    cartilha_old = "https://sindisindirs.org.br/wp-content/uploads/2025/11/cartilha-assedio-REVISADO.pdf"

    for p in pages:
        s = read(p)
        for old in OLD_URLS:
            s = s.replace(old, SITE_URL)
        if cartilha_local:
            s = s.replace(cartilha_old, "assets/docs/cartilha-assedio.pdf")
        if p.name not in NO_PARTIALS:
            for (a, b), part in ((HDR, header), (FTR, footer)):
                body = with_current(part, p.name) if a == HDR[0] else part
                s = re.sub(re.escape(a) + r".*?" + re.escape(b), lambda m: f"{a}\n{body}\n{b}", s, flags=re.S)
        if p.name != "admin.html":
            # polish.css sempre por último no <head>
            s = re.sub(r'<link rel="stylesheet" href="assets/polish\.css[^"]*">', "", s)
            s = s.replace("</head>", '<link rel="stylesheet" href="assets/polish.css"></head>', 1)
            s = re.sub(r'<div class="proto-badge">.*?</div>', "", s)
        # cache-busting pelo conteúdo do arquivo
        def bust(m):
            h = digest(m.group(1))
            return f'{m.group(1)}?v={h}' if h else m.group(0)
        s = re.sub(r'(assets/[\w./-]+\.(?:css|js))(?:\?v=\w+)?(?=")', bust, s)
        # aviso sem JavaScript logo após o cabeçalho (páginas públicas)
        if p.name not in PRIVATE and "<header" in s:
            s = NOSCRIPT_RE.sub("", s)
            s = re.sub(r"(</header>)", lambda m: m.group(1) + NOSCRIPT, s, count=1)
        write(p, s)

    # sitemap + robots
    public = [p for p in pages if p.name not in PRIVATE]
    urls = []
    for p in public:
        loc = SITE_URL + "/" + ("" if p.name == "index.html" else p.name)
        lm = lastmod(p.name)
        urls.append(f"  <url><loc>{loc}</loc>" + (f"<lastmod>{lm}</lastmod>" if lm else "") + "</url>")
    write(ROOT / "sitemap.xml",
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "\n".join(urls) + "\n</urlset>\n")
    write(ROOT / "robots.txt",
          f"User-agent: *\nAllow: /\nDisallow: /admin.html\n\nSitemap: {SITE_URL}/sitemap.xml\n")

    # mapa do site (fallback de navegação sem JavaScript)
    items = []
    for p in public:
        if p.name in ("index.html", "mapa-do-site.html"):
            continue
        items.append(f'<li><a href="{p.name}">{title_of(read(p)) or p.name}</a></li>')
    items.insert(0, '<li><a href="index.html">Início</a></li>')
    mapa = ROOT / "mapa-do-site.html"
    if mapa.exists():
        s = read(mapa)
        s = re.sub(r"(<!-- @sitemap -->).*?(<!-- @end sitemap -->)",
                   lambda m: m.group(1) + "\n" + "\n".join(items) + "\n" + m.group(2), s, flags=re.S)
        write(mapa, s)
        # a própria página precisa estar no sitemap/robots acima: rodar de novo se acabou de ser criada
    print(f"ok: {len(pages)} páginas, SITE_URL={SITE_URL}")


if __name__ == "__main__":
    sys.exit(main())
