export type Crop = {
    id: string,
    status: string,
    type: string
}

export type Command = {
    id: string;
    commandType: string;
    actuator: string;
    status: 'EXECUTED' | 'PENDING' | 'FAILED' | 'ABORTED';
    dateCreated: string;
    dateExecuted: string | null;
    response: string | null;
    crop: string;
}
