import { ENVIO_GRATIS_DESDE } from "./tienda.js";

export function tarifaPorZona(zona) {
    switch(zona) {
        case "Lima" : 
            return 0;
        case "Resto del Peru":
            return 9.99;
        case "Internacional":
            return 29.9
        default : 
            return 9.99;
    }
}

export const costoDeEnvio = (total, zona = "Resto del Peru") => total >= ENVIO_GRATIS_DESDE ? 0 : tarifaPorZona(zona);