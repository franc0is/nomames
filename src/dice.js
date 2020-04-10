export class Dice extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, initial_value) {
        super(scene, x, y);

        this.lastClickTime = 0;

        this.setName('dice');
        this.setTexture('dice');
        this.setPosition(x, y);

        this.setInteractive();
        this.on('pointerdown', this.onClick, this);

        this.setValue(initial_value);
        this.onRollCb = () => {};
        this.didRoll = false;
    }

    setOnRoll(onRollCb) {
        this.onRollCb = onRollCb;
    }

    setValue(value) {
        // FIXME frames do not match neatly to values
        this.value = value;
        this.setFrame(value);
    }

    getValue() {
        return this.value;
    }

    serialize() {
        return {
            'frame': this.getValue()
        }
    }

    resetRoll() {
        this.didRoll = false;
    }

    markRolled() {
        this.didRoll = true;
    }

    onClick() {
        if (this.didRoll) {
            return;
        }
        // 350ms double click for rolling
        let clickDelay = this.scene.time.now - this.lastClickTime;
        this.lastClickTime = this.scene.time.now;
        if (clickDelay < 350) {
            this.scene.noMamesButton.setEnabled(false);
            if (this.y === 100) {
                //if the die is inside the cup, set value to a 9 and
                this.setValue(0);
                //move to table
                this.scene.table.add(this);
            } 
            this.roll("indie");            
        }
    }

    roll(rollType) {
        let n = Phaser.Math.RND.between(0, 5);
        if (rollType === "indie"){
            this.DieSetFunction(n,"indie");
            this.indieRoll(n);
        }else{
            this.setValue(n);
            this.onRollCb(rollType);
            this.markRolled();
        }
    }

    indieRoll(n) {
        for (let i=0; i< 5; i++){
            var x = setTimeout(function(){this.DieSetFunction(i,"primIndie")}.bind(this),100*i);
        }
        for (let i=0; i< n; i++){
            var x = setTimeout(function(){this.DieSetFunction(i,"primIndie")}.bind(this),600+200*i);
        }
        var x = setTimeout(function(){this.DieSetFunction(n,"primIndie")}.bind(this),600+200*n);
        this.markRolled();
    }

    DieSetFunction(d,rollType) {
        this.setValue(d);
        this.onRollCb(rollType);
    }
}
