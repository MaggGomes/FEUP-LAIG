//<patch orderU="2" orderV="3" partsU="7" partsV="9" >
function MyPatch(scene, orderU, orderV, partsX, partsY, controlPoints) {
  var knots1 = this.getKnotsVector(orderU); // to be built inside webCGF in later versions ()
	var knots2 = this.getKnotsVector(orderV); // to be built inside webCGF in later versions

	var nurbsSurface = new CGFnurbsSurface(orderU, orderV, knots1, knots2, controlPoints);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	this.plane = new CGFnurbsObject(scene, getSurfacePoint, partsX, partsY);

};

MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.getKnotsVector = function(degree) {

	var v = new Array();
	for (var i=0; i<=degree; i++) {
		v.push(0);
	}
	for (var i=0; i<=degree; i++) {
		v.push(1);
	}
	return v;
}

MyPatch.prototype.display = function() {
  this.plane.display();
}
