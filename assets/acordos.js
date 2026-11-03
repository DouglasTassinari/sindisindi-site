(() => {
 const q=document.getElementById("q"),grid=document.getElementById("ac-grid");
 if(!q||!grid)return;
 const cards=[...grid.querySelectorAll(".ac-card")];
 const count=document.getElementById("ac-count"),empty=document.getElementById("ac-empty");
 const norm=s=>(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
 const sel={m:"",y:""};
 const run=()=>{
  const t=norm(q.value.trim());let n=0;
  cards.forEach(c=>{const ok=(!sel.m||c.dataset.m===sel.m)&&(!sel.y||c.dataset.y===sel.y)&&(!t||norm(c.dataset.n).includes(t));c.hidden=!ok;if(ok)n++;});
  count.textContent=n+(n===1?" documento":" documentos");
  empty.hidden=n>0;
 };
 [["ac-chips","m"],["ac-ychips","y"]].forEach(([id,k])=>{
  const box=document.getElementById(id);if(!box)return;
  const chips=[...box.querySelectorAll(".chip")];
  chips.forEach(b=>b.addEventListener("click",()=>{sel[k]=b.dataset[k];chips.forEach(x=>x.classList.toggle("on",x===b));run();}));
 });
 q.addEventListener("input",run);run();
})();
