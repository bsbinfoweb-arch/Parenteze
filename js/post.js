const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const msg = document.getElementById("postMessage");

// =========================
// USER
// =========================

async function requireUser(){

  const { data } = await supabaseClient.auth.getUser();

  if(!data.user){

    alert("Tu dois te connecter avant de déposer une annonce.");

    window.location.href = "login.html";

    return null;
  }

  return data.user;
}

// =========================
// LOAD CATEGORIES
// =========================

async function loadCategories(){

  const { data } = await supabaseClient
    .from("categories")
    .select("*")
    .order("id");

  document.getElementById("category").innerHTML =
    (data || []).map(c => `
      <option value="${c.id}">
        ${c.name}
      </option>
    `).join("");
}

// =========================
// UPLOAD PHOTOS
// =========================

async function uploadPhotos(userId){

  const files =
    document.getElementById("photos").files;

  if(!files.length){
    return [];
  }

  if(files.length > 2){

    alert("Maximum 2 photos");

    return [];
  }

  const urls = [];

  for(const file of files){

    const ext = file.name.split(".").pop();

    const path =
      `${userId}/${Date.now()}-${Math.random()}.${ext}`;

    const { error } = await supabaseClient
      .storage
      .from("annonce-photos")
      .upload(path, file);

    if(error){

      console.error(error);

      msg.textContent =
        "Erreur photo : " + error.message;

      continue;
    }

    const { data } = supabaseClient
      .storage
      .from("annonce-photos")
      .getPublicUrl(path);

    urls.push(data.publicUrl);
  }

  return urls;
}

// =========================
// SUBMIT
// =========================

document
  .getElementById("submitAd")
  .addEventListener("click", async () => {

    msg.textContent = "";

    const user = await requireUser();

    if(!user){
      return;
    }

    const photoUrls =
      await uploadPhotos(user.id);

    const title =
      document.getElementById("title").value.trim();

    const description =
      document.getElementById("description").value.trim();

    const priceValue =
      document.getElementById("price").value;

    const annonceType =
      document.getElementById("annonceType").value;

    const categoryValue =
      document.getElementById("category").value;

    if(!title){

      msg.textContent =
        "Le titre est obligatoire.";

      return;
    }

    const { error } = await supabaseClient
      .from("annonces")
      .insert({

        user_id: user.id,

        title: title,

        description: description,

        price: priceValue
          ? Number(priceValue)
          : null,

        price_label: priceValue
          ? `${priceValue} €`
          : (
              annonceType === "donate"
              ? "Gratuit"
              : "À discuter"
            ),

        annonce_type: annonceType,

        category_id: categoryValue || null,

        commune:
          document
            .getElementById("commune")
            .value
            .trim(),

        etablissement:
          document
            .getElementById("etablissement")
            .value
            .trim(),

        photo_urls: photoUrls,

        photo_url:
          photoUrls[0] || null,
        contact_type:
  document
    .getElementById("contactType")
    .value,

contact_value:
  document
    .getElementById("contactValue")
    .value
    .trim(),

        status: "pending"
      });

    if(error){

      console.error(error);

      msg.textContent =
        "Erreur : " + error.message;

      return;
    }

    msg.textContent =
      "Annonce envoyée avec succès. Elle sera visible après validation.";

    // RESET

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("commune").value = "";
    document.getElementById("etablissement").value = "";
    document.getElementById("photos").value = "";

  });

// =========================

requireUser();

loadCategories();
