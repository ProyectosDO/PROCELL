// =====================================================
// PROCELL - AUTENTICACIÓN ADMINISTRADOR
// =====================================================

console.log("AUTH JS INICIADO");


// =====================================================
// ELEMENTOS DEL LOGIN
// =====================================================

const loginScreen =
    document.getElementById("loginScreen");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


// =====================================================
// MOSTRAR MENSAJE
// =====================================================

function mostrarMensajeLogin(
    mensaje,
    tipo = "error"
) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        mensaje;


    loginMessage.classList.remove(
        "hidden",
        "bg-red-100",
        "text-red-700",
        "bg-green-100",
        "text-green-700"
    );


    if (tipo === "success") {

        loginMessage.classList.add(
            "bg-green-100",
            "text-green-700"
        );

    }

    else {

        loginMessage.classList.add(
            "bg-red-100",
            "text-red-700"
        );

    }

}


// =====================================================
// MOSTRAR PANEL
// =====================================================

function mostrarPanelAdmin() {

    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }


    if (adminPanel) {

        adminPanel.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// MOSTRAR LOGIN
// =====================================================

function mostrarLogin() {

    if (adminPanel) {

        adminPanel.classList.add(
            "hidden"
        );

    }


    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// VERIFICAR SESIÓN ACTUAL
// =====================================================

async function verificarSesion() {

    console.log(
        "Verificando sesión..."
    );

   
    const {
        data,
        error
    } = await supabaseClient.auth.getSession();
    


    if (error) {

        console.error(
            "Error verificando sesión:",
            error
        );

        mostrarLogin();

        return;

    }


    if (
        data &&
        data.session
    ) {

        console.log(
            "✅ Usuario autenticado"
        );

        mostrarPanelAdmin();

    }

    else {

        console.log(
            "🔒 No hay sesión activa"
        );

        mostrarLogin();

    }

}


// =====================================================
// INICIAR SESIÓN
// =====================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (
                !email ||
                !password
            ) {

                mostrarMensajeLogin(
                    "Ingresa tu correo y contraseña."
                );

                return;

            }


            // Desactivar botón

            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Iniciando sesión...";

            }


            // Limpiar mensaje anterior

            if (loginMessage) {

                loginMessage.classList.add(
                    "hidden"
                );

            }


            try {

    console.log(
        "Intentando iniciar sesión con:",
        email
    );


    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email:
                email,

            password:
                password

        });


    console.log(
        "Resultado del inicio de sesión:",
        {
            data,
            error
        }
    );


    if (error) {

    console.error(
        "Error de inicio de sesión:",
        error
    );

    mostrarMensajeLogin(
        "Correo o contraseña incorrectos."
    );

    return;

}


    console.log(
        "✅ Inicio de sesión correcto:",
        data.user
    );


    mostrarPanelAdmin();

}

            catch (error) {

                console.error(
                    "Error inesperado:",
                    error
                );


                mostrarMensajeLogin(
                    "Ocurrió un error al iniciar sesión."
                );

            }

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Iniciar sesión";

                }

            }

        }
    );

}


// =====================================================
// INICIAR VERIFICACIÓN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        verificarSesion();

    }
);

// =====================================================
// CERRAR SESIÓN
// =====================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            console.log(
                "Cerrando sesión..."
            );


            logoutButton.disabled =
                true;


            logoutButton.textContent =
                "Cerrando sesión...";


            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Error cerrando sesión:",
                    error
                );


                logoutButton.disabled =
                    false;


                logoutButton.textContent =
                    "Cerrar sesión";


                return;

            }


            console.log(
                "✅ Sesión cerrada correctamente"
            );


            // Ocultar panel

            mostrarLogin();


            // Limpiar formulario

            if (loginForm) {

                loginForm.reset();

            }

        }
    );

}