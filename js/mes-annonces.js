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

  <div class="ad">

    <div class="ad-img">

      ${
        ad.photo_url

        ?

        `
          <img
            src="${ad.photo_url}"

            style="
              width:100%;
              height:100%;
              object-fit:cover;
            "
          >
        `

        :

        `📦`
      }

    </div>

    <div class="ad-body">

      <div class="
        tag ${ad.annonce_type}
      ">

        ${
          ad.annonce_type === "sell"
            ? "À vendre"

            : ad.annonce_type === "donate"
            ? "À donner"

            : "Recherche"
        }

      </div>

      <h3>
        ${ad.title}
      </h3>

      <p class="price">
        ${ad.price_label || ""}
      </p>

      <p>
        <strong>Statut :</strong>
        ${ad.status}
      </p>

      <div
        style="
          display:flex;
          gap:8px;
          margin-top:15px;
          flex-wrap:wrap;
        "
      >

        <a

          class="btn btn-primary"

          href="
            modifier-annonce.html?id=${ad.id}
          "

          style="
            padding:10px 14px;
            font-size:14px;
          "
        >
          ✏️ Modifier
        </a>

        <button

          class="btn btn-outline"

          onclick="
            deleteAnnonce('${ad.id}')
          "

          style="
            padding:10px 14px;
            font-size:14px;
          "
        >
          🗑️ Supprimer
        </button>

      </div>

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
