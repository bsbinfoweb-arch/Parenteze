const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const msg = document.getElementById("postMessage");

async function requireUser(){
  const { data } = await supabaseClient.auth.getUser();
  if(!data.user){
    alert("Tu dois te connecter avant de déposer une annonce.");
    window.location.href = "login.html";
    return null;
  }
  return data.user;
}

async function loadCategories(){
  const { data } = await supabaseClient.from("categories").select("*").order("id");
  document.getElementById("category").innerHTML = (data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function uploadPhoto(userId){
  const file = document.getElementById("photo").files[0];
  if(!file) return null;

  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabaseClient.storage.from("annonce-photos").upload(path, file);
  if(error){
    msg.textContent = "Erreur photo : " + error.message;
    return null;
  }

  const { data } = supabaseClient.storage.from("annonce-photos").getPublicUrl(path);
  return data.publicUrl;
}

document.getElementById("submitAd").addEventListener("click", async () => {
  const user = await requireUser();
  if(!user) return;

  const photoUrl = await uploadPhoto(user.id);

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priceValue = document.getElementById("price").value;
  const annonceType = document.getElementById("annonceType").value;

  if(!title){
    msg.textContent = "Le titre est obligatoire.";
    return;
  }

  const { error } = await supabaseClient.from("annonces").insert({
    user_id:user.id,
    title,
    description,
    price: priceValue ? Number(priceValue) : null,
    price_label: priceValue ? `${priceValue} €` : (annonceType === "donate" ? "Gratuit" : "À discuter"),
    annonce_type: annonceType,
    category_id: Number(document.getElementById("category").value),
    commune: document.getElementById("commune").value.trim(),
    etablissement: document.getElementById("etablissement").value.trim(),
    photo_url: photoUrl,
    status:"pending"
  });

  if(error){
    msg.textContent = error.message;
    return;
  }

  msg.textContent = "Annonce envoyée. Elle sera visible après validation.";
});

requireUser();
loadCategories();
