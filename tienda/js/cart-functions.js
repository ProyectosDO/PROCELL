// =====================================================
// PROCELL - FUNCIONES DEL CARRITO
// =====================================================

console.log("CART-FUNCTIONS JS INICIADO");


// =====================================================
// CARRITO
// =====================================================

let carritoProductos = [];


// =====================================================
// AGREGAR PRODUCTO AL CARRITO
// =====================================================

function agregarAlCarrito(producto) {

    console.log("➕ Agregando producto:", producto);

    if (!producto) {

        console.error("❌ Producto no válido");

        return;

    }


    // Buscar si ya existe

    const productoExistente =
        carritoProductos.find(function (item) {

            return String(item.id) ===
                String(producto.id);

        });


    // Si existe, aumentar cantidad

    if (productoExistente) {

        productoExistente.cantidad++;

    }


    // Si no existe, agregarlo

    else {

        let imagenURL = "";


        if (
            producto.imagenes &&
            producto.imagenes.length > 0
        ) {

            if (
                typeof obtenerURLImagen === "function"
            ) {

                imagenURL =
                    obtenerURLImagen(
                        producto.imagenes[0]
                    );

            }

        }


        carritoProductos.push({

            id: producto.id,

            name: producto.name || "Producto",

            brand: producto.brand || "",

            model: producto.model || "",

            price: Number(producto.price || 0),

            imagen: imagenURL,

            cantidad: 1

        });

    }


    guardarCarrito();

    actualizarContadorCarrito();

    mostrarProductosCarrito();


     // Abrir carrito automáticamente

     // =====================================================
     // MOSTRAR MENSAJE DE PRODUCTO AGREGADO
     // =====================================================

     mostrarMensajeCarrito();


    console.log(
        "✅ Producto agregado correctamente"
    );

}


// =====================================================
// GUARDAR CARRITO
// =====================================================

function guardarCarrito() {

    localStorage.setItem(

        "procell_carrito",

        JSON.stringify(
            carritoProductos
        )

    );

}


// =====================================================
// CARGAR CARRITO
// =====================================================

function cargarCarrito() {

    const carritoGuardado =
        localStorage.getItem(
            "procell_carrito"
        );


    if (carritoGuardado) {

        try {

            carritoProductos =
                JSON.parse(
                    carritoGuardado
                );


            if (
                !Array.isArray(
                    carritoProductos
                )
            ) {

                carritoProductos = [];

            }

        }

        catch (error) {

            console.error(
                "❌ Error cargando carrito:",
                error
            );

            carritoProductos = [];

        }

    }


    actualizarContadorCarrito();

    mostrarProductosCarrito();

}


// =====================================================
// MOSTRAR PRODUCTOS DEL CARRITO
// =====================================================

