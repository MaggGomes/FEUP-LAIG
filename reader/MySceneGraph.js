function MySceneGraph(filename, scene) {
	this.loadedOk = null;

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	// File reading
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	this.reader.open('scenes/dsxscene.xml', this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function(){
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseLoadOk(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk=true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.parseLoadOk=function (rootElement) {

	var rootElement = this.reader.xmlDoc.documentElement;

	this.parseScene(rootElement);
	this.parseViews(rootElement);
	this.parseIllumination(rootElement);
	this.parseLights(rootElement);
	this.parseMaterials(rootElement);

	this.loadedOk=true;

	console.log("XML Loaded");

}

MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);
	this.loadedOk=false;
};

MySceneGraph.prototype.parseScene= function(rootElement) {
	var elems =  rootElement.getElementsByTagName('scene');

	if (!elems) {
      return "scene missing!";
  }

	if (elems.length != 1) {
		return "different size of scene element"
	}

	var scene = elems[0];

	this.sceneAtr = new SceneAtr(
		this.reader.getString(scene,'root',true),
		this.reader.getString(scene,'axis_length',true)
	);
}

MySceneGraph.prototype.parseViews= function(rootElement) {
	elems = rootElement.getElementsByTagName('views')

	if (!elems) {
      return "views missing!";
  }

	var views = elems[0];

	this.views = new Views(this.reader.getString(views,'default',true));

	var arrViews = views.getElementsByTagName('perspective');

	for (var i = 0; i < arrViews.length; i++) {
		this.views.perspectives.push(this.parsePerspective(arrViews[i]));
	}
}

MySceneGraph.prototype.parsePerspective = function(perspective){
	var ret = new Perspective(this.reader.getString(perspective,"id",true),
														this.reader.getFloat(perspective,"near"),
														this.reader.getFloat(perspective,"far"),
														this.reader.getFloat(perspective,"angle"));

	var fr = perspective.getElementsByTagName("from")[0];
	var to = perspective.getElementsByTagName("to")[0];

	ret.from.push(this.reader.getFloat(fr,"x"));
	ret.from.push(this.reader.getFloat(fr,"y"));
	ret.from.push(this.reader.getFloat(fr,"z"));

	ret.to.push(this.reader.getFloat(to,"x"));
	ret.to.push(this.reader.getFloat(to,"y"));
	ret.to.push(this.reader.getFloat(to,"z"));

	return ret;
}

MySceneGraph.prototype.parseIllumination = function(rootElement){
	var elems =  rootElement.getElementsByTagName('illumination');
	if (elems == null) {
		onXMLError("illumination element is missing.");
	}
	if (elems.length != 1) {
		onXMLError("either zero or more than one 'illumination' element found.");
	}

	var ambient = elems[0].getElementsByTagName('ambient');
	if (ambient == null) {
		onXMLError("ambient element is missing.");
	}
	if (ambient.length != 1) {
		onXMLError("either zero or more than one 'ambient' element found.");
	}

	var background = elems[0].getElementsByTagName('background');
	if (background == null) {
		onXMLError("background element is missing.");
	}

	if (background.length != 1) {
		onXMLError("either zero or more than one 'background' element found.");
	}

	elems = elems[0];

	this.illumination = new Illumination(this.reader.getBoolean(elems, 'doublesided'),
																			 this.reader.getBoolean(elems, 'local'));

	console.log('Illumination read from file: doubleSided = ' + this.illumination.doubleSided
																							+ ", local = " + this.illumination.local);

	ambient = ambient[0];
	var amb = [this.reader.getFloat(ambient, 'r'),
						 this.reader.getFloat(ambient, 'g'),
						 this.reader.getFloat(ambient, 'b'),
						 this.reader.getFloat(ambient, 'a')];

	this.illumination.ambient = amb;

	console.log('Illumination read from file: Ambient R = ' + this.illumination.ambient[0]
																			 + ", Ambient G = " + this.illumination.ambient[1]
																			 + ", Ambient B = " + this.illumination.ambient[2]
																			 + ", Ambient A = " + this.illumination.ambient[3]);

	background = background[0];
	var bg = [this.reader.getFloat(background, 'r'),
						this.reader.getFloat(background, 'g'),
						this.reader.getFloat(background, 'b'),
						this.reader.getFloat(background, 'a')];

	this.illumination.background = bg;

	console.log('Illumination read from file: Background R = ' + this.illumination.background[0]
																			 + ", Background G = " + this.illumination.background[1]
	                              			 + ", Background B = " + this.illumination.background[2]
																			 + ", Background A = ", this.illumination.background[3]);
}

MySceneGraph.prototype.parseLights = function(rootElement){
	this.omniLights = [];
	this.spotLights = [];

	elems = rootElement.getElementsByTagName('lights')

	if (!elems) {
      return "lights missing!";
  }

	var lights = elems[0];

	var arrOmni = lights.getElementsByTagName('omni');
	var arrSpot = lights.getElementsByTagName('spot');

	for (var i = 0; i < arrOmni.length; i++) {
		this.omniLights.push(this.parseOmniLight(arrOmni[i]));
	}

	for (var i = 0; i < arrSpot.length; i++) {
		this.spotLights.push(this.parseSpotLight(arrSpot[i]));
	}

}

MySceneGraph.prototype.parseOmniLight = function(omni){
	var ret = new omniLight(this.reader.getString(omni,"id",true),
													this.reader.getBoolean(omni,"enabled"));

  var location = omni.getElementsByTagName("location")[0];
	ret.location.push(this.reader.getFloat(location,"x"));
	ret.location.push(this.reader.getFloat(location,"y"));
	ret.location.push(this.reader.getFloat(location,"z"));
	ret.location.push(this.reader.getFloat(location,"w"));

	var ambient = omni.getElementsByTagName("ambient")[0];
	ret.ambient.push(this.reader.getFloat(ambient,"r"));
	ret.ambient.push(this.reader.getFloat(ambient,"g"));
	ret.ambient.push(this.reader.getFloat(ambient,"b"));
	ret.ambient.push(this.reader.getFloat(ambient,"a"));

	var diffuse = omni.getElementsByTagName("diffuse")[0];
	ret.diffuse.push(this.reader.getFloat(diffuse,"r"));
	ret.diffuse.push(this.reader.getFloat(diffuse,"g"));
	ret.diffuse.push(this.reader.getFloat(diffuse,"b"));
	ret.diffuse.push(this.reader.getFloat(diffuse,"a"));

	var specular = omni.getElementsByTagName("specular")[0];
	ret.specular.push(this.reader.getFloat(specular,"r"));
	ret.specular.push(this.reader.getFloat(specular,"g"));
	ret.specular.push(this.reader.getFloat(specular,"b"));
	ret.specular.push(this.reader.getFloat(specular,"a"));

	return ret;
}

MySceneGraph.prototype.parseSpotLight = function(spot){

		var ret = new spotLight(this.reader.getString(spot,"id",true),
														this.reader.getBoolean(spot,"enabled"),
														this.reader.getFloat(spot,"angle"),
														this.reader.getFloat(spot,"exponent"));


  	var target = spot.getElementsByTagName("target")[0];
		ret.target.push(this.reader.getFloat(target,"x"));
		ret.target.push(this.reader.getFloat(target,"y"));
		ret.target.push(this.reader.getFloat(target,"z"));

	  var location = spot.getElementsByTagName("location")[0];
		ret.location.push(this.reader.getFloat(location,"x"));
		ret.location.push(this.reader.getFloat(location,"y"));
		ret.location.push(this.reader.getFloat(location,"z"));

		var ambient = spot.getElementsByTagName("ambient")[0];
		ret.ambient.push(this.reader.getFloat(ambient,"r"));
		ret.ambient.push(this.reader.getFloat(ambient,"g"));
		ret.ambient.push(this.reader.getFloat(ambient,"b"));
		ret.ambient.push(this.reader.getFloat(ambient,"a"));

		var diffuse = spot.getElementsByTagName("diffuse")[0];
		ret.diffuse.push(this.reader.getFloat(diffuse,"r"));
		ret.diffuse.push(this.reader.getFloat(diffuse,"g"));
		ret.diffuse.push(this.reader.getFloat(diffuse,"b"));
		ret.diffuse.push(this.reader.getFloat(diffuse,"a"));

		var specular = spot.getElementsByTagName("specular")[0];
		ret.specular.push(this.reader.getFloat(specular,"r"));
		ret.specular.push(this.reader.getFloat(specular,"g"));
		ret.specular.push(this.reader.getFloat(specular,"b"));
		ret.specular.push(this.reader.getFloat(specular,"a"));
}

MySceneGraph.prototype.parseTextures = function(rootElement){

	var textures = rootElement.getElementsByTagName('textures');

	if (textures == null  || textures.length==0) {
		onXMLError("textures element is missing.");
	}

	this.textureList=[];

	var numText = textures[0].children.length;

	if(numText <= 0)
		onXMLError("texture elements are missing");

	for (var i = 0; i < numText; i++)
	{
		var e = textures[0].children[i];
		// process each element and store its information
		this.textureList[e.id] = e.attributes.getNamedItem("id").value;
		this.textureList[e.file] = e.attributes.getNamedItem("file").value;
		this.textureList[e.s] = e.attributes.getNamedItem("length_s").value;
		this.textureList[e.t] = e.attributes.getNamedItem("length_t").value;

		console.log("Texture read from file: ID = " + this.textureList[e.id] + ", File = " + this.textureList[e.file] + ",S Length = " + this.textureList[e.s] + ",T Length = " + this.textureList[e.t]);
	};
}

MySceneGraph.prototype.parseMaterials= function(rootElement) {
	elems = rootElement.getElementsByTagName('materials')

	if (!elems) {
      return "materials missing!";
  }

	var materials = elems[0];

	this.materials = [];
	var arrMaterials = materials.getElementsByTagName('material');

	for (var i = 0; i < arrMaterials.length; i++) {
		this.materials.push(this.parseMaterial(arrMaterials[i]));
	}


}

MySceneGraph.prototype.parseMaterial= function(material) {
	var ret = new Material(this.reader.getString(material,"id",true));

	var emission = material.getElementsByTagName("emission")[0];
	var ambient = material.getElementsByTagName("ambient")[0];
	var diffuse = material.getElementsByTagName("diffuse")[0];
	var specular = material.getElementsByTagName("specular")[0];
	var shininess = material.getElementsByTagName("shininess")[0];

	ret.emission.push(this.reader.getFloat(emission,"r"));
	ret.emission.push(this.reader.getFloat(emission,"g"));
	ret.emission.push(this.reader.getFloat(emission,"b"));
	ret.emission.push(this.reader.getFloat(emission,"a"));

	ret.ambient.push(this.reader.getFloat(ambient,"r"));
	ret.ambient.push(this.reader.getFloat(ambient,"g"));
	ret.ambient.push(this.reader.getFloat(ambient,"b"));
	ret.ambient.push(this.reader.getFloat(ambient,"a"));

	ret.diffuse.push(this.reader.getFloat(diffuse,"r"));
	ret.diffuse.push(this.reader.getFloat(diffuse,"g"));
	ret.diffuse.push(this.reader.getFloat(diffuse,"b"));
	ret.diffuse.push(this.reader.getFloat(diffuse,"a"));

	ret.specular.push(this.reader.getFloat(specular,"r"));
	ret.specular.push(this.reader.getFloat(specular,"g"));
	ret.specular.push(this.reader.getFloat(specular,"b"));
	ret.specular.push(this.reader.getFloat(specular,"a"));

	ret.shininess = this.reader.getFloat(shininess,"value")
	;

	return ret;
}
