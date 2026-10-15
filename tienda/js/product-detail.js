// =====================================================
// PROCELL - DETALLE DEL PRODUCTO
// =====================================================

console.log("✅ product-detail.js cargado");


// =====================================================
// VARIABLES
// =====================================================

let productoSeleccionado = null;


// =====================================================
// ABRIR DETALLE DEL PRODUCTO
// =====================================================

// ---- Galería: cambiar imagen (miniaturas y deslizar con el dedo) ----
let galeriaUrls = [];
let galeriaMiniaturas = [];
let galeriaIndice = 0;

function mostrarImagenGaleria(indice) {
    if (!galeriaUrls.length) return;

    galeriaIndice = (indice + galeriaUrls.length) % galeriaUrls.length;

    const img = document.getElementById("modalMainImage");
    if (img) img.src = galeriaUrls[galeriaIndice];

    galeriaMiniaturas.forEach(function (t, i) {
        t.classList.toggle("border-orange-500", i === galeriaIndice);
        t.classList.toggle("border-gray-200", i !== galeriaIndice);
    });

    const activa = galeriaMiniaturas[galeriaIndice];
    if (activa && activa.scrollIntoView) {
        activa.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const img = document.getElementById("modalMainImage");
    if (!img) return;

    const zona = img.parentElement || img;
    zona.style.touchAction = "pan-y"; // permite scroll vertical, captura el horizontal
    img.setAttribute("draggable", "false");

    let x0 = null, y0 = null;

    zona.addEventListener("touchstart", function (e) {
        if (e.touches.length !== 1) { x0 = null; return; }
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
    }, { passive: true });

    zona.addEventListener("touchend", function (e) {
        if (x0 === null || galeriaUrls.length < 2) return;
        const dx = e.changedTouches[0].clientX - x0;
        const dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            mostrarImagenGaleria(galeriaIndice + (dx < 0 ? 1 : -1));
        }
    }, { passive: true });
});

let modelosDisponibles = [];
let modeloSeleccionado = "";

function actualizarEnlaceWhatsAppDetalle() {
    const a = document.getElementById("modalWhatsApp");
    const p = productoSeleccionado;
    if (!a || !p) return;
    const mensaje =
        `Hola, estoy interesado en el producto:

${p.name || ""}

Marca: ${p.brand || ""}

Opción: ${modeloSeleccionado || textoModelos(p)}

Precio: ${formatearPrecioDetalle(p.price)}

¿Está disponible?`;
    a.href = `https://wa.me/573007493965?text=${encodeURIComponent(mensaje)}`;
}

function renderSelectorModelos() {
    const cont = document.getElementById("modalModelSelector");
    const opts = document.getElementById("modalModelOptions");
    const err = document.getElementById("modalModelError");
    if (!cont || !opts) return;

    opts.innerHTML = "";
    if (err) err.classList.add("hidden");

    if (modelosDisponibles.length <= 1) {
        cont.classList.add("hidden");
        return;
    }

    cont.classList.remove("hidden");

    modelosDisponibles.forEach(function (m) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = m;
        const base = "px-3.5 py-2 rounded-xl border text-sm font-semibold transition ";
        const off = base + "border-gray-200 bg-white text-gray-700 hover:border-orange-400";
        const on = base + "border-orange-500 bg-orange-500 text-white";
        b.className = off;
        b.addEventListener("click", function () {
            modeloSeleccionado = m;
            opts.querySelectorAll("button").forEach(function (x) { x.className = off; });
            b.className = on;
            if (err) err.classList.add("hidden");
            actualizarEnlaceWhatsAppDetalle();
        });
        opts.appendChild(b);
    });
}

