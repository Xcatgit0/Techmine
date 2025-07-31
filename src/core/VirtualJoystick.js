// VirtualJoystick.js
export class VirtualJoystick {
    constructor() {
        this.input = { x: 0, y: 0, yaw: 0 };

        // ใช้ event จากมือถือ หรือสร้างปุ่มเอง
        // นี่คือตัวอย่าง mock joystick ที่ใช้ keyboard แทน
        window.addEventListener('keydown', (e) => {
            console.log(e.key);
            if (e.key === 'w') this.input.y = -1;
            if (e.key === 's') this.input.y = 1;
            if (e.key === 'a') this.input.x = -1;
            if (e.key === 'd') this.input.x = 1;
            if (e.key === 'ArrowLeft') this.input.yaw = -1;
            if (e.key === 'ArrowRight') this.input.yaw = 1;
        });
        window.addEventListener('keyup', (e) => {
            if (['w', 's'].includes(e.key)) this.input.y = 0;
            if (['a', 'd'].includes(e.key)) this.input.x = 0;
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) this.input.yaw = 0;
        });
    }

    getInput() {
        return { ...this.input };
    }
}
