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

  console.log(data);

  document.getElementById("statAds").textContent = data.length;

  const grid = document.getElementById("adminAds");

  grid.innerHTML = "";

  data.forEach(ad => {

    let statusColor = "#666";

    if(ad.status === "published"){
      statusColor = "#159447";
    }

    if(ad.status === "pending"){
      statusColor = "#ff9800";
    }

    if(ad.status === "rejected"){
      statusColor = "#e53935";
    }

    grid.innerHTML += `

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
          ""
        }

        <h3>
          ${ad.title || "Sans titre"}
        </h3>

        <p>
          ${ad.description || ""}
        </p>

        <p>
          <strong>Statut :</strong>

          <span style="
            color:${statusColor};
            font-weight:700;
          ">
            ${ad.status || "pending"}
          </span>
        </p>

        <div style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:14px;
        ">

          <button
            onclick="publishAd('${ad.id}')"
            class="btn btn-primary"
          >
            ✅ Publier
          </button>

          <button
            onclick="rejectAd('${ad.id}')"
            class="btn btn-outline"
          >
            ❌ Refuser
          </button>

        </div>

      </div>

    `;
  });
}

  // =========================
  // STATS
  // =========================

  document.getElementById("statAds").textContent = data.length;

  // =========================
  // GRID
  // =========================

  const grid = document.getElementById("adminAds");

  grid.innerHTML = "";

  data.forEach(ad => {

    let statusColor = "#666";

    if(ad.status === "published"){
      statusColor = "#159447";
    }

    if(ad.status === "pending"){
      statusColor = "#ff9800";
    }

    if(ad.status === "rejected"){
      statusColor = "#e53935";
    }

    grid.innerHTML += `
      <div class="admin-ad">

        ${ad.photo_url ? `
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
        ` : ""}

        <h3>
          ${ad.title || "Sans titre"}
        </h3>

        <p>
          ${ad.description || ""}
        </p>

        <p>
          <strong>Statut :</strong>

          <span style="
            color:${statusColor};
            font-weight:700;
          ">
            ${ad.status || "pending"}
          </span>
        </p>

        <div style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:14px;
        ">

          <button
            onclick="publishAd('${ad.id}')"
            class="btn btn-primary"
          >
            ✅ Publier
          </button>

          <button
            onclick="rejectAd('${ad.id}')"
            class="btn btn-outline"
          >
            ❌ Refuser
          </button>

        </div>

      </div>
    `;
  });

}

// =========================
// PUBLISH
// =========================

async function publishAd(id){

  const { error } = await supabaseClient
    .from("annonces")
    .update({
      status:"published"
    })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadDashboard();
}

// =========================
// REJECT
// =========================

async function rejectAd(id){

  const { error } = await supabaseClient
    .from("annonces")
    .update({
      status:"rejected"
    })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadDashboard();
}

loadDashboard();
