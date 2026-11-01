import {render} from "solid-js/web";
import {AppRouter} from "./app/router";
import {AuthProvider} from "./features/auth/AuthProvider";
import {registerServiceWorker} from "./features/pwa/pwa";
import "./styles/index.css";

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
