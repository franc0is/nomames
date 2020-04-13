import { TextButton } from '../text-button';

export class MuteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'muteScene' });
    }
    init(data) {
        this.server = data.server;
    };

    create() {
        this.muteButton = new TextButton(this, 610, 210, 'Mute', {
            onClick: () => {
                this.server.muted = !this.server.muted;
                console.log(this.server.muted)
                if (this.server.muted){
                    this.muteButton.setText('Unmute');
                }else {
                    this.muteButton.setText('Mute');
                };
            }
        });

        this.add.existing(this.muteButton);

        
    }

}