function abrirDetalleProducto(producto) {

    console.log(
        "🔍 Abriendo producto:",
        producto
    );


    productoSeleccionado =
        producto;


    // =================================================
    // ELEMENTOS DEL MODAL
    // =================================================

    const modal =
        document.getElementById(
            "productModal"
        );


    const modalMainImage =
        document.getElementById(
            "modalMainImage"
        );


    const modalThumbnails =
        document.getElementById(
            "modalThumbnails"
        );


    const modalBrand =
        document.getElementById(
            "modalBrand"
        );


    const modalName =
        document.getElementById(
            "modalName"
        );


    const modalModel =
        document.getElementById(
            "modalModel"
        );


    const modalPrice =
        document.getElementById(
            "modalPrice"
        );


    const modalStock =
        document.getElementById(
            "modalStock"
        );


    const modalDescription =
        document.getElementById(
            "modalDescription"
        );


    const modalSpecifications =
        document.getElementById(
            "modalSpecifications"
        );


    // =================================================
    // INFORMACIÓN
    // =================================================

    modalBrand.textContent =
        producto.brand || "";


    modalName.textContent =
        producto.name || "Producto";


    modelosDisponibles = obtenerModelos(producto);
    modeloSeleccionado = modelosDisponibles.length === 1 ? modelosDisponibles[0] : "";

    modalModel.textContent =
        modelosDisponibles.length === 1
            ? `Disponible: ${modelosDisponibles[0]}`
            : "";

    renderSelectorModelos();


    modalPrice.textContent =
        formatearPrecioDetalle(
            producto.price
        );


    modalDescription.textContent =
        producto.description ||
        "Sin descripción disponible.";


    modalSpecifications.textContent =
        producto.specifications ||
        "No hay características disponibles.";


    // =================================================
    // STOCK
    // =================================================

    const stock =
        Number(
            producto.stock || 0
        );


      if (
    stock > 0
    ) {

    modalStock.textContent =
        "Disponible";

    modalStock.className =
        "inline-block bg-green-100 text-green-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold";

    }

    else {

        modalStock.textContent =
            "Agotado";


        modalStock.className =

            "inline-block bg-red-100 text-red-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold";

    }


    // =================================================
    // GALERÍA
    // =================================================

    modalThumbnails.innerHTML =
        "";


    galeriaUrls = [];
    galeriaMiniaturas = [];
    galeriaIndice = 0;

    const imagenes =
        producto.imagenes || [];


    if (
        imagenes.length > 0
    ) {

        imagenes.forEach(
            (
                imagen,
                index
            ) => {

                const url =
                    obtenerURLImagenDetalle(
                        imagen
                    );


                if (
                    !url
                ) {

                    return;

                }


                // Primera imagen

                if (
                    index === 0
                ) {

                    modalMainImage.src =
                        url;

                    modalMainImage.alt =
                        producto.name ||
                        "Producto";

                }


                // Miniatura

                const thumbnail =
                    document.createElement(
                        "button"
                    );


                thumbnail.className =

                    "flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition";


                thumbnail.innerHTML = `

                    <img

                        src="${url}"

                        alt="Imagen ${index + 1}"

                        class="
                            w-full
                            h-full
                            object-contain
                            bg-gray-50
                        "

                    >

                `;


                const posicion = galeriaUrls.length;
                galeriaUrls.push(url);
                galeriaMiniaturas.push(thumbnail);

                thumbnail.addEventListener(
                    "click",
                    function () {
                        mostrarImagenGaleria(posicion);
                    }
                );


                modalThumbnails.appendChild(
                    thumbnail
                );
            }
        );

        mostrarImagenGaleria(0);

    }

    else {

        modalMainImage.src =
            "";


        modalMainImage.alt =
            "Sin imagen";


        modalThumbnails.innerHTML = `

            <p
                class="text-gray-500 text-sm"
            >
                Este producto no tiene imágenes.
            </p>

        `;

    }


    // =================================================
    // BOTÓN WHATSAPP
    // =================================================

    const modalWhatsApp =
        document.getElementById(
            "modalWhatsApp"
        );


    const numeroWhatsApp =
        "573007493965";


    const mensaje =

        `Hola, estoy interesado en el producto:

${producto.name || ""}

Marca: ${producto.brand || ""}

Opción: ${modeloSeleccionado || textoModelos(producto)}

Precio: ${formatearPrecioDetalle(producto.price)}

¿Está disponible?`;


    modalWhatsApp.href =

        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
            mensaje
        )}`;


    // =================================================
    // MOSTRAR MODAL
    // =================================================

    modal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "overflow-hidden"
    );

}


// =====================================================
// OBTENER URL DE IMAGEN
// =====================================================

function obtenerURLImagenDetalle(
    imagen
) {

    // Si existe URL directa

    if (
        imagen.image_url
    ) {

        return imagen.image_url;

    }


    // Si existe ruta del Storage

    if (
        imagen.image_path
    ) {

        const {
            data
        } = supabaseClient

            .storage

            .from(
                "productos"
            )

            .getPublicUrl(
                imagen.image_path
            );


        return data.publicUrl;

    }


    return "";

}


// =====================================================
// CERRAR MODAL
// =====================================================

function cerrarDetalleProducto() {

    const modal =
        document.getElementById(
            "productModal"
        );


    modal.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "overflow-hidden"
    );


    productoSeleccionado =
        null;

}


// =====================================================
// FORMATEAR PRECIO
// =====================================================

function formatearPrecioDetalle(
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
// BOTONES DEL MODAL
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

                // =============================================
        // AGREGAR AL CARRITO
        // =============================================

        const modalAddToCart =
            document.getElementById("modalAddToCart");

        if (modalAddToCart) {

            modalAddToCart.addEventListener(
                "click",
                function () {

                    if (!productoSeleccionado) {

                        console.error(
                            "❌ No hay producto seleccionado."
                        );

                        return;
                    }

                    if (modelosDisponibles.length > 1 && !modeloSeleccionado) {
                        const err = document.getElementById("modalModelError");
                        if (err) err.classList.remove("hidden");
                        return;
                    }

                    agregarAlCarrito(productoSeleccionado, modeloSeleccionado);

                }
            );

        }


        // =============================================
        // CERRAR MODAL
        // =============================================

        const closeModal =
            document.getElementById(
                "closeModal"
            );


        if (
            closeModal
        ) {

            closeModal.addEventListener(
                "click",
                cerrarDetalleProducto
            );

        }


        // =============================================
        // CERRAR AL HACER CLIC FUERA
        // =============================================

        const modal =
            document.getElementById(
                "productModal"
            );


        if (
            modal
        ) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        cerrarDetalleProducto();

                    }

                }
            );

        }


        // =============================================
        // CERRAR CON ESC
        // =============================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    cerrarDetalleProducto();

                }

            }
        );


    }
);
