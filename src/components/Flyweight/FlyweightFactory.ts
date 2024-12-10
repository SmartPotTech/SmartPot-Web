import { Flyweight } from "./Flyweight";

export class FlyweightFactory<T> {
    private flyweights: Map<string, Flyweight<T>> = new Map();

    getFlyweight(sharedState: T): Flyweight<T> {
        const key = JSON.stringify(sharedState);
        if (!this.flyweights.has(key)) {
            console.log("Agregando nuevo...")
            this.flyweights.set(key, new Flyweight(sharedState));
        }
        return this.flyweights.get(key)!;
    }

    showFlyweights() {
        console.log(this.flyweights)
    }
}