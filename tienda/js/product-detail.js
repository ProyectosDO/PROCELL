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
    let huboDeslizamiento = false;

    img.style.cursor = "zoom-in";
    img.addEventListener("click", function () {
        if (huboDeslizamiento) { huboDeslizamiento = false; return; }
        Visor.abrir(galeriaIndice);
    });


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
                        huboDeslizamiento = true;
            setTimeout(function () { huboDeslizamiento = false; }, 350);
            mostrarImagenGaleria(galeriaIndice + (dx < 0 ? 1 : -1));
        }
    }, { passive: true });
});

// ---- Zoom: visor a pantalla completa (pellizcar, doble toque, rueda del mouse) ----
const Visor = (function () {

    let overlay, img, contador;
    let escala = 1, tx = 0, ty = 0;
    let pinchDist = null, pinchEscala = 1;
    let arrastre = null, ultimoToque = 0, inicioSwipe = null;
    let visorIndice = 0;

    function aplicar() {
        img.style.transform = `translate(${tx}px, ${ty}px) scale(${escala})`;
    }

    function limitar() {
        if (escala <= 1) { escala = 1; tx = 0; ty = 0; return; }
        const mx = (img.clientWidth * (escala - 1)) / 2;
        const my = (img.clientHeight * (escala - 1)) / 2;
        tx = Math.max(-mx, Math.min(mx, tx));
        ty = Math.max(-my, Math.min(my, ty));
    }

    function reiniciar() { escala = 1; tx = 0; ty = 0; aplicar(); }

    function mostrar(i) {
        if (!galeriaUrls.length) return;
        visorIndice = (i + galeriaUrls.length) % galeriaUrls.length;
        img.src = galeriaUrls[visorIndice];
        contador.textContent = galeriaUrls.length > 1
            ? (visorIndice + 1) + " / " + galeriaUrls.length : "";
        reiniciar();
    }

    function cerrar() {
        overlay.classList.add("hidden");
        overlay.classList.remove("flex");
        mostrarImagenGaleria(visorIndice); // deja la galería en la imagen vista
    }

    function crear() {
        overlay = document.createElement("div");
        overlay.className = "hidden fixed inset-0 z-[100] bg-black/95 items-center justify-center select-none";
        overlay.style.touchAction = "none";
        overlay.innerHTML =
            '<button type="button" id="visorCerrar" aria-label="Cerrar" ' +
            'class="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-white/15 text-white text-2xl leading-none">×</button>' +
            '<div id="visorContador" class="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-semibold"></div>' +
            '<img id="visorImg" alt="" draggable="false" class="max-w-full max-h-full object-contain" style="transform-origin:center center;will-change:transform">';
        document.body.appendChild(overlay);

        img = overlay.querySelector("#visorImg");
        contador = overlay.querySelector("#visorContador");
        overlay.querySelector("#visorCerrar").addEventListener("click", cerrar);

        // Tocar el fondo (fuera de la imagen) cierra
        overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });

        document.addEventListener("keydown", function (e) {
            if (overlay.classList.contains("hidden")) return;
            if (e.key === "Escape") cerrar();
            if (e.key === "ArrowRight") mostrar(visorIndice + 1);
            if (e.key === "ArrowLeft") mostrar(visorIndice - 1);
        });

        // Rueda del mouse (computador)
        overlay.addEventListener("wheel", function (e) {
            e.preventDefault();
            escala = Math.min(5, Math.max(1, escala * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
            limitar(); aplicar();
        }, { passive: false });

        // Doble clic (computador)
        img.addEventListener("dblclick", function () {
            escala = escala > 1 ? 1 : 2.5; limitar(); aplicar();
        });

        // Arrastrar con el mouse cuando hay zoom
        img.addEventListener("mousedown", function (e) {
            if (escala <= 1) return;
            arrastre = { x: e.clientX - tx, y: e.clientY - ty };
            e.preventDefault();
        });
        window.addEventListener("mousemove", function (e) {
            if (!arrastre) return;
            tx = e.clientX - arrastre.x; ty = e.clientY - arrastre.y;
            limitar(); aplicar();
        });
        window.addEventListener("mouseup", function () { arrastre = null; });

        // Táctil
        overlay.addEventListener("touchstart", function (e) {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                pinchDist = Math.hypot(dx, dy);
                pinchEscala = escala;
                inicioSwipe = null; arrastre = null;
            } else if (e.touches.length === 1) {
                const t = e.touches[0];
                inicioSwipe = { x: t.clientX, y: t.clientY };
                arrastre = { x: t.clientX - tx, y: t.clientY - ty };
            }
        }, { passive: true });

        overlay.addEventListener("touchmove", function (e) {
            if (e.touches.length === 2 && pinchDist) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                escala = Math.min(5, Math.max(1, pinchEscala * Math.hypot(dx, dy) / pinchDist));
                limitar(); aplicar();
            } else if (e.touches.length === 1 && arrastre && escala > 1) {
                tx = e.touches[0].clientX - arrastre.x;
                ty = e.touches[0].clientY - arrastre.y;
                limitar(); aplicar();
            }
        }, { passive: true });

        overlay.addEventListener("touchend", function (e) {
            if (e.touches.length < 2) pinchDist = null;
            if (e.touches.length > 0) return;

            const t = e.changedTouches[0];

            // Doble toque: alternar zoom
            const ahora = Date.now();
            if (ahora - ultimoToque < 300) {
                escala = escala > 1 ? 1 : 2.5; limitar(); aplicar();
                ultimoToque = 0; inicioSwipe = null; arrastre = null;
                return;
            }
            ultimoToque = ahora;

            // Deslizar para cambiar imagen (solo sin zoom)
            if (inicioSwipe && escala === 1 && galeriaUrls.length > 1) {
                const dx = t.clientX - inicioSwipe.x;
                const dy = t.clientY - inicioSwipe.y;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    mostrar(visorIndice + (dx < 0 ? 1 : -1));
                    ultimoToque = 0;
                }
            }
            inicioSwipe = null; arrastre = null;
        }, { passive: true });
    }

    function abrir(i) {
        if (!galeriaUrls.length) return;
        if (!overlay) crear();
        overlay.classList.remove("hidden");
        overlay.classList.add("flex");
        mostrar(i);
    }

    return { abrir: abrir };
})();

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


    const textoDescripcion = (producto.description || "").trim();
    const textoCaracteristicas = (producto.specifications || "").trim();

    modalDescription.textContent = textoDescripcion;
    modalDescription.classList.toggle("hidden", !textoDescripcion);
    document.getElementById("modalDescriptionTitle")
        .classList.toggle("hidden", !textoDescripcion);


    modalSpecifications.textContent = textoCaracteristicas;
    modalSpecifications.classList.toggle("hidden", !textoCaracteristicas);
    document.getElementById("modalSpecificationsTitle")
        .classList.toggle("hidden", !textoCaracteristicas);
    document.getElementById("modalDivider")
        .classList.toggle("hidden", !textoDescripcion && !textoCaracteristicas);


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
