// =====================================================
// PROCELL - ADMINISTRAR PRODUCTOS
// admin-products.js
// =====================================================


// =====================================================
// CONFIGURACIÓN
// =====================================================

const PRODUCTS_TABLE = "products";
const PRODUCT_IMAGES_TABLE = "product_images";
const STORAGE_BUCKET = "productos";
const CATEGORIES_TABLE = "categories";

const MAX_IMAGES = 3;
const TARGET_SIZE_KB = 170;
const MAX_IMAGE_WIDTH = 1600;

// Iconos SVG reutilizables para el botón de categoría
const ICON_PLUS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
const ICON_PENCIL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';

// =====================================================
// CONFIGURACIÓN DEL BUSCADOR Y PAGINACIÓN
// =====================================================

const PRODUCTS_PER_PAGE = 20;

let todosLosProductos = [];

let productosFiltrados = [];

let paginaActual = 1;

let textoBusqueda = "";

let categoriaSeleccionada = "";

// =====================================================
// ELEMENTOS DEL HTML
// =====================================================

const productForm =
    document.getElementById("productForm");

const imageInput =
    document.getElementById("images");

const imagePreview =
    document.getElementById("imagePreview");

const message =
    document.getElementById("message");

const saveButton =
    document.getElementById("saveButton");

const formTitle =
    document.getElementById("formTitle");

const productSearch =
    document.getElementById("productSearch");

const productCategoryFilter =
    document.getElementById("productCategoryFilter");

const productResultsInfo =
    document.getElementById("productResultsInfo");

const productPagination =
    document.getElementById("productPagination");

// =====================================================
// VARIABLES
// =====================================================

// Imágenes nuevas seleccionadas
let selectedImages = [];

// Imágenes que ya existen en Supabase
let existingImages = [];

// Imágenes existentes que el usuario decidió eliminar
let imagesToDelete = [];


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "✅ admin-products.js funcionando"
        );

        cargarProductosAdmin();

        cargarCategorias();

        configurarBuscadorProductos();

    }
);

// =====================================================
// CONFIGURAR BUSCADOR Y FILTRO DE PRODUCTOS
// =====================================================

function configurarBuscadorProductos() {

    // =============================================
    // BUSCADOR
    // =============================================

    if (productSearch) {

        productSearch.addEventListener(
            "input",
            function () {

                textoBusqueda =
                    productSearch.value
                        .toLowerCase()
                        .trim();

                paginaActual = 1;

                aplicarFiltrosProductos();

            }
        );

    }


    // =============================================
    // FILTRO DE CATEGORÍA
    // =============================================

    if (productCategoryFilter) {

        productCategoryFilter.addEventListener(
            "change",
            function () {

                categoriaSeleccionada =
                    productCategoryFilter.value;

                paginaActual = 1;

                aplicarFiltrosProductos();

            }
        );

    }

}


// =====================================================
// APLICAR FILTROS
// =====================================================

function aplicarFiltrosProductos() {

    productosFiltrados =
        todosLosProductos.filter(

            function (producto) {

                // =========================================
                // TEXTO DE BÚSQUEDA
                // =========================================

                const nombre =

                    (
                        producto.name ||
                        ""
                    )
                    .toLowerCase();


                const marca =

                    (
                        producto.brand ||
                        ""
                    )
                    .toLowerCase();


                const modelo =

                    (
                        producto.model ||
                        ""
                    )
                    .toLowerCase();


                const coincideBusqueda =

                    !textoBusqueda ||

                    nombre.includes(
                        textoBusqueda
                    ) ||

                    marca.includes(
                        textoBusqueda
                    ) ||

                    modelo.includes(
                        textoBusqueda
                    );


                // =========================================
                // CATEGORÍA
                // =========================================

                const coincideCategoria =

                    !categoriaSeleccionada ||

                    producto.category ===
                    categoriaSeleccionada;


                return (

                    coincideBusqueda &&

                    coincideCategoria

                );

            }

        );


    mostrarProductosPaginados();

}


// =====================================================
// MOSTRAR PRODUCTOS PAGINADOS
// =====================================================

function mostrarProductosPaginados() {

    const contenedor =

        document.getElementById(
            "adminProductsList"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    // =============================================
    // CALCULAR PAGINACIÓN
    // =============================================

    const totalProductos =

        productosFiltrados.length;


    const totalPaginas =

        Math.ceil(

            totalProductos /
            PRODUCTS_PER_PAGE

        );


    // =============================================
    // VALIDAR PÁGINA
    // =============================================

    if (

        paginaActual >
        totalPaginas &&

        totalPaginas >
        0

    ) {

        paginaActual =
            totalPaginas;

    }


    // =============================================
    // PRODUCTOS DE LA PÁGINA ACTUAL
    // =============================================

    const inicio =

        (
            paginaActual -
            1
        ) *

        PRODUCTS_PER_PAGE;


    const fin =

        inicio +
        PRODUCTS_PER_PAGE;


    const productosPagina =

        productosFiltrados.slice(

            inicio,

            fin

        );


    // =============================================
    // SIN RESULTADOS
    // =============================================

    if (

        productosPagina.length ===
        0

    ) {

        contenedor.innerHTML = `

            <div
                class="
                    col-span-full
                    bg-white
                    rounded-2xl
                    shadow-md
                    p-10
                    text-center
                "
            >

                <div class="w-14 h-14 mx-auto rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>

                <h3
                    class="
                        text-xl
                        font-bold
                        text-gray-800
                    "
                >

                    No se encontraron productos

                </h3>

                <p
                    class="
                        text-gray-500
                        mt-2
                    "
                >

                    Intenta cambiar el texto de búsqueda
                    o seleccionar otra categoría.

                </p>

            </div>

        `;

    }


    // =============================================
    // MOSTRAR PRODUCTOS
    // =============================================

    productosPagina.forEach(

        function (producto) {

            contenedor.appendChild(

                crearTarjetaAdmin(
                    producto
                )

            );

        }

    );


    // =============================================
    // ACTUALIZAR CONTADOR
    // =============================================

    if (productResultsInfo) {

        if (totalProductos === 0) {

            productResultsInfo.textContent =
                "No se encontraron productos.";

        } else {

            const desde =

                inicio + 1;


            const hasta =

                Math.min(

                    fin,

                    totalProductos

                );


            productResultsInfo.textContent =

                `Mostrando ${desde} - ${hasta} de ${totalProductos} productos`;

        }

    }


    // =============================================
    // MOSTRAR PAGINACIÓN
    // =============================================

    mostrarPaginacion(
        totalPaginas
    );

}


// =====================================================
// MOSTRAR PAGINACIÓN
// =====================================================

function mostrarPaginacion(
    totalPaginas
) {

    if (!productPagination) {

        return;

    }


    productPagination.innerHTML =
        "";


    if (
        totalPaginas <= 1
    ) {

        return;

    }


    // =============================================
    // BOTÓN ANTERIOR
    // =============================================

    const botonAnterior =

        document.createElement(
            "button"
        );


    botonAnterior.textContent =
        "←";


    botonAnterior.disabled =
        paginaActual === 1;


    botonAnterior.className = `

        px-4
        py-2
        rounded-lg
        font-bold
        transition

        ${
            paginaActual === 1

            ?

            "bg-gray-200 text-gray-400 cursor-not-allowed"

            :

            "bg-orange-500 text-white hover:bg-orange-600"

        }

    `;


    botonAnterior.addEventListener(

        "click",

        function () {

            if (
                paginaActual >
                1
            ) {

                paginaActual--;

                mostrarProductosPaginados();

            }

        }

    );


    productPagination.appendChild(
        botonAnterior
    );


    // =============================================
    // NÚMEROS DE PÁGINA
    // =============================================

    for (

        let i = 1;

        i <=
        totalPaginas;

        i++

    ) {

        const botonPagina =

            document.createElement(
                "button"
            );


        botonPagina.textContent =
            i;


        botonPagina.className = `

            px-4
            py-2
            rounded-lg
            font-bold
            transition

            ${
                paginaActual === i

                ?

                "bg-orange-500 text-white"

                :

                "bg-gray-200 text-gray-700 hover:bg-gray-300"

            }

        `;


        botonPagina.addEventListener(

            "click",

            function () {

                paginaActual =
                    i;

                mostrarProductosPaginados();

            }

        );


        productPagination.appendChild(
            botonPagina
        );

    }


    // =============================================
    // BOTÓN SIGUIENTE
    // =============================================

    const botonSiguiente =

        document.createElement(
            "button"
        );


    botonSiguiente.textContent =
        "→";


    botonSiguiente.disabled =

        paginaActual ===
        totalPaginas;


    botonSiguiente.className = `

        px-4
        py-2
        rounded-lg
        font-bold
        transition

        ${
            paginaActual === totalPaginas

            ?

            "bg-gray-200 text-gray-400 cursor-not-allowed"

            :

            "bg-orange-500 text-white hover:bg-orange-600"

        }

    `;


    botonSiguiente.addEventListener(

        "click",

        function () {

            if (

                paginaActual <
                totalPaginas

            ) {

                paginaActual++;

                mostrarProductosPaginados();

            }

        }

    );


    productPagination.appendChild(
        botonSiguiente
    );

}

// =====================================================
// SELECCIONAR IMÁGENES NUEVAS
// =====================================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const newFiles =
                Array.from(
                    imageInput.files
                );


            // =============================================
            // CONTAR IMÁGENES TOTALES
            // =============================================

            const totalActual =
                existingImages.length +
                selectedImages.length;


            const espacioDisponible =
                MAX_IMAGES -
                totalActual;


            if (
                espacioDisponible <= 0
            ) {

                mostrarMensaje(

                    `⚠️ Ya tienes el máximo de ${MAX_IMAGES} imágenes.`,

                    "warning"

                );

                imageInput.value = "";

                return;

            }


            // =============================================
            // AGREGAR SOLO LAS QUE CABEN
            // =============================================

            const archivosPermitidos =
                newFiles.slice(
                    0,
                    espacioDisponible
                );


            selectedImages = [

                ...selectedImages,

                ...archivosPermitidos

            ];


            if (
                newFiles.length >
                espacioDisponible
            ) {

                mostrarMensaje(

                    `⚠️ Solo puedes tener máximo ${MAX_IMAGES} imágenes por producto.`,

                    "warning"

                );

            }


            mostrarVistaPrevia();


            // =============================================
            // LIMPIAR INPUT
            // =============================================

            imageInput.value = "";

        }
    );

}


