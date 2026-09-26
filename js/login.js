const formLogin =
    document.getElementById("formLogin");


const mensajeLogin =
    document.getElementById("mensajeLogin");


const btnLogin =
    document.getElementById("btnLogin");



/* ============================= */
/* COMPROBAR SESIÓN EXISTENTE    */
/* ============================= */

async function comprobarSesion() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session) {

        window.location.href =
            "mama.html";

    }

}


comprobarSesion();



/* ============================= */
/* INICIAR SESIÓN                */
/* ============================= */

formLogin.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const correo =
            document
                .getElementById("correo")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        mensajeLogin.textContent =
            "Verificando...";


        mensajeLogin.style.color =
            "#667085";


        btnLogin.disabled = true;

        btnLogin.textContent =
            "Ingresando...";


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email: correo,

                    password: password

                });


        if (error) {

            console.error(
                "Error de login:",
                error
            );


            mensajeLogin.textContent =
                "❌ Correo o contraseña incorrectos.";


            mensajeLogin.style.color =
                "#b42318";


            btnLogin.disabled = false;

            btnLogin.textContent =
                "Iniciar sesión";


            return;

        }


        console.log(
            "Sesión iniciada:",
            data.user
        );


        mensajeLogin.textContent =
            "✅ Acceso correcto";


        mensajeLogin.style.color =
            "#027a48";


        window.location.href =
            "mama.html";

    }
);