import {MemoryRouter, Route} from "@solidjs/router";
import {render, screen} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {describe, expect, it} from "vitest";
import {SkipLink} from "./SkipLink";

describe("SkipLink", () => {
    it("lleva el foco al contenido aunque el router intercepte los enlaces", async () => {
        render(() => (
            <MemoryRouter>
                <Route path="/" component={() => (
                    <>
                        <SkipLink/>
                        <main id="main" tabindex="-1">contenido</main>
                    </>
                )}/>
            </MemoryRouter>
        ));
        await userEvent.click(screen.getByRole("link", {name: "Saltar al contenido"}));
        expect(document.activeElement?.id).toBe("main");
    });
});