// =====================================================
// MOSTRAR VISTA PREVIA COMPLETA
// =====================================================

function mostrarVistaPrevia() {

    imagePreview.innerHTML = "";


    // =================================================
    // IMÁGENES EXISTENTES
    // =================================================

    existingImages.forEach(

        function (
            imagen,
            index
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "relative bg-gray-100 rounded-xl overflow-hidden shadow";


            div.innerHTML = `

                <img

                    src="${imagen.image_url}"

                    class="
                        w-full
                        h-48
                        object-cover
                    "

                >


                <div class="p-3">

                    <p
                        class="
                            text-sm
                            font-semibold
                            text-gray-700
                        "
                    >

                        Imagen ${index + 1}

                    </p>


                    <p
                        class="
                            text-xs
                            text-green-600
                            mt-1
                        "
                    >

                        Imagen actual

                    </p>

                </div>


                <button

                    type="button"

                    onclick="marcarImagenParaEliminar(${index})"

                    class="
                        absolute
                        top-2
                        right-2
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        w-8
                        h-8
                        rounded-full
                        font-bold
                    "

                    title="Eliminar imagen"

                >

                    ×

                </button>

            `;


            imagePreview.appendChild(
                div
            );

        }

    );


    // =================================================
    // IMÁGENES NUEVAS
    // =================================================

    selectedImages.forEach(

        function (
            file,
            index
        ) {

            const reader =
                new FileReader();


            reader.onload =
                function (
                    event
                ) {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "relative bg-blue-50 rounded-xl overflow-hidden shadow border border-blue-200";


                    div.innerHTML = `

                        <img

                            src="${event.target.result}"

                            class="
                                w-full
                                h-48
                                object-cover
                            "

                        >


                        <div class="p-3">

                            <p
                                class="
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    truncate
                                "
                            >

                                ${file.name}

                            </p>


                            <p
                                class="
                                    text-xs
                                    text-blue-600
                                    mt-1
                                "
                            >

                                Imagen nueva

                            </p>


                            <p
                                class="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                            >

                                ${formatearTamaño(file.size)}

                            </p>

                        </div>


                        <button

                            type="button"

                            onclick="eliminarImagenNueva(${index})"

                            class="
                                absolute
                                top-2
                                right-2
                                bg-red-500
                                hover:bg-red-600
                                text-white
                                w-8
                                h-8
                                rounded-full
                                font-bold
                            "

                            title="Quitar imagen"

                        >

                            ×

                        </button>

                    `;


                    imagePreview.appendChild(
                        div
                    );

                };


            reader.readAsDataURL(
                file
            );

        }

    );


    // =================================================
    // SI NO HAY IMÁGENES
    // =================================================

    if (

        existingImages.length === 0 &&

        selectedImages.length === 0

    ) {

        imagePreview.innerHTML = `

            <div
                class="
                    col-span-full
                    text-center
                    py-8
                    text-gray-400
                "
            >

                <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>
                </div>

                <p class="mt-2">

                    No hay imágenes seleccionadas.

                </p>

            </div>

        `;

    }

}


// =====================================================
// MARCAR IMAGEN EXISTENTE PARA ELIMINAR
// =====================================================

function marcarImagenParaEliminar(
    index
) {

    const imagen =
        existingImages[index];


    if (!imagen) {

        return;

    }


    const confirmar =
        confirm(
            "¿Quieres eliminar esta imagen del producto?"
        );


    if (!confirmar) {

        return;

    }


    // =============================================
    // GUARDAR PARA ELIMINAR AL ACTUALIZAR
    // =============================================

    imagesToDelete.push(
        imagen
    );


    // =============================================
    // QUITAR DE LAS EXISTENTES
    // =============================================

    existingImages.splice(
        index,
        1
    );


    mostrarVistaPrevia();

}


// =====================================================
// ELIMINAR IMAGEN NUEVA
// =====================================================

function eliminarImagenNueva(
    index
) {

    selectedImages.splice(
        index,
        1
    );


    mostrarVistaPrevia();

}


// =====================================================
// FORMATEAR TAMAÑO
// =====================================================

function formatearTamaño(
    bytes
) {

    if (
        bytes < 1024
    ) {

        return (
            bytes +
            " B"
        );

    }


    if (
        bytes <
        1024 *
        1024
    ) {

        return (

            (
                bytes /
                1024
            ).toFixed(1) +

            " KB"

        );

    }


    return (

        (
            bytes /
            (
                1024 *
                1024
            )
        ).toFixed(2) +

        " MB"

    );

}


// =====================================================
// COMPRIMIR IMAGEN
// =====================================================

