const supabaseClient = supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const msg = document.getElementById("authMessage");

/* =========================
   GOOGLE LOGIN / SIGNUP
========================= */

const googleBtn = document.getElementById("googleLogin");

if(googleBtn){

  googleBtn.addEventListener("click", async () => {

    const rgpd = document.getElementById("rgpd");

    // Si la checkbox existe (page inscription)
    if(rgpd && !rgpd.checked){

      msg.textContent =
        "Tu dois accepter la politique de confidentialité.";

      return;
    }

    const { error } =
      await supabaseClient.auth.signInWithOAuth({

        provider:"google",

        options:{

          redirectTo:
            "https://bsbinfoweb-arch.github.io/Parenteze/index.html",

          queryParams:{
            prompt:"select_account"
          }

        }

      });

    if(error){
      msg.textContent = error.message;
    }

  });

}

/* =========================
   INSCRIPTION EMAIL
========================= */

const signupBtn =
  document.getElementById("emailSignup");

if(signupBtn){

  signupBtn.addEventListener("click", async () => {

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    const rgpd =
      document.getElementById("rgpd").checked;

    if(!rgpd){

      msg.textContent =
        "Tu dois accepter la politique de confidentialité.";

      return;
    }

    const { error } =
      await supabaseClient.auth.signUp({

        email,
        password

      });

    if(error){

      msg.textContent = error.message;
      return;

    }

    msg.textContent =
      "Compte créé avec succès.";

    setTimeout(() => {

      window.location.href =
        "connection.html";

    },1500);

  });

}

/* =========================
   CONNEXION EMAIL
========================= */

const loginBtn =
  document.getElementById("emailLogin");

if(loginBtn){

  loginBtn.addEventListener("click", async () => {

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    const { error } =
      await supabaseClient.auth.signInWithPassword({

        email,
        password

      });

    if(error){

      msg.textContent = error.message;
      return;

    }

    window.location.href = "index.html";

  });

}
