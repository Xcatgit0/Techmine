import Connector from "./Connector.js";
import ChargableBattery from "./ChargableBattery.js";
import EnergyNetwork from "./Network.js";

const net = new EnergyNetwork();

// สร้างอุปกรณ์
const generator = new Connector("Generator", "source", 14, 0.1);
const batteryA  = new ChargableBattery("Battery A", 12, 200);
const batteryB  = new ChargableBattery("Battery B", 10, 150);
const wire      = new Connector("Wire", "wire", 0, 0.3);
const motor     = new Connector("Motor", "load", 0, 10);
setInterval(()=>{generator.voltage=0;},10000);
// ต่อวงจร
generator.connect(wire);
wire.connect(batteryA);
batteryA.connect(batteryB);
batteryB.connect(motor);

// เพิ่มเข้า network
net.addConnector(generator);
net.addConnector(batteryA);
net.addConnector(batteryB);
net.addConnector(wire);
net.addConnector(motor);

// จำลองการอัปเดต 5 รอบ (เหมือน frame ในเกม)
for (let t = 0; t < 5; t++) {
    console.log(`\n--- Frame ${t + 1} ---`);
    net.update(1);
}
setInterval( ()=>{
net.update(1);
},500);