async function comprimirImagen(
    file
) {

    return new Promise(

        function (
            resolve,
            reject
        ) {

            const reader =
                new FileReader();


            reader.onload =
                function (
                    event
                ) {

                    const img =
                        new Image();


                    img.onload =
                        function () {

                            let width =
                                img.width;


                            let height =
                                img.height;


                            // =====================================
                            // REDUCIR ANCHO
                            // =====================================

                            if (
                                width >
                                MAX_IMAGE_WIDTH
                            ) {

                                const ratio =

                                    MAX_IMAGE_WIDTH /
                                    width;


                                width =
                                    MAX_IMAGE_WIDTH;


                                height =

                                    Math.round(

                                        height *
                                        ratio

                                    );

                            }


                            // =====================================
                            // CANVAS
                            // =====================================

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;


                            canvas.height =
                                height;


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(

                                img,

                                0,

                                0,

                                width,

                                height

                            );


                            // =====================================
                            // CALIDAD
                            // =====================================

                            let quality =
                                0.85;


                            // =====================================
                            // INTENTAR COMPRESIÓN
                            // =====================================

                            function intentarCompresion() {

                                canvas.toBlob(

                                    function (
                                        blob
                                    ) {

                                        if (!blob) {

                                            reject(

                                                new Error(

                                                    "No se pudo comprimir la imagen."

                                                )

                                            );

                                            return;

                                        }


                                        const sizeKB =

                                            blob.size /
                                            1024;


                                        console.log(

                                            "📦 Tamaño comprimido:",

                                            sizeKB.toFixed(1),

                                            "KB"

                                        );


                                        // =====================================
                                        // TERMINAR
                                        // =====================================

                                        if (

                                            sizeKB <=
                                            TARGET_SIZE_KB

                                            ||

                                            quality <=
                                            0.35

                                        ) {

                                            const nombre =

                                                file.name

                                                    .replace(

                                                        /\.[^/.]+$/,

                                                        ""

                                                    )

                                                +

                                                ".webp";


                                            const compressedFile =

                                                new File(

                                                    [

                                                        blob

                                                    ],

                                                    nombre,

                                                    {

                                                        type:
                                                            "image/webp"

                                                    }

                                                );


                                            resolve(

                                                compressedFile

                                            );


                                            return;

                                        }


                                        // =====================================
                                        // BAJAR CALIDAD
                                        // =====================================

                                        quality -=
                                            0.05;


                                        intentarCompresion();

                                    },

                                    "image/webp",

                                    quality

                                );

                            }


                            intentarCompresion();

                        };


                    img.onerror =
                        function () {

                            reject(

                                new Error(

                                    "No se pudo leer la imagen."

                                )

                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    reject(

                        new Error(

                            "Error al cargar la imagen."

                        )

                    );

                };


            reader.readAsDataURL(
                file
            );

        }

    );

}


// =====================================================
// MOSTRAR MENSAJES
// =====================================================

function mostrarMensaje(
    texto,
    tipo = "success"
) {

    if (!message) {

        return;

    }


    message.classList.remove(

        "hidden",

        "bg-green-100",

        "text-green-700",

        "bg-red-100",

        "text-red-700",

        "bg-yellow-100",

        "text-yellow-700"

    );


    if (
        tipo === "success"
    ) {

        message.classList.add(

            "bg-green-100",

            "text-green-700"

        );

    }


    if (
        tipo === "error"
    ) {

        message.classList.add(

            "bg-red-100",

            "text-red-700"

        );

    }


    if (
        tipo === "warning"
    ) {

        message.classList.add(

            "bg-yellow-100",

            "text-yellow-700"

        );

    }


    message.textContent =
        texto;

}


// =====================================================
// GUARDAR / ACTUALIZAR PRODUCTO
// =====================================================

productForm.addEventListener(

    "submit",

    async function (
        event
    ) {

        event.preventDefault();


        // =================================================
        // COMPROBAR SI ESTAMOS EDITANDO
        // =================================================

        const editingId =
            productForm.dataset.editingId;


        if (
            editingId
        ) {

            await actualizarProducto(
                editingId
            );

            return;

        }


        // =================================================
        // SI NO ESTAMOS EDITANDO
        // CREAR PRODUCTO NUEVO
        // =================================================

        await crearProducto();

    }

);


// =====================================================
// CREAR PRODUCTO NUEVO
// =====================================================

async function crearProducto() {

    // =============================================
    // VALIDAR IMÁGENES
    // =============================================

    if (
        selectedImages.length === 0
    ) {

        mostrarMensaje(

            "⚠️ Debes seleccionar al menos una imagen.",

            "warning"

        );

        return;

    }


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Creando producto...";


    let productId =
        null;


    let uploadedStoragePaths =
        [];


    try {

        // =============================================
        // OBTENER DATOS
        // =============================================

        const datos =
            obtenerDatosFormulario();


        // =============================================
        // CREAR PRODUCTO
        // =============================================

        const {

            data: product,

            error: productError

        } = await supabaseClient

            .from(
                PRODUCTS_TABLE
            )

            .insert([

                datos

            ])

            .select()

            .single();


        if (
            productError
        ) {

            throw productError;

        }


        productId =
            product.id;


        console.log(

            "✅ Producto creado:",

            product

        );


        const imageRecords =
            [];


        // =============================================
        // SUBIR IMÁGENES
        // =============================================

        for (

            let i = 0;

            i <
            selectedImages.length;

            i++

        ) {

            saveButton.textContent =

                `Procesando imagen ${i + 1} de ${selectedImages.length}...`;


            const compressedImage =

                await comprimirImagen(

                    selectedImages[i]

                );


            console.log(

                "📷 Imagen original:",

                formatearTamaño(

                    selectedImages[i].size

                )

            );


            console.log(

                "📦 Imagen comprimida:",

                formatearTamaño(

                    compressedImage.size

                )

            );


            // =============================================
            // CREAR RUTA
            // =============================================

            const fileName =

                `${productId}/${Date.now()}_${i + 1}_${Math.random().toString(36).substring(2, 8)}.webp`;


            // =============================================
            // SUBIR STORAGE
            // =============================================

            saveButton.textContent =

                `Subiendo imagen ${i + 1} de ${selectedImages.length}...`;


            const {

                error: uploadError

            } = await supabaseClient

                .storage

                .from(
                    STORAGE_BUCKET
                )

                .upload(

                    fileName,

                    compressedImage,

                    {

                        contentType:
                            "image/webp",

                        upsert:
                            false

                    }

                );


            if (
                uploadError
            ) {

                throw uploadError;

            }


            uploadedStoragePaths.push(
                fileName
            );


            // =============================================
            // URL PÚBLICA
            // =============================================

            const {

                data: publicUrlData

            } = supabaseClient

                .storage

                .from(
                    STORAGE_BUCKET
                )

                .getPublicUrl(
                    fileName
                );


            const imageUrl =

                publicUrlData.publicUrl;


            // =============================================
            // REGISTRO
            // =============================================

            imageRecords.push({

                product_id:
                    productId,

                image_url:
                    imageUrl,

                display_order:
                    i + 1

            });


            // =============================================
            // PRIMERA IMAGEN
            // =============================================

            if (
                i === 0
            ) {

                const {

                    error: updateError

                } = await supabaseClient

                    .from(
                        PRODUCTS_TABLE
                    )

                    .update({

                        image_url:
                            imageUrl

                    })

                    .eq(

                        "id",

                        productId

                    );


                if (
                    updateError
                ) {

                    throw updateError;

                }

            }

        }


        // =============================================
        // GUARDAR REGISTROS
        // =============================================

        saveButton.textContent =

            "Guardando información de imágenes...";


        const {

            error: imagesError

        } = await supabaseClient

            .from(
                PRODUCT_IMAGES_TABLE
            )

            .insert(
                imageRecords
            );


        if (
            imagesError
        ) {

            throw imagesError;

        }


        // =============================================
        // ÉXITO
        // =============================================

        mostrarMensaje(

            "✅ Producto guardado correctamente con sus imágenes.",

            "success"

        );


        limpiarFormulario();


        cargarProductosAdmin();

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error creando producto:",

            error

        );


        // =============================================
        // BORRAR ARCHIVOS SUBIDOS
        // =============================================

        if (
            uploadedStoragePaths.length >
            0
        ) {

            await supabaseClient

                .storage

                .from(
                    STORAGE_BUCKET
                )

                .remove(
                    uploadedStoragePaths
                );

        }


        // =============================================
        // BORRAR PRODUCTO INCOMPLETO
        // =============================================

        if (
            productId
        ) {

            await supabaseClient

                .from(
                    PRODUCTS_TABLE
                )

                .delete()

                .eq(

                    "id",

                    productId

                );

        }


        mostrarMensaje(

            "❌ Error al guardar el producto: " +

            error.message,

            "error"

        );

    }


    finally {

        saveButton.disabled =
            false;


        saveButton.textContent =
            "Guardar producto";

    }

}


// =====================================================
// OBTENER DATOS DEL FORMULARIO
// =====================================================

function obtenerDatosFormulario() {

    return {

        name:

            document
                .getElementById(
                    "name"
                )
                .value
                .trim(),


        brand:

            document
                .getElementById(
                    "brand"
                )
                .value
                .trim(),


        model:

            document
                .getElementById(
                    "model"
                )
                .value
                .trim(),


        category:

            document
                .getElementById(
                    "category"
                )
                .value,


        price:

            Number(

                document
                    .getElementById(
                        "price"
                    )
                    .value

            ),


        stock:

            Number(

                document
                    .getElementById(
                        "stock"
                    )
                    .value

            ),


        description:

            document
                .getElementById(
                    "description"
                )
                .value
                .trim(),


        specifications:

            document
                .getElementById(
                    "specifications"
                )
                .value
                .trim(),


        is_active:

            document
                .getElementById(
                    "is_active"
                )
                .checked

    };

}


// =====================================================
// ACTUALIZAR PRODUCTO
// =====================================================

async function actualizarProducto(
    productId
) {

    saveButton.disabled =
        true;


    saveButton.textContent =
        "Actualizando producto...";


    const nuevasRutas =
        [];


    try {

        // =============================================
        // DATOS
        // =============================================

        const datos =
            obtenerDatosFormulario();


        // =============================================
        // ACTUALIZAR PRODUCTO
        // =============================================

        const {

            error: productError

        } = await supabaseClient

            .from(
                PRODUCTS_TABLE
            )

            .update(
                datos
            )

            .eq(

                "id",

                productId

            );


        if (
            productError
        ) {

            throw productError;

        }


        // =============================================
        // ELIMINAR IMÁGENES MARCADAS
        // =============================================

        for (

            const imagen
            of
            imagesToDelete

        ) {

            // =========================================
            // BORRAR STORAGE
            // =========================================

            const ruta =

                obtenerRutaStorage(

                    imagen.image_url

                );


            if (
                ruta
            ) {

                const {

                    error: storageError

                } = await supabaseClient

                    .storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove([

                        ruta

                    ]);


                if (
                    storageError
                ) {

                    console.error(

                        "⚠️ Error eliminando imagen de Storage:",

                        storageError

                    );

                }

            }


            // =========================================
            // BORRAR REGISTRO
            // =========================================

            const {

                data: filasEliminadas,

                error: imageDeleteError

            } = await supabaseClient

                .from(
                    PRODUCT_IMAGES_TABLE
                )

                .delete()

                .eq(

                    "id",

                    imagen.id

                )

                .select();


            if (
                imageDeleteError
            ) {

                throw imageDeleteError;

            }


            // =========================================
            // SI NO SE BORRÓ NINGUNA FILA
            // (normalmente por una política RLS que
            // bloquea el DELETE sin lanzar error)
            // =========================================

            if (

                !filasEliminadas ||

                filasEliminadas.length === 0

            ) {

                throw new Error(

                    "No se pudo eliminar el registro de la imagen en la base de datos. " +
                    "Revisa las políticas de seguridad (RLS) de la tabla '" +
                    PRODUCT_IMAGES_TABLE +
                    "' en Supabase: falta permitir DELETE al rol autenticado."

                );

            }

        }


        // =============================================
        // SUBIR IMÁGENES NUEVAS
        // =============================================

        const newImageRecords =
            [];


        for (

            let i = 0;

            i <
            selectedImages.length;

            i++

        ) {

            saveButton.textContent =

                `Procesando imagen ${i + 1} de ${selectedImages.length}...`;


            const compressedImage =

                await comprimirImagen(

                    selectedImages[i]

                );


            // =========================================
            // CREAR RUTA
            // =========================================

            const fileName =

                `${productId}/${Date.now()}_${i + 1}_${Math.random().toString(36).substring(2, 8)}.webp`;


            // =========================================
            // SUBIR
            // =========================================

            saveButton.textContent =

                `Subiendo imagen ${i + 1} de ${selectedImages.length}...`;


            const {

                error: uploadError

            } = await supabaseClient

                .storage

                .from(
                    STORAGE_BUCKET
                )

                .upload(

                    fileName,

                    compressedImage,

                    {

                        contentType:
                            "image/webp",

                        upsert:
                            false

                    }

                );


            if (
                uploadError
            ) {

                throw uploadError;

            }


            nuevasRutas.push(
                fileName
            );


            // =========================================
            // URL
            // =========================================

            const {

                data: publicUrlData

            } = supabaseClient

                .storage

                .from(
                    STORAGE_BUCKET
                )

                .getPublicUrl(
                    fileName
                );


            const imageUrl =

                publicUrlData.publicUrl;


            // =========================================
            // REGISTRO
            // =========================================

            newImageRecords.push({

                product_id:
                    productId,

                image_url:
                    imageUrl,

                display_order:
                    0

            });

        }


        // =============================================
        // GUARDAR NUEVAS IMÁGENES
        // =============================================

        if (

            newImageRecords.length >
            0

        ) {

            // =========================================
            // OBTENER IMÁGENES ACTUALES
            // =========================================

            const {

                data: currentImages,

                error: currentImagesError

            } = await supabaseClient

                .from(
                    PRODUCT_IMAGES_TABLE
                )

                .select(
                    "id"
                )

                .eq(

                    "product_id",

                    productId

                );


            if (
                currentImagesError
            ) {

                throw currentImagesError;

            }


            // =========================================
            // INSERTAR NUEVAS
            // =========================================

            const startOrder =

                currentImages
                    ? currentImages.length + 1
                    : 1;


            newImageRecords.forEach(

                function (
                    imagen,
                    index
                ) {

                    imagen.display_order =

                        startOrder +
                        index;

                }

            );


            const {

                error: insertImagesError

            } = await supabaseClient

                .from(
                    PRODUCT_IMAGES_TABLE
                )

                .insert(
                    newImageRecords
                );


            if (
                insertImagesError
            ) {

                throw insertImagesError;

            }


            // =========================================
            // SI NO HABÍA IMAGEN PRINCIPAL
            // =========================================

            if (

                existingImages.length ===
                0

            ) {

                const primeraImagen =

                    newImageRecords[0];


                const {

                    error: mainImageError

                } = await supabaseClient

                    .from(
                        PRODUCTS_TABLE
                    )

                    .update({

                        image_url:
                            primeraImagen.image_url

                    })

                    .eq(

                        "id",

                        productId

                    );


                if (
                    mainImageError
                ) {

                    throw mainImageError;

                }

            }

        }


        // =============================================
        // SI LA IMAGEN PRINCIPAL FUE ELIMINADA
        // =============================================

        if (

            imagesToDelete.length >
            0

            &&

            existingImages.length >
            0

        ) {

            const primeraExistente =

                existingImages[0];


            const {

                error: mainImageError

            } = await supabaseClient

                .from(
                    PRODUCTS_TABLE
                )

                .update({

                    image_url:
                        primeraExistente.image_url

                })

                .eq(

                    "id",

                    productId

                );


            if (
                mainImageError
            ) {

                throw mainImageError;

            }

        }


        // =============================================
        // SI QUEDARON SOLO NUEVAS IMÁGENES
        // =============================================

        if (

            existingImages.length ===
            0

            &&

            newImageRecords.length >
            0

        ) {

            const {

                error: mainImageError

            } = await supabaseClient

                .from(
                    PRODUCTS_TABLE
                )

                .update({

                    image_url:
                        newImageRecords[0].image_url

                })

                .eq(

                    "id",

                    productId

                );


            if (
                mainImageError
            ) {

                throw mainImageError;

            }

        }


        // =============================================
        // ÉXITO
        // =============================================

        mostrarMensaje(

            "✅ Producto actualizado correctamente.",

            "success"

        );


        limpiarFormulario();


        cargarProductosAdmin();

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error actualizando producto:",

            error

        );


        // =============================================
        // BORRAR ARCHIVOS NUEVOS SI FALLÓ
        // =============================================

        if (
            nuevasRutas.length >
            0
        ) {

            await supabaseClient

                .storage

                .from(
                    STORAGE_BUCKET
                )

                .remove(
                    nuevasRutas
                );

        }


        mostrarMensaje(

            "❌ Error al actualizar el producto: " +

            error.message,

            "error"

        );

    }


    finally {

        saveButton.disabled =
            false;


        saveButton.textContent =
            "Guardar producto";

    }

}


