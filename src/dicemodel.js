import { Die } from './die';

export class DiceModel {
    constructor(NUM_DICE){
        this.dice = [];
        for (let i=0; i< NUM_DICE; i++) {
            let d = new Die(i, NUM_DICE - i, true, i, false);
            this.dice.push(d);
        };
    };

    reorder() {
        let d = [];
        let i = 0;
        for (let k of this.dice){
            if (k.index === i) {
                d.puch(k);
            }
            i++;
        }
        return d;
    };

    getDice() {
        return this.dice;
    };

    setDice(d) {
        this.dice = d;
        this.reorder()
    };

    getOneDie(index) {
        return this.dice[index];
    };

    setOneDie(index, value) {
        this.dice[index].value = value;
    };

    getCup(){
        let cup = [];
        for (let d of this.dice) {
            if (d.inCup) {
                cup.push(d);
            }
        }
        return cup;
    };

    getTable(){
        let table = [];
        for (let d of this.dice) {
            if (!d.inCup) {
                table.push(d);
            }
        }
        return table;
    };

    allRolled(){
        for (let d of this.dice) {
            if (!d.didRoll) {
                return false;
            }
        }
        return true;
    };

    getSlot(slot) {
        let d = [];
        for (let k of this.dice){
            if (k.slot === slot) {
                d.push(k);
            }
        }
        return d;
    };

    setSlot(index, slot) {
        this.dice[index].slot = slot;
    };

    getLocation(index) {
        let cup = this.dice[index].inCup;
        let slot = this.dice[index].slot;
        return [cup,slot];
    };

    getDieByLoc(cup,slot) {
        for (let d of this.dice) {
            if (d.inCup === cup && d.slot === slot){
                return d.index
            };
        };
    };
}