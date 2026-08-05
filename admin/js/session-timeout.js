/* =========================================================
   PROCELL
   CONTROL DE SESIÓN POR INACTIVIDAD

   Archivo:
   admin/js/session-timeout.js

   FUNCIONAMIENTO:

   - Solo funciona si existe una sesión activa en Supabase.
   - Detecta actividad del usuario.
   - La actividad reinicia el contador.
   - Después del tiempo de inactividad aparece un aviso.
   - Mover el mouse NO cierra el aviso.
   - El aviso solo desaparece al pulsar
     "Continuar sesión".
   - Si no pulsa el botón, se cierra la sesión.
   - Si la sesión ya está cerrada, no aparece ningún aviso.
   ========================================================= */


/* =========================================================
   1. CONFIGURACIÓN
   ========================================================= */


/*
   TIEMPO MÁXIMO DE INACTIVIDAD

   Para producción:
   30 minutos

   Para probar:
   1 * 60 * 1000
*/

const INACTIVITY_LIMIT =
   15  * 60 * 1000;


/*
   Tiempo de aviso antes de cerrar sesión.

   1 minuto
*/

const WARNING_TIME =
    60 * 1000;


/*
   Cada cuánto comprobamos
   la inactividad.

   10 segundos
*/

const CHECK_INTERVAL =
    10 * 1000;


/* =========================================================
   2. VARIABLES
   ========================================================= */


/*
   Última actividad registrada
*/

let lastActivityTime =
    Date.now();


/*
   Indica si el aviso está visible
*/

let warningShown =
    false;


/*
   Indica si el cierre está en proceso
*/

let logoutInProgress =
    false;


/*
   Indica si existe una sesión activa
*/

let sessionActive =
    false;


/*
   ID del intervalo
*/

let inactivityInterval =
    null;


/* =========================================================
   3. COMPROBAR SESIÓN ACTIVA
   ========================================================= */

async function checkActiveSession() {

    try {

        /*
           Verificar que Supabase exista
        */

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "❌ supabaseClient no está disponible."
            );

            return false;

        }


        /*
           Obtener sesión actual
        */

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        /*
           Si existe un error
        */

        if (error) {

            console.error(
                "❌ Error comprobando sesión:",
                error
            );

            return false;

        }


        /*
           Obtener sesión
        */

        const session =
            data?.session;


        /*
           Si no existe sesión
        */

        if (!session) {

            sessionActive =
                false;

            stopInactivityMonitor();

            removeInactivityWarning();

            return false;

        }


        /*
           Existe una sesión válida
        */

        sessionActive =
            true;


        return true;


    } catch (error) {

        console.error(
            "❌ Error verificando sesión:",
            error
        );

        return false;

    }

}


/* =========================================================
   4. REGISTRAR ACTIVIDAD
   ========================================================= */

function registerActivity() {


    /*
       Si no hay sesión activa,
       no hacemos absolutamente nada.
    */

    if (!sessionActive) {

        return;

    }


    /*
       Si estamos cerrando sesión,
       no hacemos nada.
    */

    if (logoutInProgress) {

        return;

    }


    /*
       Verificar si el aviso está visible
    */

    const warning =
        document.getElementById(
            "procell-inactivity-warning"
        );


    /*
       Si el aviso está visible,
       NO desaparecerá por actividad.

       Solo desaparecerá con el botón
       "Continuar sesión".
    */

    if (warning) {

        return;

    }


    /*
       Actualizar última actividad
    */

    lastActivityTime =
        Date.now();


    console.log(
        "🟢 Actividad detectada."
    );

}


/* =========================================================
   5. DETECTAR ACTIVIDAD
   ========================================================= */

const activityEvents = [

    "mousemove",

    "mousedown",

    "click",

    "keydown",

    "scroll",

    "touchstart",

    "touchmove",

    "wheel"

];


activityEvents.forEach(

    function(eventName) {

        document.addEventListener(

            eventName,

            function() {

                registerActivity();

            },

            {
                passive: true
            }

        );

    }

);


/* =========================================================
   6. MOSTRAR AVISO
   ========================================================= */