// =====================================================
// EDITAR PRODUCTO
// =====================================================

async function editarProducto(
    producto
) {

    console.log(

        "✏️ Editando producto:",

        producto

    );


    // =============================================
    // LLENAR FORMULARIO
    // =============================================

    document
        .getElementById(
            "name"
        )
        .value =

        producto.name ||
        "";


    document
        .getElementById(
            "brand"
        )
        .value =

        producto.brand ||
        "";


    document
        .getElementById(
            "model"
        )
        .value =

        producto.model ||
        "";


    document
        .getElementById(
            "category"
        )
        .value =

        producto.category ||
        "";


    document
        .getElementById(
            "price"
        )
        .value =

        producto.price ||
        0;


    document
        .getElementById(
            "stock"
        )
        .value =

        producto.stock ||
        0;


    document
        .getElementById(
            "description"
        )
        .value =

        producto.description ||
        "";


    document
        .getElementById(
            "specifications"
        )
        .value =

        producto.specifications ||
        "";


    document
        .getElementById(
            "is_active"
        )
        .checked =

        producto.is_active ===
        true;


    // =============================================
    // GUARDAR ID
    // =============================================

    productForm.dataset.editingId =
        producto.id;


    // =============================================
    // CAMBIAR BOTÓN
    // =============================================

    // =============================================
// CAMBIAR BOTÓN
// =============================================

saveButton.textContent =
    "Actualizar producto";


// MOSTRAR BOTÓN CANCELAR EDICIÓN

    const cancelEditButton =
       document.getElementById(
           "cancelEditButton"
       );
  
   if (cancelEditButton) {

        cancelEditButton.classList.remove(
            "hidden"
       );

   }

    // =============================================
    // CAMBIAR TÍTULO
    // =============================================

    if (
        formTitle
    ) {

        formTitle.textContent =
            "Modificar producto";

    }


    // =============================================
    // LIMPIAR ESTADOS
    // =============================================

    selectedImages =
        [];


    existingImages =
        [];


    imagesToDelete =
        [];


    imagePreview.innerHTML = `

        <div
            class="
                col-span-full
                text-center
                py-6
            "
        >

            <div class="text-3xl">
                ⏳
            </div>

            <p class="text-gray-500 mt-2">

                Cargando imágenes...

            </p>

        </div>

    `;


    try {

        // =============================================
        // CARGAR IMÁGENES
        // =============================================

        const {

            data: imagenes,

            error

        } = await supabaseClient

            .from(
                PRODUCT_IMAGES_TABLE
            )

            .select("*")

            .eq(

                "product_id",

                producto.id

            )

            .order(

                "display_order",

                {

                    ascending:
                        true

                }

            );


        if (
            error
        ) {

            throw error;

        }


        existingImages =
            imagenes ||
            [];


        console.log(

            "🖼️ Imágenes existentes:",

            existingImages

        );


        mostrarVistaPrevia();

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error cargando imágenes:",

            error

        );


        imagePreview.innerHTML = `

            <div
                class="
                    col-span-full
                    bg-red-100
                    text-red-700
                    p-4
                    rounded-lg
                    text-center
                "
            >

                ❌ No se pudieron cargar las imágenes.

            </div>

        `;

    }


    // =============================================
    // MENSAJE
    // =============================================

    mostrarMensaje(

        "✏️ Editando: " +

        (
            producto.name ||
            "Producto"
        ),

        "warning"

    );


    // =============================================
    // SUBIR AL FORMULARIO
    // =============================================

    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// =====================================================
