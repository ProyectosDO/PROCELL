// ==========================================
// PROCELL - CREAR PRODUCTOS
// ==========================================


// ==========================================
// CONFIGURACIÓN
// ==========================================

const MAX_IMAGES = 3;

const TARGET_SIZE_KB = 170;

const MAX_IMAGE_WIDTH = 1600;


// ==========================================
// NOMBRES EXACTOS DE SUPABASE
// ==========================================

const PRODUCTS_TABLE =
    "products";

const PRODUCT_IMAGES_TABLE =
    "product_images";

const STORAGE_BUCKET =
    "productos";


// ==========================================
// ELEMENTOS DEL HTML
// ==========================================

const productForm =
    document.getElementById(
        "productForm"
    );

const imageInput =
    document.getElementById(
        "images"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const message =
    document.getElementById(
        "message"
    );

const saveButton =
    document.getElementById(
        "saveButton"
    );


// ==========================================
// IMÁGENES SELECCIONADAS
// ==========================================

let selectedImages = [];

let existingImages = [];


// ==========================================
// IMÁGENES SUBIDAS
// ==========================================

let uploadedStoragePaths = [];


// ==========================================
// VERIFICAR ELEMENTOS
// ==========================================

if (!productForm) {

    console.error(
        "❌ No se encontró #productForm"
    );

}

if (!imageInput) {

    console.error(
        "❌ No se encontró #images"
    );

}

if (!imagePreview) {

    console.error(
        "❌ No se encontró #imagePreview"
    );

}

if (!saveButton) {

    console.error(
        "❌ No se encontró #saveButton"
    );

}


// ==========================================
// SELECCIONAR IMÁGENES
// ==========================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const newFiles =
                Array.from(
                    imageInput.files
                );


            // ==================================
            // AGREGAR NUEVAS IMÁGENES
            // ==================================

            selectedImages = [

                ...selectedImages,

                ...newFiles

            ];


            // ==================================
            // LIMITAR A 3 IMÁGENES
            // ==================================

            if (
                selectedImages.length >
                MAX_IMAGES
            ) {

                selectedImages =
                    selectedImages.slice(
                        0,
                        MAX_IMAGES
                    );


                mostrarMensaje(

                    "⚠️ Solo puedes seleccionar máximo 3 imágenes.",

                    "warning"

                );

            }


            // ==================================
            // MOSTRAR VISTA PREVIA
            // ==================================

            mostrarVistaPrevia();


            // ==================================
            // LIMPIAR INPUT
            // ==================================

            imageInput.value =
                "";

        }
    );

}


// ==========================================
// MOSTRAR VISTA PREVIA
// ==========================================

function mostrarVistaPrevia() {

    if (!imagePreview) {

        return;

    }


    imagePreview.innerHTML =
        "";


    // ==================================
    // MOSTRAR IMÁGENES EXISTENTES
    // ==================================

    if (
        existingImages &&
        existingImages.length > 0
    ) {

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


                div.innerHTML =

                    '<img ' +

                    'src="' +
                    imagen.image_url +
                    '" ' +

                    'class="w-full h-48 object-cover">' +

                    '<div class="p-3">' +

                    '<p class="text-sm font-semibold text-gray-700">' +

                    "Imagen actual " +
                    (index + 1) +

                    "</p>" +

                    "</div>";


                imagePreview.appendChild(
                    div
                );

            }

        );

    }


    // ==================================
    // MOSTRAR IMÁGENES NUEVAS
    // ==================================

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
                        "relative bg-gray-100 rounded-xl overflow-hidden shadow";


                    div.innerHTML =

                        '<img ' +

                        'src="' +
                        event.target.result +
                        '" ' +

                        'class="w-full h-48 object-cover">' +

                        '<div class="p-3">' +

                        '<p class="text-sm font-semibold text-gray-700 truncate">' +

                        file.name +

                        "</p>" +

                        '<p class="text-xs text-gray-500 mt-1">' +

                        "Tamaño original: " +

                        formatearTamaño(
                            file.size
                        ) +

                        "</p>" +

                        "</div>" +

                        '<button ' +

                        'type="button" ' +

                        'class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full font-bold" ' +

                        'onclick="eliminarImagen(' +
                        index +
                        ')"' +

                        ">" +

                        "×" +

                        "</button>";


                    imagePreview.appendChild(
                        div
                    );

                };


            reader.readAsDataURL(
                file
            );

        }

    );

}


