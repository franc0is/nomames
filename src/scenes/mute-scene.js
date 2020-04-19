import { TextButton } from '../text-button';

export class MuteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'muteScene' });
    }

    init(data) {
        this.audioManager = data.audioManager;
    };

    updateText() {
        if (this.audioManager && this.audioManager.isMuted()){
            this.muteButton.setText('Unmute');
        } else {
            this.muteButton.setText('Mute');
        };
    }

    create() {
        this.muteButton = new TextButton(this, 690, 210, 'Mute', {
            onClick: () => {
                this.audioManager.toggleMute();
                this.updateText();
            }
        });

        this.add.existing(this.muteButton);
        this.updateText();
    }
}