// CANCELAR EDICIÓN
// =====================================================

function cancelarEdicion() {

    console.log(

        "❌ Cancelando edición"

    );


    limpiarFormulario();


    mostrarMensaje(

        "Edición cancelada.",

        "warning"

    );

}


// =====================================================
// LIMPIAR FORMULARIO
// =====================================================

function limpiarFormulario() {

    productForm.reset();


    // =============================================
    // QUITAR MODO EDICIÓN
    // =============================================

    productForm.dataset.editingId =
        "";


    // =============================================
    // RESTAURAR ESTADO
    // =============================================

    document
        .getElementById(
            "is_active"
        )
        .checked =
        true;


    document
        .getElementById(
            "stock"
        )
        .value =
        1;


    // =============================================
    // LIMPIAR IMÁGENES
    // =============================================

    selectedImages =
        [];


    existingImages =
        [];


    imagesToDelete =
        [];


    imagePreview.innerHTML =
        "";


    // =============================================
    // RESTAURAR TÍTULO
    // =============================================

    if (
        formTitle
    ) {

        formTitle.textContent =
            "Agregar nuevo producto";

    }


    // =============================================
    // RESTAURAR BOTÓN
    // =============================================

    // =============================================
// RESTAURAR BOTÓN
// =============================================

saveButton.textContent =
    "Guardar producto";


// OCULTAR BOTÓN CANCELAR EDICIÓN

   const cancelEditButton =
       document.getElementById(
           "cancelEditButton"
       );

   if (cancelEditButton) {

       cancelEditButton.classList.add(
           "hidden"
       );
  
   }

}


// =====================================================
// CARGAR PRODUCTOS ADMIN
// =====================================================

// =====================================================
// CARGAR PRODUCTOS ADMIN
// =====================================================

async function cargarProductosAdmin() {

    const contenedor =
        document.getElementById(
            "adminProductsList"
        );


    if (!contenedor) {

        console.error(
            "❌ No se encontró #adminProductsList"
        );

        return;

    }


    try {

        // =============================================
        // CARGAR PRODUCTOS DESDE SUPABASE
        // =============================================

        const {

            data: productos,

            error

        } = await supabaseClient

            .from(
                PRODUCTS_TABLE
            )

            .select("*")

            .order(

                "created_at",

                {

                    ascending:
                        false

                }

            );


        if (
            error
        ) {

            throw error;

        }


        // =============================================
        // GUARDAR TODOS LOS PRODUCTOS
        // =============================================

        todosLosProductos =
            productos ||
            [];


        console.log(

            "📦 Productos cargados:",

            todosLosProductos.length

        );


        // =============================================
        // INICIAR FILTROS
        // =============================================

        productosFiltrados =
            todosLosProductos;


        paginaActual =
            1;


        // =============================================
        // MOSTRAR PRODUCTOS
        // =============================================

        mostrarProductosPaginados();


    }


    catch (
        error
    ) {

        console.error(

            "❌ Error cargando productos:",

            error

        );


        contenedor.innerHTML = `

            <div
                class="
                    col-span-full
                    bg-red-50
                    border
                    border-red-200
                    rounded-2xl
                    p-6
                    text-center
                "
            >

                <div class="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>


                <h3
                    class="
                        font-bold
                        text-red-700
                    "
                >

                    Error al cargar los productos

                </h3>


                <p
                class="
                     text-red-600
                       text-sm
                       mt-2
                    "
                >

                   ${error.message}

                </p>

            </div>

        `;

    }

}


// =====================================================
// CREAR TARJETA ADMINISTRATIVA
// =====================================================

// =====================================================
// CREAR FILA DE PRODUCTO PARA TABLA ADMINISTRATIVA
// =====================================================

