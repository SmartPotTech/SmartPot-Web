import {createMemoryHistory, MemoryRouter, Route} from "@solidjs/router";
import {fireEvent, render, screen, waitFor} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {describe, expect, it} from "vitest";
import {setLocale} from "../../lib/i18n";
import {es} from "../../lib/i18n/es";
import {FAQ} from "./faq";
import {LandingPage} from "./LandingPage";

function renderLanding() {
    const history = createMemoryHistory();
    history.set({value: "/"});
    render(() => (
        <MemoryRouter history={history}>
            <Route path="/" component={LandingPage}/>
            <Route path="/register" component={() => <p>Crear cuenta</p>}/>
            <Route path="/login" component={() => <p>Ingresar</p>}/>
        </MemoryRouter>
    ));
}

describe("LandingPage", () => {
    it("muestra la portada, las secciones principales y las llamadas a la acción", () => {
        renderLanding();

        expect(screen.getByRole("heading", {name: "Monitoreo de cultivos hidropónicos"})).toBeInTheDocument();
        expect(screen.getByText("SmartPot lee los sensores de tu cultivo, te dice qué necesita cada planta y por qué, y puede actuar por ti."))
            .toBeInTheDocument();
        for (const heading of [
            "Cómo empieza",
            "Lo que ves en la app",
            "Rangos ideales por especie",
            "Qué mide, qué mueve y cómo decide",
            "Abierto de punta a punta",
            "Preguntas frecuentes",
        ]) {
            expect(screen.getByRole("heading", {name: heading})).toBeInTheDocument();
        }
        const calls = screen.getAllByRole("link", {name: "Crear cuenta gratis"});
        expect(calls.length).toBeGreaterThanOrEqual(2);
        expect(calls.every((link) => link.getAttribute("href") === "/register")).toBe(true);
    });

    it("la demo cambia de especie y actualiza sus lecturas y rangos ideales", async () => {
        renderLanding();

        expect(screen.getByRole("radio", {name: "Lechuga"})).toBeChecked();
        expect(screen.getByText("Nada: las tres lecturas están en su rango.")).toBeInTheDocument();
        expect(screen.getByText("18,5 °C")).toBeInTheDocument();
        expect(screen.getByText("Ideal: 15–22 °C")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("radio", {name: "Tomate"}));

        expect(screen.getByRole("radio", {name: "Tomate"})).toBeChecked();
        expect(await screen.findByText("24,0 °C")).toBeInTheDocument();
        expect(screen.getByText("Ideal: 20–28 °C")).toBeInTheDocument();
        expect(screen.getByText("Nada: las tres lecturas están en su rango.")).toBeInTheDocument();
    });

    it("la demo reacciona a las lecturas y muestra lo que haría el agente", async () => {
        renderLanding();

        fireEvent.input(screen.getByLabelText("pH"), {target: {value: "7.5"}});
        expect(await screen.findByText("Da una dosis de 3 s de pH Down, si el modelo de corrección de pH la confirma."))
            .toBeInTheDocument();
        expect(screen.getByText(/Regla «Bloqueo de nutrientes»/)).toBeInTheDocument();
        expect(screen.getByText("Alto")).toBeInTheDocument();

        fireEvent.input(screen.getByLabelText("Temperatura"), {target: {value: "35"}});
        expect(await screen.findByText("Enciende el ventilador 10 minutos.")).toBeInTheDocument();
    });

    it("publica todas las preguntas frecuentes de faq.ts con sus respuestas", () => {
        renderLanding();

        for (const item of FAQ) {
            expect(screen.getByText(es[item.question])).toBeInTheDocument();
        }
        expect(screen.getByText(es[FAQ[0]!.answer])).toBeInTheDocument();
        // El listado es estático: la landing no oculta preguntas tras un acordeón, así que se comprueba el contenido completo.
        expect(screen.queryByRole("button", {name: es[FAQ[0]!.question]})).not.toBeInTheDocument();
    });

    it("conmuta el contenido a inglés y vuelve a traducir la demo en vivo", async () => {
        renderLanding();
        expect(screen.getByRole("heading", {name: "Monitoreo de cultivos hidropónicos"})).toBeInTheDocument();

        await setLocale("en");

        await waitFor(() => expect(
            screen.getByRole("heading", {name: "Hydroponic crop monitoring"}),
        ).toBeInTheDocument());
        expect(screen.getByText("What is SmartPot?")).toBeInTheDocument();
        expect(screen.getAllByRole("link", {name: "Create a free account"}).length).toBeGreaterThanOrEqual(2);
        expect(screen.getByRole("radio", {name: "Tomato"})).toBeInTheDocument();
        expect(screen.getByText("Nothing: all three readings are in range.")).toBeInTheDocument();
    });
});
