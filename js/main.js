import { agregarAlCarrito, faltaParaEnvioGratis, guardarCarrito, leerCarrito, olvidarCarrito, quitarDelCarrito, resumenCarrito } from "./carrito.js";
import {productos } from "./datos.js";
import formatearPrecio from "./formato.js";
import { ENVIO_GRATIS_DESDE } from "./tienda.js";
import { filaCarrito, tarjetaProducto } from "./ui.js";

const resumenCabecera = document.querySelector('#resumen-carrito');
const listaCarrito = document.querySelector('#lista-carrito');
const totalCarrito = document.querySelector('#total-carrito');
const barraEnvio = document.querySelector('#barra-envio');
const mensajeEnvio = document.querySelector('#mensaje-envio');
const botonVaciar = document.querySelector('#vaciar');
const grillaCatalogo = document.querySelector("#catalogo-grid");

const botonTema = document.querySelector("#tema");
const CLAVE_TEMA = "techcart_tema";

let tema = "light";

try {
    tema = localStorage.getItem(CLAVE_TEMA) || "light";
} catch (error) {
    console.warn("No se pudo leer el tema:", error.message);
}
document.documentElement.classList.toggle("dark", tema === "dark");

botonTema.addEventListener("click", () => {
    const esOscuro = document.documentElement.classList.toggle("dark");
    tema = esOscuro ? "dark" : "light";

    try {
        localStorage.setItem(CLAVE_TEMA, tema);
    } catch (error) {
        console.warn("No se pudo guardar el tema:", error.message);
    }
});

const pintarCatalogo = (lista = productos) => {
    grillaCatalogo.innerHTML = "";

    if (lista.length === 0) {
        const aviso = document.createElement("p");
        aviso.textContent = "No se encontraron productos.";
        aviso.classList.add("text-texto-suave", "text-center", "py-4");
        aviso.id = "aviso-sin-resultados";

        grillaCatalogo.append(aviso);
    } else {
        const aviso = document.querySelector("#aviso-sin-resultados");
        aviso?.remove();

        const html = lista.map(tarjetaProducto).join("");
        grillaCatalogo.insertAdjacentHTML("beforeEnd", html);
    }

    grillaCatalogo.setAttribute(
        "aria-label",
        `Catalogo con ${lista.length} productos`
    );
}

const filtrosCategoria = document.querySelector("#filtros-categoria");

filtrosCategoria.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-categoria]");

    if (!boton) return;

    const categoria = boton.dataset.categoria;

    if (categoria === "todas") {
        pintarCatalogo();
        return;
    }

    const filtrados = productos.filter(
        producto => producto.categoria === categoria
    );

    pintarCatalogo(filtrados);
});

let carrito = leerCarrito();

const pintarCarrito = () => {
    const {unidades, subTotal, igv, envio, total}= resumenCarrito(carrito);
    document.title = `TechCart (${unidades})`;
    resumenCabecera.textContent = unidades === 0 ? "Carrito vacio" : `${unidades} producto(s) - ${formatearPrecio(total)}`;
    listaCarrito.innerHTML = carrito.map(filaCarrito).join("");
    totalCarrito.textContent = unidades === 0 ? "Todavia no agregaste nada." : 
        `Subtotal ${formatearPrecio(subTotal)} - IGV ${formatearPrecio(igv)} - ` +
        `Envio ${formatearPrecio(envio)} - Total ${formatearPrecio(total)}`;
    botonVaciar.classList.toggle("hidden", unidades === 0);
    const avance = Math.min((subTotal/ ENVIO_GRATIS_DESDE) * 100, 100);
    barraEnvio.style.width = `${avance}%`
    const falta = faltaParaEnvioGratis(subTotal);
    mensajeEnvio.textContent = falta === 0 ? "Tu pedido ya tiene envio gratis." : `Te faltan ${formatearPrecio(falta)} para el envio gratis.`;
}

grillaCatalogo.addEventListener('click', (evento) => {
    const boton = evento.target.closest("button[data-accion='agregar']");
    if(!boton) return;
     const id = Number(boton.dataset.id);
    const producto = productos.find( p => p.id === id);
    if(!producto) return;
    carrito = agregarAlCarrito(carrito , producto);
    guardarCarrito(carrito);
    pintarCarrito();
});

listaCarrito.addEventListener('click', (evento) => {
    const boton = evento.target.closest("button[data-accion='quitar']");
    if(!boton) return;
    carrito = quitarDelCarrito(carrito, Number(boton.dataset.id));
    guardarCarrito(carrito);
    pintarCarrito();
});

botonVaciar.addEventListener('click', () => {
    carrito = [];
    olvidarCarrito();
    pintarCarrito();
})

const formularioCompra = document.querySelector('#form-compra');
const estadoPedido = document.querySelector('#estado-pedido');

const mostrarAviso = (mensaje, esError) => {
    estadoPedido.querySelector("p")?.remove();
    const aviso = document.createElement("p");
    aviso.textContent = mensaje;
    aviso.classList.add("font-semibold", esError ? "text-error" : "text-exito");
    estadoPedido.append(aviso);
}

formularioCompra.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if(!formularioCompra.checkValidity()){
        formularioCompra.reportValidity();
        mostrarAviso("Faltan datos por completar. Revisa los campos marcados", true);
        return;
    }

    if(carrito.length === 0 ) {
        mostrarAviso("Tu carrito esta vacio: Agrega al menos un producto antes de confirmar.", true);
        return;
    }

    const datos = new FormData(formularioCompra);
    const nombre = datos.get("nombre");
    const unidades = Number(formularioCompra.elements.cantidad.value);
    const {total} = resumenCarrito(carrito);
    mostrarAviso(
        `
        Gracias, ${nombre}. Tu pedido de ${carrito.length} producto(s) y ${unidades} unidad(es) 
        ` + 
        `por ${formatearPrecio(total)} quedo registrado.`, false
    );
    formularioCompra.reset();

})
pintarCatalogo();
pintarCarrito();
//pintarCatalogo([]);