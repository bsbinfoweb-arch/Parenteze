const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

async function updateAnnonceStatus(id, status){

  const { error } = await supabaseClient
    .from("annonces")
    .update({ status })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadAnnonces();
}

async function deleteAnnonce(id){

  if(!confirm("Supprimer cette annonce ?")) return;

  const { error } = await supabaseClient
    .from("annonces")
    .delete()
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadAnnonces();
}

async function loadAnnonces(){

  const filter = document.getElementById("statusFilter").value;

  let query = supabaseClient
    .from("annonces")
    .select("*")
    .order("created_at", { ascending:false });

  if(filter){
    query = query.eq("status", filter);
  }

  const { data: annonces, error } = await query;

  if(error){
    console.error(error);
    return;
  }

  const container = document.getElementById("allAds");

  if(!annonces || annonces.length === 0){

    container.innerHTML = `
      <p>Aucune annonce.</p>
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
        ${ad.status}
      </p>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;">

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

        <button
          class="btn btn-outline"
          style="border-color:#e5484d;color:#e5484d;"
          onclick="deleteAnnonce('${ad.id}')"
        >
          🗑️ Supprimer
        </button>

      </div>

    </div>

  `).join("");
}

document
  .getElementById("statusFilter")
  .addEventListener("change", loadAnnonces);

loadAnnonces();

window.updateAnnonceStatus = updateAnnonceStatus;
window.deleteAnnonce = deleteAnnonce;