function crearTarjetaAdmin(producto) {

    const fila =
        document.createElement("tr");


    // =================================================
    // ESTADO
    // =================================================

    const activo =
        producto.is_active === true;


    const estadoHTML = activo

        ?

        `
            <span
                class="
                    inline-flex
                    items-center
                    bg-green-100
                    text-green-700
                    px-2
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                "
            >
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Activo
            </span>
        `

        :

        `
            <span
                class="
                    inline-flex
                    items-center
                    bg-red-100
                    text-red-700
                    px-2
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                "
            >
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Inactivo
            </span>
        `;


    // =================================================
    // IMAGEN
    // =================================================

    const imagenURL =
        producto.image_url ||
        "";


    const imagenHTML =

        imagenURL

        ?

        `
            <img
                src="${imagenURL}"
                alt="${producto.name || "Producto"}"
                class="
                    w-14
                    h-14
                    object-contain
                    bg-gray-50
                    rounded-lg
                    p-1
                    border
                    border-gray-200
                "
            >
        `

        :

        `
            <div
                class="
                    w-14
                    h-14
                    bg-gray-100
                    text-gray-400
                    rounded-lg
                    flex
                    items-center
                    justify-center
                "
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <path d="M21 15l-5-5L5 21"></path>
                </svg>
            </div>
        `;


    // =================================================
    // CREAR FILA
    // =================================================

    fila.innerHTML = `

        <!-- PRODUCTO -->

        <td class="px-4 py-4">

            <div class="flex items-center gap-3">

                ${imagenHTML}

                <div class="min-w-0">

                    <p
                        class="
                            font-bold
                            text-gray-800
                            truncate
                        "
                    >
                        ${producto.name || "Sin nombre"}
                    </p>

                    ${
                        producto.brand

                        ?

                        `
                            <p
                                class="
                                    text-sm
                                    text-gray-500
                                    truncate
                                "
                            >
                                ${producto.brand}

                                ${
                                    producto.model

                                    ?

                                    " · " +
                                    producto.model

                                    :

                                    ""

                                }

                            </p>
                        `

                        :

                        ""

                    }

                </div>

            </div>

        </td>


        <!-- CATEGORÍA -->

        <td class="px-4 py-4">

            <span
                class="
                    bg-orange-100
                    text-orange-700
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    whitespace-nowrap
                "
            >

                ${
                    producto.category ||
                    "Sin categoría"
                }

            </span>

        </td>


        <!-- PRECIO -->

        <td
            class="
                px-4
                py-4
                font-bold
                text-gray-800
                whitespace-nowrap
            "
        >

            ${formatearPrecioAdmin(
                producto.price
            )}

        </td>


        <!-- STOCK -->

        <td
            class="
                px-4
                py-4
                text-center
                font-semibold
                text-gray-700
            "
        >

            ${producto.stock || 0}

        </td>


        <!-- ESTADO -->

        <td class="px-4 py-4">

            ${estadoHTML}

        </td>


        <!-- ACCIONES -->

        <td class="px-4 py-4">

            <div
                class="
                    flex
                    items-center
                    gap-2
                "
            >

                <!-- EDITAR -->

                <button

                    type="button"

                    class="
                        edit-product
                        bg-orange-50
                        hover:bg-orange-500
                        hover:text-white
                        text-orange-600
                        font-semibold
                        p-2.5
                        rounded-lg
                        transition
                    "

                    title="Editar producto"

                >

                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>

                </button>


                <!-- ELIMINAR -->

                <button

                    type="button"

                    class="
                        delete-product
                        bg-red-50
                        hover:bg-red-500
                        hover:text-white
                        text-red-600
                        font-semibold
                        p-2.5
                        rounded-lg
                        transition
                    "

                    title="Eliminar producto"

                >

                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>

                </button>

            </div>

        </td>

    `;


    // =================================================
    // BOTÓN EDITAR
    // =================================================

    fila

        .querySelector(
            ".edit-product"
        )

        .addEventListener(

            "click",

            function () {

                editarProducto(
                    producto
                );

            }

        );


    // =================================================
    // BOTÓN ELIMINAR
    // =================================================

    fila

        .querySelector(
            ".delete-product"
        )

        .addEventListener(

            "click",

            function () {

                eliminarProducto(
                    producto.id
                );

            }

        );


    return fila;

}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

async function eliminarProducto(
    productId
) {

    const confirmar =

        confirm(

            "¿Seguro que deseas eliminar este producto? Esta acción también eliminará sus imágenes."

        );


    if (
        !confirmar
    ) {

        return;

    }


    try {

        // =============================================
        // BUSCAR IMÁGENES
        // =============================================

        const {

            data: imagenes,

            error: imagenesError

        } = await supabaseClient

            .from(
                PRODUCT_IMAGES_TABLE
            )

            .select(
                "image_url"
            )

            .eq(

                "product_id",

                productId

            );


        if (
            imagenesError
        ) {

            throw imagenesError;

        }


        // =============================================
        // BORRAR STORAGE
        // =============================================

        if (

            imagenes &&

            imagenes.length >
            0

        ) {

            const rutas =

                imagenes

                    .map(

                        function (
                            imagen
                        ) {

                            return obtenerRutaStorage(

                                imagen.image_url

                            );

                        }

                    )

                    .filter(

                        function (
                            ruta
                        ) {

                            return ruta !== "";

                        }

                    );


            if (
                rutas.length >
                0
            ) {

                await supabaseClient

                    .storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove(
                        rutas
                    );

            }

        }


        // =============================================
        // BORRAR REGISTROS
        // =============================================

        const {

            error: deleteImagesError

        } = await supabaseClient

            .from(
                PRODUCT_IMAGES_TABLE
            )

            .delete()

            .eq(

                "product_id",

                productId

            );


        if (
            deleteImagesError
        ) {

            throw deleteImagesError;

        }


        // =============================================
        // BORRAR PRODUCTO
        // =============================================

        const {

            error: deleteProductError

        } = await supabaseClient

            .from(
                PRODUCTS_TABLE
            )

            .delete()

            .eq(

                "id",

                productId

            );


        if (
            deleteProductError
        ) {

            throw deleteProductError;

        }


        // =============================================
        // ÉXITO
        // =============================================

        mostrarMensaje(

            "✅ Producto eliminado correctamente.",

            "success"

        );


        cargarProductosAdmin();

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error eliminando producto:",

            error

        );


        mostrarMensaje(

            "❌ No se pudo eliminar el producto: " +

            error.message,

            "error"

        );

    }

}


// =====================================================
// OBTENER RUTA DEL STORAGE
// =====================================================

function obtenerRutaStorage(
    imageUrl
) {

    if (
        !imageUrl
    ) {

        return "";

    }


    const marcador =

        "/storage/v1/object/public/" +

        STORAGE_BUCKET +

        "/";


    const posicion =

        imageUrl.indexOf(
            marcador
        );


    if (
        posicion ===
        -1
    ) {

        return "";

    }


    return imageUrl.substring(

        posicion +
        marcador.length

    );

}


// =====================================================
// FORMATEAR PRECIO
// =====================================================

