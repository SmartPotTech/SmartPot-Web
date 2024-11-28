import axios from "axios";
import {UserData} from "../contexts/AuthContext";
import {Crop, History, Notifications} from "../types/ApiResponses";
import {cropHistory, userCrop, userNotifications} from "./Endpoints";

export async function getHistoryFromCrop(user: UserData, crop: Crop): Promise<History[]> {
    let history: History[] = [];

    console.log("[API/HISTORY] User id: " + user.id)
    console.log("[API/HISTORY] Crop id: " + crop.id)

    await axios.get(`${cropHistory}${crop.id}`,
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

    await axios.get(`${userCrop}${user.id}`,
        getAuthHeaders(user)
    )
        .then(response => {
            crop = response.data;
        })
        .catch((e) => console.log("Cant fetch Crop data. err: " + e));

    return crop[0];
}

export async function getNotifications(user: UserData): Promise<Notifications[]> {
    let notifications: Notifications[] = [];

    console.log("[API/NOTIFICATIOS] User id: " +  + user.id)

    await axios.get(`${userNotifications}${user.id}`,
        getAuthHeaders(user)
    )
        .then(response => {
            notifications = response.data;
        })
        .catch((e) => console.log("Cant fetch notifications data. err" + e))

    return notifications;

}

function getAuthHeaders(user: UserData) {
    return {
        headers: {
            Authorization: "Bearer " + user.authToken,
        }
    }
}