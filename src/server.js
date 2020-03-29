import PubNub from 'pubnub';
import { Message, StartGameMessage, DiceUpdateMessage } from './message';

class Player {
    constructor(uuid, name = '', timestamp = '') {
        this.uuid = uuid;
        this.name = name;
        this.timestamp = timestamp;
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
}

/*
 * callbacks: onPlayersUpdate, onGameStart
 */

export class Server {
    constructor(callbacks) {
        // TODO change this to a map uuid => player
        this.players = {};
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
                    this.players[uuid] = Player.fromState(uuid, state);
                }
            }
        );
        this.callbacks.onPlayersUpdate(this.players);
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
                if (this.players[uuid]) {
                    this.players[uuid].setState(state);
                } else {
                    this.players[uuid] = Player.fromState(state);
                }
                break;
            case 'join':
                this.players[uuid] = new Player(uuid);
                break;
            case 'timeout':
            case 'leave':
                delete this.players[uuid];
                break;
        }
        this.callbacks.onPlayersUpdate(this.players);
    }
}
