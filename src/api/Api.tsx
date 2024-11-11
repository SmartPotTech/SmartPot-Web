import axios from "axios";
import { UserData } from "../context/AuthContext";
import { Crop, History } from "../types/ApiResponses";
import { cropHistory, userCrop } from "./Endpoints";    

export async function getHistoryFromCrop(user: UserData, crop: Crop): Promise<History[]> {
    let history: History[] = [];

    console.log("[API/HISTORY] User id: " + user.id)
    console.log("[API/HISTORY] Crop id: " + crop.id)

    await axios.get("https://api-smartpot.onrender.com/" + cropHistory + crop.id ,
        getAuthHeaders(user)
    )
        .then(response => {
            history = response.data;
        })
        .catch((e) => console.log("Cant fetch history data. err: " + e));    
    
    return history;
}

// TODO: Este metodo deberia devolver solo un cultivo, mas sin enbargo la solicitud devuelve varios

export async function getCrop(user: UserData): Promise<Crop> {
    let crop: Crop[] = [];

    console.log("[API/CROP] User id: " + user.id)

    await axios.get("https://api-smartpot.onrender.com/" + userCrop + user.id,
        getAuthHeaders(user)
    )
        .then(response => {
            crop = response.data;
        })
        .catch((e) => console.log("Cant fetch Crop data. err: " + e));    
    
    return crop[0];
}

function getAuthHeaders(user: UserData) {
    return {
        headers: {
            Authorization: "Bearer " + user.authToken,
        }
    }
}