// ==========================================
// ELIMINAR IMAGEN NUEVA
// ==========================================

function eliminarImagen(
    index
) {

    selectedImages.splice(
        index,
        1
    );


    mostrarVistaPrevia();

}


// ==========================================
// FORMATEAR TAMAÑO
// ==========================================

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
            ).toFixed(
                1
            ) +

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
        ).toFixed(
            2
        ) +

        " MB"

    );

}


// ==========================================
// COMPRIMIR IMAGEN
// ==========================================

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


                            // ==================================
                            // REDUCIR ANCHO
                            // ==================================

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


                            // ==================================
                            // CREAR CANVAS
                            // ==================================

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


                            // ==================================
                            // CALIDAD INICIAL
                            // ==================================

                            let quality =
                                0.85;


                            // ==================================
                            // INTENTAR COMPRESIÓN
                            // ==================================

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

                                            sizeKB.toFixed(
                                                1
                                            ),

                                            "KB"

                                        );


                                        // ==================================
                                        // TERMINAR COMPRESIÓN
                                        // ==================================

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


                                        // ==================================
                                        // REDUCIR CALIDAD
                                        // ==================================

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


// ==========================================
// MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(
    texto,
    tipo
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
        tipo ===
        "success"
    ) {

        message.classList.add(

            "bg-green-100",

            "text-green-700"

        );

    }


    if (
        tipo ===
        "error"
    ) {

        message.classList.add(

            "bg-red-100",

            "text-red-700"

        );

    }


    if (
        tipo ===
        "warning"
    ) {

        message.classList.add(

            "bg-yellow-100",

            "text-yellow-700"

        );

    }


    message.textContent =
        texto;

}


// ==========================================
// GUARDAR PRODUCTO NUEVO
// ==========================================

