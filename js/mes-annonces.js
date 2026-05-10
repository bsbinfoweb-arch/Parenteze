const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

// =========================
// LOAD USER + ADS
// =========================

async function loadMyAds(){

  const { data } =
    await supabaseClient.auth.getUser();

  const user = data.user;

  if(!user){

    window.location.href =
      "login.html";

    return;
  }

  const container =
    document.getElementById("myAds");

  // =========================
  // LOAD ADS
  // =========================

  const { data: annonces, error } =
    await supabaseClient

      .from("annonces")

      .select("*")

      .eq("user_id", user.id)

      .order(
        "created_at",
        { ascending:false }
      );

  if(error){

    console.error(error);

    container.innerHTML = `
      <p>
        Erreur chargement annonces.
      </p>
    `;

    return;
  }

  // =========================
  // EMPTY
  // =========================

  if(!annonces || !annonces.length){

    container.innerHTML = `

      <div class="dashboard-section">

        <h2>
          Bienvenue ${user.email}
        </h2>

        <p>
          Vous n'avez encore publié aucune annonce.
        </p>

      </div>

    `;

    return;
  }

  // =========================
  // DISPLAY
  // =========================

  container.innerHTML = `

    <div class="dashboard-section">

      <h2>
        Bienvenue ${user.email}
      </h2>

      <p>
        Gérez vos annonces facilement.
      </p>

      <div class="admin-ads-grid">

        ${annonces.map(ad => `

          <div class="admin-ad">

            ${
              ad.photo_url

              ?

              `
                <img
                  src="${ad.photo_url}"

                  style="
                    width:100%;
                    height:180px;
                    object-fit:cover;
                    border-radius:14px;
                    margin-bottom:14px;
                  "
                >
              `

              :

              ``
            }

            <h3>
              ${ad.title}
            </h3>

            <p>
              ${ad.price_label || ""}
            </p>

            <p>
              <strong>Statut :</strong>

              ${ad.status}
            </p>

           <div
  style="
    display:flex;
    gap:10px;
    margin-top:18px;
  "
>

  <a

    class="btn btn-primary"

    href="
      modifier-annonce.html?id=${ad.id}
    "
  >
    ✏️ Modifier
  </a>

  <button

    class="btn btn-outline"

    onclick="
      deleteAnnonce('${ad.id}')
    "
  >
    🗑️ Supprimer
  </button>

</div>

          </div>

        `).join("")}

      </div>

    </div>

  `;
}

// =========================
// DELETE
// =========================

async function deleteAnnonce(id){

  const confirmDelete =
    confirm(
      "Supprimer cette annonce ?"
    );

  if(!confirmDelete){
    return;
  }

  const { error } =
    await supabaseClient

      .from("annonces")

      .delete()

      .eq("id", id);

  if(error){

    alert(error.message);

    return;
  }

  loadMyAds();
}

// =========================

window.deleteAnnonce =
  deleteAnnonce;

loadMyAds();
