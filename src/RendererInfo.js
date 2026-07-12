// RendererInfo.js
export class RendererInfo {
  constructor(renderer) {
    this.renderer = renderer;
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.top = '10px';
    this.container.style.right = '10px';
    this.container.style.padding = '8px 12px';
    this.container.style.background = 'rgba(0, 0, 0, 0.6)';
    this.container.style.color = '#0f0';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.lineHeight = '1.4em';
    this.container.style.borderRadius = '6px';
    this.container.style.zIndex = '9999';
    document.body.appendChild(this.container);
    this.infoRegister = {};
    this.memory = { geometries: 0, textures: 0 };
    this.render = { calls: 0, triangles: 0, points: 0, lines: 0 };

    this.lastUpdate = 0;
  }
  register(name, getHtml) {
    this.infoRegister[name] = (typeof getHtml == "function") ? getHtml : function () { return "" };
  }

  update() {
    if (!this.renderer) return;

    const info = this.renderer.info;

    this.memory.geometries = info.memory.geometries;
    this.memory.textures = info.memory.textures;

    this.render.calls = info.render.calls;
    this.render.triangles = info.render.triangles;
    this.render.points = info.render.points;
    this.render.lines = info.render.lines;

    const now = performance.now();
    // อัปเดต UI ทุก ๆ 250 มิลลิวินาที (ลดการกระพริบ)
    if (now - this.lastUpdate > 250) {
      this.container.innerHTML = `
        <b>Renderer Info</b><br>
        🧠 Geometries: ${this.memory.geometries}<br>
        🖼️ Textures: ${this.memory.textures}<br>
        🎨 Calls: ${this.render.calls}<br>
        🔺 Triangles: ${this.render.triangles}<br>
        ➖ Lines: ${this.render.lines}<br>
        • Points: ${this.render.points}
      `;
      for (let name in this.infoRegister) {
        this.container.innerHTML += `<br><b>${name}</b><br>`;
        this.container.innerHTML += this.infoRegister[name]();
      }
      this.lastUpdate = now;
    }
  }

  remove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
