function XMLscene(itf) {
    CGFscene.call(this);
    this.interface = itf;
    this.lightsArray = [];
    this.viewIndex = 0;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
	CGFscene.prototype.init.call(this, application);

	this.initCameras();
	this.initLights();

	this.enableTextures(true);

	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.clearDepth(100.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
	this.gl.depthFunc(this.gl.LEQUAL);

	this.axis = new CGFaxis(this);

	this.currentCamera = 0;
	this.cameras = [];
	
	this.materialsList = {};
    this.materialsIDs = []

    this.texturesList = {};
	this.texturesID = [];

    this.transformationsList = {};
    this.transformationsIDs = [];

    this.componentsList = {};
    this.componentsIDs = [];

    this.lightsStatus =[];
    this.lightsNames = [];

	// Scene elements
  //TODO primitivas de teste
	this.leftWall = new MyTorus(this,2,4,20,20);
	this.floor = new MyQuad(this,0,10,0,12);


};

XMLscene.prototype.initCameras = function() {
	this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(30, 30, 30), vec3.fromValues(0, 0, 0));
};

/*XMLscene.prototype.initCameras = function()
{
	for(var i = 0; i < this.graph.cameras.length / 6; i++)
		this.cameras[i] = new CGFcamera(0.4, this.graph.cameras[i * 6 + 1], this.graph.cameras[i * 6 + 2], this.graph.cameras[i * 6 + 4], this.graph.cameras[5]);

	this.camera = this.cameras[this.currentCamera];
    this.interface.setActiveCamera(this.camera);
}*/


XMLscene.prototype.initLights = function() {
	this.setGlobalAmbientLight(0, 0 ,0, 1);

	this.setGlobalAmbientLight(0.5,0.5,0.5, 1.0);

	// Positions for four lights
	this.lights[0].setPosition(4, 6, 1, 1);
	this.lights[0].setVisible(true); // show marker on light position (different from enabled)
	this.lights[0].setAmbient(0, 0, 0, 1);
	this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
	this.lights[0].setSpecular(10, 10,0 ,1);
	this.lights[0].enable();


};

/*XMLscene.prototype.initIllumination = function()
{
	this.gl.clearColor(this.graph.backgroundR,this.graph.backgroundG,this.graph.backgroundB,this.graph.backgroundA);
    this.setAmbient(this.graph.ambientR, this.graph.ambientG, this.graph.ambientB, this.graph.ambientA);
}*/

XMLscene.prototype.updateLights = function() {
	for (i = 0; i < this.lights.length; i++)
	this.lights[i].update();
}

XMLscene.prototype.initMaterials = function()
{
    this.materialsList = this.graph.materialsList;
    this.materialsIDs = this.graph.materialsIDs;

}

XMLscene.prototype.initTextures = function ()
{
    this.texturesList = this.graph.texturesList;
    this.texturesID = this.graph.texturesID;
   

    if(this.texturesID.length > 0)
        this.enableTextures(true);
}

XMLscene.prototype.initTransformations = function()
{
   
    this.transformationsList = this.graph.transformationList;
    this.transformationsIDs = this.graph.transformationIDs;

}

XMLscene.prototype.initComponents = function()
{
    this.componentsList = this.graph.componentsList;
    this.componentsIDs = this.graph.componentsIDs;
    
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
	//this.floor.display();
	//this.leftWall.display();
	// Draw axis
	this.axis.display();
	
	if (this.graph.loadedOk)
	{
		this.lights[0].update();
		this.displayGraph(this.graph.root, null, null);
	};	
}

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
    this.updateView();
    this.initDSXLights();
    this.initMaterials();
    this.initTextures();
    this.initTextures();
    this.initComponents();
    this.axis = new CGFaxis(this, this.graph.sceneAtr.axis_length, 0.05);
	
};

XMLscene.prototype.updateView = function () {
  this.camera = this.graph.views.perspectives[this.viewIndex].camera;
  this.interface.setActiveCamera(this.graph.views.perspectives[this.viewIndex].camera);

  this.viewIndex = (++this.viewIndex) % this.graph.views.perspectives.length;

};



