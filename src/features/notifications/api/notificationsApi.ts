import axios from "axios";
import {UserData} from "../../auth/types";
import {Notifications} from "../types";
import {userNotifications} from "./endpoints";
import {getAuthHeaders} from "../../../shared/utils/api";

export async function getNotifications(user: UserData): Promise<Notifications[]> {
    let notifications: Notifications[] = [];

    console.log("[API/NOTIFICATIOS] User id: " + user.id)

    await axios.get(`${userNotifications}${user.id}`,
        getAuthHeaders(user)
    )
        .then(response => {
            notifications = response.data;
        })
        .catch((e) => console.log("Cant fetch notifications data. err" + e))

    return notifications;
}