function formatearPrecioAdmin(
    precio
) {

    return Number(

        precio ||
        0

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
// =====================================================
// CARGAR CATEGORÍAS DESDE SUPABASE
// =====================================================

// =====================================================
// CARGAR CATEGORÍAS DESDE SUPABASE
// =====================================================

async function cargarCategorias() {

    const categorySelect =
        document.getElementById("category");

    const productCategoryFilter =
        document.getElementById(
            "productCategoryFilter"
        );


    // =================================================
    // COMPROBAR SELECTOR DEL PRODUCTO
    // =================================================

    if (!categorySelect) {

        console.error(
            "❌ No se encontró el selector #category"
        );

        return;

    }


    try {

        // =================================================
        // CONSULTAR CATEGORÍAS
        // =================================================

        const {

            data: categorias,

            error

        } = await supabaseClient

            .from(
                CATEGORIES_TABLE
            )

            .select("*")

            .order(
                "name",
                {
                    ascending: true
                }
            );


        console.log(
            "📂 Categorías recibidas:",
            categorias
        );


        if (error) {

            throw error;

        }


        // =================================================
        // CARGAR CATEGORÍAS EN FORMULARIO DE PRODUCTO
        // =================================================

        categorySelect.innerHTML = `

            <option value="">
                Seleccionar categoría
            </option>

        `;


        if (

            categorias &&

            categorias.length > 0

        ) {

            categorias.forEach(

                function (
                    categoria
                ) {

                    const option =

                        document.createElement(
                            "option"
                        );


                    option.value =
                        categoria.name;


                    option.textContent =
                        categoria.name;


                    categorySelect.appendChild(
                        option
                    );

                }

            );

        }


        // =================================================
        // CARGAR CATEGORÍAS EN FILTRO
        // =================================================

        if (
            productCategoryFilter
        ) {

            productCategoryFilter.innerHTML = `

                <option value="">
                    Todas las categorías
                </option>

            `;


            if (

                categorias &&

                categorias.length > 0

            ) {

                categorias.forEach(

                    function (
                        categoria
                    ) {

                        const option =

                            document.createElement(
                                "option"
                            );


                        option.value =
                            categoria.name;


                        option.textContent =
                            categoria.name;


                        productCategoryFilter.appendChild(
                            option
                        );

                    }

                );

            }


            console.log(
                "✅ Filtro de categorías cargado"
            );

        }


        console.log(
            "✅ Categorías cargadas correctamente:",
            categorias
        );

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error cargando categorías:",

            error

        );

    }

}

// =====================================================
// GESTIÓN DE CATEGORÍAS
// AGREGAR / EDITAR / ELIMINAR
// =====================================================


// =====================================================
// ELEMENTOS DEL PANEL DE CATEGORÍAS
// =====================================================

const categoryNameInput =
    document.getElementById("categoryName");

const addCategoryButton =
    document.getElementById("addCategoryButton");

const editingCategoryIdInput =
    document.getElementById("editingCategoryId");

const cancelCategoryEditButton =
    document.getElementById("cancelCategoryEditButton");

const cancelCategoryEditContainer =
    document.getElementById("cancelCategoryEditContainer");

const categoryMessage =
    document.getElementById("categoryMessage");

const categoriesList =
    document.getElementById("categoriesList");


// =====================================================
// MOSTRAR MENSAJE DE CATEGORÍA
// =====================================================

function mostrarMensajeCategoria(
    texto,
    tipo = "success"
) {

    if (!categoryMessage) {

        return;

    }


    categoryMessage.classList.remove(

        "hidden",

        "bg-green-100",

        "text-green-700",

        "bg-red-100",

        "text-red-700",

        "bg-yellow-100",

        "text-yellow-700"

    );


    if (
        tipo === "success"
    ) {

        categoryMessage.classList.add(

            "bg-green-100",

            "text-green-700"

        );

    }


    if (
        tipo === "error"
    ) {

        categoryMessage.classList.add(

            "bg-red-100",

            "text-red-700"

        );

    }


    if (
        tipo === "warning"
    ) {

        categoryMessage.classList.add(

            "bg-yellow-100",

            "text-yellow-700"

        );

    }


    categoryMessage.textContent =
        texto;


    setTimeout(

        function () {

            categoryMessage.classList.add(
                "hidden"
            );

        },

        4000

    );

}


// =====================================================
// CARGAR LISTA VISUAL DE CATEGORÍAS
// =====================================================

async function cargarListaCategorias() {

    if (!categoriesList) {

        console.error(
            "❌ No se encontró #categoriesList"
        );

        return;

    }


    try {

        const {

            data: categorias,

            error

        } = await supabaseClient

            .from(
                CATEGORIES_TABLE
            )

            .select("*")

            .order(

                "name",

                {

                    ascending:
                        true

                }

            );


        if (error) {

            throw error;

        }


        categoriesList.innerHTML =
            "";


        // =============================================
        // SI NO HAY CATEGORÍAS
        // =============================================

        if (

            !categorias ||

            categorias.length ===
            0

        ) {

            categoriesList.innerHTML = `

                <div
                    class="
                        col-span-full
                        text-center
                        py-8
                        text-gray-500
                    "
                >

                    <div class="w-14 h-14 mx-auto rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                    </div>

                    <p>
                        No hay categorías registradas.
                    </p>

                </div>

            `;

            return;

        }


        // =============================================
        // MOSTRAR CATEGORÍAS
        // =============================================

        categorias.forEach(

            function (
                categoria
            ) {

                const tarjeta =
                    document.createElement(
                        "div"
                    );


                tarjeta.className = `

                    bg-gray-50
                    border
                    border-gray-200
                    rounded-xl
                    p-1
                    shadow-sm

                `;


                tarjeta.innerHTML = `

                    <div
                        class="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        <div
                            class="
                                flex
                                items-center
                                gap-3
                                min-w-0
                            "
                        >

                            <div
                                class="
                                    w-8
                                    h-8
                                    bg-orange-100
                                    text-orange-600
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>

                            </div>


                            <div class="min-w-0">

                                <p
                                    class="
                                        font-bold
                                        text-gray-800
                                        truncate
                                    "
                                >

                                    ${categoria.name}

                                </p>

                            </div>

                        </div>


                        <div
                            class="
                                flex
                                gap-2
                            "
                        >

                            <button

                                type="button"

                                class="
                                    edit-category
                                    bg-orange-50
                                    hover:bg-orange-500
                                    hover:text-white
                                    text-orange-600
                                    p-2.5
                                    rounded-lg
                                    font-semibold
                                    transition
                                "

                            >

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>

                            </button>


                            <button

                                type="button"

                                class="
                                    delete-category
                                    bg-red-50
                                    hover:bg-red-500
                                    hover:text-white
                                    text-red-600
                                    p-2.5
                                    rounded-lg
                                    font-semibold
                                    transition
                                "

                            >

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>

                            </button>

                        </div>

                    </div>

                `;


                // =========================================
                // BOTÓN EDITAR
                // =========================================

                tarjeta

                    .querySelector(
                        ".edit-category"
                    )

                    .addEventListener(

                        "click",

                        function () {

                            iniciarEdicionCategoria(

                                categoria

                            );

                        }

                    );


                // =========================================
                // BOTÓN ELIMINAR
                // =========================================

                tarjeta

                    .querySelector(
                        ".delete-category"
                    )

                    .addEventListener(

                        "click",

                        function () {

                            eliminarCategoria(

                                categoria

                            );

                        }

                    );


                categoriesList.appendChild(
                    tarjeta
                );

            }

        );

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error cargando lista de categorías:",

            error

        );


        categoriesList.innerHTML = `

            <div
                class="
                    col-span-full
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    rounded-xl
                    p-5
                    text-center
                "
            >

                ❌ Error al cargar las categorías.

                <p class="text-sm mt-2">

                    ${error.message}

                </p>

            </div>

        `;

    }

}


// =====================================================
// AGREGAR / ACTUALIZAR CATEGORÍA
// =====================================================