XMLscene.prototype.initDSXLights = function() {
    var j = 0;

    this.lightsArray = new Array(this.graph.omniLights.length + this.graph.spotLights.length);
    for (var i = 0; i < this.graph.omniLights.length; i++, j++) {
        var omni = this.graph.omniLights[i];

        this.lights[j].setPosition(omni.location[0], omni.location[1], omni.location[2], omni.location[3]);
        this.lights[j].setAmbient(omni.ambient[0], omni.ambient[1], omni.ambient[2], omni.ambient[3]);
        this.lights[j].setDiffuse(omni.diffuse[0], omni.diffuse[1], omni.diffuse[2], omni.diffuse[3]);
        this.lights[j].setSpecular(omni.specular[0], omni.specular[1], omni.specular[2], omni.specular[3]);

        this.lightsArray[j] = omni.enabled;
        this.interface.addLight("omni", j, omni.id);

        if (omni.enabled)
            this.lights[j].enable();
        else
            this.lights[j].disable();

        this.lights[j].setVisible(true);
        this.lights[j].update();
    }

    for (var i = 0; i < this.graph.spotLights.length; i++, j++) {
        var spot = this.graph.spotLights[i];

        this.lights[j].setPosition(spot.location[0], spot.location[1], spot.location[2], 1);
        this.lights[j].setAmbient(spot.ambient[0], spot.ambient[1], spot.ambient[2], spot.ambient[3]);
        this.lights[j].setDiffuse(spot.diffuse[0], spot.diffuse[1], spot.diffuse[2], spot.diffuse[3]);
        this.lights[j].setSpecular(spot.specular[0], spot.specular[1], spot.specular[2], spot.specular[3]);
        this.lights[j].setSpotExponent(spot.exponent);
        this.lights[j].setSpotDirection(spot.location[0] - spot.target[0], spot.location[1] - spot.target[1], spot.location[2] - spot.target[2]);

        this.lightsArray[j] = spot.enabled;
        this.interface.addLight("spot", j, spot.id);

        if (spot.enabled)
            this.lights[j].enable();
        else
            this.lights[j].disable();

        this.lights[j].setVisible(true);
        this.lights[j].update();
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

XMLscene.prototype.displayGraph = function(root, material, texture)
{
    var node;
  	var mat;
	var text;

	node = this.componentsList['root'];
	if(node instanceof Component){

	console.log(node);
	//transformations
	this.pushMatrix();
//	this.multMatrix(this.transformationList[node.transformationsID]);

	//materials
	if(node.materialID == 'inherit')
			mat = material;
	else {
		  mat = this.materialsList[node.materialID];
	}

	//textures
    console.log(node.texture);
	text = this.texturesList[node.texture];
	
	if (node.texture == "none")
		text = null;
	else if (node.texture == "inherit")
		text = texture;

    console.log(text);
    //mat.setTexture(texture);
    //mat.apply();
    
  /*  if(node.transformationsID != null)
    {
        this.applyTransformations(this.transformationsList[node.transformationsID]);
    }
    else {

        this.applyTransformations(node.transformations);
    }

    for(var i = 0; i < node.primitivesRefs.length; i++){
        this.primitives[node.primitivesRefs[i]].display();
    }

	for(var i = 0 ; i < node.componentRefs.length; i++ ){
        var childID = node.componentRefs[i];
	    this.displayGraph(childID, mat, text);
	}
*/

	this.popMatrix();

}


}

XMLscene.prototype.applyTransformations = function(transformations){
/*    console.log("transformations: ");
    console.log(transformations);*/
    //var i = transformations.length - 1; i >= 0; i--

    //var i = 0; i < transformations.length; i++
    for(var i = 0; i < transformations.length; i++){
        var transf = transformations[i];
        //console.log(transf);
    //    console.log(transformations[i].tagName);
        switch(transf.type){
            case "rotate":
            this.rotate(transf.angle * Math.PI / 180,
                        transf.axis == "x" ? 1 : 0,
                        transf.axis == "y" ? 1 : 0,
                        transf.axis == "z" ? 1 : 0);
            break;
            case "translate":
            this.translate(transf.x, transf.y, transf.z);
            break;
            case "scale":
            this.scale(transf.x, transf.y, transf.z);
            break;
        }

    }
        //console.log(transformations[i]);
}
