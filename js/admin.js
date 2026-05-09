const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

async function loadDashboard(){

  const { data, error } = await supabaseClient
    .from("annonces")
    .select("*");

  console.log("ANNONCES :", data);
  console.log("ERROR :", error);

  if(error){
    alert(error.message);
    return;
  }

  document.getElementById("statAds").textContent = data.length;

  const grid = document.getElementById("adminAds");

  grid.innerHTML = "";

  data.forEach(ad => {

    grid.innerHTML += `
      <div class="admin-ad">
        <h3>${ad.title || "Sans titre"}</h3>
        <p>${ad.description || ""}</p>
      </div>
    `;
  });

}

loadDashboard();
