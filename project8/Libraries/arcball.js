/**
 * Created by gleicher on 7/31/15.
 */

/** an attempt to recreate the simple arcball in Javascript
 ** this is a transliteration of the ArcBall code created for
 ** CS559 in C++
 ** the UI parts aren't as clean - since you might want the mouse for
 ** other stuff
 **
 ** if you're a 559 student, you don't need to worry about how this works
 ** you can just use it
 **
 ** note: this isn't very efficient - it creates matrices and quaternions all over
 ** the place where it doesn't need to
 **/

//**************************************************************************
//
// We need a quick and dirty Quaternion class - for ArcBall
// Note1 : If you're a 559 student, don't worry about how this works
// Note2 : If you know what a quaternion is and want to use it, you
//         probably don't want this one! it's a simple version only for the
//         simple arcball
//
//**************************************************************************
function ABQuat() {
    "use strict";
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
}
ABQuat.prototype.asMatrix = function() {
    "use strict";
    // Be TWGL compatible
    var mat =  new Float32Array(16);


    // makes excess local variables, but it makes typing easier for translation
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var w = this.w;

    var Nq = x*x + y*y + z*z + w*w;
    var s = 0;
    if (Nq > 0)
    {
        s = (2.0 / Nq);
    }
    var xs = x*s,	  ys = y*s,	  zs = z*s;
    var wx = w*xs,	  wy = w*ys,  wz = w*zs;
    var xx = x*xs,	  xy = x*ys,  xz = x*zs;
    var yy = y*ys,	  yz = y*zs,  zz = z*zs;

    // i hope I don't transpose this...
    mat[0] = 1.0 - (yy + zz);   mat[1] = xy + wz;           mat[2] = xz - wy;
    mat[4] = xy - wz;           mat[5]= 1.0 - (xx + zz);    mat[6] = yz + wx;
    mat[8] = xz + wy;           mat[9] = yz - wx;           mat[10] = 1.0 - (xx + yy);

    mat[3] = mat[7] = mat[11] = 0;
    mat[12]=mat[13]=mat[14] = 0;
    mat[15]=1;

    return mat;
};
ABQuat.prototype.renorm = function() {
    var Nq = 1.0 / Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
	this.x *= Nq;
	this.y *= Nq;
	this.z *= Nq;
	this.w *= Nq;
};
ABQuat.prototype.mult = function(qR) {
    var qq = new ABQuat();
    var w=this.w, x=this.x, y=this.y, z=this.z;
	qq.w = w*qR.w - x*qR.x - y*qR.y - z*qR.z;
	qq.x = w*qR.x + x*qR.w + y*qR.z - z*qR.y;
	qq.y = w*qR.y + y*qR.w + z*qR.x - x*qR.z;
	qq.z = w*qR.z + z*qR.w + x*qR.y - y*qR.x;
	return (qq);

};
ABQuat.prototype.zero = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
};

//////////////////////////////////////////////////////////////////////////////////////
function ArcBall(canvas, callback) {
    "use strict";
    this.start = new ABQuat();
    this.now = new ABQuat();
    this.downX = 0;
    this.downY = 0;
    this.mode = 0;
    this.canvas = canvas;

    this.initZ = 10;

    this.callback = callback;

    // set up all the mouse events
    var that = this;
    canvas.addEventListener("mousedown",function(e) {
        var sx = canvas.width / 2;
        var sy = canvas.height / 2;
        var nx = (e.pageX - sx) / sx;
        var ny = -(e.pageY - sy) / sy;
        that.click(nx,ny)

    });
    canvas.addEventListener("mousemove",function(e) {
        var sx = canvas.width / 2;
        var sy = canvas.height / 2;
        var nx = (e.pageX - sx) / sx;
        var ny = -(e.pageY - sy) / sy;
        if (that.mode) {
            that.computeNow(nx, ny);
            if (that.callback) that.callback();
        }
    });
    document.addEventListener("mouseup",function(e) {
        that.mode = 0;
        if (that.callback) that.callback();
    });

}
ArcBall.prototype.reset = function() {
    "use strict";
    this.start.zero();
    this.now.zero();
    this.mode = 0;
};
ArcBall.prototype.getMatrix = function() {
    "use strict";
    var q = this.now.mult(this.start);
    return q.asMatrix()
};
ArcBall.prototype.click = function(x,y) {
    "use strict";
    this.start = this.now.mult(this.start);
    this.downX = x;
    this.downY = y;
    this.panX = 0;
    this.panY = 0;
    this.mode = 1;
    this.now.zero();
};
ArcBall.prototype.spin = function(x,y,z) {
    "use strict";
    this.start = this.now.mult(this.start);

 	var iw = x*x + y*y + z*z;
	if (iw<1)
		iw = math.sqrt(1-iw);
	else
		iw = 0;
	this.now.x = x;
    this.now.y = y;
    this.now.z = z;
    this.now.w = iw;

    this.norm.renorm();
    this.start = this.now.mult(this.start);

    this.now.zero();
};
ArcBall.prototype.onUnitSphere = function(mx,my)
{
    "use strict";
	var x = mx;		// should divide radius
	var y = my;
    var z;
	var mag = x*x + y*y;
	if (mag > 1.0) {
		var scale = 1.0 / Math.sqrt(mag);
		x *= scale;
		y *= scale;
		z = 0;
	} else {
		z = Math.sqrt(1 - mag);
	}
    return [x,y,z];
};
ArcBall.prototype.computeNow = function(mx,my)
{
    "use strict";
    var down = this.onUnitSphere(this.downX, this.downY);
    var mouse = this.onUnitSphere(mx, my);

    // here we compute the quaternion between these two points
    this.now.x = down[1]*mouse[2] - down[2]*mouse[1];
    this.now.y = down[2]*mouse[0] - down[0]*mouse[2];
    this.now.z = down[0]*mouse[1] - down[1]*mouse[0];
    this.now.w = down[0]*mouse[0] + down[1]*mouse[1] + down[2]*mouse[2];

    this.now.renorm();		// just in case...
};