function showInactivityWarning() {


    /*
       Si no hay sesión activa,
       NO mostrar aviso.
    */

    if (!sessionActive) {

        return;

    }


    /*
       Si ya se mostró,
       no mostrarlo otra vez.
    */

    if (warningShown) {

        return;

    }


    /*
       Marcar aviso mostrado
    */

    warningShown =
        true;


    /*
       Crear aviso
    */

    const warning =
        document.createElement(
            "div"
        );


    warning.id =
        "procell-inactivity-warning";


    warning.innerHTML = `

        <div class="procell-warning-box">

            <div class="procell-warning-icon">

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>

            </div>


            <div class="procell-warning-content">

                <h3>

                    Sesión a punto de cerrarse

                </h3>


                <p>

                    Tu sesión se cerrará automáticamente
                    por inactividad en aproximadamente
                    1 minuto.

                </p>


                <button
                    id="procell-continue-session"
                    type="button"
                >

                    Continuar sesión

                </button>

            </div>

        </div>

    `;


    /*
       Agregar al documento
    */

    document.body.appendChild(
        warning
    );


    /*
       Obtener botón
    */

    const continueButton =
        document.getElementById(
            "procell-continue-session"
        );


    /*
       Evento del botón
    */

    if (continueButton) {

        continueButton.addEventListener(

            "click",

            function() {


                /*
                   Reiniciar contador
                */

                lastActivityTime =
                    Date.now();


                /*
                   Marcar que ya no
                   se muestra el aviso
                */

                warningShown =
                    false;


                /*
                   Eliminar aviso
                */

                removeInactivityWarning();


                console.log(
                    "🟢 Sesión continuada por el usuario."
                );


            }

        );

    }

}


/* =========================================================
   7. ELIMINAR AVISO
   ========================================================= */

function removeInactivityWarning() {

    const warning =
        document.getElementById(
            "procell-inactivity-warning"
        );


    if (warning) {

        warning.remove();

    }


    warningShown =
        false;

}


/* =========================================================
   8. CERRAR SESIÓN POR INACTIVIDAD
   ========================================================= */

async function logoutDueToInactivity() {


    /*
       Evitar múltiples ejecuciones
    */

    if (logoutInProgress) {

        return;

    }


    /*
       Marcar proceso
    */

    logoutInProgress =
        true;


    /*
       Marcar sesión como inactiva
    */

    sessionActive =
        false;


    /*
       Detener temporizador
    */

    stopInactivityMonitor();


    /*
       Eliminar aviso
    */

    removeInactivityWarning();


    console.log(
        "⏰ Cerrando sesión por inactividad..."
    );


    try {


        /*
           Cerrar sesión en Supabase
        */

        if (
            typeof supabaseClient !==
            "undefined"
        ) {

            await supabaseClient.auth.signOut();

        }


    } catch (error) {

        console.error(
            "❌ Error cerrando sesión:",
            error
        );

    }


    /*
       Mostrar mensaje
    */

    alert(
        "Tu sesión se cerró automáticamente por inactividad."
    );


    /*
       Redirigir al login
    */

    window.location.href =
        "index.html";

}


/* =========================================================
   9. COMPROBAR INACTIVIDAD
   ========================================================= */

async function checkInactivity() {


    /*
       Si no hay sesión activa,
       detener todo.
    */

    if (!sessionActive) {

        return;

    }


    /*
       Verificar que la sesión
       todavía exista en Supabase
    */

    const active =
        await checkActiveSession();


    /*
       Si ya no existe sesión,
       detener proceso.
    */

    if (!active) {

        return;

    }


    /*
       Obtener hora actual
    */

    const currentTime =
        Date.now();


    /*
       Calcular inactividad
    */

    const inactiveTime =
        currentTime -
        lastActivityTime;


    /*
       Calcular tiempo restante
    */

    const remainingTime =
        INACTIVITY_LIMIT -
        inactiveTime;


    /*
       Mostrar aviso
    */

    if (

        remainingTime <=
        WARNING_TIME

        &&

        remainingTime > 0

    ) {

        showInactivityWarning();

    }


    /*
       Cerrar sesión
    */

    if (

        inactiveTime >=
        INACTIVITY_LIMIT

    ) {

        await logoutDueToInactivity();

    }

}


/* =========================================================
   10. INICIAR MONITOR
   ========================================================= */

function startInactivityMonitor() {


    /*
       Evitar iniciar
       varios intervalos
    */

    if (inactivityInterval) {

        return;

    }


    /*
       Actividad inicial
    */

    lastActivityTime =
        Date.now();


    /*
       Crear intervalo
    */

    inactivityInterval =
        setInterval(

            checkInactivity,

            CHECK_INTERVAL

        );


    console.log(
        "🔐 Monitor de inactividad iniciado."
    );

}


/* =========================================================
   11. DETENER MONITOR
   ========================================================= */

