/* PLANEJAMENTO — BMW Universe
Tema: catálogo de modelos BMW.
Entrada: busca, categoria, cliques de favoritos, nota e formulário.
Processamento: filtrar, classificar, resumir, salvar dados e atualizar o DOM.
Saída: cards, gráfico SVG, lista de favoritos e média de avaliações.
Escopo local: variáveis declaradas dentro das funções não vazam para o escopo global.
*/

const MODELS=[{"name": "320i F30", "category": "Série 3", "query": "BMW 320i F30 sedan", "description": "Sedã esportivo que combina equilíbrio, conforto e prazer ao dirigir.", "years": "2012–2019"}, {"name": "118i F40", "category": "Série 1", "query": "BMW 118i F40", "description": "Hatch premium compacto com estilo urbano.", "years": "2019–2024"}, {"name": "M135i", "category": "Série 1", "query": "BMW M135i F40", "description": "Hatch esportivo com personalidade marcante.", "years": "2019–2024"}, {"name": "220i Coupé", "category": "Série 2", "query": "BMW 220i G42 coupe", "description": "Coupé compacto com proporções esportivas.", "years": "2021–atual"}, {"name": "M240i", "category": "Série 2", "query": "BMW M240i G42", "description": "Coupé de alto desempenho da linha M Performance.", "years": "2021–atual"}, {"name": "330i G20", "category": "Série 3", "query": "BMW 330i G20 sedan", "description": "Uma evolução moderna do sedã esportivo clássico.", "years": "2019–atual"}, {"name": "M340i", "category": "Série 3", "query": "BMW M340i G20", "description": "Seis cilindros e dinâmica de condução envolvente.", "years": "2019–atual"}, {"name": "420i Coupé", "category": "Série 4", "query": "BMW 420i G22 coupe", "description": "Design de duas portas com linhas elegantes.", "years": "2020–atual"}, {"name": "M440i", "category": "Série 4", "query": "BMW M440i G22 coupe", "description": "Estilo de coupé e desempenho M Performance.", "years": "2020–atual"}, {"name": "530i", "category": "Série 5", "query": "BMW 530i G30", "description": "Sedã executivo com tecnologia e conforto.", "years": "2017–2023"}, {"name": "540i", "category": "Série 5", "query": "BMW 540i G30", "description": "Sedã executivo com motor de seis cilindros.", "years": "2017–2023"}, {"name": "740i", "category": "Série 7", "query": "BMW 740i G70", "description": "Luxo, inovação e conforto na linha de representação.", "years": "2022–atual"}, {"name": "840i", "category": "Série 8", "query": "BMW 840i G15 coupe", "description": "Grand tourer de presença sofisticada.", "years": "2018–2025"}, {"name": "M2", "category": "BMW M", "query": "BMW M2 G87", "description": "Esportivo compacto da divisão BMW M.", "years": "2023–atual"}, {"name": "M3", "category": "BMW M", "query": "BMW M3 G80", "description": "Sedã de alto desempenho com legado nas pistas.", "years": "2021–atual"}, {"name": "M4", "category": "BMW M", "query": "BMW M4 G82 coupe", "description": "Coupé de alta performance da BMW M.", "years": "2021–atual"}, {"name": "M5", "category": "BMW M", "query": "BMW M5 F90", "description": "Sedã de desempenho extremo.", "years": "2017–2023"}, {"name": "X1", "category": "SUVs X", "query": "BMW X1 U11", "description": "SUV compacto versátil para a rotina.", "years": "2022–atual"}, {"name": "X3", "category": "SUVs X", "query": "BMW X3 G01", "description": "SUV médio que equilibra espaço e dinamismo.", "years": "2017–2024"}, {"name": "X5", "category": "SUVs X", "query": "BMW X5 G05", "description": "SUV de luxo com foco em conforto e desempenho.", "years": "2018–atual"}, {"name": "X6", "category": "SUVs X", "query": "BMW X6 G06", "description": "SUV-coupé de design marcante.", "years": "2019–atual"}, {"name": "X7", "category": "SUVs X", "query": "BMW X7 G07", "description": "SUV grande com espaço e sofisticação.", "years": "2019–atual"}, {"name": "i4", "category": "Elétricos", "query": "BMW i4 G26", "description": "Gran Coupé elétrico de proposta esportiva.", "years": "2021–atual"}, {"name": "i5", "category": "Elétricos", "query": "BMW i5 G60", "description": "Sedã executivo totalmente elétrico.", "years": "2023–atual"}, {"name": "iX", "category": "Elétricos", "query": "BMW iX I20", "description": "SUV elétrico de design futurista.", "years": "2021–atual"}, {"name": "Z4", "category": "Roadster", "query": "BMW Z4 G29 roadster", "description": "Roadster conversível feito para dirigir a céu aberto.", "years": "2018–atual"}];
const grid=document.getElementById('grid'), filters=document.getElementById('filters'), search=document.getElementById('search'), select=document.getElementById('model');
let activeCategory='Todos',stars=0;
let storedFavorites=[];
try{const value=JSON.parse(localStorage.getItem('bmw-universe-favorites')||'[]');if(Array.isArray(value))storedFavorites=value.filter(x=>typeof x==='string')}catch(e){console.warn('Favoritos não puderam ser lidos')}
const favorites=new Set(storedFavorites);

