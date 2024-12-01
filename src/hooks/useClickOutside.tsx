import { useEffect, useRef } from "react";

const useClickOutside = (callback: () => void) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect( () => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) callback()
        }

        document.addEventListener("mouseup", handleClickOutside);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mouseup", handleClickOutside);
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [callback]);

    return ref;
}

export default useClickOutside;