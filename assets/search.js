(() => {
 const pages=[
  ["Início","index.html"],["O sindicato","sindicato.html"],["Notícias","noticias.html"],["Direitos do trabalhador","direitos.html"],["Acordos coletivos","acordos.html"],["Convênios","convenios.html"],["Publicações","publicacoes.html"],["Contato","contato.html"],["História do sindicato","sindisindi-37-anos.html"],["Saúde no trabalho e acordos","e-sindicatario-saude-acordos.html"],["Inglês no trabalho","ingles-no-trabalho.html"],["Questionário de saúde","questionario-saude.html"],["Ponto facultativo","ponto-facultativo-copa.html"],["Convenções da OIT","oit-igualdade-violencia.html"],["ACT CPERS","act-cpers.html"],["ACT CUT-RS","act-cut-rs.html"],["Acordo SENGE-RS","acordo-senge-rs.html"],["Homologações","homologacoes.html"]
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
