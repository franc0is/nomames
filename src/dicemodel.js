export class diceModel {
    constructor(NUM_DICE){
        this.dice = [];
        for (let i=0; i< NUM_DICE; i++) {
            let d = new die(i, NUM_DICE - i, true, i, false);
            this.dice.push(d);
        };
    }

    getCup(){

    }

    getTable(){

    }

    allRolled(){

    }

    
}