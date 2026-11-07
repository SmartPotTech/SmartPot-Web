import {render} from "solid-js/web";
import {AppRouter} from "./app/router";
import {preloadRoute} from "./app/routes";
import {AuthProvider} from "./features/auth/AuthProvider";
import {registerServiceWorker} from "./features/pwa/pwa";
import {initI18n} from "./lib/i18n";
import {initTheme} from "./lib/theme";
import "./styles/index.css";

// El trozo de la vista abierta empieza a bajar ya, en paralelo con el idioma y la verificación de la sesión.
preloadRoute(window.location.pathname);
// Tema e idioma se aplican antes de montar la app para que no haya parpadeo; el script en línea del <head> ya los
// fijó en el primer pintado y aquí se toma el relevo.
initTheme();
await initI18n();
registerServiceWorker();

// render() de Solid agrega la app sin borrar lo que haya: el contenido estático para rastreadores
// (index.html) se quita antes de montar para que no quede sobre la interfaz.
const root = document.getElementById("root")!;
root.replaceChildren();

render(
    () => (
        <AuthProvider>
            <AppRouter/>
        </AuthProvider>
    ),
    root,
);
