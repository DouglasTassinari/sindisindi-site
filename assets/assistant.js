(() => {
  const phone = "5551998843247";
  const pages = [
    ["Início","index.html"],["O sindicato","sindicato.html"],["Notícias","noticias.html"],
    ["Direitos","direitos.html"],["Acordos coletivos","acordos.html"],["Convênios","convenios.html"],
    ["Publicações","publicacoes.html"],["Contato","contato.html"],
    ["História do sindicato","sindisindi-37-anos.html"],["Saúde e acordos","e-sindicatario-saude-acordos.html"],
    ["Inglês no trabalho","ingles-no-trabalho.html"],["Questionário de saúde","questionario-saude.html"],
    ["Ponto facultativo","ponto-facultativo-copa.html"],["OIT: igualdade e violência","oit-igualdade-violencia.html"],
    ["ACT CPERS","act-cpers.html"],["ACT CUT-RS","act-cut-rs.html"],
    ["Acordo SENGE-RS","acordo-senge-rs.html"],["Homologações","homologacoes.html"]
  ];
  const norm = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  const stop = new Set(["para","como","qual","quais","uma","com","por","que","dos","das","sobre","onde","quando","sindicato","sindisindi"]);
  let index = [], ready = false;
  const shell = document.createElement("div");
  shell.id = "sind-assistant";
  shell.innerHTML = `
    <a class="sind-wa-float" href="https://wa.me/${phone}?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20o%20SINDISINDI%2FRS." target="_blank" rel="noopener" aria-label="Fale com o sindicato pelo WhatsApp"><span class="wa-symbol">◉</span><span>Fale com o sindicato</span></a>
    <button class="sind-chat-launch" aria-label="Abrir assistente do site"><span>?</span><b>Como podemos ajudar?</b></button>
    <section class="sind-chat-panel" aria-label="Assistente virtual" hidden>
      <header class="sind-chat-head"><div><strong>Assistente SINDISINDI/RS</strong><small>Pesquise informações no site</small></div><button class="sind-chat-close" aria-label="Fechar">×</button></header>
      <div class="sind-chat-messages"><div class="sind-msg bot">Olá! Posso ajudar a localizar notícias, acordos, convênios, publicações e informações institucionais. O que você procura?</div></div>
      <form class="sind-chat-form"><input aria-label="Digite sua dúvida" placeholder="Digite sua dúvida..." autocomplete="off" required><button type="submit">Enviar</button></form>
      <div class="sind-chat-foot">Busca no conteúdo publicado neste site. Para atendimento direto, use o WhatsApp.</div>
    </section>`;
  document.body.appendChild(shell);
  const panel = shell.querySelector(".sind-chat-panel"), launch=shell.querySelector(".sind-chat-launch"), messages=shell.querySelector(".sind-chat-messages"), form=shell.querySelector("form"), input=form.querySelector("input");
  launch.onclick=()=>{panel.hidden=false;launch.hidden=true;input.focus();};
  shell.querySelector(".sind-chat-close").onclick=()=>{panel.hidden=true;launch.hidden=false;};
  const add=(text,who="bot",html=false)=>{const el=document.createElement("div");el.className="sind-msg "+who;if(html)el.innerHTML=text;else el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;};
  const load=async()=>{if(ready)return;ready=true;index=await Promise.all(pages.map(async ([title,url])=>{try{const r=await fetch(url);if(!r.ok)throw 0;const h=await r.text();const d=new DOMParser().parseFromString(h,"text/html");d.querySelectorAll("script,style,nav,footer,header").forEach(x=>x.remove());return {title,url,text:(d.body?.innerText||"").replace(/\s+/g," ").trim()};}catch(e){return {title,url,text:""};}}));};
  const answer=async q=>{await load();const terms=norm(q).split(" ").filter(w=>w.length>2&&!stop.has(w));if(!terms.length)return null;
    const ranked=index.map(p=>{const t=norm(p.text);let score=terms.reduce((n,w)=>n+(t.split(w).length-1),0);if(norm(p.title).split(" ").some(w=>terms.includes(w)))score+=4;return {...p,score};}).filter(p=>p.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
    if(!ranked.length)return null;
    return ranked.map(p=>{const raw=p.text;const nt=norm(raw);let at=0;for(const w of terms){const i=nt.indexOf(w);if(i>=0){at=Math.max(0,i-180);break;}}const excerpt=raw.slice(at,at+390).trim();return {title:p.title,url:p.url,excerpt};});
  };
  form.addEventListener("submit",async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;add(q,"user");input.value="";const wait=document.createElement("div");wait.className="sind-msg bot";wait.textContent="Estou pesquisando o conteúdo do site...";messages.appendChild(wait);messages.scrollTop=messages.scrollHeight;
    const results=await answer(q);wait.remove();
    if(!results){add("Não encontrei uma resposta clara nas páginas publicadas. Para não passar uma informação incorreta, fale diretamente com o sindicato pelo WhatsApp.");add("Abrir WhatsApp: https://wa.me/"+phone+"?text="+encodeURIComponent("Olá, tenho uma dúvida e gostaria de falar com o SINDISINDI/RS."),"bot");return;}
    add("Encontrei estas informações no site:");
    results.forEach(r=>{const el=document.createElement("div");el.className="sind-result";const a=document.createElement("a");a.href=r.url;a.textContent=r.title;a.target="_self";const p=document.createElement("p");p.textContent=r.excerpt+(r.excerpt.length>=390?"…":"");el.append(a,p);messages.appendChild(el);});
    add("Se sua dúvida exigir orientação específica ou não estiver respondida nessas páginas, fale com a equipe pelo WhatsApp.");
    const wa=document.createElement("a");wa.className="sind-wa-inline";wa.href="https://wa.me/"+phone+"?text="+encodeURIComponent("Olá, gostaria de tirar uma dúvida com o SINDISINDI/RS.");wa.target="_blank";wa.rel="noopener";wa.textContent="Fale com o sindicato pelo WhatsApp";messages.appendChild(wa);messages.scrollTop=messages.scrollHeight;
  });
})();