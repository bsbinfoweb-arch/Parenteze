const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

async function updateAnnonceStatus(id, status){

  const { error } = await supabaseClient
    .from("annonces")
    .update({ status: status })
    .eq("id", id);

  if(error){
    console.error(error);
    alert(error.message);
    return;
  }

  loadDashboard();
}

async function loadDashboard(){

  const { count: annoncesCount } = await supabaseClient
    .from("annonces")
    .select("*", { count:"exact", head:true });

  const { count: pendingCount } = await supabaseClient
    .from("annonces")
    .select("*", { count:"exact", head:true })
    .eq("status", "pending");

  const { count: usersCount } = await supabaseClient
    .from("profiles")
    .select("*", { count:"exact", head:true });

  document.getElementById("stats").innerHTML = `
  
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div>
        <h3>${annoncesCount || 0}</h3>
        <p>Annonces</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon orange">⏳</div>
      <div>
        <h3>${pendingCount || 0}</h3>
        <p>En attente</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon blue">👨‍👩‍👧</div>
      <div>
        <h3>${usersCount || 0}</h3>
        <p>Parents inscrits</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon red">🏫</div>
      <div>
        <h3>12</h3>
        <p>Établissements</p>
      </div>
    </div>
  `;

  const { data: annonces, error } = await supabaseClient
    .from("annonces")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending:false })
    .limit(10);

  if(error){
    console.error(error);
    return;
  }

  const container = document.getElementById("recentAds");

  if(!annonces || annonces.length === 0){

    container.innerHTML = `
      <p>Aucune annonce en attente.</p>
    `;

    return;
  }

  container.innerHTML = annonces.map(ad => `
  
    <div class="admin-ad">

      ${
        ad.photo_url
        ? `<img src="${ad.photo_url}" style="width:100%;height:180px;object-fit:cover;border-radius:14px;margin-bottom:14px;">`
        : ``
      }

      <h3>${ad.title || "Sans titre"}</h3>

      <p>${ad.description || ""}</p>

      <p>
        <strong>Statut :</strong>
        <span style="
          color:${
            ad.status === "published"
            ? "#159447"
            : ad.status === "pending"
            ? "#ff8a00"
            : "#e5484d"
          };
          font-weight:700;
        ">
          ${ad.status || "pending"}
        </span>
      </p>

      <div style="display:flex;gap:10px;margin-top:18px;">

        <button
          class="btn btn-primary"
          onclick="updateAnnonceStatus('${ad.id}', 'published')"
        >
          ✅ Publier
        </button>

        <button
          class="btn btn-outline"
          onclick="updateAnnonceStatus('${ad.id}', 'rejected')"
        >
          ❌ Refuser
        </button>

      </div>

    </div>

  `).join("");
}

loadDashboard();

window.updateAnnonceStatus = updateAnnonceStatus;
