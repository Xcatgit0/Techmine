export class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    /**
     * 
     * @param {String} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push({ type: 'on', callback });
        return this;
    }
    /**
    * 
    * @param {String} event 
    * @param {Function} callback 
    */
    once(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push({ type: 'once', callback });
        return this;
    }
    /**
     * 
     * @param {String} event 
     * @param  {...any} args 
     */
    emit(event, ...args) {
        if (!this.listeners[event]) return false;
        const currentListeners = [...this.listeners[event]];
        for (const listener of currentListeners) {
            listener.callback(...args);
            if (listener.type === 'once') {
                this.off(event, listener.callback);
            }
        }
    }
    /**
     * 
     * @param {String} event 
     * @param {Function} callback 
     */
    off(event, callback) {
        if (!this.listeners[event]) return this;
        this.listeners[event] = this.listeners[event].filter(
            l => l.callback !== callback
        );
        return this
    }
}