import {fireEvent, render, screen} from "@solidjs/testing-library";
import {createSignal} from "solid-js";
import {afterEach, describe, expect, it, vi} from "vitest";
import {Dialog} from "./Dialog";

describe("Dialog", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("abre el diálogo nativo como modal sin prefijar el atributo open", () => {
        let hadOpenBeforeShowModal: boolean | undefined;
        const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (
            this: HTMLDialogElement,
        ) {
            hadOpenBeforeShowModal = this.hasAttribute("open");
            this.setAttribute("open", "");
        });

        render(() => (
            <Dialog open={true} title="Nuevo cultivo" onClose={() => undefined}>
                <p>Contenido modal</p>
            </Dialog>
        ));

        expect(showModal).toHaveBeenCalledTimes(1);
        expect(hadOpenBeforeShowModal).toBe(false);
        expect(screen.getByRole("dialog", {name: "Nuevo cultivo"})).toHaveAttribute("open");
    });

    it("sincroniza showModal y close al cambiar open y responde a Escape", () => {
        const onClose = vi.fn();
        const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (
            this: HTMLDialogElement,
        ) {
            this.setAttribute("open", "");
        });
        const close = vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (
            this: HTMLDialogElement,
        ) {
            this.removeAttribute("open");
            this.dispatchEvent(new Event("close"));
        });

        const [open, setOpen] = createSignal(false);
        render(() => (
            <Dialog open={open()} title="Confirmar" onClose={onClose}>
                <p>Detalle</p>
            </Dialog>
        ));

        expect(showModal).not.toHaveBeenCalled();

        setOpen(true);
        expect(showModal).toHaveBeenCalledTimes(1);

        const dialog = screen.getByRole("dialog", {name: "Confirmar"});
        const cancelEvent = new Event("cancel", {cancelable: true});
        fireEvent(dialog, cancelEvent);
        expect(cancelEvent.defaultPrevented).toBe(true);
        expect(onClose).toHaveBeenCalledTimes(1);

        setOpen(false);
        expect(close).toHaveBeenCalledTimes(1);
    });
});
