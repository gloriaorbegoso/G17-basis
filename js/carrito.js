import {IGV, ENVIO_GRATIS_DESDE, costoDeEnvio, sumar} from "./tienda.js";
export const CLAVE_CARRITO = "techcart_carrito";

export const agregarAlCarrito = (carrito, producto) => {
    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
        return carrito.map(item =>
            item.id === producto.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
        );
    }

    return [...carrito, { ...producto, cantidad: 1 }];
};

export const quitarDelCarrito = (carrito, id) => carrito.filter(item => item.id !== id);

export const resumenCarrito = (carrito) => {
    const unidades = carrito.reduce((total, item) => total + item.cantidad, 0);
    const subTotal = sumar(...carrito.map(({ precio, cantidad }) => precio * cantidad)); //100
    const igv = subTotal * IGV; // 100 * 0.18 = 18 soles
    const envio = unidades === 0 ? 0 : costoDeEnvio(subTotal); // 9.90
    return {unidades, subTotal, igv, envio,  total : subTotal + igv + envio}; // 127.90
};

export const faltaParaEnvioGratis = (subTotal) => Math.max(ENVIO_GRATIS_DESDE - subTotal,0);

export const guardarCarrito = (carrito) => {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch(error) {
        console.warn("No se pudo guardar el carrito:", error.message);
    }
}
export const leerCarrito = () => {
    try {
        const crudo = localStorage.getItem(CLAVE_CARRITO);
        return crudo ? JSON.parse(crudo) : [];
    } catch (error) {
        console.warn("El carrito guardado no se pudo leer, empiece desde uno vacio", error.message);
        return [];
    }
}

export const olvidarCarrito = () => {
    try {
        localStorage.removeItem(CLAVE_CARRITO);
    } catch (error) {
        console.warn("No se pudo borrar el carrito guardado:", error.message);
    }
}