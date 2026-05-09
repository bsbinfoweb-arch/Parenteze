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
    return;
  }

  document.getElementById("statAds").textContent = data.length;

  const grid = document.getElementById("adminAds");

  grid.innerHTML = "";

  data.forEach(ad => {

   grid.innerHTML += `
  <div class="admin-ad">

    <h3>${ad.title || "Sans titre"}</h3>

    <p>
      ${ad.description || ""}
    </p>

    <br>

    <strong>
      Statut :
      ${ad.status || "pending"}
    </strong>

    <br><br>

    <button onclick="approveAd('${ad.id}')" class="btn btn-primary">
      ✅ Approuver
    </button>

    <button onclick="rejectAd('${ad.id}')" class="btn btn-outline">
      ❌ Refuser
    </button>

  </div>
`;
    `;
  });

}

loadDashboard();
