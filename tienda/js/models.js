// =====================================================
// PROCELL - MODELOS MÚLTIPLES (TIENDA)
// La columna "model" puede contener varios modelos separados por "|".
// =====================================================

function obtenerModelos(producto) {
    const texto = producto && producto.model ? String(producto.model) : "";
    return texto
        .split("|")
        .map(function (m) { return m.trim(); })
        .filter(Boolean);
}

function textoModelos(producto) {
    return obtenerModelos(producto).join(", ");
}

function claveCarrito(id, modelo) {
    return String(id) + "::" + (modelo || "");
}

window.obtenerModelos = obtenerModelos;
window.textoModelos = textoModelos;
window.claveCarrito = claveCarrito;
