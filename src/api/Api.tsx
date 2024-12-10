import axios from "axios";
import {UserData} from "../contexts/AuthContext";
import {Crop, History, Measures, Notifications} from "../types/ApiResponses";
import {cropHistory, cropHistoryRange, userCrop, userNotifications} from "./Endpoints";
import { FlyweightFactory } from "../components/Flyweight/FlyweightFactory";

let measureFactory = new FlyweightFactory<Measures>()

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

    measureFactory.showFlyweights();
    return history.map(e => {
        e.measures = measureFactory.getFlyweight(e.measures).sharedState
        return e;
    });
}

export async function getHistoryFromDateRange(user: UserData, crop: Crop, ranges: {startDate: string, endDate: string}): Promise<History[]> {
    let history: History[] = [];

    console.log("[API/HISTORY RANGE] fetching history from range")
    console.log("[API/HISTORY] User id: " + user.id)
    console.log("[API/HISTORY] Crop id: " + crop.id)

    await axios.post(`${cropHistoryRange}${crop.id}`, ranges, getAuthHeaders(user))
        .then( response => {
            console.log(response)
            history = response.data
        })
        .catch((e) => console.log("Cant fetch history data from ranges: " + e));

    measureFactory.showFlyweights()
    return history.map(e => {
        e.measures = measureFactory.getFlyweight(e.measures).sharedState
        return e
    });
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