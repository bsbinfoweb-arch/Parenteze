const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

async function loadDashboard(){

  const { data, error } = await supabaseClient
    .from("annonces")
    .select("*");

  if(error){
    console.error(error);
    alert(error.message);
    return;
  }

  document.getElementById("statAds").textContent = data.length;

  const grid = document.getElementById("adminAds");
  grid.innerHTML = "";

  data.forEach(ad => {
    grid.innerHTML += `
      <div class="admin-ad">

        ${ad.photo_url ? `
          <img src="${ad.photo_url}" style="width:100%;max-height:180px;object-fit:cover;border-radius:12px;margin-bottom:12px;">
        ` : ""}

        <h3>${ad.title || "Sans titre"}</h3>

        <p>${ad.description || ""}</p>

        <p><strong>Statut :</strong> ${ad.status || "pending"}</p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
          <button onclick="publishAd('${ad.id}')" class="btn btn-primary">
            ✅ Publier
          </button>

          <button onclick="rejectAd('${ad.id}')" class="btn btn-outline">
            ❌ Refuser
          </button>
        </div>

      </div>
    `;
  });
}

async function publishAd(id){
  const { error } = await supabaseClient
    .from("annonces")
    .update({ status:"published" })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadDashboard();
}

async function rejectAd(id){
  const { error } = await supabaseClient
    .from("annonces")
    .update({ status:"rejected" })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadDashboard();
}

loadDashboard();
