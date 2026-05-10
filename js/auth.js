const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const msg = document.getElementById("authMessage");

document.getElementById("googleLogin").addEventListener("click", async () => {
  const rgpd = document.getElementById("rgpd").checked;
  if(!rgpd){
    msg.textContent = "Tu dois accepter la politique de confidentialité.";
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({

  provider: "google",

  options: {

    redirectTo:
      "https://bsbinfoweb-arch.github.io/Parenteze/index.html",

    queryParams:{
      prompt:"select_account"
    }
  }
});

  if(error) msg.textContent = error.message;
});

document.getElementById("emailSignup").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const rgpd = document.getElementById("rgpd").checked;

  if(!rgpd){
    msg.textContent = "Tu dois accepter la politique de confidentialité.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if(error){
    msg.textContent = error.message;
    return;
  }

  msg.textContent = "Compte créé. Vérifie ton email si une confirmation est demandée.";

  if(data.user){
    await supabaseClient.from("profiles").update({ rgpd_accepted:true }).eq("id", data.user.id);
    await supabaseClient.from("consents").insert({
      user_id:data.user.id,
      consent_type:"privacy_policy",
      accepted:true
    });
  }
});

document.getElementById("emailLogin").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if(error){
    msg.textContent = error.message;
    return;
  }

  window.location.href = "index.html";
});
