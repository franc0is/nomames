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
    constructor(activePlayerUUID,isClockwise,fiverPass) {
        super('passCup');
        this.activePlayerUUID = activePlayerUUID;
        this.isClockwise = isClockwise;
        this.fiverPass = fiverPass;
    }

    static getType() {
        return 'passCup';
    }

    static deserialize(msg) {
        return new this(msg['activePlayerUUID'],msg['isClockwise'],msg['fiverPass']);
    }
}

export const Action = {
    ROLL_ONE:  'rollOne',
    ROLL_MANY: 'rollMany',
    MOVE_ONE:  'moveOne',
    SHOW_MANY: 'showMany'
};

export class DiceUpdateMessage extends Message {
    constructor(update) {
        super('diceUpdate');
        this.action = update['action'];
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


export const NMType = {
    NO_MAMES: 'nomames',
    FAILED_5: 'failed5',
    ROLLED_5: 'rolled5'
}

export class NoMamesMessage extends Message {
    constructor(nmtype,audionum) {
        super('noMames');
        this.nmtype = nmtype;
        this.audionum = audionum;
    }

    static getType() {
        return 'noMames';
    }

    static deserialize(msg) {
        return new this(msg['nmtype'], msg['audionum']);
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