if (productForm) {

    productForm.addEventListener(

        "submit",

        async function (
            event
        ) {

            event.preventDefault();


            // ==================================
            // COMPROBAR SI ESTAMOS EDITANDO
            // ==================================

            const editingId =

                productForm.dataset.editingId;


            if (
                editingId
            ) {

                console.log(

                    "✏️ Producto en modo edición."

                );


                mostrarMensaje(

                    "✏️ Estás editando un producto. Usa el botón 'Actualizar producto'.",

                    "warning"

                );


                return;

            }


            // ==================================
            // VALIDAR IMÁGENES
            // ==================================

            if (
                selectedImages.length ===
                0
            ) {

                mostrarMensaje(

                    "⚠️ Debes seleccionar al menos una imagen.",

                    "warning"

                );


                return;

            }


            // ==================================
            // DESACTIVAR BOTÓN
            // ==================================

            saveButton.disabled =
                true;


            saveButton.textContent =
                "Guardando producto...";


            // ==================================
            // REINICIAR RUTAS SUBIDAS
            // ==================================

            uploadedStoragePaths =
                [];


            // ==================================
            // ID DEL PRODUCTO
            // ==================================

            let productId =
                null;


            try {

                // ==================================
                // OBTENER DATOS
                // ==================================

                const name =

                    document
                        .getElementById(
                            "name"
                        )
                        .value
                        .trim();


                const brand =

                    document
                        .getElementById(
                            "brand"
                        )
                        .value
                        .trim();


                const model =

                    document
                        .getElementById(
                            "model"
                        )
                        .value
                        .trim();


                const category =

                    document
                        .getElementById(
                            "category"
                        )
                        .value;


                const price =

                    Number(

                        document
                            .getElementById(
                                "price"
                            )
                            .value

                    );


                const stock =

                    Number(

                        document
                            .getElementById(
                                "stock"
                            )
                            .value

                    );


                const description =

                    document
                        .getElementById(
                            "description"
                        )
                        .value
                        .trim();


                const specifications =

                    document
                        .getElementById(
                            "specifications"
                        )
                        .value
                        .trim();


                const is_active =

                    document
                        .getElementById(
                            "is_active"
                        )
                        .checked;


                // ==================================
                // CREAR PRODUCTO
                // ==================================

                saveButton.textContent =
                    "Creando producto...";


                const {

                    data:
                        product,

                    error:
                        productError

                } = await supabaseClient

                    .from(
                        PRODUCTS_TABLE
                    )

                    .insert([

                        {

                            name:
                                name,

                            brand:
                                brand,

                            model:
                                model,

                            category:
                                category,

                            price:
                                price,

                            stock:
                                stock,

                            description:
                                description,

                            specifications:
                                specifications,

                            is_active:
                                is_active

                        }

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


                // ==================================
                // REGISTROS DE IMÁGENES
                // ==================================

                const imageRecords =
                    [];


                // ==================================
                // PROCESAR IMÁGENES
                // ==================================

                for (

                    let i = 0;

                    i <
                    selectedImages.length;

                    i++

                ) {

                    saveButton.textContent =

                        "Procesando imagen " +

                        (
                            i + 1
                        ) +

                        " de " +

                        selectedImages.length +

                        "...";


                    // ==================================
                    // COMPRIMIR
                    // ==================================

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


                    // ==================================
                    // CREAR RUTA
                    // ==================================

                    const fileName =

                        productId +

                        "/" +

                        Date.now() +

                        "_" +

                        (
                            i + 1
                        ) +

                        "_" +

                        Math.random()

                            .toString(
                                36
                            )

                            .substring(
                                2,
                                8
                            ) +

                        ".webp";


                    // ==================================
                    // SUBIR A STORAGE
                    // ==================================

                    saveButton.textContent =

                        "Subiendo imagen " +

                        (
                            i + 1
                        ) +

                        " de " +

                        selectedImages.length +

                        "...";


                    const {

                        error:
                            uploadError

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


                    // ==================================
                    // GUARDAR RUTA
                    // ==================================

                    uploadedStoragePaths.push(

                        fileName

                    );


                    // ==================================
                    // OBTENER URL
                    // ==================================

                    const {

                        data:
                            publicUrlData

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


                    console.log(

                        "🔗 URL:",

                        imageUrl

                    );


                    // ==================================
                    // REGISTRO
                    // ==================================

                    imageRecords.push({

                        product_id:
                            productId,

                        image_url:
                            imageUrl,

                        display_order:
                            i + 1

                    });


                    // ==================================
                    // PRIMERA IMAGEN DEL PRODUCTO
                    // ==================================

                    if (
                        i === 0
                    ) {

                        const {

                            error:
                                updateError

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


                // ==================================
                // GUARDAR IMÁGENES
                // ==================================

                saveButton.textContent =

                    "Guardando información de imágenes...";


                const {

                    error:
                        imagesError

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


                // ==================================
                // ÉXITO
                // ==================================

                console.log(

                    "✅ Producto guardado correctamente."

                );


                mostrarMensaje(

                    "✅ Producto guardado correctamente con sus imágenes.",

                    "success"

                );


                // ==================================
                // LIMPIAR FORMULARIO
                // ==================================

                productForm.reset();


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


                selectedImages =
                    [];


                existingImages =
                    [];


                uploadedStoragePaths =
                    [];


                imagePreview.innerHTML =
                    "";


            }


            catch (
                error
            ) {

                console.error(

                    "❌ Error completo:",

                    error

                );


                mostrarMensaje(

                    "❌ Error al guardar el producto: " +

                    error.message,

                    "error"

                );


                // ==================================
                // ELIMINAR ARCHIVOS SUBIDOS
                // ==================================

                if (

                    uploadedStoragePaths.length >
                    0

                ) {

                    console.log(

                        "🧹 Eliminando archivos subidos debido al error..."

                    );


                    const {

                        error:
                            storageCleanupError

                    } = await supabaseClient

                        .storage

                        .from(
                            STORAGE_BUCKET
                        )

                        .remove(

                            uploadedStoragePaths

                        );


                    if (
                        storageCleanupError
                    ) {

                        console.error(

                            "⚠️ Error limpiando Storage:",

                            storageCleanupError

                        );

                    }

                }


                // ==================================
                // ELIMINAR PRODUCTO INCOMPLETO
                // ==================================

                if (
                    productId
                ) {

                    console.log(

                        "🧹 Eliminando producto incompleto..."

                    );


                    const {

                        error:
                            deleteError

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
                        deleteError
                    ) {

                        console.error(

                            "⚠️ No se pudo eliminar el producto incompleto:",

                            deleteError

                        );

                    }

                }

            }


            finally {

                // ==================================
                // RESTAURAR BOTÓN
                // ==================================

                saveButton.disabled =
                    false;


                // ==================================
                // COMPROBAR MODO EDICIÓN
                // ==================================

                if (
                    productForm.dataset.editingId
                ) {

                    saveButton.textContent =

                        "Actualizar producto";

                }

                else {

                    saveButton.textContent =

                        "Guardar producto";

                }

            }

        }

    );

}