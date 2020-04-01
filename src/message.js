export class Message {
    constructor(type) {
        this.type = type;
    }

    static getTypeMap() {
        return {
            [StartGameMessage.getType()]: StartGameMessage,
            [DiceUpdateMessage.getType()]: DiceUpdateMessage,
            [PassCupMessage.getType()]: PassCupMessage
        };
    }

    static deserialize(msg) {
        return this.getTypeMap()[msg.type].deserialize(msg);
    }
}

export class StartGameMessage extends Message {
    constructor(activePlayerUUID) {
        // I was not able to void the duplicate 'startGame' :-(
        super('startGame');
        this.activePlayerUUID = activePlayerUUID;
    }

    static getType() {
        // I was not able to void the duplicate 'startGame' :-(
        return 'startGame';
    }

    static deserialize(msg) {
        return new this(msg['activePlayerUUID']);
    }
}

export class PassCupMessage extends Message {
    constructor(activePlayerUUID) {
        super('passCup');
        this.activePlayerUUID = activePlayerUUID;
    }

    static getType() {
        return 'passCup';
    }

    static deserialize(msg) {
        return new this(msg['activePlayerUUID']);
    }
}

export class DiceUpdateMessage extends Message {
    constructor(update) {
        super('diceUpdate');
        this.cup = update['cup'];
        this.table = update['table'];
    }

    static getType() {
        return 'diceUpdate';
    }

    static deserialize(msg) {
        return new this(msg);
    }
}
