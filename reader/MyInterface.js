function MyInterface() {
    CGFinterface.call(this);
}


MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

MyInterface.prototype.init = function(application) {

    CGFinterface.prototype.init.call(this, application);

    this.gui = new dat.GUI();

    this.spot = this.gui.addFolder("Spot Lights");

    this.omni = this.gui.addFolder("Omni Lights");


    return true;
};

MyInterface.prototype.addLight = function(type, i, id) {
    if (type == "omni") {
        this.omni.add(this.scene.lightsArray, i, this.scene.lightsArray[i]).name(id);
    } else if (type == "spot") {
        this.spot.add(this.scene.lightsArray, i, this.scene.lightsArray[i]).name(id);
    } else {
        console.log("Unknown type of light!!");
    }
}

MyInterface.prototype.processKeyDown = function(event) {
    switch (event.keyCode) {
        case (77): //M
            this.scene.updateMaterial();
            break;
        case (86): //V
            this.scene.updateView();
            break;
    };
};