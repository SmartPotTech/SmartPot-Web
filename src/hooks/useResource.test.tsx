import {createRoot, createSignal} from "solid-js";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {useResource} from "./useResource";

describe("useResource", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("cambia el ritmo de consulta cuando cambia el intervalo", async () => {
        const loader = vi.fn(() => Promise.resolve(1));
        const [fast, setFast] = createSignal(false);
        const dispose = createRoot((disposeRoot) => {
            useResource(loader, [], () => (fast() ? 4_000 : 15_000));
            return disposeRoot;
        });
        await vi.advanceTimersByTimeAsync(0);
        expect(loader).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(14_000);
        expect(loader).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1_000);
        expect(loader).toHaveBeenCalledTimes(2);

        // Al acelerar no se vuelve a pedir en el acto: solo se reinicia el temporizador con el nuevo ritmo.
        setFast(true);
        await vi.advanceTimersByTimeAsync(0);
        expect(loader).toHaveBeenCalledTimes(2);
        await vi.advanceTimersByTimeAsync(4_000);
        expect(loader).toHaveBeenCalledTimes(3);
        dispose();
    });

    it("permite que el intervalo dependa del propio recurso", async () => {
        const dispose = createRoot((disposeRoot) => {
            const pending = (): boolean => resource.data === "pending";
            const resource = useResource(() => Promise.resolve("pending"), [], () => (pending() ? 4_000 : 15_000));
            return disposeRoot;
        });
        await vi.advanceTimersByTimeAsync(0);
        dispose();
    });
});
