import PubNub from 'pubnub';
import { Message, StartGameMessage, DiceUpdateMessage } from './message';

class Player {
    constructor(uuid, name = '', timestamp = '') {
        this.uuid = uuid;
        this.name = name;
        this.timestamp = timestamp;
        this.isActive = false;
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

    getPlayers() {
        return this.players;
    }
}

class PlayersList {
    constructor() {
        this.players = {}
    }

    getPlayers() {
        return this.players;
    }

    addPlayer(player) {
        // FIXME if player updated its state in the middle of the game
        // this would risk losing the "active" marker
        this.players[player.uuid] = player;
    }

    removePlayerByUUID(uuid) {
        delete this.players[uuid];
    }
}

/*
 * callbacks: onPlayersUpdate, onGameStart
 */

export class Server {
    constructor(callbacks) {
        // TODO change this to a map uuid => player
        this.playersList = new PlayersList();
        this.setCallbacks(callbacks);
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }

    connect(channel) {
        this.channel = channel;

        this.myUUID = PubNub.generateUUID();

        this.pubnub = new PubNub({
            subscribeKey: 'sub-c-b9b14632-698f-11ea-94ed-e20534093ea4',
            publishKey: 'pub-c-759cd5e9-128d-44d4-b7e7-925bc983f3f4',
            // FIXME UUID ideally more stable
            uuid: this.myUUID,
            ssl: true,
            heartbeatInterval: 30,
            presenceTimeout: 60
        });

        this.pubnub.addListener({
            status: (statusEvent) => {
                if (statusEvent.category === "PNConnectedCategory") {
                }
            },
            presence: (presenceEvent) => {
                this.handlePresence(presenceEvent);
            },
            message: (msg) => {
                let fromMe = (msg.publisher === this.myUUID);
                this.handleMessage(msg.message, fromMe);
            }
        })

        this.pubnub.subscribe({
            channels: [this.channel],
            withPresence: true
        });

        this.refreshPlayersList();
    }

    setName(name) {
        var newState = {
            name: name,
            timestamp: new Date()
        };
        this.pubnub.setState(
            {
                channels: [this.channel],
                state: newState
            }
        );
    }

    getPlayers() {
        return this.playersList.getPlayers();
    }

    refreshPlayersList() {
        this.pubnub.hereNow(
            {
                channels: [this.channel],
                includeState: true
            },
            (status, response) => {
                let occupants = response['channels'][this.channel]['occupants'];
                for (var occupant of occupants) {
                    let state = occupant['state'];
                    let uuid = occupant['uuid'];
                    this.playersList.addPlayer(Player.fromState(uuid, state));
                }
            }
        );
        this.callbacks.onPlayersUpdate(this.playersList.getPlayers());
    }

    publish(msg) {
        this.pubnub.publish(
            {
                message: msg,
                channel: this.channel
            },
            function (status) {
                if (status.error) {
                    // handle error
                    console.log("Publish error with status: ", status);
                }
            }
        );
    }

    startGame() {
        let msg = new StartGameMessage();
        this.publish(msg);
    }

    updateDice(update) {
        let msg = new DiceUpdateMessage(update);
        this.publish(msg);
    }

    handleMessage(msg, fromMe) {
        let deserialized = Message.deserialize(msg);
        switch (deserialized.type) {
            case StartGameMessage.getType():
                this.callbacks.onGameStart(deserialized);
                break;
            case DiceUpdateMessage.getType():
                if (!fromMe) {
                    this.callbacks.onDiceUpdate(deserialized);
                }
                break;
        }
    }

    handlePresence(presenceEvent) {
        console.log(presenceEvent);
        let uuid = presenceEvent['uuid'];
        switch (presenceEvent['action']) {
            case 'state-change':
                let state = presenceEvent['state'];
                this.playersList.addPlayer(Player.fromState(uuid, state));
                break;
            case 'join':
                this.playersList.addPlayer(new Player(uuid));
                break;
            case 'timeout':
            case 'leave':
                this.playersList.removePlayerByUUID(uuid);
                break;
        }
        this.callbacks.onPlayersUpdate(this.playersList.getPlayers());
    }
}
