import PubNub from 'pubnub';
import { Message, StartGameMessage, DiceUpdateMessage,
         PassCupMessage, KillPlayerMessage, NoMamesMessage,
         ResetMessage, ChangeDirectionMessage, PlayerLookedMessage } from './message';
import { PlayersList } from './playerslist'
import { Player } from './player'


/*
 * callbacks: onPlayersUpdate, onGameStart, onNoMames, onReset, onDiceUpdate
 */

export class Server {
    constructor(callbacks) {
        // TODO change this to a map uuid => player
        this.setCallbacks(callbacks);
        this.myUUID = PubNub.generateUUID();
        this.playersList = new PlayersList(this.myUUID);
        this.widowUsed = false;
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }

    connect(channel) {
        this.channel = channel;

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
            function (status) {
                if (status.error) {
                    // handle error
                    console.log("Publish error with status: ", status);
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

    passCup() {
        this.playersList.getActivePlayer.hasLooked = false;
        this.playersList.getActivePlayer.rolledCup = false;
        this.playersList.setNextPlayerActive();
        let activePlayer = this.playersList.getActivePlayer();
        let msg = new PassCupMessage(activePlayer.uuid);
        this.publish(msg);
    }

    changePassDirection() {
        let isClockwise = this.playersList.directionIsClockwise();
        isClockwise = !isClockwise;
        let msg = new ChangeDirectionMessage(isClockwise);
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

    playerLooked() {
        let msg = new PlayerLookedMessage();
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
                if (deserialized.rollType === "cup"){
                    this.playersList.getActivePlayer().rolledCup = true;
                    this.playersList.getActivePlayer().hasLooked = false;
                    this.callbacks.onPlayersUpdate(this.playersList);
                }
                if (!fromMe) {
                    this.callbacks.onDiceUpdate(deserialized);
                }
                break;
            }
            case PassCupMessage.getType(): {
                let uuid = deserialized.activePlayerUUID;
                this.playersList.getActivePlayer().hasLooked = false;
                this.playersList.getActivePlayer().rolledCup = false;
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
            case ChangeDirectionMessage.getType(): {
                this.playersList.setDirection(deserialized.isClockwise);
                this.callbacks.onPassDirectionChange(deserialized.isClockwise);
                break;
            }
            case PlayerLookedMessage.getType(): {
                let player = this.playersList.getActivePlayer();
                player.hasLooked = true;
                this.callbacks.onPlayersUpdate(this.playersList);
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
        this.callbacks.onPlayersUpdate(this.playersList);
    }
}
