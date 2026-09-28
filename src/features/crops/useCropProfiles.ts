import {useEffect, useState} from "react";
import {cropApi} from "../../lib/api/services";
import type {CropProfile, CropType} from "../../lib/api/types";

let cache: Promise<CropProfile[]> | null = null;

/** Los perfiles casi nunca cambian: se piden una vez por sesión y se comparten. */
export function useCropProfiles(): Partial<Record<CropType, CropProfile>> {
    const [profiles, setProfiles] = useState<Partial<Record<CropType, CropProfile>>>({});

    useEffect(() => {
        let active = true;
        cache ??= cropApi.profiles().catch((error) => {
            cache = null;
            throw error;
        });
        cache
            .then((list) => active && setProfiles(Object.fromEntries(list.map((profile) => [profile.type, profile]))))
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);

    return profiles;
}
