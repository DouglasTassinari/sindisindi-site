"""Gera as páginas de notícias a partir de data/noticias.json.

Chamado por tools/build.py. Cria um HTML por artigo, monta a lista em noticias.html
e atualiza os 3 destaques da home. Para publicar uma notícia nova: acrescente um item
em data/noticias.json (e a imagem em assets/news/) e rode `python tools/build.py`.
"""
import html as H
import json
import re
from pathlib import Path

MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
         "agosto", "setembro", "outubro", "novembro", "dezembro"]


def data_br(iso):
    y, m, d = iso.split("-")
    return f"{int(d)} de {MESES[int(m) - 1]} de {y}"


def esc(s):
    return H.escape(s, quote=True)


def head(titulo, resumo, arquivo, capa, site_url):
    og = f'<meta property="og:image" content="{site_url}/{capa}">' if capa else ""
    return (
        '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<meta name="description" content="{esc(resumo)}">'
        f"<title>{esc(titulo)} | SINDISINDI/RS</title>"
        '<link rel="stylesheet" href="assets/base.css"><link rel="stylesheet" href="assets/site.css">'
        '<link rel="stylesheet" href="assets/impact.css"><link rel="stylesheet" href="assets/search.css">'
        '<meta property="og:type" content="article"><meta property="og:site_name" content="SINDISINDI/RS">'
        '<meta property="og:locale" content="pt_BR">'
        f'<meta property="og:title" content="{esc(titulo)} | SINDISINDI/RS">'
        f'<meta property="og:description" content="{esc(resumo)}">'
        f'<meta property="og:url" content="{site_url}/{arquivo}">{og}'
        '<meta name="twitter:card" content="summary_large_image">'
        f'<link rel="canonical" href="{site_url}/{arquivo}"></head><body>'
        "<!-- @include header -->\n<!-- @end header -->"
    )


TAIL = ('<!-- @include footer -->\n<!-- @end footer -->'
        '<link rel="stylesheet" href="assets/assistant.css"><script src="assets/assistant.js" defer></script>'
        '<script src="assets/search.js" defer></script></body></html>')


def render_article(d, todos, site_url):
    capa = d.get("capa")
    corpo = d["html"]
    figura = ""
    if capa and capa not in corpo:
        figura = f'<figure class="article-cover"><img src="{capa}" alt="" loading="eager"></figure>'
    rel = [x for x in todos if x["arquivo"] != d["arquivo"] and x["categoria"] == d["categoria"]][:3]
    if len(rel) < 3:
        rel += [x for x in todos if x["arquivo"] != d["arquivo"] and x not in rel][: 3 - len(rel)]
    rel_html = "".join(
        f'<li><a href="{x["arquivo"]}"><span>{data_br(x["data"])}</span>{esc(x["titulo"])}</a></li>' for x in rel)
    autor = f" · por {esc(d['autor'])}" if d.get("autor") else ""
    main = (
        f'<main><section class="hero article-hero"><div class="wrap"><small>{esc(d["categoria"])} · {data_br(d["data"])}</small>'
        f'<h1>{esc(d["titulo"])}</h1></div></section>'
        '<section><div class="wrap" style="max-width:820px">'
        f'<div class="tag">{esc(d["categoria"])}</div>'
        f'<p class="article-meta">Publicado em {data_br(d["data"])}{autor}</p>'
        f'{figura}<div class="article-body">{corpo}</div>'
        f'<div class="article-more"><h2>Leia também</h2><ul>{rel_html}</ul></div>'
        '<a class="btn" href="noticias.html">Voltar às notícias</a></div></section></main>'
    )
    return head(d["titulo"], d["resumo"], d["arquivo"], capa, site_url) + main + TAIL


def card(d):
    capa = d.get("capa")
    img = (f'<a class="news-cover" href="{d["arquivo"]}" tabindex="-1" aria-hidden="true">'
           f'<img src="{capa}" alt="" loading="lazy"></a>') if capa else ""
    return (
        f'<article class="card news-item" data-y="{d["data"][:4]}" data-c="{esc(d["categoria"])}" '
        f'data-n="{esc(d["titulo"])} {esc(d["resumo"])}">{img}'
        f'<div class="tag">{esc(d["categoria"])} · {data_br(d["data"])}</div>'
        f'<h3><a href="{d["arquivo"]}">{esc(d["titulo"])}</a></h3><p>{esc(d["resumo"])}</p>'
        f'<a class="btn" href="{d["arquivo"]}">Ler notícia</a></article>')


