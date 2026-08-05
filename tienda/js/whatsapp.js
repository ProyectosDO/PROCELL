// =====================================================
// PROCELL - WHATSAPP
// =====================================================

console.log("WHATSAPP JS INICIADO");


// =====================================================
// NÚMERO DE WHATSAPP DE PROCELL
// =====================================================

const NUMERO_WHATSAPP = "573007493965";


// =====================================================
// CONFIGURAR WHATSAPP
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Configurando botón de WhatsApp..."
        );


        const botonWhatsApp =
            document.getElementById(
                "checkoutWhatsApp"
            );


        if (!botonWhatsApp) {

            console.error(
                "❌ No se encontró checkoutWhatsApp"
            );

            return;

        }


        botonWhatsApp.addEventListener(
            "click",
            function () {

                console.log(
                    "📱 Botón WhatsApp presionado"
                );


                enviarPedidoWhatsApp();

            }
        );


        console.log(
            "✅ Botón de WhatsApp configurado"
        );

    }
);


// =====================================================
// ENVIAR PEDIDO A WHATSAPP
// =====================================================

function enviarPedidoWhatsApp() {

    console.log(
        "📱 Preparando pedido..."
    );


    // =================================================
    // OBTENER CARRITO ACTUAL
    // =================================================

    let carritoActual = [];


    // Primero intentar usar carritoProductos

    if (
        typeof carritoProductos !==
        "undefined"
    ) {

        carritoActual =
            carritoProductos;

    }


    // Si no existe, leer LocalStorage

    else {

        const carritoGuardado =
            localStorage.getItem(
                "procell_carrito"
            );


        if (carritoGuardado) {

            try {

                carritoActual =
                    JSON.parse(
                        carritoGuardado
                    );

            }

            catch (error) {

                console.error(
                    "❌ Error leyendo carrito:",
                    error
                );

                carritoActual = [];

            }

        }

    }


    // =================================================
    // COMPROBAR CARRITO
    // =================================================

    if (
        !Array.isArray(
            carritoActual
        ) ||
        carritoActual.length === 0
    ) {

        alert(
            "El carrito está vacío."
        );

        return;

    }


    console.log(
        "🛒 Productos a enviar:",
        carritoActual
    );


    // =================================================
    // CREAR MENSAJE
    // =================================================

    let mensaje =
        "Hola PROCELL 👋\n\n";


    mensaje +=
        "Quiero realizar el siguiente pedido:\n\n";


    let total = 0;


    // =================================================
    // RECORRER PRODUCTOS
    // =================================================

    carritoActual.forEach(
        function (
            producto,
            indice
        ) {


            const precio =
                Number(
                    producto.price || 0
                );


            const cantidad =
                Number(
                    producto.cantidad || 1
                );


            const subtotal =
                precio *
                cantidad;


            total +=
                subtotal;


            mensaje +=

                (
                    indice + 1
                ) +

                ". " +

                (
                    producto.name ||
                    "Producto"
                ) +

                "\n";


            if (
                producto.brand
            ) {

                mensaje +=

                    "Marca: " +

                    producto.brand +

                    "\n";

            }


            if (
                producto.model
            ) {

                mensaje +=

                    "Modelo: " +

                    producto.model +

                    "\n";

            }


            mensaje +=

                "Cantidad: " +

                cantidad +

                "\n";


            mensaje +=

                "Precio: " +

                formatearPrecioWhatsApp(
                    precio
                ) +

                "\n";


            mensaje +=

                "Subtotal: " +

                formatearPrecioWhatsApp(
                    subtotal
                ) +

                "\n\n";

        }
    );


    // =================================================
    // TOTAL
    // =================================================

    mensaje +=

        "TOTAL DEL PEDIDO: " +

        formatearPrecioWhatsApp(
            total
        ) +

        "\n\n";


    mensaje +=

        "¡Gracias! Quedo atento(a) a la confirmación. 😊";


    // =================================================
    // CREAR URL
    // =================================================

    const enlaceWhatsApp =

        "https://wa.me/" +

        NUMERO_WHATSAPP +

        "?text=" +

        encodeURIComponent(
            mensaje
        );


    console.log(
        "🔗 Enlace generado:",
        enlaceWhatsApp
    );


    // =================================================
    // ABRIR WHATSAPP
    // =================================================

    window.open(
        enlaceWhatsApp,
        "_blank"
    );

}


// =====================================================
// FORMATEAR PRECIO
// =====================================================

function formatearPrecioWhatsApp(
    precio
) {

    return Number(
        precio || 0
    ).toLocaleString(
        "es-CO",
        {

            style:
                "currency",

            currency:
                "COP",

            maximumFractionDigits:
                0

        }
    );

}