function mostrarProductosCarrito() {

    const contenedor =
        document.getElementById(
            "cartItems"
        );


    if (!contenedor) {

        return;

    }


    // =================================================
    // CARRITO VACÍO
    // =================================================

    if (
        carritoProductos.length === 0
    ) {

        contenedor.innerHTML =
            '<div class="text-center py-16">' +

                '<div class="text-5xl mb-4">' +
                    '🛒' +
                '</div>' +

                '<h3 class="font-bold text-lg">' +
                    'Tu carrito está vacío' +
                '</h3>' +

                '<p class="text-gray-500 mt-2">' +
                    'Agrega productos para comenzar tu pedido.' +
                '</p>' +

            '</div>';


        actualizarTotalCarrito();

        return;

    }


    // =================================================
    // LIMPIAR CONTENEDOR
    // =================================================

    contenedor.innerHTML = "";


    // =================================================
    // MOSTRAR PRODUCTOS
    // =================================================

    carritoProductos.forEach(
        function (producto) {


            const subtotal =

                Number(
                    producto.price || 0
                )

                *

                Number(
                    producto.cantidad || 1
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "flex gap-4 py-4 border-b";


            // =================================================
            // CREAR IMAGEN
            // =================================================

            let imagenHTML = "";


            if (producto.imagen) {

                imagenHTML =
                    '<img ' +

                    'src="' +
                    producto.imagen +
                    '" ' +

                    'alt="' +
                    producto.name +
                    '" ' +

                    'class="w-full h-full object-contain">' ;

            }

            else {

                imagenHTML =
                    '<div class="w-full h-full flex items-center justify-center text-2xl">' +
                    '📦' +
                    '</div>';

            }


            // =================================================
            // CREAR MARCA
            // =================================================

            let marcaHTML = "";


            if (producto.brand) {

                marcaHTML =
                    '<p class="text-sm text-gray-500">' +

                    producto.brand +

                    '</p>';

            }


            // =================================================
            // CONTENIDO DEL PRODUCTO
            // =================================================

            item.innerHTML =

                '<div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">' +

                    imagenHTML +

                '</div>' +


                '<div class="flex-1 min-w-0">' +

                    '<h3 class="font-bold text-gray-800">' +

                        producto.name +

                    '</h3>' +


                    marcaHTML +


                    '<p class="text-orange-500 font-bold mt-1">' +

                        formatearPrecioCarrito(
                            producto.price
                        ) +

                    '</p>' +


                    '<div class="flex items-center gap-3 mt-3">' +


                        '<button ' +

                            'class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold" ' +

                            'data-action="restar" ' +

                            'data-id="' +
                            producto.id +
                            '">' +

                            '−' +

                        '</button>' +


                        '<span class="font-bold">' +

                            producto.cantidad +

                        '</span>' +


                        '<button ' +

                            'class="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold" ' +

                            'data-action="sumar" ' +

                            'data-id="' +
                            producto.id +
                            '">' +

                            '+' +

                        '</button>' +


                        '<button ' +

                            'class="ml-auto text-red-500 hover:text-red-700 text-sm font-semibold" ' +

                            'data-action="eliminar" ' +

                            'data-id="' +
                            producto.id +
                            '">' +

                            'Eliminar' +

                        '</button>' +


                    '</div>' +


                    '<p class="text-sm text-gray-500 mt-2">' +

                        'Subtotal: ' +

                        formatearPrecioCarrito(
                            subtotal
                        ) +

                    '</p>' +


                '</div>';


            contenedor.appendChild(
                item
            );

        }
    );


    // =================================================
    // BOTONES DEL CARRITO
    // =================================================

    contenedor
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            function (boton) {

                boton.addEventListener(
                    "click",
                    function () {

                        const accion =
                            this.dataset.action;


                        const id =
                            this.dataset.id;


                        if (
                            accion === "sumar"
                        ) {

                            cambiarCantidad(
                                id,
                                1
                            );

                        }


                        else if (
                            accion === "restar"
                        ) {

                            cambiarCantidad(
                                id,
                                -1
                            );

                        }


                        else if (
                            accion === "eliminar"
                        ) {

                            eliminarDelCarrito(
                                id
                            );

                        }

                    }
                );

            }
        );


    actualizarTotalCarrito();

}


// =====================================================
// CAMBIAR CANTIDAD
// =====================================================

function cambiarCantidad(
    id,
    cambio
) {

    const producto =
        carritoProductos.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!producto) {

        return;

    }


    producto.cantidad +=
        cambio;


    if (
        producto.cantidad <= 0
    ) {

        eliminarDelCarrito(id);

        return;

    }


    guardarCarrito();

    actualizarContadorCarrito();

    mostrarProductosCarrito();

}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

function eliminarDelCarrito(id) {

    carritoProductos =
        carritoProductos.filter(
            function (producto) {

                return String(producto.id) !==
                    String(id);

            }
        );


    guardarCarrito();

    actualizarContadorCarrito();

    mostrarProductosCarrito();

}

// =====================================================
// VACIAR CARRITO
// =====================================================

