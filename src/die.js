export class Die {
    constructor(index, value, inCup, slot, didRoll){
        this.index = index;
        this.value = value;
        this.inCup = inCup;
        this.slot = slot;
        this.didRoll = didRoll;
    }

    setValue(value){
        this.value = value;
    }

    getValue(){
        return this.value;
    }

    setCup(inCup){
        this.inCup = inCup;
    }

    getCup(){
        return this.inCup;
    }

    setSlot(slot){
        this.slot = slot;
    }

    getSlot() {
        return this.slot;
    }

    setRoll(didRoll) {
        this.didRoll = didRoll;
    }

    getRoll() {
        return this.didRoll;
    }
        
    resetRoll() {
        this.didRoll = false;
    }

    markRolled() {
        this.didRoll = true;
    }
}