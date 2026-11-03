(() => {
 const q=document.getElementById("q"),grid=document.getElementById("ac-grid");
 if(!q||!grid)return;
 const chips=[...document.querySelectorAll("#ac-chips .chip")],cards=[...grid.querySelectorAll(".ac-card")];
 const count=document.getElementById("ac-count"),empty=document.getElementById("ac-empty");
 const norm=s=>(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
 let mes="";
 const run=()=>{
  const t=norm(q.value.trim());let n=0;
  cards.forEach(c=>{const ok=(!mes||c.dataset.m===mes)&&(!t||norm(c.dataset.n).includes(t));c.hidden=!ok;if(ok)n++;});
  count.textContent=n+(n===1?" documento":" documentos");
  empty.hidden=n>0;
 };
 chips.forEach(b=>b.addEventListener("click",()=>{mes=b.dataset.m;chips.forEach(x=>x.classList.toggle("on",x===b));run();}));
 q.addEventListener("input",run);run();
})();
