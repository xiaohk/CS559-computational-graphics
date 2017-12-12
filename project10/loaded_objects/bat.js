// Draw the sheep.objjs file

/**
 * Created by Jay Wong on 12/11/17.
 */

// Global object list
var grobjects = grobjects || []
var Bat = undefined
// Have to use semicolon below, weird JS
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

// Implement the curve for bat to fly
var Hermite = function(t) {
    return [
        2*t*t*t-3*t*t+1,
        t*t*t-2*t*t+t,
        -2*t*t*t+3*t*t,
        t*t*t-t*t
    ];
}

var HermiteDerivative = function(t) {
    return [
        6*t*t-6*t,
        3*t*t-4*t+1,
        -6*t*t+6*t,
        3*t*t-2*t
    ];
}

function Cubic(basis, P, t){
    var b = basis(t);
    var result=v3.mulScalar(P[0],b[0]);
    v3.add(v3.mulScalar(P[1],b[1]),result,result);
    v3.add(v3.mulScalar(P[2],b[2]),result,result);
    v3.add(v3.mulScalar(P[3],b[3]),result,result);
    return result;
}

(function() {
    "use strict"
    // constructor for Sheep

    Bat = function Bat(name, position, size, color, theta) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position || [0,0,0]
        this.target = [0,0,0]
        this.size = size || 1.0
        this.color = color
        this.theta = theta
        this.curtime = 0
        // Curve segment control points: [p0, d0, p1, d1]
        this.s1 = [[-3, 1, -3], [4, 2.5, 4], [3, 4, -3], [0, -2, 3.5]]
        this.s2 = [[3, 4, -3], [0, -2, 3.5], [0, 1.5, 2.5], [-2.5, 0, -2.5]]
        this.s3 = [[0, 1.5, 2.5], [-2.5, 0, -2.5], [-3, 1.5, 1.5], [0, -1, -3]]
        this.s4 = [[-3, 1.5, 1.5], [0, -1, -3], [-3, 1, -3], [4, 2.5, 4]]
    }

    // One of the object necessary function
    Bat.prototype.init = function(drawingState) {
        this.now = drawingState.realtime
        this.buffer = null
        // Get the gl content
        var gl=drawingState.gl

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["stone-vs", "stone-fs"]);

        // Didn't do texture yet, just paint to one color
        var vertexColorsRaw = []
        for(var i = 0; i < bat_data["object"]["vertex"]["data"].length; i++){
            vertexColorsRaw.push(...this.color)
        }


        this.texture = twgl.createTexture(gl, {
            target: gl.TEXTURE_2D_ARRAY,
            src: image_bat1
        })

        var myCoord = []
        for(var i = 0; i < bat_data["object"]["texcoord"]["data"].length; i++){
            var temp = bat_data["object"]["texcoord"]["data"][i]
            if (i%2 == 1){
                myCoord.push(1 - temp)
            } else {
                myCoord.push(temp)
            }
        }

        var arrays = {
            vpos : {numComponents : 3,
                    data: bat_data["object"]["vertex"]["data"]},
            vnormal : {numComponents : 3,
                      data : bat_data["object"]["normal"]["data"]},
            vcolor : {numComponents : 3,
                      data :  bat_data["object"]["color"]["data"]},
            vTexCoord : {numComponents : 2,
                      data :  myCoord}
        }

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    Bat.prototype.draw = function(drawingState) {
        var modelM = m4.scaling([this.size,this.size,this.size])
        // Rotate the model to let it face forward
        m4.rotateX(modelM, Math.PI/2, modelM)
        m4.rotateZ(modelM, Math.PI, modelM)

        // Change the position and orientation
        this.initPosition(drawingState)
        modelM = m4.multiply(modelM, twgl.m4.lookAt(
                                this.position, this.target, [0, 1, 0]))

        //console.log(drawingState.realtime)

        var gl = drawingState.gl
        gl.useProgram(this.shaderProgram.program)
        twgl.setBuffersAndAttributes(gl,this.shaderProgram, this.buffer)
        twgl.setUniforms(this.shaderProgram,{
            view:drawingState.view,
            proj:drawingState.proj,
            lightdir:drawingState.sunDirection,
            model: modelM,
            texSampler: this.texture
        })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer)
    }

    Bat.prototype.center = function(drawingState) {
        return this.position
    }

    // Record time and make curve segments
    Bat.prototype.initPosition = function(drawingState){
        // Four segments
        if (this.curTime < 1) {
            this.position = Cubic(Hermite, this.s1, this.curTime)
            this.target = Cubic(HermiteDerivative, this.s1, this.curTime)
        }
        else if (this.curTime >= 1 && this.curTime < 2) {
            this.position = Cubic(Hermite, this.s2, this.curTime - 1)
            this.target = Cubic(HermiteDerivative, this.s2, this.curTime - 1)
        }
        else if (this.curTime >= 2 && this.curTime < 3) {
            this.position = Cubic(Hermite, this.s3, this.curTime - 2)
            this.target = Cubic(HermiteDerivative, this.s3, this.curTime - 2)
        }
        else if(this.curTime >= 3 && this.curTime < 4) {
            this.position = Cubic(Hermite, this.s4, this.curTime - 3)
            this.target = Cubic(HermiteDerivative, this.s4, this.curTime - 3)
        }
        else {
            // If greater than 4, restart
            this.curTime = 0
            return
        }

        // Update time
        this.curTime += (drawingState.realtime - this.lastTime)/3000
        this.lastTime = drawingState.realtime
        return;
    }

})()
