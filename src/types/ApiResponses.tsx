export type Crop = {
    id: string,
    status: string,
    type: string
}

export type History = {
    id: string,
    date: string,
    measures: Measures
}

export type Measures = {
    atmosphere: number,
    brightness: number,
    humidity: number,
    ph: number,
    tds: number,
    temperature: number
}

export type Notifications = {
    id: string, 
    message: string,
    type: string,
    date: string,
}