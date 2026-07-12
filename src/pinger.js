export default class pinger {
    /**
     * 
     * @param {WebSocket} con 
     */
    constructor(con) {
        this.ping = 0; // ms
        this.interval = null;
        this.lasttime = 0;
        this.con = con;
        this.con.addEventListener("message", (e) => {
            if (e.data === `{"type":"pong"}`) {
                this.ping = Date.now() - this.lasttime;
            }
        });
    }
    start() {
        this.interval = setInterval(() => {
            this.con.send(`{"type":"ping"}`);
            this.lasttime = Date.now();
        }, 1000);
    }
    stop() {
        clearInterval(this.interval);
    }
}