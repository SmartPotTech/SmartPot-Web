// Aplica el tema y el idioma guardados antes de que se pinte la página, para que no haya parpadeo. Es un archivo
// aparte porque la CSP (script-src 'self') no admite scripts en línea; src/lib/theme y src/lib/i18n toman el relevo.
(function () {
    try {
        var stored = window.localStorage.getItem("smartpot_theme");
        var dark = stored === "dark"
            || (stored !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
        var root = document.documentElement;
        root.classList.toggle("dark", dark);
        root.setAttribute("data-theme", dark ? "dark" : "light");
        var color = document.querySelector('meta[name="theme-color"]');
        if (color) color.setAttribute("content", dark ? "#0A0E0C" : "#0B3D2B");
        var scheme = document.querySelector('meta[name="color-scheme"]');
        if (scheme) scheme.setAttribute("content", dark ? "dark" : "light");
        if (window.localStorage.getItem("smartpot_locale") === "en") root.lang = "en";
    } catch (error) {
        // Sin almacenamiento se queda el tema claro en español.
    }
})();
