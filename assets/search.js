(() => {
 const pages=[
  ["Início","index.html"],["O sindicato","sindicato.html"],["Notícias","noticias.html"],["Direitos do trabalhador","direitos.html"],["Acordos coletivos","acordos.html"],["Convênios","convenios.html"],["Publicações","publicacoes.html"],["Contato","contato.html"],["História do sindicato","sindisindi-37-anos.html"],["Saúde no trabalho e acordos","e-sindicatario-saude-acordos.html"],["Inglês no trabalho","ingles-no-trabalho.html"],["Questionário de saúde","questionario-saude.html"],["Ponto facultativo","ponto-facultativo-copa.html"],["Convenções da OIT","oit-igualdade-violencia.html"],["ACT CPERS","act-cpers.html"],["ACT CUT-RS","act-cut-rs.html"],["Acordo SENGE-RS","acordo-senge-rs.html"],["Homologações","homologacoes.html"],["Dúvidas frequentes","faq.html"],["Aviso de privacidade","privacidade.html"]
 ];
 const header=document.querySelector("header");
 if(!header||document.getElementById("site-search-form"))return;

 const section=document.createElement("section");
 section.className="site-search";
 section.setAttribute("aria-label","Pesquisa no site");
 section.innerHTML=
  '<div class="search-shell">'+
   '<form class="site-search-form" id="site-search-form" role="search" autocomplete="off">'+
    '<label class="sr-only" for="site-search-input">O que você procura?</label>'+
    '<span class="search-icon" aria-hidden="true">⌕</span>'+
    '<input id="site-search-input" type="search" placeholder="Pesquise no site: acordos, direitos, convênios, notícias…" aria-controls="site-search-results">'+
    '<span class="search-spinner" aria-hidden="true"></span>'+
    '<button type="button" class="search-clear" aria-label="Limpar pesquisa">×</button>'+
   '</form>'+
   '<div class="search-panel" id="site-search-results" aria-live="polite"><div class="search-panel-inner"></div></div>'+
  '</div>';
 header.after(section);

 const form=section.querySelector("form"),input=section.querySelector("input"),clear=section.querySelector(".search-clear"),panel=section.querySelector(".search-panel"),out=section.querySelector(".search-panel-inner");
 const norm=s=>(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
 const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

 let index,timer,seq=0;
 const load=()=>index||(index=Promise.all(pages.map(async([title,url])=>{
  try{
   const r=await fetch(url);if(!r.ok)throw 0;
   const d=new DOMParser().parseFromString(await r.text(),"text/html");
   d.querySelectorAll("script,style,nav,footer,header,.site-search").forEach(n=>n.remove());
   const root=d.querySelector("main")||d.body;const text=root.innerHTML.replace(/<[^>]+>/g," ");const ta=document.createElement("textarea");ta.innerHTML=text;const clean=ta.value.replace(/\s+/g," ").trim();
   return {title,url,text:clean,nt:norm(title),nx:norm(clean)};
  }catch{return {title,url,text:"",nt:"",nx:""};}
 })));

 const highlight=(text,terms)=>{
  let html=esc(text);
  terms.forEach(t=>{html=html.replace(new RegExp("("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi"),"<mark>$1</mark>");});
  return html;
 };
 const snippetFor=(r,terms)=>{
  let pos=-1;
  for(const t of terms){pos=r.nx.indexOf(t);if(pos>-1)break;}
  const start=Math.max(0,pos-70);
  return (start>0?"…":"")+r.text.slice(start,start+230)+(r.text.length>start+230?"…":"");
 };

 const open=()=>panel.classList.add("is-open");
 const close=()=>panel.classList.remove("is-open");
 const busy=on=>section.classList.toggle("is-loading",on);

 // Troca o conteúdo com um fade curto, sem o painel "piscar"
 const render=html=>{
  const swap=out.innerHTML!=="";
  out.classList.add("is-swapping");
  setTimeout(()=>{out.innerHTML=html;out.classList.remove("is-swapping");open();},swap?140:0);
 };

 const run=async()=>{
  const raw=input.value.trim(),q=norm(raw),mine=++seq;
  section.classList.toggle("has-value",raw.length>0);
  if(q.length<2){busy(false);close();return;}
  busy(true);
  const data=await load();
  if(mine!==seq)return;
  const terms=q.split(" ").filter(t=>t.length>1);
  const results=data.map(d=>{
   let score=0,hit=0;
   for(const t of terms){
    const count=d.nx.split(t).length-1;
    if(count)hit++;
    score+=Math.min(count,6)*(t.length>4?2:1);
    if(d.nt.includes(t))score+=5;
   }
   return {...d,score,hit};
  }).filter(d=>d.text&&d.score>0).sort((a,b)=>b.hit-a.hit||b.score-a.score).slice(0,8);
  busy(false);
  if(!results.length){
   render('<p class="search-status">Não encontramos resultados para <strong>“'+esc(raw)+'”</strong>. Tente outros termos ou use o menu.</p>');
   return;
  }
  const rawTerms=raw.split(/\s+/).filter(t=>t.length>1);
  let html='<p class="search-status">'+results.length+(results.length===1?" resultado":" resultados")+' para <strong>“'+esc(raw)+'”</strong></p><div class="search-list">';
  results.forEach((r,i)=>{
   html+='<a class="search-result" style="--i:'+i+'" href="'+r.url+'"><strong>'+highlight(r.title,rawTerms)+'</strong><span>'+highlight(snippetFor(r,terms),rawTerms)+'</span></a>';
  });
  render(html+'</div>');
 };

 input.addEventListener("input",()=>{clearTimeout(timer);section.classList.toggle("has-value",input.value.length>0);timer=setTimeout(run,160);});
 input.addEventListener("focus",()=>{load();if(out.innerHTML&&input.value.trim().length>1)open();});
 form.addEventListener("submit",e=>{e.preventDefault();clearTimeout(timer);run();});
 clear.addEventListener("click",()=>{input.value="";seq++;busy(false);section.classList.remove("has-value");close();input.focus();});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&panel.classList.contains("is-open"))clear.click();});
 document.addEventListener("click",e=>{if(!section.contains(e.target))close();});
})();

// Barra de acessibilidade, atalhos e "migalhas de pão" (padrão gov.br)
(() => {
 const html=document.documentElement,body=document.body;
 const store={get:k=>{try{return localStorage.getItem(k);}catch{return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch{}}};
 const main=document.querySelector("main");
 if(main&&!main.id){main.id="conteudo";main.tabIndex=-1;}
 const header=document.querySelector("header");
 const nav0=document.querySelector("header nav");if(nav0&&!nav0.id)nav0.id="main-navigation";
 html.classList.add("js");
 const hdr=document.querySelector("header:not(.site-header)"),tg=hdr&&hdr.querySelector(".menu-toggle");
 if(tg&&nav0){
  const setMenu=o=>{tg.setAttribute("aria-expanded",String(o));tg.setAttribute("aria-label",o?"Fechar menu":"Abrir menu");hdr.classList.toggle("menu-open",o);};
  tg.addEventListener("click",()=>setMenu(tg.getAttribute("aria-expanded")!=="true"));
  nav0.addEventListener("click",e=>{if(e.target.closest("a"))setMenu(false);});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false);});
 }
 const bar=document.createElement("div");bar.className="gov-bar";
 bar.innerHTML='<a class="skip-link" href="#conteudo">Ir para o conteúdo</a><span class="gov-hours">Atendimento: seg. a qui. 8h–12h e 13h–17h · sex. 8h–12h</span>'+
  '<div class="gov-tools" role="group" aria-label="Acessibilidade"><button type="button" data-a="dec" aria-label="Diminuir letras">A−</button><button type="button" data-a="inc" aria-label="Aumentar letras">A+</button><button type="button" data-a="hc" aria-pressed="false">Alto contraste</button></div>';
 const topline=document.querySelector(".topline");
 (topline||header).before(bar);
 let z=parseFloat(store.get("sindi_zoom")||"1")||1;
 const applyZoom=()=>{body.style.zoom=z===1?"":z;};
 const hc=store.get("sindi_hc")==="1";html.classList.toggle("hc",hc);
 bar.querySelector('[data-a="hc"]').setAttribute("aria-pressed",hc);
 applyZoom();
 bar.addEventListener("click",e=>{
  const btn=e.target.closest("button");const a=btn&&btn.dataset.a;if(!a)return;
  if(a==="inc")z=Math.min(1.3,+(z+.1).toFixed(2));
  if(a==="dec")z=Math.max(.9,+(z-.1).toFixed(2));
  if(a==="hc"){const on=!html.classList.contains("hc");html.classList.toggle("hc",on);btn.setAttribute("aria-pressed",on);store.set("sindi_hc",on?"1":"0");}
  else{store.set("sindi_zoom",String(z));applyZoom();}
 });
 const h1=document.querySelector("main h1");
 if(h1&&!/(\/|index\.html)$/.test(location.pathname)){
  const nav=document.createElement("nav");nav.className="crumbs";nav.setAttribute("aria-label","Você está em");
  const a1=document.createElement("a");a1.href="index.html";a1.textContent="Início";
  const sp=document.createElement("span");sp.textContent="›";
  const cur=document.createElement("span");cur.setAttribute("aria-current","page");cur.style.margin="0";cur.textContent=h1.textContent.length>70?h1.textContent.slice(0,67)+"…":h1.textContent;
  nav.append(a1,sp,cur);
  const after=document.querySelector(".site-search");(after||header).after(nav);
 }
})();

