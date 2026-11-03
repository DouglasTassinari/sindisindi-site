(() => {
 const q=document.getElementById("nq"),grid=document.getElementById("n-grid");
 if(!q||!grid)return;
 const cards=[...grid.querySelectorAll(".news-item")];
 const count=document.getElementById("n-count"),empty=document.getElementById("n-empty"),more=document.getElementById("n-more");
 const norm=s=>(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
 const sel={y:"",c:""};const STEP=12;let limit=STEP;
 const run=()=>{
  const t=norm(q.value.trim());const ok=[];
  cards.forEach(c=>{const m=(!sel.y||c.dataset.y===sel.y)&&(!sel.c||c.dataset.c===sel.c)&&(!t||norm(c.dataset.n).includes(t));c.hidden=true;if(m)ok.push(c);});
  ok.slice(0,limit).forEach(c=>{c.hidden=false;});
  count.textContent=ok.length+(ok.length===1?" notícia":" notícias");
  empty.hidden=ok.length>0;more.hidden=ok.length<=limit;
 };
 [["n-ychips","y"],["n-cchips","c"]].forEach(([id,k])=>{
  const box=document.getElementById(id);if(!box)return;
  const chips=[...box.querySelectorAll(".chip")];
  chips.forEach(b=>b.addEventListener("click",()=>{sel[k]=b.dataset[k];chips.forEach(x=>x.classList.toggle("on",x===b));limit=STEP;run();}));
 });
 q.addEventListener("input",()=>{limit=STEP;run();});
 more.addEventListener("click",()=>{limit+=STEP;run();});run();
})();
