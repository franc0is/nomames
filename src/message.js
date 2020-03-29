export class Message {
    constructor(type) {
        this.type = type;
    }

    static getTypeMap() {
        return {
            [StartGameMessage.getType()]: StartGameMessage,
            [DiceUpdateMessage.getType()]: DiceUpdateMessage
        };
    }

    static deserialize(msg) {
        return this.getTypeMap()[msg.type].deserialize(msg);
    }
}

export class StartGameMessage extends Message {
    constructor() {
        // I was not able to void the duplicate 'startGame' :-(
        super('startGame');
    }

    static getType() {
        // I was not able to void the duplicate 'startGame' :-(
        return 'startGame';
    }

    static deserialize(data) {
        return new this();
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
