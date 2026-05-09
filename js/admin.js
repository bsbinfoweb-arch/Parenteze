const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

async function loadDashboard(){

  // =====================
  // CHARGER LES ANNONCES
  // =====================

  const { data: ads, error } = await supabaseClient
    .from("ads")
    .select("*")
    .order("created_at", { ascending:false });

  if(error){
    console.error(error);
    return;
  }

  // =====================
  // STATS
  // =====================

  document.getElementById("statAds").textContent = ads.length;

  // =====================
  // GRID ANNONCES
  // =====================

  const grid = document.getElementById("adminAds");

  grid.innerHTML = "";

  ads.forEach(ad => {

    grid.innerHTML += `
    
      <div class="admin-ad">

        <h3>${ad.title}</h3>

        <p>
          ${ad.description || ""}
        </p>

        <strong>
          ${ad.price || 0} €
        </strong>

      </div>

    `;
  });

}

loadDashboard();
