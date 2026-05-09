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

  // =========================
  // RELATED ADS
  // =========================

  const { data: relatedAds } = await supabaseClient
    .from("annonces")
    .select("*")
    .eq("status", "published")
    .eq("etablissement", annonce.etablissement)
    .neq("id", annonce.id)
    .limit(4);

  // =========================

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

        <a
          href="index.html"

          style="
            display:inline-flex;
            align-items:center;
            gap:8px;
            margin-bottom:25px;
            font-weight:800;
            color:#159447;
          "
        >
          ← Retour aux annonces
        </a>

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

        <div class="detail-date">

          🕒 Publié le
          ${
            new Date(annonce.created_at)
              .toLocaleDateString("fr-FR")
          }

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

    <section class="related-section">

      <h2>
        📚 Autres annonces pour
        ${annonce.etablissement}
      </h2>

      <div class="related-grid">

        ${
          relatedAds && relatedAds.length

          ?

          relatedAds.map(ad => `

            <a
              href="annonce.html?id=${ad.id}"

              class="related-card"
            >

              <img
                src="${
                  ad.photo_url || ""
                }"

                class="related-image"
              >

              <div class="related-body">

                <h3>
                  ${ad.title}
                </h3>

                <p>
                  ${ad.price_label || ""}
                </p>

              </div>

            </a>

          `).join("")

          :

          `
            <p>
              Aucune autre annonce pour cet établissement.
            </p>
          `
        }

      </div>

    </section>

  `;
}

loadAnnonce();
