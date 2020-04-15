import PubNub from 'pubnub';
import { Message, StartGameMessage, DiceUpdateMessage,
         PassCupMessage, KillPlayerMessage, NoMamesMessage,
         ResetMessage } from './message';
import { PlayersList } from './playerslist'
import { Player } from './player'


/*
 * callbacks: onPlayersUpdate, onGameStart, onNoMames, onReset
 */

export class Server {
    constructor(callbacks) {
        // TODO change this to a map uuid => player
        this.setCallbacks(callbacks);
        this.myUUID = PubNub.generateUUID();
        this.playersList = new PlayersList(this.myUUID);
        this.widowUsed = false;
        this.lastTimetoken = 0;
        this.muted = false;

        this.pubnub = new PubNub({
            subscribeKey: 'sub-c-b9b14632-698f-11ea-94ed-e20534093ea4',
            publishKey: 'pub-c-759cd5e9-128d-44d4-b7e7-925bc983f3f4',
            // FIXME UUID ideally more stable
            uuid: this.myUUID,
            ssl: true,
            heartbeatInterval: 30,
            presenceTimeout: 120
        });

        this.pubnub.addListener({
            status: (statusEvent) => {
                if (statusEvent.category === "PNConnectedCategory") {
                    // connected to server
                }
                if (statusEvent.category === "PNNetworkDownCategory") {
                    // no internet
                    this.callbacks.onPause('Disconnected :-(');
                }
                if (statusEvent.category === "PNNetworkUpCategory") {
                    // internet back
                    this.connect(this.channel);
                    this.callbacks.onResume();
                }
                if (statusEvent.category === "PNTimeoutCategory") {
                    // network timeout
                }
            },
            presence: (presenceEvent) => {
                this.handlePresence(presenceEvent);
            },
            message: (msg) => {
                let fromMe = (msg.publisher === this.myUUID);
                this.lastTimetoken = msg.timetoken;
                this.handleMessage(msg.message, fromMe);
            }
        })
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }

    connect(channel) {
        this.channel = channel;

        this.pubnub.subscribe({
            channels: [this.channel],
            withPresence: true,
            timetoken: this.lastTimetoken
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

    getPlayersList() {
        return this.playersList;
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
        this.callbacks.onPlayersUpdate(this.playersList);
    }

    publish(msg) {
        this.pubnub.publish(
            {
                message: msg,
                channel: this.channel
            },
            (status) => {
                if (status.error) {
                    // handle error
                    console.log("Publish error with status: ", status, ". Retrying in 3s");
                    setTimeout(this.publish(msg), 3000);
                }
            }
        );
    }

    startGame() {
        this.playersList.setNextPlayerActive();
        let activePlayer = this.playersList.getActivePlayer();
        let uuidList = this.playersList.getUUIDList();
        let msg = new StartGameMessage(activePlayer.uuid, uuidList);
        this.publish(msg);
    }

    passCup(isClockwise) {
        this.playersList.setDirection(isClockwise);
        this.playersList.setNextPlayerActive();
        let activePlayer = this.playersList.getActivePlayer();
        let msg = new PassCupMessage(activePlayer.uuid,isClockwise);
        this.publish(msg);
    }

    updateDice(update) {
        let msg = new DiceUpdateMessage(update);
        this.publish(msg);
    }

    killPlayer(player) {
        let msg = new KillPlayerMessage(player.uuid);
        this.publish(msg);
    }

    noMames() {
        let msg = new NoMamesMessage();
        this.publish(msg);
    }

    reset() {
        let me = this.playersList.getMe();
        let msg = new ResetMessage(me.uuid);
        this.publish(msg);
    }

    handleMessage(msg, fromMe) {
        let deserialized = Message.deserialize(msg);
        switch (deserialized.type) {
            case StartGameMessage.getType(): {
                let uuid = deserialized.activePlayerUUID;
                let player = this.playersList.getPlayerByUUID(uuid);
                player.isActive = true;
                this.playersList.orderByUUIDList(deserialized.uuidList);
                this.callbacks.onGameStart(deserialized);
                break;
            }
            case DiceUpdateMessage.getType(): {
                if (!fromMe) {
                    this.callbacks.onDiceUpdate(deserialized);
                }
                break;
            }
            case PassCupMessage.getType(): {
                this.playersList.setDirection(deserialized.isClockwise);
                this.callbacks.onPassDirectionChange(deserialized.isClockwise);
                let uuid = deserialized.activePlayerUUID;
                this.playersList.getActivePlayer().isActive = false;
                this.playersList.getPlayerByUUID(uuid).isActive = true;
                this.callbacks.onPlayersUpdate(this.playersList);
                break;
            }
            case KillPlayerMessage.getType(): {
                let uuid = deserialized.uuid;
                let player = this.playersList.getPlayerByUUID(uuid);
                if (player.numLives > 1){
                    player.numLives -= 1;
                    this.playersList.getActivePlayer().isActive= false;
                    player.isActive = true;
                } else if (!this.widowUsed){
                    this.widowUsed = true;
                    this.playersList.getActivePlayer().isActive= false;
                    player.isActive = true;
                    // Alter player name to make fun of them
                    player.name = '💩' + player.name.substring(1);
                } else {
                    player.numLives = 0;
                    player.isDead = true;
                    if (player.isActive) {
                        this.playersList.setPreviousPlayerActive();
                    }
                }
                this.playersList.setDirection(true);
                this.callbacks.onReset();
                break;
            }
            case NoMamesMessage.getType(): {
                this.callbacks.onNoMames();
                break;
            }
            case ResetMessage.getType(): {
                let uuid = deserialized.uuid;
                this.playersList.getActivePlayer().isActive = false;
                this.playersList.getPlayerByUUID(uuid).isActive = true;
                this.playersList.setDirection(true);
                this.callbacks.onReset();
                break;
            }
        }
    }

    handlePresence(presenceEvent) {
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
        console.log('Received ', presenceEvent['action'], ' with state ',
            presenceEvent['state'], ' playersList is now ' ,this.playersList);
        this.callbacks.onPlayersUpdate(this.playersList);
    }
}