function stopInactivityMonitor() {


    /*
       Si existe intervalo
    */

    if (inactivityInterval) {


        /*
           Detener intervalo
        */

        clearInterval(
            inactivityInterval
        );


        /*
           Limpiar variable
        */

        inactivityInterval =
            null;


        console.log(
            "🔒 Monitor de inactividad detenido."
        );

    }

}


/* =========================================================
   12. ESCUCHAR CAMBIOS DE AUTENTICACIÓN
   ========================================================= */

async function setupAuthListener() {


    /*
       Verificar sesión inicial
    */

    const active =
        await checkActiveSession();


    /*
       Si existe sesión
    */

    if (active) {


        /*
           Iniciar monitor
        */

        startInactivityMonitor();


    } else {


        /*
           No hay sesión
        */

        stopInactivityMonitor();


    }


    /*
       Escuchar cambios de Supabase Auth
    */

    if (
        typeof supabaseClient !==
        "undefined"
    ) {


        supabaseClient.auth.onAuthStateChange(

            function(
                event,
                session
            ) {


                console.log(

                    "🔐 Cambio de autenticación:",

                    event

                );


                /*
                   Si existe sesión
                */

                if (session) {


                    /*
                       Activar sesión
                    */

                    sessionActive =
                        true;


                    /*
                       Reiniciar contador
                    */

                    lastActivityTime =
                        Date.now();


                    /*
                       Iniciar monitor
                    */

                    startInactivityMonitor();


                } else {


                    /*
                       No hay sesión
                    */

                    sessionActive =
                        false;


                    /*
                       Detener monitor
                    */

                    stopInactivityMonitor();


                    /*
                       Eliminar aviso
                    */

                    removeInactivityWarning();

                }

            }

        );

    }

}


/* =========================================================
   13. ESTILOS DEL AVISO
   ========================================================= */

const inactivityStyles =
    document.createElement(
        "style"
    );


inactivityStyles.textContent = `

    #procell-inactivity-warning {

        position: fixed;

        inset: 0;

        width: 100%;

        height: 100%;

        display: flex;

        align-items: center;

        justify-content: center;

        background:
            rgba(
                0,
                0,
                0,
                0.45
            );

        backdrop-filter:
            blur(4px);

        -webkit-backdrop-filter:
            blur(4px);

        z-index: 99999;

        padding: 20px;

        box-sizing: border-box;

    }


    .procell-warning-box {

        width: 100%;

        max-width: 460px;

        display: flex;

        align-items: flex-start;

        gap: 18px;

        padding: 25px;

        background: #ffffff;

        border-radius: 18px;

        box-shadow:
            0 20px 50px
            rgba(
                0,
                0,
                0,
                0.25
            );

        animation:
            procellWarningAppear
            0.25s
            ease;

    }


    .procell-warning-icon {

        width: 50px;

        height: 50px;

        min-width: 50px;

        display: flex;

        align-items: center;

        justify-content: center;

        border-radius: 50%;

        background: #fff7ed;

        font-size: 24px;

    }


    .procell-warning-content {

        flex: 1;

    }


    .procell-warning-content h3 {

        margin:
            0 0 8px 0;

        color:
            #111827;

        font-size:
            19px;

        font-weight:
            700;

    }


    .procell-warning-content p {

        margin:
            0 0 18px 0;

        color:
            #6b7280;

        font-size:
            14px;

        line-height:
            1.6;

    }


    #procell-continue-session {

        border:
            none;

        padding:
            10px
            18px;

        border-radius:
            10px;

        background:
            #f97316;

        color:
            white;

        font-weight:
            600;

        cursor:
            pointer;

        transition:
            all
            0.2s
            ease;

    }


    #procell-continue-session:hover {

        background:
            #ea580c;

        transform:
            translateY(-1px);

    }


    @keyframes procellWarningAppear {

        from {

            opacity:
                0;

            transform:
                scale(0.95)
                translateY(10px);

        }

        to {

            opacity:
                1;

            transform:
                scale(1)
                translateY(0);

        }

    }


    @media (
        max-width: 480px
    ) {

        .procell-warning-box {

            padding:
                20px;

            gap:
                12px;

        }


        .procell-warning-icon {

            width:
                42px;

            height:
                42px;

            min-width:
                42px;

            font-size:
                20px;

        }


        .procell-warning-content h3 {

            font-size:
                17px;

        }

    }

`;


/*
   Agregar estilos
*/

document.head.appendChild(
    inactivityStyles
);


/* =========================================================
   14. INICIAR CUANDO CARGA LA PÁGINA
   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        setupAuthListener();

    }

);