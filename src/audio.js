import { Action } from './message';

export class NMAudioManager {
    constructor(scene) {
        this.scene = scene;
        this.muted = false;
    }

    preload() {
        this.scene.load.audio('indieRoll', 'assets/dieRoll.mp3');
        this.scene.load.audio('cupRoll', 'assets/cupRoll.mp3');
        this.scene.load.audio('noMames', 'assets/NoMamesWey.mp3');
        this.scene.load.audio('noMames2', 'assets/AyNoMames.mp3');
    }

    create() {
        this.cupRollAudio = this.scene.sound.add('cupRoll');
        this.dieRollAudio = this.scene.sound.add('indieRoll');
        this.noMamesAudio = this.scene.sound.add('noMames');
        this.ayNoMamesAudio = this.scene.sound.add('noMames2');
    }

    toggleMute() {
        this.muted = !this.muted;
    }

    isMuted() {
        return this.muted;
    }

    playNoMames(audionum) {
        if (this.muted) {
            return;
        }

        if (audionum === 0) {
            this.noMamesAudio.play();
        } else {
            this.ayNoMamesAudio.play();
        }
    }

    playAudioForAction(action) {
        if (this.muted) {
            return;
        }

        switch (action) {
            case Action.ROLL_ONE:
                this.dieRollAudio.play();
                break;
            case Action.ROLL_MANY:
                this.cupRollAudio.play();
                break;
            default:
                break;
        }
    }
}
