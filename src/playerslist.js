export class PlayersList {
    constructor(myUUID) {
        this.players = []
        this.myUUID = myUUID;
    }

    getPlayers() {
        return this.players;
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
                this.players[(removeIdx + 1) % this.players.length].isActive = true;
            }
            delete this.players[removeIdx];
        }
    }

    setNextPlayerActive() {
        let next = false;
        for (const [idx, player] of this.players.entries()) {
            if (next && !player.isDead) {
                player.isActive = true;
                return;
            }
            if (player.isActive) {
                player.isActive = false;
                next = true;
            }
        }
        // else
        this.players[0].isActive = true;
    }
}
