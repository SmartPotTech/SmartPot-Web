import {t} from "../../lib/i18n";

/**
 * Primer elemento enfocable de cada diseño: lleva el foco al contenido. El router intercepta los enlaces en el
 * documento, así que el foco se mueve con un listener nativo del propio enlace (`on:click`, que corre antes); sin
 * JavaScript sigue funcionando como ancla normal.
 */
export function SkipLink() {
    return (
        <a href="#main" class="skip-link" on:click={(event: MouseEvent) => {
            const main = document.getElementById("main");
            if (!main) return;
            event.preventDefault();
            main.focus();
        }}>
            {t("nav.skipToContent")}
        </a>
    );
}
