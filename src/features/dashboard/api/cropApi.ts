import axios from "axios";
import { UserData } from "../../auth/types";
import { Crop } from "../types";
import { userCrop, numCrop } from "./endpoints";
import { getAuthHeaders } from "../../../shared/utils/api";

// TODO: Este metodo deberia devolver solo un cultivo, mas sin embargo la solicitud devuelve varios
export async function getCrop(user: UserData): Promise<Crop> {
    let crop: Crop[] = [];

    console.log("[API/CROP] User id: " + user.id)

    await axios.get(`${userCrop}${user.id}`,
        getAuthHeaders(user)
    )
        .then(response => {
            crop = response.data;
        })
        .catch((e) => console.log("Cant fetch Crop data. err: " + e));

    return crop[0];
}

export async function getNumCrop(user: UserData): Promise<number> {
    let num = 0;

    console.log("[API/CROP] User id: " + user.id)

    await axios.get(`${numCrop}${user.id}`,
        getAuthHeaders(user)
    )
        .then(response => {
            num = response.data;
        })
        .catch((e) => console.log("Cant fetch Crop data. err: " + e));
    console.log("++++++++++" + num)
    return num;
}
