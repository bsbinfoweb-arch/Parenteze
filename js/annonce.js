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

    <div style="
      max-width:1100px;
      margin:auto;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:40px;
      align-items:start;
    ">

      <div>

        ${
          annonce.photo_url
          ?
          `
            <img
              src="${annonce.photo_url}"

              style="
                width:100%;
                border-radius:24px;
                object-fit:cover;
                box-shadow:0 15px 35px rgba(0,0,0,0.08);
              "
            >
          `
          :
          ""
        }

      </div>

      <div>

        <h1 style="
          font-size:42px;
          margin-top:0;
        ">
          ${annonce.title}
        </h1>

        <p style="
          font-size:30px;
          font-weight:800;
          color:#159447;
          margin-top:10px;
        ">
          ${annonce.price_label || ""}
        </p>

        <div style="
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          margin:25px 0;
        ">

          <div class="btn btn-outline">
            📍 ${annonce.commune || "Non renseigné"}
          </div>

          <div class="btn btn-outline">
            🏫 ${annonce.etablissement || "Non renseigné"}
          </div>

        </div>

        <p style="
          line-height:1.8;
          font-size:17px;
        ">
          ${annonce.description || ""}
        </p>

        <button class="btn btn-primary" style="margin-top:30px;">
          💬 Contacter le parent
        </button>

      </div>

    </div>

  `;
}

loadAnnonce();