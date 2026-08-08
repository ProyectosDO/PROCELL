// =====================================================
// PROCELL - CATÁLOGO PÚBLICO
// =====================================================

console.log(
    "✅ catalog.js se cargó correctamente"
);


// =====================================================
// VARIABLES
// =====================================================

let productos = [];

let categoriaActual = "Todos";

let busquedaActual = "";

let paginaActual = 1;

const PRODUCTOS_POR_PAGINA = 50;

let productosFiltrados = [];


// =====================================================
// INICIAR CATÁLOGO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🔄 Iniciando catálogo..."
        );

        cargarProductos();

        cargarCategorias();

        configurarBuscador();

    }
);


// =====================================================
// CARGAR PRODUCTOS DESDE SUPABASE
// =====================================================

async function cargarProductos() {

    const contenedor =
        document.getElementById(
            "productsGrid"
        );


    if (!contenedor) {

        console.error(
            "❌ No se encontró #productsGrid"
        );

        return;

    }


    contenedor.innerHTML = `

        <div
            class="
                col-span-full
                flex
                flex-col
                items-center
                justify-center
                py-20
            "
        >

            <div
                class="
                    w-12
                    h-12
                    border-4
                    border-orange-200
                    border-t-orange-500
                    rounded-full
                    animate-spin
                "
            ></div>

            <p class="mt-5 text-gray-500">

                Cargando productos...

            </p>

        </div>

    `;


    try {

        console.log(
            "🔄 Consultando tabla products..."
        );


        // =================================================
        // CONSULTAR TODOS LOS PRODUCTOS
        // =================================================

        const {
            data: productosData,
            error: productosError
        } = await supabaseClient

            .from(
                "products"
            )

            .select(
                "*"
            )

            .eq(
                "is_active",
                true
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (
            productosError
        ) {

            throw productosError;

        }


        productos =
            productosData || [];


        console.log(
            "✅ Productos encontrados:",
            productos
        );


        // =================================================
        // CARGAR IMÁGENES
        // =================================================

        for (
            const producto of productos
        ) {


            const {
                data: imagenes,
                error: imagenesError
            } = await supabaseClient

                .from(
                    "product_images"
                )

                .select(
                    "*"
                )

                .eq(
                    "product_id",
                    producto.id
                )

                .order(
                    "display_order",
                    {
                        ascending: true
                    }
                );


            if (
                imagenesError
            ) {

                console.error(
                    "⚠️ Error cargando imágenes:",
                    imagenesError
                );


                producto.imagenes =
                    [];

            }

            else {

                producto.imagenes =
                    imagenes || [];

            }

        }


        // =================================================
        // APLICAR FILTROS
        // =================================================

        aplicarFiltros();

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
                    text-center
                    py-16
                "
            >

                <div class="text-5xl mb-4">
                    ⚠️
                </div>

                <h3
                    class="
                        text-xl
                        font-bold
                        text-red-600
                    "
                >

                    Error al cargar los productos

                </h3>

                <p
                    class="
                        text-gray-500
                        mt-2
                    "
                >

                    Revisa la consola del navegador.

                </p>

            </div>

        `;

    }

}


// =====================================================
// OBTENER URL DE IMAGEN
// =====================================================

function obtenerURLImagen(
    imagen
) {


    // =================================================
    // SI YA TENEMOS URL
    // =================================================

    if (
        imagen.image_url
    ) {

        return imagen.image_url;

    }


    // =================================================
    // SI TENEMOS RUTA DEL STORAGE
    // =================================================

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
// MOSTRAR PRODUCTOS
// =====================================================

function mostrarProductos() {

    const contenedor =
        document.getElementById(
            "productsGrid"
        );


    const noProducts =
        document.getElementById(
            "noProducts"
        );


    const productCount =
        document.getElementById(
            "productCount"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML =
        "";


    // =================================================
    // SIN RESULTADOS
    // =================================================

    if (
        productosFiltrados.length === 0
    ) {

        if (
            noProducts
        ) {

            noProducts.classList.remove(
                "hidden"
            );

        }


        if (
            productCount
        ) {

            productCount.textContent =
                "0 productos";

        }


        eliminarPaginacion();

        return;

    }


    if (
        noProducts
    ) {

        noProducts.classList.add(
            "hidden"
        );

    }


    // =================================================
    // CALCULAR PAGINACIÓN
    // =================================================

    const totalProductos =
        productosFiltrados.length;


    const totalPaginas =
        Math.ceil(
            totalProductos /
            PRODUCTOS_POR_PAGINA
        );


    // =================================================
    // ASEGURAR QUE LA PÁGINA SEA VÁLIDA
    // =================================================

    if (
        paginaActual >
        totalPaginas
    ) {

        paginaActual =
            totalPaginas;

    }


    if (
        paginaActual < 1
    ) {

        paginaActual =
            1;

    }


    // =================================================
    // CALCULAR PRODUCTOS DE LA PÁGINA ACTUAL
    // =================================================

    const inicio =
        (
            paginaActual - 1
        ) *
        PRODUCTOS_POR_PAGINA;


    const fin =
        inicio +
        PRODUCTOS_POR_PAGINA;


    const productosPagina =
        productosFiltrados.slice(
            inicio,
            fin
        );


    console.log(
        "📄 Página actual:",
        paginaActual
    );


    console.log(
        "📦 Productos mostrados:",
        productosPagina.length
    );


    // =================================================
    // CREAR TARJETAS
    // =================================================

    productosPagina.forEach(
        function (
            producto
        ) {

            const tarjeta =
                crearTarjetaProducto(
                    producto
                );


            contenedor.appendChild(
                tarjeta
            );

        }
    );


    // =================================================
    // CONTADOR
    // =================================================

    if (
        productCount
    ) {

        const numeroInicio =
            inicio + 1;


        const numeroFin =
            Math.min(
                fin,
                totalProductos
            );


        productCount.textContent =

            `${numeroInicio}-${numeroFin} de ${totalProductos} producto${
                totalProductos === 1
                    ? ""
                    : "s"
            }`;

    }


    // =================================================
    // MOSTRAR PAGINACIÓN
    // =================================================

    crearPaginacion(
        totalPaginas
    );

}


// =====================================================
// CREAR TARJETA
// =====================================================

function crearTarjetaProducto(
    producto
) {

    const tarjeta =
        document.createElement(
            "div"
        );


    tarjeta.className = `

    bg-white
    rounded-xl
    sm:rounded-2xl
    overflow-hidden
    border
    border-gray-100
    shadow-md
    sm:shadow-lg

    transition-all
    duration-300

    active:scale-[0.98]
    sm:hover:-translate-y-2
    sm:hover:shadow-2xl
    sm:hover:border-orange-300

    group

`;


    // =================================================
    // IMAGEN
    // =================================================

    let imagenURL =
        "";


    if (
        producto.imagenes &&
        producto.imagenes.length > 0
    ) {

        imagenURL =
            obtenerURLImagen(
                producto.imagenes[0]
            );

    }


    let imagenHTML =
        "";


    if (
        imagenURL
    ) {

        imagenHTML = `

    <div

        class="
            w-full
            aspect-square
            flex
            items-center
            justify-center
            bg-gray-50
            overflow-hidden
        "

    >

        <img

            src="${imagenURL}"

            alt="${producto.name || "Producto"}"

            loading="lazy"

            class="
    w-full
    h-full
    object-contain
    p-2
    sm:p-4
    sm:group-hover:scale-110
    transition
    duration-500
    cursor-pointer
"

        >

    </div>

`;

    }

    else {

        imagenHTML = `

            <div

                class="
                    w-full
                    aspect-square
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    text-3xl
                    sm:text-5xl
                    cursor-pointer
                "

            >

                📦

            </div>

        `;

    }


    // =================================================
    // STOCK
    // =================================================

    const stock =
        Number(
            producto.stock || 0
        );


    let stockHTML =
        "";


    if (
        stock > 0
    ) {

        stockHTML = `

            

        `;

    }

    else {

        stockHTML = `

            <span

                class="
                    bg-red-100
                    text-red-700
                    px-2
                    py-0.5
                    sm:px-3
                    sm:py-1
                    rounded-full
                    text-[10px]
                    sm:text-xs
                    font-semibold
                "

            >

                Agotado

            </span>

        `;

    }


    // =================================================
    // TARJETA
    // =================================================

    tarjeta.innerHTML = `

        <!-- IMAGEN -->

        <div
            class="
                relative
                bg-gray-50
                overflow-hidden
                cursor-pointer
            "
            data-action="detalle"
        >

            ${imagenHTML}


            <!-- DISPONIBILIDAD -->



            <!-- BOTÓN + RÁPIDO -->

            <button

                class="
                    add-to-cart
                    absolute
                    top-2
                    right-2
                    sm:top-4
                    sm:right-4
                    w-7
                    h-7
                    sm:w-10
                    sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-white
                    sm:bg-green-500
                    text-green-500
                    sm:text-white
                    hover:bg-green-500
                    hover:text-white
                    active:bg-green-500
                    active:text-white
                    rounded-full
                    text-base
                    sm:text-xl
                    font-bold
                    leading-none
                    shadow-md
                    transition
                    disabled:bg-gray-200
                    disabled:text-gray-400
                    disabled:cursor-not-allowed
                "

                title="Agregar al carrito"

                data-id="${producto.id}"

                ${
                    stock <= 0
                        ? "disabled"
                        : ""
                }

            >

                +

            </button>

        </div>


        <!-- INFORMACIÓN -->

           <div
           class="
           p-2.5
           sm:p-5
           flex
           flex-col
           "
           >


            <!-- MARCA -->

               <p
                  class="
                  text-orange-500
                  text-[10px]
                  sm:text-sm
                  font-semibold
                    h-3.5
                    sm:h-5
                    truncate
                    "
                    >
                  ${producto.brand || "&nbsp;"}
               </p>


            <!-- NOMBRE -->

            <h3

                class="
                    text-[13px]
                    sm:text-lg
                    font-bold
                    text-gray-800
                    mt-1
                    cursor-pointer
                    hover:text-orange-500
                    transition
                    line-clamp-2
                    leading-snug
                    min-h-[2.1em]
                    sm:min-h-0
                "

                data-action="detalle"

            >

                ${producto.name || "Producto"}

            </h3>


            <!-- MODELO -->

              <p
                  class="
                      text-[10px]
                      sm:text-sm
                    text-gray-500
                     mt-0.5
                     sm:mt-1
                        h-3.5
                        sm:h-5
                        truncate
                      "
                     >
                ${producto.model || "&nbsp;"}
             </p>

            <!-- PRECIO -->

            <p

                class="
                    text-[15px]
                    sm:text-2xl
                    font-extrabold
                    text-orange-500
                    mt-1.5
                    sm:mt-4
                "

            >

                ${formatearPrecio(
                    producto.price
                )}

            </p>


            <!-- BOTÓN COMPRAR -->

            <button

                class="
                    buy-product
                    w-full
                    h-8
                    sm:h-12
                    mt-2
                    sm:mt-4
                    bg-gray-900
                    hover:bg-orange-500
                    active:bg-orange-500
                    text-white
                    rounded-lg
                    sm:rounded-xl
                    font-semibold
                    sm:font-bold
                    text-[11px]
                    sm:text-base
                    transition
                "

                data-id="${producto.id}"

            >

                Ver producto

            </button>

        </div>

    `;


    // =================================================
    // ABRIR DETALLE
    // =================================================

    tarjeta
        .querySelectorAll(
            '[data-action="detalle"]'
        )
        .forEach(
            function (
                elemento
            ) {

                elemento.addEventListener(
                    "click",
                    function () {

                        abrirDetalleProducto(
                            producto
                        );

                    }
                );

            }
        );


    // =================================================
    // BOTÓN +
    // =================================================

    const addButton =
        tarjeta.querySelector(
            ".add-to-cart"
        );


    addButton.addEventListener(
        "click",
        function (
            event
        ) {

            event.stopPropagation();


            if (
                stock <= 0
            ) {

                return;

            }


            if (
                typeof agregarAlCarrito ===
                "function"
            ) {

                agregarAlCarrito(
                    producto
                );

            }

            else {

                console.error(
                    "❌ cart.js todavía no está conectado"
                );

            }

        }
    );


    // =================================================
    // BOTÓN COMPRAR
    // =================================================

    const buyButton =
        tarjeta.querySelector(
            ".buy-product"
        );


    buyButton.addEventListener(
        "click",
        function (
            event
        ) {

            event.stopPropagation();


            abrirDetalleProducto(
                producto
            );

        }
    );


    return tarjeta;

}


// =====================================================
// BUSCADOR
// =====================================================

function configurarBuscador() {

    const input =
        document.getElementById(
            "searchInput"
        );
        const clearButton =
    document.getElementById(
        "clearSearch"
    );


    if (
        !input
    ) {

        return;

    }


    // =================================================
    // ESCRIBIR EN EL BUSCADOR
    // =================================================

    input.addEventListener(
        "input",
        function () {

            busquedaActual =
                this.value
                    .trim()
                    .toLowerCase();

                    // =============================================
// MOSTRAR / OCULTAR BOTÓN X
// =============================================

if (clearButton) {

    if (busquedaActual.length > 0) {

        clearButton.classList.remove(
            "hidden"
        );

    }

    else {

        clearButton.classList.add(
            "hidden"
        );

    }

}


            // =============================================
            // VOLVER A PÁGINA 1
            // =============================================

            paginaActual =
                1;


            // =============================================
            // APLICAR FILTROS
            // =============================================

            aplicarFiltros();

        }
    );


    // =================================================
    // PRESIONAR ENTER
    // =================================================

    input.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                busquedaActual =
                    this.value
                        .trim()
                        .toLowerCase();


                paginaActual =
                    1;


                aplicarFiltros();


                // =========================================
                // IR A PRODUCTOS
                // =========================================

                const productsSection =
                    document.getElementById(
                        "productos"
                    );


                if (
                    productsSection
                ) {

                    setTimeout(
                        function () {

                            productsSection.scrollIntoView(
                                {
                                    behavior:
                                        "smooth",

                                    block:
                                        "start"
                                }
                            );

                        },
                        100
                    );

                }

            }

        }
    );

// =================================================
// BOTÓN LIMPIAR
// =================================================

if (clearButton) {

    clearButton.addEventListener(
        "click",
        function () {

            input.value = "";

            busquedaActual = "";

            paginaActual = 1;

            aplicarFiltros();

            clearButton.classList.add(
                "hidden"
            );

            input.focus();

        }
    );

}
}


// =====================================================
// CARGAR CATEGORÍAS DESDE SUPABASE
// =====================================================

async function cargarCategorias() {

    const contenedor =
        document.getElementById(
            "categoryButtons"
        );


    if (!contenedor) {

        console.error(
            "❌ No se encontró #categoryButtons"
        );

        return;

    }


    // =================================================
    // MENSAJE DE CARGA
    // =================================================

    contenedor.innerHTML = `

        <div class="text-gray-500">

            Cargando categorías...

        </div>

    `;


    try {

        console.log(
            "🔄 Consultando categorías..."
        );


        // =================================================
        // CONSULTAR CATEGORÍAS
        // =================================================

        const {
            data: categorias,
            error
        } = await supabaseClient

            .from(
                "categories"
            )

            .select(
                "*"
            )

            .order(
                "name",
                {
                    ascending: true
                }
            );


        if (
            error
        ) {

            throw error;

        }


        console.log(
            "✅ Categorías encontradas:",
            categorias
        );


        // =================================================
        // LIMPIAR CONTENEDOR
        // =================================================

        contenedor.innerHTML =
            "";


        // =================================================
        // BOTÓN TODOS
        // =================================================

        const botonTodos =
            document.createElement(
                "button"
            );


        botonTodos.type =
            "button";


        botonTodos.dataset.category =
            "Todos";


        botonTodos.className = `

            category-button

            bg-orange-500

            text-white

            px-3

            py-2

            sm:px-4

            rounded-xl

            font-semibold

            text-sm

            sm:text-base

            whitespace-nowrap

            transition

        `;


        botonTodos.textContent =
            "Todos";


        contenedor.appendChild(
            botonTodos
        );


        // =================================================
        // CREAR CATEGORÍAS
        // =================================================

        categorias.forEach(
            function (
                categoria
            ) {

                const boton =
                    document.createElement(
                        "button"
                    );


                boton.type =
                    "button";


                boton.dataset.category =
                    categoria.name;


                boton.className = `

                    category-button

                    bg-white

                    border

                    border-gray-200

                    hover:border-orange-500

                    hover:text-orange-500

                    px-3

                    py-2

                    sm:px-4

                    rounded-xl

                    font-semibold

                    text-sm

                    sm:text-base

                    whitespace-nowrap

                    transition

                `;


                boton.textContent =
                    categoria.name;


                contenedor.appendChild(
                    boton
                );

            }
        );


        // =================================================
        // CONFIGURAR BOTONES
        // =================================================

        configurarCategorias();


    }

    catch (
        error
    ) {

        console.error(
            "❌ Error cargando categorías:",
            error
        );


        contenedor.innerHTML = `

            <div
                class="
                    text-red-500
                    font-semibold
                "
            >

                ⚠️ No se pudieron cargar las categorías.

            </div>

        `;

    }

}


// =====================================================
// CONFIGURAR BOTONES DE CATEGORÍAS
// =====================================================

function configurarCategorias() {

    const botones =
        document.querySelectorAll(
            ".category-button"
        );


    botones.forEach(
        function (
            boton
        ) {

            boton.addEventListener(
                "click",
                function () {


                    // =================================
                    // GUARDAR CATEGORÍA ACTUAL
                    // =================================

                    categoriaActual =
                        this.dataset.category;


                    // =================================
                    // VOLVER A PÁGINA 1
                    // =================================

                    paginaActual =
                        1;


                    // =================================
                    // ACTUALIZAR ESTILOS
                    // =================================

                    botones.forEach(
                        function (
                            btn
                        ) {

                            btn.classList.remove(
                                "bg-orange-500",
                                "text-white"
                            );


                            btn.classList.add(
                                "bg-white",
                                "text-gray-700"
                            );

                        }
                    );


                    // =================================
                    // ACTIVAR BOTÓN SELECCIONADO
                    // =================================

                    this.classList.remove(
                        "bg-white",
                        "text-gray-700"
                    );


                    this.classList.add(
                        "bg-orange-500",
                        "text-white"
                    );


                    // =================================
                    // APLICAR FILTROS
                    // =================================

                    aplicarFiltros();

                }
            );

        }
    );

}


// =====================================================
// FILTRAR PRODUCTOS
// =====================================================

function aplicarFiltros() {

    // =================================================
    // FILTRAR SOBRE EL ARRAY ORIGINAL
    // =================================================

    productosFiltrados =
        productos.filter(
            function (
                producto
            ) {


                // =========================================
                // CATEGORÍA
                // =========================================

                const coincideCategoria =

                    categoriaActual ===
                    "Todos"

                    ||

                    String(
                        producto.category || ""
                    )
                    .toLowerCase()

                    ===

                    String(
                        categoriaActual
                    )
                    .toLowerCase();


                // =========================================
                // TEXTO DE BÚSQUEDA
                // =========================================

                const texto = `

                    ${producto.name || ""}

                    ${producto.brand || ""}

                    ${producto.model || ""}

                    ${producto.category || ""}

                `;


                // =========================================
                // BUSCAR
                // =========================================

                const coincideBusqueda =

                    texto
                        .toLowerCase()
                        .includes(
                            busquedaActual
                        );


                // =========================================
                // RESULTADO
                // =========================================

                return (

                    coincideCategoria &&

                    coincideBusqueda

                );

            }
        );


    console.log(
        "🔎 Productos después de filtrar:",
        productosFiltrados.length
    );


    // =================================================
    // MOSTRAR PÁGINA ACTUAL
    // =================================================

    mostrarProductos();

}


// =====================================================
// CREAR PAGINACIÓN
// =====================================================

function crearPaginacion(
    totalPaginas
) {

    let contenedor =
        document.getElementById(
            "paginacionProductos"
        );


    // =================================================
    // CREAR CONTENEDOR SI NO EXISTE
    // =================================================

    if (
        !contenedor
    ) {

        contenedor =
            document.createElement(
                "div"
            );


        contenedor.id =
            "paginacionProductos";


        contenedor.className = `

            flex
            flex-wrap
            justify-center
            items-center
            gap-2
            mt-10
            mb-10

        `;


        const productsGrid =
            document.getElementById(
                "productsGrid"
            );


        if (
            productsGrid &&
            productsGrid.parentElement
        ) {

            productsGrid.parentElement.appendChild(
                contenedor
            );

        }

    }


    // =================================================
    // LIMPIAR
    // =================================================

    contenedor.innerHTML =
        "";


    // =================================================
    // SI SOLO HAY UNA PÁGINA
    // =================================================

    if (
        totalPaginas <= 1
    ) {

        return;

    }


    // =================================================
    // BOTÓN ANTERIOR
    // =================================================

    const botonAnterior =
        document.createElement(
            "button"
        );


    botonAnterior.type =
        "button";


    botonAnterior.textContent =
        "←";


    botonAnterior.title =
        "Página anterior";


    botonAnterior.disabled =
        paginaActual === 1;


    botonAnterior.className = `

        w-10
        h-10
        rounded-xl
        bg-gray-100
        text-gray-700
        font-bold
        transition
        hover:bg-orange-500
        hover:text-white
        disabled:opacity-40
        disabled:cursor-not-allowed

    `;


    botonAnterior.addEventListener(
        "click",
        function () {

            if (
                paginaActual > 1
            ) {

                paginaActual--;

                mostrarProductos();

                desplazarAProductos();

            }

        }
    );


    contenedor.appendChild(
        botonAnterior
    );


    // =================================================
    // CREAR NÚMEROS
    // =================================================

    const numeros =
        obtenerNumerosPaginas(
            paginaActual,
            totalPaginas
        );


    numeros.forEach(
        function (
            numero
        ) {


            // =========================================
            // PUNTOS
            // =========================================

            if (
                numero === "..."
            ) {

                const puntos =
                    document.createElement(
                        "span"
                    );


                puntos.textContent =
                    "...";


                puntos.className = `

                    px-2
                    text-gray-500
                    font-bold

                `;


                contenedor.appendChild(
                    puntos
                );


                return;

            }


            // =========================================
            // BOTÓN DE PÁGINA
            // =========================================

            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


            boton.textContent =
                numero;


            boton.className = `

                w-10
                h-10
                rounded-xl
                font-semibold
                transition

                ${
                    numero === paginaActual

                        ? "bg-orange-500 text-white"

                        : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                }

            `;


            boton.addEventListener(
                "click",
                function () {

                    if (
                        paginaActual ===
                        numero
                    ) {

                        return;

                    }


                    paginaActual =
                        numero;


                    mostrarProductos();

                    desplazarAProductos();

                }
            );


            contenedor.appendChild(
                boton
            );

        }
    );


    // =================================================
    // BOTÓN SIGUIENTE
    // =================================================

    const botonSiguiente =
        document.createElement(
            "button"
        );


    botonSiguiente.type =
        "button";


    botonSiguiente.textContent =
        "→";


    botonSiguiente.title =
        "Página siguiente";


    botonSiguiente.disabled =
        paginaActual ===
        totalPaginas;


    botonSiguiente.className = `

        w-10
        h-10
        rounded-xl
        bg-gray-100
        text-gray-700
        font-bold
        transition
        hover:bg-orange-500
        hover:text-white
        disabled:opacity-40
        disabled:cursor-not-allowed

    `;


    botonSiguiente.addEventListener(
        "click",
        function () {

            if (
                paginaActual <
                totalPaginas
            ) {

                paginaActual++;

                mostrarProductos();

                desplazarAProductos();

            }

        }
    );


    contenedor.appendChild(
        botonSiguiente
    );

}


// =====================================================
// OBTENER NÚMEROS DE PÁGINAS
// =====================================================

function obtenerNumerosPaginas(
    actual,
    total
) {

    const paginas =
        [];


    // =================================================
    // SI HAY 7 O MENOS
    // =================================================

    if (
        total <= 7
    ) {

        for (
            let i = 1;
            i <= total;
            i++
        ) {

            paginas.push(
                i
            );

        }


        return paginas;

    }


    // =================================================
    // PRIMERA PÁGINA
    // =================================================

    paginas.push(
        1
    );


    // =================================================
    // CALCULAR RANGO
    // =================================================

    let inicio =
        Math.max(
            2,
            actual - 1
        );


    let fin =
        Math.min(
            total - 1,
            actual + 1
        );


    // =================================================
    // PUNTOS INICIALES
    // =================================================

    if (
        inicio > 2
    ) {

        paginas.push(
            "..."
        );

    }


    // =================================================
    // NÚMEROS INTERMEDIOS
    // =================================================

    for (
        let i = inicio;
        i <= fin;
        i++
    ) {

        paginas.push(
            i
        );

    }


    // =================================================
    // PUNTOS FINALES
    // =================================================

    if (
        fin < total - 1
    ) {

        paginas.push(
            "..."
        );

    }


    // =================================================
    // ÚLTIMA PÁGINA
    // =================================================

    paginas.push(
        total
    );


    return paginas;

}


// =====================================================
// ELIMINAR PAGINACIÓN
// =====================================================

function eliminarPaginacion() {

    const contenedor =
        document.getElementById(
            "paginacionProductos"
        );


    if (
        contenedor
    ) {

        contenedor.innerHTML =
            "";

    }

}


// =====================================================
// DESPLAZAR A PRODUCTOS
// =====================================================

function desplazarAProductos() {

    const productsSection =
        document.getElementById(
            "productos"
        );


    if (
        productsSection
    ) {

        setTimeout(
            function () {

                productsSection.scrollIntoView(
                    {
                        behavior:
                            "smooth",

                        block:
                            "start"
                    }
                );

            },
            100
        );

    }

}


// =====================================================
// FORMATEAR PRECIO
// =====================================================

function formatearPrecio(
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
