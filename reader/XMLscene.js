var degToRad = Math.PI / 180.0;

var BOARD_WIDTH = 6.0;
var BOARD_HEIGHT = 4.0;

var BOARD_A_DIVISIONS = 30;
var BOARD_B_DIVISIONS = 100;

function XMLscene(itf) {
    CGFscene.call(this);
    this.interface = itf;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);
    this.lightsArray = [];
    this.initCameras();
    this.initLights();

    this.enableTextures(true);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);

};

XMLscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(30, 30, 30), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.initLights = function() {
    this.lights[0].setPosition(4, 6, 1, 1);
    this.lights[0].setVisible(true); // show marker on light position (different from enabled)
    this.lights[0].setAmbient(0, 0, 0, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].setSpecular(10, 10, 0, 1);
    this.lights[0].enable();
}


XMLscene.prototype.updateLights = function() {
    for (i = 0; i < this.lights.length; i++)
        this.lights[i].update();
}


XMLscene.prototype.display = function() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation)
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Update all lights used
    this.updateLights();

    // Draw axis
    this.axis.display();


};

XMLscene.prototype.onGraphLoaded = function() {

    this.gl.clearColor(this.graph.illumination.background[0],
        this.graph.illumination.background[1],
        this.graph.illumination.background[2],
        this.graph.illumination.background[3]);

    this.setGlobalAmbientLight(this.graph.illumination.ambient[0],
        this.graph.illumination.ambient[1],
        this.graph.illumination.ambient[2],
        this.graph.illumination.ambient[3]);

    this.lights[0].setVisible(true);
    this.lights[0].enable();
    /*this.updateView();
     */
    this.initDSXLights();
    this.axis = new CGFaxis(this, this.graph.sceneAtr.axis_length, 0.05);
};


XMLscene.prototype.initDSXLights = function() {
    var index = 0;

    this.lightsArray = new Array(this.graph.omniLights.length + this.graph.spotLights.length);
    for (var i = 0; i < this.graph.omniLights.length; i++, index++) {
        var omni = this.graph.omniLights[i];

        this.lights[index].setPosition(omni.location[0], omni.location[1], omni.location[2], omni.location[3]);
        this.lights[index].setAmbient(omni.ambient[0], omni.ambient[1], omni.ambient[2], omni.ambient[3]);
        this.lights[index].setDiffuse(omni.diffuse[0], omni.diffuse[1], omni.diffuse[2], omni.diffuse[3]);
        this.lights[index].setSpecular(omni.specular[0], omni.specular[1], omni.specular[2], omni.specular[3]);

        this.lightsArray[index] = omni.enabled;
        this.interface.addLight("omni", index, omni.id);

        if (omni.enabled)
            this.lights[index].enable();
        else
            this.lights[index].disable();

        this.lights[index].setVisible(true);
        this.lights[index].update();
    }




    for (var i = 0; i < this.graph.spotLights.length; i++, index++) {
        var spot = this.graph.spotLights[i];

        this.lights[index].setPosition(spot.location[0], spot.location[1], spot.location[2], 1);
        this.lights[index].setAmbient(spot.ambient[0], spot.ambient[1], spot.ambient[2], spot.ambient[3]);
        this.lights[index].setDiffuse(spot.diffuse[0], spot.diffuse[1], spot.diffuse[2], spot.diffuse[3]);
        this.lights[index].setSpecular(spot.specular[0], spot.specular[1], spot.specular[2], spot.specular[3]);
        this.lights[index].setSpotExponent(spot.exponent);
        this.lights[index].setSpotDirection(spot.location[0] - spot.target[0], spot.location[1] - spot.target[1], spot.location[2] - spot.target[2]);

        this.lightsArray[index] = spot.enabled;
        this.interface.addLight("spot", index, spot.id);

        if (spot.enabled)
            this.lights[index].enable();
        else
            this.lights[index].disable();

        this.lights[index].setVisible(true);
        this.lights[index].update();
    }



};

XMLscene.prototype.updateLights = function () {

  for (var i = 0; i < this.lightsArray.length; i++) {
    if(this.lightsArray[i])
      this.lights[i].enable();
    else
      this.lights[i].disable();
  }

  for (var i = 0; i < this.lights.length; i++)
    this.lights[i].update();

}