async function guardarCategoria() {

    if (!categoryNameInput) {

        return;

    }


    const nombre =
        categoryNameInput.value.trim();


    // =============================================
    // VALIDAR NOMBRE
    // =============================================

    if (!nombre) {

        mostrarMensajeCategoria(

            "⚠️ Escribe el nombre de la categoría.",

            "warning"

        );

        categoryNameInput.focus();

        return;

    }


    const editingId =
        editingCategoryIdInput.value;


    try {

        addCategoryButton.disabled =
            true;


        addCategoryButton.textContent =

            editingId

            ?

            "Guardando cambios..."

            :

            "Agregando...";


        // =============================================
        // COMPROBAR SI YA EXISTE
        // =============================================

        const {

            data: categoriaExistente,

            error: buscarError

        } = await supabaseClient

            .from(
                CATEGORIES_TABLE
            )

            .select("*")

            .ilike(

                "name",

                nombre

            );


        if (buscarError) {

            throw buscarError;

        }


        const duplicada =

            categoriaExistente &&

            categoriaExistente.some(

                function (
                    categoria
                ) {

                    return (

                        !editingId ||

                        String(
                            categoria.id
                        ) !==
                        String(
                            editingId
                        )

                    );

                }

            );


        if (duplicada) {

            mostrarMensajeCategoria(

                "⚠️ Esa categoría ya existe.",

                "warning"

            );

            return;

        }


        // =============================================
        // EDITAR CATEGORÍA
        // =============================================

        if (editingId) {

            // =========================================
            // OBTENER NOMBRE ANTERIOR
            // =========================================

            const {

                data: categoriaAnterior,

                error: anteriorError

            } = await supabaseClient

                .from(
                    CATEGORIES_TABLE
                )

                .select(
                    "name"
                )

                .eq(

                    "id",

                    editingId

                )

                .single();


            if (anteriorError) {

                throw anteriorError;

            }


            const nombreAnterior =

                categoriaAnterior.name;


            // =========================================
            // ACTUALIZAR CATEGORÍA
            // =========================================

            const {

                error: updateError

            } = await supabaseClient

                .from(
                    CATEGORIES_TABLE
                )

                .update({

                    name:
                        nombre

                })

                .eq(

                    "id",

                    editingId

                );


            if (updateError) {

                throw updateError;

            }


            // =========================================
            // ACTUALIZAR PRODUCTOS QUE USABAN
            // LA CATEGORÍA ANTERIOR
            // =========================================

            const {

                error: productsUpdateError

            } = await supabaseClient

                .from(
                    PRODUCTS_TABLE
                )

                .update({

                    category:
                        nombre

                })

                .eq(

                    "category",

                    nombreAnterior

                );


            if (productsUpdateError) {

                console.error(

                    "⚠️ La categoría cambió, pero no se pudieron actualizar algunos productos:",

                    productsUpdateError

                );

            }


            mostrarMensajeCategoria(

                "✅ Categoría actualizada correctamente.",

                "success"

            );

        }


        // =============================================
        // AGREGAR CATEGORÍA NUEVA
        // =============================================

        else {

            const {

                error: insertError

            } = await supabaseClient

                .from(
                    CATEGORIES_TABLE
                )

                .insert({

                    name:
                        nombre

                });


            if (insertError) {

                throw insertError;

            }


            mostrarMensajeCategoria(

                "✅ Categoría agregada correctamente.",

                "success"

            );

        }


        // =============================================
        // LIMPIAR FORMULARIO
        // =============================================

        categoryNameInput.value =
            "";


        editingCategoryIdInput.value =
            "";


        addCategoryButton.innerHTML =

            ICON_PLUS_SVG + "<span>Agregar categoría</span>";


        if (
            cancelCategoryEditContainer
        ) {

            cancelCategoryEditContainer.classList.add(
                "hidden"
            );

        }


        // =============================================
        // ACTUALIZAR TODO
        // =============================================

        await cargarListaCategorias();

        await cargarCategorias();

        await cargarProductosAdmin();

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error guardando categoría:",

            error

        );


        mostrarMensajeCategoria(

            "❌ Error: " +
            error.message,

            "error"

        );

    }


    finally {

        if (
            addCategoryButton
        ) {

            addCategoryButton.disabled =
                false;


            if (
                !editingCategoryIdInput.value
            ) {

                addCategoryButton.innerHTML =

                    ICON_PLUS_SVG + "<span>Agregar categoría</span>";

            }

        }

    }

}


// =====================================================
// INICIAR EDICIÓN DE CATEGORÍA
// =====================================================

function iniciarEdicionCategoria(
    categoria
) {

    if (!categoryNameInput) {

        return;

    }


    categoryNameInput.value =
        categoria.name;


    editingCategoryIdInput.value =
        categoria.id;


    addCategoryButton.innerHTML =
        ICON_PENCIL_SVG + "<span>Guardar cambios</span>";


    if (
        cancelCategoryEditContainer
    ) {

        cancelCategoryEditContainer.classList.remove(
            "hidden"
        );

    }


    categoryNameInput.focus();


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// =====================================================
// CANCELAR EDICIÓN DE CATEGORÍA
// =====================================================

function cancelarEdicionCategoria() {

    if (
        categoryNameInput
    ) {

        categoryNameInput.value =
            "";

    }


    if (
        editingCategoryIdInput
    ) {

        editingCategoryIdInput.value =
            "";

    }


    if (
        addCategoryButton
    ) {

        addCategoryButton.innerHTML =

            ICON_PLUS_SVG + "<span>Agregar categoría</span>";

    }


    if (
        cancelCategoryEditContainer
    ) {

        cancelCategoryEditContainer.classList.add(
            "hidden"
        );

    }

}


// =====================================================
// ELIMINAR CATEGORÍA
// =====================================================

async function eliminarCategoria(
    categoria
) {

    const confirmar =

        confirm(

            `¿Seguro que deseas eliminar la categoría "${categoria.name}"?`

        );


    if (!confirmar) {

        return;

    }


    try {

        // =============================================
        // COMPROBAR SI HAY PRODUCTOS CON ESTA CATEGORÍA
        // =============================================

        const {

            data: productosConCategoria,

            error: productosError

        } = await supabaseClient

            .from(
                PRODUCTS_TABLE
            )

            .select(
                "id,name"
            )

            .eq(

                "category",

                categoria.name

            );


        if (productosError) {

            throw productosError;

        }


        // =============================================
        // SI HAY PRODUCTOS
        // =============================================

        if (

            productosConCategoria &&

            productosConCategoria.length >
            0

        ) {

            const nombres =

                productosConCategoria

                    .slice(
                        0,
                        5
                    )

                    .map(

                        function (
                            producto
                        ) {

                            return producto.name;

                        }

                    )

                    .join(
                        ", "
                    );


            mostrarMensajeCategoria(

                "⚠️ No puedes eliminar esta categoría porque hay productos que la utilizan: " +

                nombres,

                "warning"

            );

            return;

        }


        // =============================================
        // ELIMINAR CATEGORÍA
        // =============================================

        const {

            error: deleteError

        } = await supabaseClient

            .from(
                CATEGORIES_TABLE
            )

            .delete()

            .eq(

                "id",

                categoria.id

            );


        if (deleteError) {

            throw deleteError;

        }


        // =============================================
        // ÉXITO
        // =============================================

        mostrarMensajeCategoria(

            "✅ Categoría eliminada correctamente.",

            "success"

        );


        // =============================================
        // ACTUALIZAR LISTAS
        // =============================================

        await cargarListaCategorias();

        await cargarCategorias();

    }


    catch (
        error
    ) {

        console.error(

            "❌ Error eliminando categoría:",

            error

        );


        mostrarMensajeCategoria(

            "❌ No se pudo eliminar la categoría: " +

            error.message,

            "error"

        );

    }

}


// =====================================================
// EVENTOS DEL PANEL DE CATEGORÍAS
// =====================================================


// BOTÓN AGREGAR / ACTUALIZAR

if (
    addCategoryButton
) {

    addCategoryButton.addEventListener(

        "click",

        guardarCategoria

    );

}


// BOTÓN CANCELAR EDICIÓN

if (
    cancelCategoryEditButton
) {

    cancelCategoryEditButton.addEventListener(

        "click",

        cancelarEdicionCategoria

    );

}


// PERMITIR ENTER PARA GUARDAR

if (
    categoryNameInput
) {

    categoryNameInput.addEventListener(

        "keydown",

        function (
            event
        ) {

            if (

                event.key ===
                "Enter"

            ) {

                event.preventDefault();

                guardarCategoria();

            }

        }

    );

}


// =====================================================
// INICIALIZAR LISTA DE CATEGORÍAS
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        cargarListaCategorias();

    }

);

// =====================================================
// EXPORTAR FUNCIONES PARA HTML
// =====================================================

window.editarProducto =
    editarProducto;


window.eliminarProducto =
    eliminarProducto;


window.cancelarEdicion =
    cancelarEdicion;


window.marcarImagenParaEliminar =
    marcarImagenParaEliminar;


window.eliminarImagenNueva =
    eliminarImagenNueva;


console.log(

    "✅ admin-products.js cargado completamente."

);