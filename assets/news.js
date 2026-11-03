// Mostra em noticias.html as publicações organizadas no modo administrativo (admin.html).
// Sem alterações salvas, a página continua exibindo o conteúdo original.
(() => {
 const KEY="sindi_posts_v1";
 const grid=document.querySelector("main .grid");
 if(!grid)return;
 let posts;
 try{posts=JSON.parse(localStorage.getItem(KEY)||"null");}catch{posts=null;}
 if(!Array.isArray(posts))return;
 const frag=document.createDocumentFragment();
 posts.filter(p=>p.published).forEach(p=>{
  const card=document.createElement("article");card.className="card";
  if(p.img){const im=document.createElement("img");im.className="feature-photo fit";im.src=p.img;im.alt=p.title;im.loading="lazy";card.append(im);}
  const tag=document.createElement("div");tag.className="tag";tag.textContent=p.tag||"";
  const h=document.createElement("h3");h.textContent=p.title;
  const t=document.createElement("p");t.textContent=p.summary||"";
  const a=document.createElement("a");a.className="btn";a.href=p.url||"#";a.textContent="Acessar";
  card.append(tag,h,t,a);frag.append(card);
 });
 grid.replaceChildren(frag);
})();
