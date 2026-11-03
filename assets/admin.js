// Modo administrativo (protótipo): organiza as publicações da página Notícias.
// As alterações ficam salvas neste navegador (localStorage). Em produção, o mesmo painel grava num CMS.
(() => {
 const KEY="sindi_posts_v1";
 const $=s=>document.querySelector(s);
 const listEl=$("#post-list"),form=$("#post-form"),msg=$("#msg");
 let posts=[],editing=null;

 const uid=()=>"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 const save=()=>{localStorage.setItem(KEY,JSON.stringify(posts));};
 const toast=t=>{msg.textContent=t;msg.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>msg.classList.remove("on"),2600);};

 async function defaults(){
  const html=await (await fetch("noticias.html",{cache:"no-store"})).text();
  const d=new DOMParser().parseFromString(html,"text/html");
  return [...d.querySelectorAll("main .grid .card")].map(c=>({
   id:uid(),title:c.querySelector("h3")?.textContent.trim()||"",tag:c.querySelector(".tag")?.textContent.trim()||"",
   summary:c.querySelector("p")?.textContent.trim()||"",url:c.querySelector("a.btn")?.getAttribute("href")||"",
   img:c.querySelector("img")?.getAttribute("src")||"",published:true}));
 }

 function render(){
  listEl.replaceChildren();
  $("#count").textContent=posts.filter(p=>p.published).length+" publicadas · "+posts.filter(p=>!p.published).length+" rascunhos";
  posts.forEach((p,i)=>{
   const li=document.createElement("li");li.className="post"+(p.published?"":" draft");li.draggable=true;li.dataset.i=i;
   const th=document.createElement("div");th.className="thumb";if(p.img){const im=document.createElement("img");im.src=p.img;im.alt="";th.append(im);}
   const body=document.createElement("div");body.className="body";
   const st=document.createElement("strong");st.textContent=p.title||"(sem título)";
   const meta=document.createElement("span");meta.textContent=(p.tag||"Sem categoria")+" · "+(p.published?"Publicada":"Rascunho");
   body.append(st,meta);
   const act=document.createElement("div");act.className="acts";
   const mk=(label,fn,cls)=>{const b=document.createElement("button");b.type="button";b.textContent=label;if(cls)b.className=cls;b.addEventListener("click",fn);return b;};
   act.append(
    mk("↑",()=>move(i,-1)),mk("↓",()=>move(i,1)),
    mk(p.published?"Ocultar":"Publicar",()=>{p.published=!p.published;save();render();toast(p.published?"Publicação visível no site.":"Publicação oculta do site.");}),
    mk("Editar",()=>edit(i)),
    mk("Excluir",()=>{if(confirm("Excluir esta publicação?")){posts.splice(i,1);save();render();toast("Publicação excluída.");}},"danger"));
   li.append(th,body,act);
   li.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",i);li.classList.add("drag");});
   li.addEventListener("dragend",()=>li.classList.remove("drag"));
   li.addEventListener("dragover",e=>e.preventDefault());
   li.addEventListener("drop",e=>{e.preventDefault();const from=+e.dataTransfer.getData("text/plain");if(from===i)return;posts.splice(i,0,posts.splice(from,1)[0]);save();render();toast("Ordem atualizada.");});
   listEl.append(li);
  });
 }
 function move(i,d){const j=i+d;if(j<0||j>=posts.length)return;[posts[i],posts[j]]=[posts[j],posts[i]];save();render();}

 function edit(i){
  editing=i;const p=i==null?{title:"",tag:"",summary:"",url:"",img:"",published:true}:posts[i];
  form.title.value=p.title;form.tag.value=p.tag;form.summary.value=p.summary;form.url.value=p.url;form.img.value=p.img.startsWith("data:")?"":p.img;form.published.checked=p.published;
  form.dataset.img=p.img;$("#form-title").textContent=i==null?"Nova publicação":"Editar publicação";
  $("#editor").classList.add("open");form.title.focus();$("#editor").scrollIntoView({behavior:"smooth",block:"nearest"});
 }
 $("#new").addEventListener("click",()=>edit(null));
 $("#cancel").addEventListener("click",()=>$("#editor").classList.remove("open"));
 form.file.addEventListener("change",()=>{
  const f=form.file.files[0];if(!f)return;
  if(f.size>1.5*1024*1024){toast("Imagem acima de 1,5 MB. Use uma menor.");form.file.value="";return;}
  const r=new FileReader();r.onload=()=>{form.dataset.img=r.result;form.img.value="";toast("Imagem carregada.");};r.readAsDataURL(f);
 });
 form.addEventListener("submit",e=>{
  e.preventDefault();
  const p={id:editing==null?uid():posts[editing].id,title:form.title.value.trim(),tag:form.tag.value.trim(),summary:form.summary.value.trim(),url:form.url.value.trim(),img:form.img.value.trim()||form.dataset.img||"",published:form.published.checked};
  if(!p.title){toast("Informe o título.");return;}
  if(editing==null)posts.unshift(p);else posts[editing]=p;
  save();render();$("#editor").classList.remove("open");toast("Publicação salva.");
 });
 $("#reset").addEventListener("click",async()=>{if(!confirm("Restaurar as publicações originais do site?"))return;localStorage.removeItem(KEY);posts=await defaults();save();render();toast("Publicações restauradas.");});
 $("#export").addEventListener("click",()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(posts,null,2)],{type:"application/json"}));a.download="publicacoes-sindisindi.json";a.click();});

 (async()=>{
  try{posts=JSON.parse(localStorage.getItem(KEY)||"null");}catch{posts=null;}
  if(!Array.isArray(posts)){posts=await defaults();save();}
  render();
 })();
})();
