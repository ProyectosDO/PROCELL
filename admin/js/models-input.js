// =====================================================
// PROCELL - CAMPO DE MÚLTIPLES MODELOS (ADMIN)
// Guarda los modelos en la columna "model" separados por " | "
// (compatible con productos que tenían un solo modelo).
// =====================================================

const MODELOS_SEPARADOR = " | ";

function parsearModelos(texto) {
    return String(texto || "")
        .split(/[|\n;,]+/)
        .map(function (m) { return m.trim(); })
        .filter(function (m, i, arr) {
            return m && arr.findIndex(function (x) {
                return x.toLowerCase() === m.toLowerCase();
            }) === i;
        });
}

window.ModelosAdmin = (function () {

    let modelos = [];

    function el(id) { return document.getElementById(id); }

    function render() {
        const cont = el("modelChips");
        if (!cont) return;
        cont.innerHTML = "";
        modelos.forEach(function (m, i) {
            const chip = document.createElement("span");
            chip.className =
                "inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full pl-3 pr-1.5 py-1 text-sm font-semibold";
            const txt = document.createElement("span");
            txt.textContent = m;
            const x = document.createElement("button");
            x.type = "button";
            x.setAttribute("aria-label", "Quitar " + m);
            x.className =
                "w-5 h-5 rounded-full hover:bg-orange-200 text-orange-700 leading-none";
            x.textContent = "×";
            x.addEventListener("click", function () {
                modelos.splice(i, 1);
                render();
            });
            chip.appendChild(txt);
            chip.appendChild(x);
            cont.appendChild(chip);
        });
        const hidden = el("model");
        if (hidden) hidden.value = modelos.join(MODELOS_SEPARADOR);
    }

    function agregar(texto) {
        parsearModelos(texto).forEach(function (m) {
            const existe = modelos.some(function (x) {
                return x.toLowerCase() === m.toLowerCase();
            });
            if (!existe) modelos.push(m);
        });
        render();
    }

    function confirmarPendiente() {
        const input = el("modelInput");
        if (input && input.value.trim()) {
            agregar(input.value);
            input.value = "";
        }
    }

    function establecer(texto) {
        modelos = parsearModelos(texto);
        const input = el("modelInput");
        if (input) input.value = "";
        render();
    }

    function valor() {
        confirmarPendiente();
        return modelos.join(MODELOS_SEPARADOR);
    }

    document.addEventListener("DOMContentLoaded", function () {
        const input = el("modelInput");
        const btn = el("modelAddBtn");
        if (input) {
            input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    confirmarPendiente();
                }
            });
            input.addEventListener("blur", confirmarPendiente);
        }
        if (btn) btn.addEventListener("click", function () {
            confirmarPendiente();
            if (input) input.focus();
        });
        render();
    });

    return { establecer: establecer, valor: valor, limpiar: function () { establecer(""); } };

})();
