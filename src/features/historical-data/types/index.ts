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
