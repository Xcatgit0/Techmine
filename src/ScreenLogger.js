// container สำหรับ log ทั้งหมด
const logContainer = document.createElement("div");
Object.assign(logContainer.style, {
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    pointerEvents: "none",
    zIndex: 9999,
});
document.body.appendChild(logContainer);

// ฟังก์ชันแสดงข้อความ
function log(message, duration = 2000) {
    const logBox = document.createElement("div");
    Object.assign(logBox.style, {
        background: "rgba(0, 0, 0, 0.6)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: "16px",
        padding: "6px 10px",
        borderRadius: "6px",
        textAlign: "center",
        opacity: 0,
        transition: "opacity 0.3s",
    });
    logBox.textContent = message;
    logContainer.appendChild(logBox);

    // แสดงข้อความ
    requestAnimationFrame(() => {
        logBox.style.opacity = "1";
    });

    // ซ่อนข้อความและลบออก
    setTimeout(() => {
        logBox.style.opacity = "0";
        logBox.addEventListener("transitionend", () => {
            logContainer.removeChild(logBox);
        }, { once: true });
    }, duration);
}
export { log };
// ตัวอย่างการใช้งาน
//log("Hello World!", 3000);
//log("Player joined!", 2000);
//setTimeout(() => log("Connection restored!", 4000), 1000);
