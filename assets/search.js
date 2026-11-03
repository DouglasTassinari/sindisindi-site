(() => {
 const pages=[
  ["Início","index.html"],["O sindicato","sindicato.html"],["Notícias","noticias.html"],["Direitos do trabalhador","direitos.html"],["Acordos coletivos","acordos.html"],["Convênios","convenios.html"],["Publicações","publicacoes.html"],["Contato","contato.html"],["História do sindicato","sindisindi-37-anos.html"],["Saúde no trabalho e acordos","e-sindicatario-saude-acordos.html"],["Inglês no trabalho","ingles-no-trabalho.html"],["Questionário de saúde","questionario-saude.html"],["Ponto facultativo","ponto-facultativo-copa.html"],["Convenções da OIT","oit-igualdade-violencia.html"],["ACT CPERS","act-cpers.html"],["ACT CUT-RS","act-cut-rs.html"],["Acordo SENGE-RS","acordo-senge-rs.html"],["Homologações","homologacoes.html"]
 ];
 const form=document.getElementById("site-search-form"),input=document.getElementById("site-search-input"),out=document.getElementById("site-search-results");
 if(!form||!input||!out)return;
 const norm=s=>(s||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\\s+/g," ").trim();
 let index;
 const load=()=>index||(index=Promise.all(pages.map(async([title,url])=>{try{const r=await fetch(url);if(!r.ok)throw 0;const d=new DOMParser().parseFromString(await r.text(),"text/html");d.querySelectorAll("script,style,nav,footer,header").forEach(n=>n.remove());return {title,url,text:(d.querySelector("main")||d.body).innerText.replace(/\\s+/g," ").trim()};}catch{return {title,url,text:""};}})));
 form.addEventListener("submit",async e=>{
  e.preventDefault();const q=norm(input.value);if(!q)return;out.replaceChildren();const status=document.createElement("p");status.className="search-status";status.textContent="Pesquisando no conteúdo do site…";out.append(status);
  const terms=q.split(" ").filter(t=>t.length>1);const data=await load();const results=data.map(d=>{const text=norm(d.title+" "+d.text);let score=0;for(const t of terms){const count=text.split(t).length-1;score+=Math.min(count,6)*(t.length>4?2:1);if(norm(d.title).includes(t))score+=5;}return {...d,score};}).filter(d=>d.text&&d.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
  out.replaceChildren();if(!results.length){const empty=document.createElement("p");empty.className="search-status";empty.textContent="Não encontramos resultados. Tente outros termos ou navegue pelas opções do menu.";out.append(empty);return;}
  const heading=document.createElement("p");heading.className="search-status";heading.textContent=results.length+" resultado(s) encontrado(s):";out.append(heading);
  results.forEach(r=>{const card=document.createElement("article");card.className="search-result";const a=document.createElement("a");a.href=r.url;a.textContent=r.title;const snippet=document.createElement("p");const pos=norm(r.text).indexOf(terms[0]);snippet.textContent=r.text.slice(Math.max(0,pos-75),Math.max(0,pos-75)+230)+(r.text.length>230?"…":"");card.append(a,snippet);out.append(card);});
 });
})();
