export class Player {
    constructor(uuid, name = '', timestamp = '') {
        this.uuid = uuid;
        this.name = name;
        this.timestamp = timestamp;
        this.isActive = false;
        this.isMe = false;
        this.isDead = false;
    }

    static fromState(uuid, state) {
        // TODO should create a class for the state
        let p =  new this(uuid);
        if (state && 'name' in state) {
            p.name = state['name'];
        }
        if (state && 'timestamp' in state) {
            p.timestamp = state['timestamp'];
        }
        return p;
    }

    setState(state) {
        this.name = state['name'];
        this.timestamp = state['timestamp'];
    }

    setActive(active) {
        this.isActive = active;
    }

    copyAttributes(player) {
        this.name = name;
    }

    getPlayers() {
        return this.players;
    }
}
