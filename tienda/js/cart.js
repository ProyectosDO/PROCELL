console.log("CART JS INICIADO");

let carrito = [];

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Configurando carrito..."
        );

        const cartButton =
            document.getElementById(
                "cartButton"
            );

        if (cartButton) {

            cartButton.addEventListener(
                "click",
                function () {

                    console.log(
                        "Carrito abierto"
                    );

                    const cartOverlay =
                        document.getElementById(
                            "cartOverlay"
                        );

                    if (cartOverlay) {

                        cartOverlay.classList.remove(
                            "hidden"
                        );

                    }

                }
            );

        }

        const closeCart =
            document.getElementById(
                "closeCart"
            );

        if (closeCart) {

            closeCart.addEventListener(
                "click",
                function () {

                    const cartOverlay =
                        document.getElementById(
                            "cartOverlay"
                        );

                    if (cartOverlay) {

                        cartOverlay.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        }

        console.log(
            "Carrito configurado correctamente"
        );

    }
);
