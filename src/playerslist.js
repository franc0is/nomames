export class PlayersList {
    constructor(myUUID) {
        this.players = []
        this.myUUID = myUUID;
        this.isClockwise = true;
    }

    getPlayers() {
        return this.players;
    }

    getUUIDList() {
        let uuidList = []
        this.players.forEach(player => {
            uuidList.push(player.uuid);
        });
        return uuidList;
    }

    orderByUUIDList(uuidList) {
        let orderedPlayers = []
        uuidList.forEach(uuid => {
            let p = this.getPlayerByUUID(uuid);
            orderedPlayers.push(p);
        });
        this.players = orderedPlayers;
    }

    addPlayer(player) {
        if (player.uuid === this.myUUID) {
            player.isMe = true;
        }

        for (let p of this.players) {
            if (p.uuid === player.uuid) {
                p.name = player.name;
                return;
            }
        }
        // else
        this.players.push(player);
    }

    getPlayerByUUID(uuid) {
        for (let player of this.players) {
            if (player.uuid === uuid) {
                return player;
            }
        }
    }

    getActivePlayer() {
        for (let player of this.players) {
            if (player.isActive) {
                return player;
            }
        }
    }

    getMe() {
        for (let player of this.players) {
            if (player.isMe) {
                return player;
            }
        }
    }

    removePlayerByUUID(uuid) {
        let removeIdx = undefined;
        for (const [idx, player] of this.players.entries()) {
            if (player.uuid === uuid) {
                removeIdx = idx;
                break;
            }
        }
        if (removeIdx !== undefined) {
            if (this.players[removeIdx].isActive) {
                this.setNextPlayerActive();
            }
            delete this.players[removeIdx];
        }
    }

    directionIsClockwise() {
        return this.isClockwise;
    }

    setDirection(isClockwise) {
        this.isClockwise = isClockwise;
    }

    setPreviousPlayerActive() {
        if (this.isClockwise) {
            this.setNextCounterClockwise();
        } else {
            this.setNextClockwise();
        }
    }

    setNextPlayerActive() {
        if (this.isClockwise) {
            this.setNextClockwise();
        } else {
            this.setNextCounterClockwise();
        }
    }

    setNextCounterClockwise() {
        let next = false;
        let i = this.players.length - 1;
        let activeIdx = -1;
        do {
            let player = this.players[i];
            if (next && !player.isDead) {
                player.isActive = true;
                return;
            }
            if (player.isActive) {
                player.isActive = false;
                next = true;
                activeIdx = i;
            }
            i--;
            if (i < 0) {
                i = this.players.length - 1;
            }
        } while (i != activeIdx);
        // else
        this.players[0].isActive = true;
    }

    setNextClockwise() {
        let next = false;
        let i = 0;
        let activeIdx = 0;
        do {
            let player = this.players[i];
            if (next && !player.isDead) {
                player.isActive = true;
                return;
            }
            if (player.isActive) {
                player.isActive = false;
                next = true;
                activeIdx = i;
            }
            i = (i + 1) % this.players.length;
        } while (i != activeIdx);
        // else
        this.players[0].isActive = true;
    }

    getNextClockwise() {
        let next = false;
        let i = 0;
        let activeIdx = 0;
        do {
            let player = this.players[i];
            if (next && !player.isDead) {
                return player.name;
            }
            if (player.isActive) {
                next = true;
                activeIdx = i;
            }
            i = (i + 1) % this.players.length;
        } while (i != activeIdx);
    }

    getNextCounterClockwise() {
        let next = false;
        let i = this.players.length - 1;
        let activeIdx = -1;
        do {
            let player = this.players[i];
            if (next && !player.isDead) {
                return player.name;
            }
            if (player.isActive) {
                next = true;
                activeIdx = i;
            }
            i--;
            if (i < 0) {
                i = this.players.length - 1;
            }
        } while (i != activeIdx);
    }
}
