(() => {
  if (document.getElementById("sind-assistant")) return;
  const PHONE="5551998843247";
  const WA="https://wa.me/"+PHONE+"?text="+encodeURIComponent("Olá! Gostaria de falar com o SINDISINDI/RS.");
  const pages=[
    ["Início","index.html"],["O sindicato","sindicato.html"],["Notícias","noticias.html"],
    ["Direitos","direitos.html"],["Acordos coletivos","acordos.html"],["Convênios","convenios.html"],
    ["Publicações","publicacoes.html"],["Contato","contato.html"],
    ["História do sindicato","sindisindi-37-anos.html"],["Saúde no trabalho e acordos","e-sindicatario-saude-acordos.html"],
    ["Inglês no trabalho","ingles-no-trabalho.html"],["Questionário de saúde","questionario-saude.html"],
    ["Ponto facultativo","ponto-facultativo-copa.html"],["Convenções da OIT","oit-igualdade-violencia.html"],
    ["ACT CPERS","act-cpers.html"],["ACT CUT-RS","act-cut-rs.html"],
    ["Acordo SENGE-RS","acordo-senge-rs.html"],["Homologações","homologacoes.html"]
  ];
  const normalize=s=>(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  const stop=new Set("para como qual quais uma com por que dos das sobre onde quando voce voces sindicato sindisindi quero gostaria preciso pode consegue tem site".split(" "));
  let docs=null, loading=null;
  const root=document.createElement("div");root.id="sind-assistant";
  root.innerHTML=`
    <a class="sind-wa-float" href="${WA}" target="_blank" rel="noopener"><span class="sind-wa-icon">◉</span><span>Fale com o sindicato</span></a>
    <button class="sind-chat-launch" type="button"><span class="sind-chat-launch-icon">?</span><span>Precisa de ajuda?</span></button>
    <section class="sind-chat-panel" aria-label="Assistente SINDISINDI/RS" hidden>
      <div class="sind-chat-head"><div class="sind-chat-brand"><span class="sind-chat-avatar">S</span><div><strong>Atendimento SINDISINDI/RS</strong><small><i></i> Assistente de informações do site</small></div></div><button class="sind-chat-close" type="button" aria-label="Fechar chat" title="Fechar chat"><span aria-hidden="true">×</span></button></div>
      <div class="sind-chat-messages" aria-live="polite">
        <div class="sind-chat-date">COMO PODEMOS AJUDAR?</div>
        <div class="sind-msg bot">Olá! Sou o assistente virtual do SINDISINDI/RS. Posso pesquisar informações nas páginas do site e indicar onde encontrar o que você precisa.</div>
        <div class="sind-chat-prompts"><button type="button" data-q="Quais são os convênios disponíveis?">Convênios disponíveis</button><button type="button" data-q="Onde encontro os acordos coletivos?">Acordos coletivos</button><button type="button" data-q="Quero conhecer o sindicato">Conheça o sindicato</button><button type="button" data-q="Como entro em contato?">Contato</button></div>
      </div>
      <form class="sind-chat-form"><input aria-label="Digite sua pergunta" placeholder="Escreva sua dúvida aqui..." autocomplete="off" required><button type="submit" aria-label="Enviar pergunta">➤</button></form>
      <div class="sind-chat-foot">As respostas são localizadas no conteúdo publicado no site. Para atendimento pessoal, use o botão WhatsApp.</div>
    </section>`;
  document.body.appendChild(root);
  const panel=root.querySelector(".sind-chat-panel"),launch=root.querySelector(".sind-chat-launch"),messages=root.querySelector(".sind-chat-messages"),form=root.querySelector(".sind-chat-form"),input=form.querySelector("input");
  const scroll=()=>messages.scrollTo({top:messages.scrollHeight,behavior:"smooth"});
  launch.addEventListener("click",()=>{panel.hidden=false;launch.hidden=true;input.focus();});
  root.querySelector(".sind-chat-close").addEventListener("click",()=>{panel.hidden=true;launch.hidden=false;});\n  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){panel.hidden=true;launch.hidden=false;}});
  const bubble=(txt,who="bot")=>{const e=document.createElement("div");e.className="sind-msg "+who;e.textContent=txt;messages.appendChild(e);scroll();return e;};
  const load=async()=>{
    if(docs)return docs;if(loading)return loading;
    loading=Promise.all(pages.map(async([title,url])=>{try{const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw Error("HTTP "+res.status);const html=await res.text();const doc=new DOMParser().parseFromString(html,"text/html");doc.querySelectorAll("script,style,nav,footer,header,.sind-chat-panel,#sind-assistant").forEach(n=>n.remove());const text=(doc.querySelector("main")||doc.body).innerText.replace(/\s+/g," ").trim();return {title,url,text};}catch{return {title,url,text:""};}})).then(x=>(docs=x));
    return loading;
  };
  const search=async query=>{
    const data=await load(),terms=normalize(query).split(" ").filter(t=>t.length>2&&!stop.has(t));
    if(!terms.length)return [];
    const ranked=data.map(d=>{const text=normalize(d.title+" "+d.text);let score=0;terms.forEach(t=>{const hits=text.split(t).length-1;score+=Math.min(hits,5)*(t.length>5?2:1);});if(terms.some(t=>normalize(d.title).includes(t)))score+=8;return {...d,score};}).filter(d=>d.text&&d.score>0).sort((a,b)=>b.score-a.score);
    const best=ranked[0]?.score||0;return ranked.filter(x=>x.score>=Math.max(2,best*.42)).slice(0,3).map(d=>{
      const raw=d.text,nt=normalize(raw);let pos=-1;for(const t of terms){const i=nt.indexOf(t);if(i>=0){pos=i;break;}}
      const excerpt=pos<0?raw.slice(0,300):raw.slice(Math.max(0,pos-120),Math.min(raw.length,pos+280));
      return {...d,excerpt:(excerpt.length>=390?"…":"")+excerpt+(pos+280<raw.length?"…":"")};
    });
  };
  const addResults=(items)=>{
    const wrap=document.createElement("div");wrap.className="sind-result-list";
    items.forEach(r=>{const card=document.createElement("article");card.className="sind-result";const label=document.createElement("span");label.textContent="CONTEÚDO DO SITE";const a=document.createElement("a");a.href=r.url;a.textContent=r.title;const p=document.createElement("p");p.textContent=r.excerpt;const go=document.createElement("a");go.href=r.url;go.className="sind-result-link";go.textContent="Ver página →";card.append(label,a,p,go);wrap.appendChild(card);});messages.appendChild(wrap);scroll();
  };
  const ask=async q=>{
    bubble(q,"user");input.value="";const wait=bubble("Estou pesquisando as páginas do site…","typing");
    try{const results=await search(q);wait.remove();
      if(results.length){bubble("Encontrei estas páginas que podem responder à sua dúvida:");addResults(results);bubble("Se não encontrar o que procura, você pode falar diretamente com a equipe pelo WhatsApp.");}
      else{bubble("Não localizei essa informação no conteúdo disponível do site. Posso tentar com outros termos ou você pode falar diretamente com a equipe.");const actions=document.createElement("div");actions.className="sind-chat-actions";const retry=document.createElement("button");retry.type="button";retry.textContent="Tentar outra pesquisa";retry.onclick=()=>input.focus();const wa=document.createElement("a");wa.href=WA;wa.target="_blank";wa.rel="noopener";wa.textContent="Falar com o sindicato no WhatsApp";actions.append(retry,wa);messages.appendChild(actions);scroll();}
    }catch{wait.remove();bubble("Não consegui carregar a pesquisa agora. Tente novamente em instantes ou fale com o sindicato pelo botão de WhatsApp.");}
  };
  form.addEventListener("submit",e=>{e.preventDefault();const q=input.value.trim();if(q)ask(q);});
  messages.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(b)ask(b.dataset.q);});
})();