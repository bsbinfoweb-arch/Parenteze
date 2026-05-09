const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

async function loadAnnonce(){

  const params = new URLSearchParams(window.location.search);

  const id = params.get("id");

  if(!id){

    document.getElementById("annonceDetail").innerHTML = `
      <p>Annonce introuvable.</p>
    `;

    return;
  }

  const { data: annonce, error } = await supabaseClient
    .from("annonces")
    .select("*")
    .eq("id", id)
    .single();

  if(error || !annonce){

    document.getElementById("annonceDetail").innerHTML = `
      <p>Annonce introuvable.</p>
    `;

    return;
  }

  document.getElementById("annonceDetail").innerHTML = `

    <div class="marketplace-detail">

      <div class="gallery">

        <img
          id="mainPhoto"

          src="${
            annonce.photo_urls?.[0]
            || annonce.photo_url
            || ''
          }"

          class="main-photo"
        >

        <div class="thumbs">

          ${(annonce.photo_urls || []).map(url => `

            <img
              src="${url}"

              class="thumb"

              onclick="
                document.getElementById('mainPhoto').src='${url}'
              "
            >

          `).join("")}

        </div>

      </div>

      <div class="detail-content">

        <div class="detail-badge">

          ${
            annonce.annonce_type === "donate"
            ? "🎁 À donner"
            : annonce.annonce_type === "search"
            ? "🔎 Recherche"
            : "💰 À vendre"
          }

        </div>

        <h1>
          ${annonce.title}
        </h1>

        <div class="detail-price">
          ${annonce.price_label || ""}
        </div>

        <div class="detail-meta">

          <div class="meta-pill">
            📍 ${annonce.commune || "Non renseigné"}
          </div>

          <div class="meta-pill">
            🏫 ${annonce.etablissement || "Non renseigné"}
          </div>

        </div>

        <div class="detail-description">

          ${annonce.description || ""}

        </div>

        <button
          class="btn btn-primary detail-contact"
        >
          💬 Contacter le parent
        </button>

      </div>

    </div>

  `;
}

loadAnnonce();
