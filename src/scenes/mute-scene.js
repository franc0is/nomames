import { TextButton } from '../text-button';

export class MuteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'muteScene' });
    }

    init(data) {
        this.audioManager = data.audioManager;
    };

    create() {
        this.muteButton = new TextButton(this, 610, 210, 'Mute', {
            onClick: () => {
                this.audioManager.toggleMute();
                if (this.audioManager.isMuted()){
                    this.muteButton.setText('Unmute');
                } else {
                    this.muteButton.setText('Mute');
                };
            }
        });

        this.add.existing(this.muteButton);
    }
}