const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const statusBox = document.getElementById("adminStatus");
const pendingBox = document.getElementById("pendingAds");

async function checkAdmin(){
  const { data: auth } = await supabaseClient.auth.getUser();
  if(!auth.user){
    window.location.href = "login.html";
    return false;
  }

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

if(!profile){
  statusBox.innerHTML = "<p>Profil introuvable.</p>";
  return false;
}

  statusBox.innerHTML = "<p>Connecté en administrateur.</p>";
  return true;
}

async function loadPending(){
  const ok = await checkAdmin();
  if(!ok) return;

  const { data, error } = await supabaseClient
    .from("annonces")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending:false });

  if(error){
    pendingBox.textContent = error.message;
    return;
  }

  if(!data.length){
    pendingBox.innerHTML = "<p>Aucune annonce en attente.</p>";
    return;
  }

  pendingBox.innerHTML = data.map(a => `
    <div class="admin-ad">
      <h3>${a.title}</h3>
      <p>${a.description || ""}</p>
      <p><strong>${a.price_label || ""}</strong> — ${a.commune || ""} — ${a.etablissement || ""}</p>
      ${a.photo_url ? `<img src="${a.photo_url}" style="max-width:220px;border-radius:10px">` : ""}
      <br><br>
      <button class="btn btn-primary" onclick="moderate('${a.id}','published')">Valider</button>
      <button class="btn btn-outline" onclick="moderate('${a.id}','rejected')">Refuser</button>
    </div>
  `).join("");
}

window.moderate = async function(id, status){
  const { error } = await supabaseClient.from("annonces").update({ status }).eq("id", id);
  if(error) alert(error.message);
  await loadPending();
}

loadPending();