def render_all(root: Path, site_url: str):
    f = root / "data/noticias.json"
    if not f.exists():
        return []
    docs = json.loads(f.read_text(encoding="utf-8"))
    docs.sort(key=lambda d: d["data"], reverse=True)
    for d in docs:
        out = root / d["arquivo"]
        page = render_article(d, docs, site_url)
        if not out.exists() or out.read_text(encoding="utf-8") != page:
            out.write_text(page, encoding="utf-8", newline="\n")

    # lista em noticias.html
    anos = sorted({d["data"][:4] for d in docs}, reverse=True)
    ychips = "".join(f'<button type="button" class="chip" data-y="{a}">{a}</button>' for a in anos)
    cards = "\n".join(card(d) for d in docs)
    p = root / "noticias.html"
    s = p.read_text(encoding="utf-8")
    if "<!-- @news -->" not in s:
        m = re.search(r"<main>.*?</main>", s, re.S)
        novo = (
            '<main><section class="hero"><div class="wrap"><small>SINDISINDI/RS · Desde 1989</small><h1>Notícias</h1>'
            "<p>Informação, mobilização e atualizações sobre o mundo do trabalho e a atuação sindical.</p></div></section>"
            '<section class="band"><div class="wrap">'
            '<div class="ac-tools"><label class="sr-only" for="nq">Buscar notícia</label>'
            '<input id="nq" class="filter" type="search" placeholder="Buscar notícia por palavra…" autocomplete="off">'
            '<p class="ac-count" id="n-count" role="status" aria-live="polite"></p></div>'
            '<div class="ac-chips" id="n-ychips" role="group" aria-label="Filtrar por ano"><span class="ac-lbl">Ano</span>'
            '<button type="button" class="chip on" data-y="">Todos</button><!-- @news-ychips --><!-- @end news-ychips --></div>'
            '<div class="ac-chips" id="n-cchips" role="group" aria-label="Filtrar por tipo"><span class="ac-lbl">Tipo</span>'
            '<button type="button" class="chip on" data-c="">Todas</button><button type="button" class="chip" data-c="Destaques">Destaques</button></div>'
            '<div class="grid news-list" id="n-grid"><!-- @news -->\n<!-- @end news --></div>'
            '<p class="ac-empty" id="n-empty" hidden>Nenhuma notícia encontrada. Tente outra palavra ou limpe os filtros.</p>'
            '<p style="text-align:center;margin-top:24px"><button type="button" class="btn" id="n-more" hidden>Mostrar mais notícias</button></p>'
            '</div></section><script src="assets/noticias.js" defer></script></main>'
        )
        s = s[: m.start()] + novo + s[m.end():]
        s = re.sub(r'<script src="assets/news\.js[^"]*"[^>]*></script>', "", s)
    s = re.sub(r"(<!-- @news -->).*?(<!-- @end news -->)",
               lambda m: m.group(1) + "\n" + cards + "\n" + m.group(2), s, flags=re.S)
    s = re.sub(r"(<!-- @news-ychips -->).*?(<!-- @end news-ychips -->)",
               lambda m: m.group(1) + ychips + m.group(2), s, flags=re.S)
    p.write_text(s, encoding="utf-8", newline="\n")

    # destaques da home (3 mais recentes marcados como Destaques)
    ix = root / "index.html"
    h = ix.read_text(encoding="utf-8")
    top = [d for d in docs if d["categoria"] == "Destaques" and d.get("capa")][:3]
    itens = "".join(
        f'<article class="news-card"><img src="{d["capa"]}" alt="" loading="lazy"><div>'
        f'<p class="eyebrow">{data_br(d["data"])}</p><h3>{esc(d["titulo"])}</h3><p>{esc(d["resumo"][:140].rsplit(" ", 1)[0])}…</p>'
        f'<a href="{d["arquivo"]}">Leia mais →</a></div></article>' for d in top)
    h = re.sub(r'(<div class="news-grid">).*?(</div>\s*<div class="actions"><a class="button outline" href="noticias\.html">)',
               lambda m: m.group(1) + "\n   " + itens + "\n  " + m.group(2), h, count=1, flags=re.S)
    ix.write_text(h, encoding="utf-8", newline="\n")
    return docs