function vaciarCarrito() {

    console.log("🗑️ Vaciando carrito...");

    // Vaciar el array
    carritoProductos = [];

    // Guardar carrito vacío en localStorage
    guardarCarrito();

    // Actualizar contador
    actualizarContadorCarrito();

    // Mostrar carrito vacío
    mostrarProductosCarrito();

    console.log(
        "✅ Carrito vaciado correctamente"
    );

}
// =====================================================
// ACTUALIZAR CONTADOR
// =====================================================

// =====================================================
// ACTUALIZAR CONTADORES DEL CARRITO
// =====================================================

function actualizarContadorCarrito() {

    // =================================================
    // CONTADOR DEL BOTÓN DEL CARRITO
    // =================================================

    const contador =
        document.getElementById(
            "cartCount"
        );


    // =================================================
    // TEXTO DEL CARRITO
    // =================================================

    const cartSubtitle =
        document.getElementById(
            "cartSubtitle"
        );


    // =================================================
    // CALCULAR CANTIDAD TOTAL
    // =================================================

    let cantidadTotal = 0;


    carritoProductos.forEach(
        function (producto) {

            cantidadTotal +=
                Number(
                    producto.cantidad || 0
                );

        }
    );


    // =================================================
    // ACTUALIZAR NÚMERO DEL ICONO DEL CARRITO
    // =================================================

    if (contador) {

        if (
            cantidadTotal > 0
        ) {

            contador.textContent =
                cantidadTotal;


            contador.classList.remove(
                "hidden"
            );

        }

        else {

            contador.textContent =
                "0";


            contador.classList.add(
                "hidden"
            );

        }

    }


    // =================================================
    // ACTUALIZAR TEXTO "X PRODUCTOS"
    // =================================================

    if (cartSubtitle) {

        cartSubtitle.textContent =

            `${cantidadTotal} producto${
                cantidadTotal === 1
                    ? ""
                    : "s"
            }`;

    }

}


// =====================================================
// ACTUALIZAR TOTAL
// =====================================================

function actualizarTotalCarrito() {

    const elemento =
        document.getElementById(
            "cartTotal"
        );


    if (!elemento) {

        return;

    }


    let total = 0;


    carritoProductos.forEach(
        function (producto) {

            total +=

                Number(
                    producto.price || 0
                )

                *

                Number(
                    producto.cantidad || 1
                );

        }
    );


    elemento.textContent =
        formatearPrecioCarrito(
            total
        );


    const botonCheckout =
        document.getElementById(
            "checkoutWhatsApp"
        );


    if (botonCheckout) {

        botonCheckout.disabled =
            carritoProductos.length === 0;

    }

}


// =====================================================
// FORMATEAR PRECIO
// =====================================================

function formatearPrecioCarrito(
    precio
) {

    return Number(
        precio || 0
    ).toLocaleString(
        "es-CO",
        {

            style: "currency",

            currency: "COP",

            maximumFractionDigits: 0

        }
    );

}


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarCarrito();

        console.log(
            "✅ Funciones del carrito listas"
        );

    }
);


// =====================================================
// HACER FUNCIÓN GLOBAL
// =====================================================

window.agregarAlCarrito =
    agregarAlCarrito;

// =====================================================
// MENSAJE PRODUCTO AGREGADO
// =====================================================

function mostrarMensajeCarrito() {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    // Mostrar mensaje

    toast.textContent =
        "✅ Producto agregado al carrito";


    toast.classList.remove(
        "hidden"
    );


    // Ocultar después de 4 segundos

    setTimeout(
        function () {

            toast.classList.add(
                "hidden"
            );

        },
        1000
    );

}

// =====================================================
// BOTÓN VACIAR CARRITO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const clearCart =
            document.getElementById(
                "clearCart"
            );

        if (clearCart) {

            clearCart.addEventListener(
                "click",
                function () {

                    vaciarCarrito();

                }
            );

        }

    }
);