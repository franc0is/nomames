export class Message {
    constructor(type) {
        this.type = type;
    }

    static getTypeMap() {
        return {
            [StartGameMessage.getType()]: StartGameMessage,
            [DiceUpdateMessage.getType()]: DiceUpdateMessage,
            [PassCupMessage.getType()]: PassCupMessage,
            [KillPlayerMessage.getType()]: KillPlayerMessage,
            [NoMamesMessage.getType()]: NoMamesMessage,
            [ResetMessage.getType()]: ResetMessage
        };
    }

    static deserialize(msg) {
        return this.getTypeMap()[msg.type].deserialize(msg);
    }
}

export class StartGameMessage extends Message {
    constructor(activePlayerUUID, uuidList) {
        // I was not able to void the duplicate 'startGame' :-(
        super('startGame');
        this.activePlayerUUID = activePlayerUUID;
        this.uuidList = uuidList;
    }

    static getType() {
        // I was not able to void the duplicate 'startGame' :-(
        return 'startGame';
    }

    static deserialize(msg) {
        return new this(msg['activePlayerUUID'], msg['uuidList']);
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

export class KillPlayerMessage extends Message {
    constructor(uuid) {
        super('killPlayer');
        this.uuid = uuid;
    }

    static getType() {
        return 'killPlayer';
    }

    static deserialize(msg) {
        return new this(msg['uuid']);
    }
}

export class NoMamesMessage extends Message {
    constructor() {
        super('noMames');
    }

    static getType() {
        return 'noMames';
    }

    static deserialize(msg) {
        return new this();
    }
}

export class ResetMessage extends Message {
    constructor(uuid) {
        super('reset');
        this.uuid = uuid;
    }

    static getType() {
        return 'reset';
    }

    static deserialize(msg) {
        return new this(msg['uuid']);
    }
}
