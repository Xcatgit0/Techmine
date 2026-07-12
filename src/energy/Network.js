// energy/EnergyNetwork.js
export default class EnergyNetwork {
    constructor() {
        this.connectors = [];
    }

    addConnector(conn) {
        this.connectors.push(conn);
    }
    getSources() {
    // source ปกติ + battery ที่มี charge > 0
    return this.connectors.filter(c => {
        if ((c.type === "source" && c.type !== "off")) return true;
        if (c.type === "battery" && c.charge > 0) return true;
        return false;
    });
}
    getLoads() {
        return this.connectors.filter(c => c.type === "load");
    }

    update(deltaTime = 1) {
//        console.log("\n⚡ อัปเดตเครือข่ายไฟฟ้า ⚡");

        const sources = this.getSources();
        const loads = this.getLoads();

        // คำนวณแรงดันเฉลี่ยของแหล่งจ่าย
        const avgVoltage = sources.length > 0
            ? sources.reduce((sum, s) => sum + s.voltage, 0) / sources.length
            : 0;
//console.log(avgVoltage);
        // โหลดแต่ละตัวใช้พลังงานจากแรงดันเฉลี่ย
        for (const load of loads) {
            const pathR = this.getPathResistance(sources[0], load);
            const Vdrop = avgVoltage * (load.resistance / (load.resistance + pathR));
//            console.log(pathR,Vdrop);
            load.consumePower(Vdrop);
        }

        // อัปเดตแบตเตอรี่
        for (const src of sources) {
            if (src.type === "battery" && src.update)
                src.update(avgVoltage, deltaTime);
        }
    }

    // คำนวณความต้านทานรวม (ง่าย ๆ)
    getPathResistance(a, b, visited = new Set()) {
//console.log(a,b);
        if (!a || !b) return 0;
        if (a === b) return 0;
        visited.add(a);
        for (const next of a.connected) {
            if (visited.has(next)) continue;
            if (next === b) return next.resistance;
            const res = this.getPathResistance(next, b, visited);
            if (res >= 0) return res + next.resistance;
        }
        return Infinity;
    }
}
