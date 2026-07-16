import { hash } from "./Hash.js";
export default class player {
    constructor(displayName, uuid) {
        this.displayName = displayName;
        this.uuid = uuid;
	this.hash = hash(uuid)
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        this.camPos = {
            x: 0,
            y: 0
        };
    }
}
