import axios from "axios";
import {Command} from "../types";
import {UserData} from "../../auth";
import {activateUV} from "./endpoints";
import {getAuthHeaders} from "../../../shared/utils/api";

export async function activateUVLight(user: UserData, cropId: string): Promise<Command> {
    const response = await axios.post<Command>(
        `${activateUV}/${cropId}`,
        {},
        getAuthHeaders(user)
    );

    return response.data;
}