// Horário de funcionamento no rodapé de todas as páginas
(() => {
 const f=document.querySelector("footer");if(!f||f.querySelector(".foot-hours"))return;
 const box=f.querySelector(".wrap,.container")||f;
 const p=document.createElement("p");p.className="foot-hours";
 p.innerHTML="<strong>Horário de funcionamento:</strong> segunda a quinta, das 8h às 12h e das 13h às 17h · sexta, das 8h às 12h";
 box.append(p);
 const soc=document.createElement("p");soc.className="foot-social";
 soc.innerHTML='<strong>Siga o SINDISINDI/RS:</strong> <a href="https://www.facebook.com/sindisindirs.sindicato" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.instagram.com/sindisindi_rs/" target="_blank" rel="noopener">Instagram</a> · <a href="privacidade.html">Privacidade</a>';
 box.append(soc);
})();

// Compartilhar, tempo de leitura, formulário de contato e voltar ao topo
(() => {
 const toast=(t)=>{let n=document.getElementById("sindi-toast");if(!n){n=document.createElement("div");n.id="sindi-toast";n.setAttribute("role","status");document.body.append(n);}n.textContent=t;n.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove("on"),2400);};

 // Notícias: tempo de leitura e compartilhar
 const art=document.querySelector('main .wrap[style*="max-width"] .tag')&&document.querySelector('main .wrap[style*="max-width:820px"],main .wrap[style*="max-width: 820px"]');
 if(art&&!art.querySelector(".share")){
  const words=(art.textContent||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean).length;
  const min=Math.max(1,Math.ceil(words/200));
  const tag=art.querySelector(".tag");
  const meta=document.createElement("p");meta.className="read-time";meta.textContent="Leitura: "+min+(min===1?" minuto":" minutos");
  tag.after(meta);
  const url=location.href.split("#")[0],title=document.title.replace(/\s*\|.*$/,"");
  const box=document.createElement("div");box.className="share";
  box.innerHTML='<span>Compartilhar:</span>';
  const mk=(label,href)=>{const a=document.createElement("a");a.className="share-btn";a.textContent=label;a.href=href;a.target="_blank";a.rel="noopener";return a;};
  const wa=mk("WhatsApp","https://wa.me/?text="+encodeURIComponent(title+" "+url));
  const em=mk("E-mail","mailto:?subject="+encodeURIComponent(title)+"&body="+encodeURIComponent(title+"\n"+url));em.removeAttribute("target");
  const cp=document.createElement("button");cp.type="button";cp.className="share-btn";cp.textContent="Copiar link";
  cp.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(url);}catch{const t=document.createElement("textarea");t.value=url;document.body.append(t);t.select();try{document.execCommand("copy");}catch{}t.remove();}toast("Link copiado.");});
  box.append(wa,em,cp);
  const back=[...art.querySelectorAll("a.btn")].find(a=>/Voltar/.test(a.textContent));
  (back||art.lastElementChild).before(box);
 }

 // Formulário de contato via WhatsApp
 const form=document.getElementById("contact-form");
 if(form){
  form.noValidate=true;
  form.addEventListener("submit",e=>{
   e.preventDefault();
   const nome=form.nome.value.trim(),msg=form.elements.text.value.trim(),err=form.querySelector(".cform-err");
   if(!nome||!msg){err.hidden=false;(nome?form.elements.text:form.nome).focus();return;}
   err.hidden=true;
   const text="Olá, sou "+nome+".\nAssunto: "+form.assunto.value+"\n\n"+msg;
   window.open("https://wa.me/5551998843247?text="+encodeURIComponent(text),"_blank","noopener");
  });
 }

 // Voltar ao topo
 const up=document.createElement("button");up.type="button";up.className="to-top";up.setAttribute("aria-label","Voltar ao topo");up.innerHTML="↑";
 document.body.append(up);
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 up.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduce?"auto":"smooth"}));
 let tick=false;
 addEventListener("scroll",()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{up.classList.toggle("on",scrollY>600);tick=false;});},{passive:true});
})();
