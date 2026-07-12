// energy/Connector.js
export default class Connector {
    constructor(name, type, voltage = 0, resistance = 1) {
        this.name = name;
        this.type = type; // "source" | "load" | "wire" | "battery"
        this.voltage = voltage;
        this.resistance = resistance;
        this.current = 0;
        this.connected = [];
    }

    connect(connector) {
        if (!this.connected.includes(connector)) {
            this.connected.push(connector);
            connector.connected.push(this);
        }
    }

    consumePower(voltage) {
        if (this.type === "load") {
            const I = voltage / this.resistance;
            this.current = I;
            const P = voltage * I;
//console.log(voltage,this.voltage,I,P);
            console.log(`${this.name} ใช้พลังงาน ${P.toFixed(2)}W (I=${I.toFixed(2)}A, V=${voltage.toFixed(2)}V)`);
            return P;
        }
        return 0;
    }
}
