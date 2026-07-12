// energy/ChargableBattery.js
import Connector from "./Connector.js";

export default class ChargableBattery extends Connector {
    constructor(name, voltage = 12, capacity = 100, resistance = 0.2) {
        super(name, "battery", voltage, resistance);
        this.capacity = capacity;     // หน่วย Wh (พลังงานสูงสุด)
        this.charge = capacity / 2;   // เริ่มต้นมีครึ่งหนึ่ง
    }

    update(deltaV, deltaTime) {
        // ถ้าแรงดันรอบข้างสูงกว่า -> ชาร์จ
        if (deltaV > this.voltage) {
            const dE = (deltaV - this.voltage) * deltaTime * 0.5; // คิดพลังงานเข้า
            this.charge = Math.min(this.charge + dE, this.capacity);
            this.voltage += (deltaV - this.voltage) * 0.05; // ปรับแรงดันค่อย ๆ
            //console.log(`${this.name} กำลังชาร์จ... (${this.charge.toFixed(1)}/${this.capacity} Wh)`);
        }
        // ถ้าแรงดันรอบข้างต่ำกว่า -> ปล่อยไฟ
        else if (deltaV < this.voltage) {
            const dE = (this.voltage - deltaV) * deltaTime * 0.5;
            this.charge = Math.max(this.charge - dE, 0);
            this.voltage -= (this.voltage - deltaV) * 0.02;
            //console.log(`${this.name} ปล่อยไฟ... (${this.charge.toFixed(1)}/${this.capacity} Wh)`);
        }
    }

    isEmpty() {
        return this.charge <= 0;
    }
}