const categories=['Todos',...new Set(MODELS.map(m=>m.category))];
const photoCache=new Map();
// Consulta fotografias de arquivos reais no Wikimedia Commons, sem chave de API.
async function getPhoto(m){
 if(photoCache.has(m.query))return photoCache.get(m.query);
 const terms=[m.query+' automobile',m.query,'BMW '+m.name];
 for(const term of terms){try{
  const api=new URL('https://commons.wikimedia.org/w/api.php');api.searchParams.set('action','query');api.searchParams.set('generator','search');api.searchParams.set('gsrsearch','filetype:bitmap '+term);api.searchParams.set('gsrnamespace','6');api.searchParams.set('gsrlimit','8');api.searchParams.set('prop','imageinfo');api.searchParams.set('iiprop','url|mime|extmetadata');api.searchParams.set('iiurlwidth','760');api.searchParams.set('format','json');api.searchParams.set('origin','*');
  const response=await fetch(api,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('API indisponível');const data=await response.json();const pages=Object.values(data.query?.pages||{});const words=m.query.toLowerCase().replace('bmw ','').split(' ').filter(x=>x.length>1);const candidates=pages.filter(p=>p.imageinfo?.[0]?.mime?.startsWith('image/') && !/logo|badge|emblem|interior|engine|dashboard|wheel|diagram|drawing|render/i.test(p.title));candidates.sort((a,b)=>words.filter(w=>a.title.toLowerCase().includes(w)).length-words.filter(w=>b.title.toLowerCase().includes(w)).length).reverse();const best=candidates.find(p=>words.slice(0,2).every(w=>p.title.toLowerCase().includes(w)))||candidates[0];if(best){const i=best.imageinfo[0];const photo={src:i.thumburl||i.url,page:i.descriptionurl||'https://commons.wikimedia.org/wiki/'+encodeURIComponent(best.title),title:best.title};photoCache.set(m.query,photo);return photo;}
 }catch(e){console.warn('Foto indisponível para',m.name,e.message)} }
 return null;
}
function renderFilters(){filters.replaceChildren();categories.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='filter'+(activeCategory===c?' active':'');b.textContent=c;b.setAttribute('aria-pressed',String(activeCategory===c));b.onclick=()=>{activeCategory=c;renderFilters();renderCards()};filters.append(b)})}
function makeCard(m){const article=document.createElement('article');article.className='card';const box=document.createElement('div');box.className='photo-box';const fallback=document.createElement('div');fallback.className='photo-fallback';fallback.textContent='Carregando fotografia real...';box.append(fallback);const tag=document.createElement('span');tag.className='photo-label';tag.textContent=m.category;box.append(tag);const body=document.createElement('div');body.className='card-body';const title=document.createElement('h3');title.textContent='BMW '+m.name;const desc=document.createElement('p');desc.textContent=m.description;const bottom=document.createElement('div');bottom.className='card-bottom';const years=document.createElement('span');years.textContent=m.years;const button=document.createElement('button');button.type='button';button.className='pick';button.textContent='Avaliar ↗';button.dataset.action='review';button.dataset.model=m.name;const favButton=document.createElement('button');favButton.type='button';favButton.className='favorite-toggle';favButton.dataset.action='favorite';favButton.dataset.model=m.name;favButton.textContent='♥ Favoritar';favButton.setAttribute('aria-label','Favoritar BMW '+m.name);favButton.setAttribute('aria-pressed',String(favorites.has(m.name)));bottom.append(years,favButton,button);body.append(title,desc,bottom);article.append(box,body);
 getPhoto(m).then(photo=>{if(!photo){fallback.replaceChildren();fallback.append('Não foi possível carregar a foto. ');const link=document.createElement('a');link.href='https://commons.wikimedia.org/w/index.php?search='+encodeURIComponent(m.query)+'&title=Special:MediaSearch&type=image';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Buscar no Commons';fallback.append(link);return}const img=document.createElement('img');img.loading='lazy';img.alt='Fotografia real de BMW '+m.name;img.src=photo.src;img.onerror=()=>{img.remove();fallback.textContent='Imagem temporariamente indisponível'};img.onload=()=>fallback.remove();const link=document.createElement('a');link.href=photo.page;link.target='_blank';link.rel='noopener noreferrer';link.title='Ver autor, licença e arquivo original';link.setAttribute('aria-label','Créditos da foto da BMW '+m.name);link.style.cssText='position:absolute;right:10px;bottom:10px;background:#07111cdd;padding:4px 9px;border-radius:8px;font-size:11px;color:white';link.textContent='Foto ↗';box.prepend(img);box.append(link)});return article}
function renderCards(){const q=search.value.toLocaleLowerCase('pt-BR').trim();const filtered=MODELS.filter(m=>(activeCategory==='Todos'||m.category===activeCategory)&&(m.name+' '+m.category+' '+m.description).toLocaleLowerCase('pt-BR').includes(q));document.getElementById('count').textContent=filtered.length+' de '+MODELS.length+' modelos';grid.replaceChildren(...filtered.map(makeCard));if(!filtered.length){const el=document.createElement('p');el.className='empty';el.textContent='Nenhum modelo encontrado. Tente outra busca.';grid.append(el)}}
search.addEventListener('input',renderCards);MODELS.forEach(m=>{const option=document.createElement('option');option.value=m.name;option.textContent='BMW '+m.name;select.append(option)});renderFilters();renderCards();
// Armazenamento local: demonstração de front-end, sem banco de dados.
let reviews=[];try{const saved=JSON.parse(localStorage.getItem('bmw-universe-reviews')||'[]');if(Array.isArray(saved))reviews=saved.filter(r=>r&&typeof r.name==='string'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5).slice(-100)}catch(e){}
const starButtons=[...document.querySelectorAll('[data-star]')];function paintStars(){starButtons.forEach(b=>{b.classList.toggle('on',Number(b.dataset.star)<=stars);b.setAttribute('aria-pressed',String(Number(b.dataset.star)===stars))})}starButtons.forEach(b=>b.onclick=()=>{stars=Number(b.dataset.star);paintStars()});
function renderReviews(){const n=reviews.length;const avg=n?reviews.reduce((s,r)=>s+r.rating,0)/n:0;document.getElementById('average').textContent=n?avg.toFixed(1).replace('.',','):'—';document.getElementById('summaryStars').textContent=n?'★'.repeat(Math.round(avg))+'☆'.repeat(5-Math.round(avg)):'☆☆☆☆☆';document.getElementById('reviewCount').textContent=n?n+' avaliação(ões) neste navegador':'Nenhuma avaliação registrada.';const list=document.getElementById('reviewList');list.replaceChildren();reviews.slice(-5).reverse().forEach(r=>{const item=document.createElement('div');item.className='review';const h=document.createElement('strong');h.textContent=r.name+' · BMW '+r.model+' · '+'★'.repeat(r.rating);const p=document.createElement('p');p.textContent=r.comment||'Sem comentário.';item.append(h,p);list.append(item)})}renderReviews();
document.getElementById('reviewForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('name').value.trim(),model=select.value,comment=document.getElementById('comment').value.trim(),message=document.getElementById('message');if(!name||!model||!stars){message.textContent='Preencha o nome, escolha um modelo e selecione as estrelas.';return}reviews.push({name,model,comment,rating:stars});reviews=reviews.slice(-100);try{localStorage.setItem('bmw-universe-reviews',JSON.stringify(reviews));message.textContent='Avaliação salva neste navegador!'}catch(e){message.textContent='Avaliação adicionada, mas não foi possível salvar neste navegador.'}renderReviews();e.target.reset();stars=0;paintStars()});
const topButton=document.getElementById('top');window.addEventListener('scroll',()=>topButton.classList.toggle('visible',scrollY>450),{passive:true});topButton.onclick=()=>scrollTo({top:0,behavior:'smooth'});

// Delegação: um único ouvinte no contêiner trata inclusive cards criados após uma busca.
grid.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');
 if(!button||!grid.contains(button))return;
 const model=button.dataset.model;
 switch(button.dataset.action){
  case 'review':
   select.value=model;
   document.getElementById('avaliacoes').scrollIntoView({behavior:'smooth'});
   document.getElementById('message').textContent='Modelo selecionado: BMW '+model;
   break;
  case 'favorite':
   if(favorites.has(model)){favorites.delete(model)}else if(MODELS.some(m=>m.name===model)){favorites.add(model)}else{console.warn('Modelo desconhecido');return}
   try{localStorage.setItem('bmw-universe-favorites',JSON.stringify([...favorites]))}catch(e){console.warn('Falha ao salvar favoritos')}
   updateFavoriteSummary();renderCards();
   break;
  default:break;
 }
});
function classifyCount(value){
 const count=Number(value); // coerção explícita
 if(count===0)return 'Nenhum modelo favoritado.';
 else if(count===1)return '1 modelo favoritado.';
 else return count+' modelos favoritados.';
}
function updateFavoriteSummary(){
 const list=document.getElementById('favoriteList');list.replaceChildren();
 const selected=MODELS.filter(m=>favorites.has(m.name));
 // for...of com acumulador e while para cumprir o bloco de lógica da Aula 09.
 let total=0;for(const model of selected){total+=1}
 let index=0;while(index<selected.length){
  const chip=document.createElement('span');chip.className='favorite-chip';chip.textContent='BMW '+selected[index].name;list.append(chip);index++;
 }
 document.getElementById('favoritesSummary').textContent=classifyCount(total);
 document.getElementById('navFavCount').textContent=String(total);
}
document.getElementById('clearFavorites').addEventListener('click',()=>{favorites.clear();try{localStorage.setItem('bmw-universe-favorites','[]')}catch(e){}updateFavoriteSummary();renderCards()});
updateFavoriteSummary();
// Gráfico SVG responsivo construído a partir do mesmo array do catálogo.
function renderChart(){
 const svg=document.getElementById('categoryChart');const ns='http://www.w3.org/2000/svg';
 const counts=categories.filter(c=>c!=='Todos').map(c=>({name:c,count:MODELS.filter(m=>m.category===c).length}));
 const maximum=Math.max(...counts.map(c=>c.count),1);
 const create=(tag,attrs,content)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(content!==undefined)el.textContent=content;svg.append(el);return el};
 counts.forEach((item,i)=>{const y=22+i*39;create('text',{x:12,y:y+15,fill:'#f5f8fc','font-size':13},item.name);create('rect',{x:128,y,width:Math.round(item.count/maximum*360),height:22,rx:5,fill:'#168cff'});create('text',{x:Math.min(500,135+item.count/maximum*360),y:y+16,fill:'#f5f8fc','font-size':13},item.count)});
 document.getElementById('chartText').textContent=counts.map(c=>c.name+': '+c.count).join(' · ');
}
renderChart();
const menuToggle=document.getElementById('menuToggle');const mainNav=document.getElementById('main-nav');
menuToggle.addEventListener('click',()=>{const expanded=menuToggle.getAttribute('aria-expanded')==='true';menuToggle.setAttribute('aria-expanded',String(!expanded));menuToggle.setAttribute('aria-label',expanded?'Abrir menu':'Fechar menu');mainNav.classList.toggle('open',!expanded)});
mainNav.addEventListener('click',e=>{if(e.target.closest('a')){mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}});
const dropdown=document.querySelector('.nav-drop-button');dropdown.addEventListener('click',()=>{const open=dropdown.getAttribute('aria-expanded')==='true';dropdown.setAttribute('aria-expanded',String(!open));dropdown.parentElement.classList.toggle('open',!open)});
