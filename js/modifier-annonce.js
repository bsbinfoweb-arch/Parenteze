const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const message =
  document.getElementById("message");

// =========================
// LOAD
// =========================

async function loadAnnonce(){

  const { data } =
    await supabaseClient.auth.getUser();

  const user = data.user;

  if(!user){

    window.location.href =
      "login.html";

    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const id =
    params.get("id");

  if(!id){

    message.textContent =
      "Annonce introuvable.";

    return;
  }

  const { data: annonce, error } =
    await supabaseClient

      .from("annonces")

      .select("*")

      .eq("id", id)

      .single();

  if(error || !annonce){

    message.textContent =
      "Annonce introuvable.";

    return;
  }

  // =========================
  // SECURITY
  // =========================

  if(annonce.user_id !== user.id){

    message.textContent =
      "Accès refusé.";

    return;
  }

  // =========================
  // PREFILL
  // =========================

  document.getElementById("title")
    .value = annonce.title || "";

  document.getElementById("description")
    .value = annonce.description || "";

  document.getElementById("price")
    .value = annonce.price || "";

  // =========================
  // SAVE
  // =========================

  document
    .getElementById("saveBtn")

    .addEventListener(
      "click",

      async () => {

        const { error } =
          await supabaseClient

            .from("annonces")

            .update({

              title:
                document
                  .getElementById("title")
                  .value
                  .trim(),

              description:
                document
                  .getElementById("description")
                  .value
                  .trim(),

              price:
                Number(
                  document
                    .getElementById("price")
                    .value
                ) || null
            })

            .eq("id", id);

        if(error){

          message.textContent =
            error.message;

          return;
        }

        message.textContent =
          "Annonce mise à jour.";
      }
    );
}

loadAnnonce();