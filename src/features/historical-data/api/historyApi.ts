import axios from "axios";
import { UserData } from "../../auth/types";
import { Crop } from "../../dashboard/types";
import { History, Measures } from "../types";
import { cropHistory, cropHistoryRange } from "./endpoints";
import { FlyweightFactory } from "../../../shared/patterns/Flyweight/FlyweightFactory";
import { getAuthHeaders } from "../../../shared/utils/api";

const measureFactory = new FlyweightFactory<Measures>()

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

export async function getHistoryFromDateRange(user: UserData, crop: Crop, ranges: {
    startDate: string,
    endDate: string
}): Promise<History[]> {
    let history: History[] = [];

    console.log("[API/HISTORY RANGE] fetching history from range")
    console.log("[API/HISTORY] User id: " + user.id)
    console.log("[API/HISTORY] Crop id: " + crop.id)

    await axios.post(`${cropHistoryRange}${crop.id}`, ranges, getAuthHeaders(user))
        .then(response => {
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
