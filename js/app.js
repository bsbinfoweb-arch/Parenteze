const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const icons = {
  book:"📖", shirt:"👕", bag:"🎒", calculator:"🧮", ball:"⚽", dots:"•••"
};

async function loadCategories(){
  const { data, error } = await supabaseClient.from("categories").select("*").order("id");
  const grid = document.getElementById("categoryGrid");
  const filter = document.getElementById("filterCategory");
  if(error){ console.error(error); return; }
  grid.innerHTML = data.map(c => `
    <div class="cat-card">
      <div class="cat-icon">${icons[c.icon] || "📌"}</div>
      <h3>${c.name}</h3>
      <small>Voir les annonces</small>
    </div>
  `).join("");
  filter.innerHTML += data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadEtablissements(){
  const { data } = await supabaseClient.from("etablissements").select("*").order("name");
  const filter = document.getElementById("filterEtablissement");
  if(!data) return;
  filter.innerHTML += data.map(e => `<option>${e.name}</option>`).join("");
}

function demoAds(){
  return [
    {title:"Manuels 6ème - Collège", etablissement:"Collège de Baimbridge, Les Abymes", price_label:"25 €", annonce_type:"sell", emoji:"📚"},
    {title:"Chemise uniforme garçon", etablissement:"Lycée Gerville Réache, Basse-Terre", price_label:"Gratuit", annonce_type:"donate", emoji:"👕"},
    {title:"Sac à dos Eastpak", etablissement:"Collège Matéliane, Gosier", price_label:"20 €", annonce_type:"sell", emoji:"🎒"},
    {title:"Calculatrice collège", etablissement:"Collège Félix Éboué, Morne-à-l’Eau", price_label:"À discuter", annonce_type:"search", emoji:"🧮"}
  ];
}

async function loadAds(){
  const { data, error } = await supabaseClient
    .from("annonces")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending:false })
    .limit(8);

  const ads = data && data.length ? data : demoAds();
  document.getElementById("adsGrid").innerHTML = ads.map(a => {
    const type = a.annonce_type || "sell";
    const label = type === "donate" ? "A DONNER" : type === "search" ? "JE RECHERCHE" : "A VENDRE";
    const price = a.price_label || (a.price ? `${a.price} €` : "Gratuit");
    return `
      <a href="annonce.html?id=${a.id}" class="ad">
        <div class="ad-img">${a.photo_url ? `<img src="${a.photo_url}" alt="" style="width:100%;height:100%;object-fit:cover">` : (a.emoji || "📦")}</div>
        <div class="ad-body">
          <span class="tag ${type}">${label}</span>
          <h3>${a.title}</h3>
          <p>${a.etablissement || ""}</p>
          <div class="price">${price}</div>
        </div>
      </a>
    `;
  }).join("");
}

loadCategories();
loadEtablissements();
loadAds();
