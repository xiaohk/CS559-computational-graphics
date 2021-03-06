// Draw the sheep.objjs file

/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Boy = undefined
// Have to use semicolon below, weird JS
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"
    // constructor for Sheep

    Boy = function Boy(name, position, size, color, theta) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position || [0,0,0]
        this.size = size || 1.0
        this.color = color
        this.theta = theta
    }

    // One of the object necessary function
    Boy.prototype.init = function(drawingState) {
        this.now = drawingState.realtime
        this.buffer = null
        // Get the gl content
        var gl=drawingState.gl

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["stone-vs", "stone-fs"]);

        // Didn't do texture yet, just paint to one color
        var vertexColorsRaw = []
        for(var i = 0; i < cowboy_data["object"]["vertex"]["data"].length; i++){
            vertexColorsRaw.push(...this.color)
        }

        var texture_image = image_boy1
        if (this.name == "Jack"){
            texture_image = image_boy2
        }
        this.texture = twgl.createTexture(gl, {
            target: gl.TEXTURE_2D_ARRAY,
            src: texture_image
        })

        var myCoord = []
        for(var i = 0; i < cowboy_data["object"]["texcoord"]["data"].length; i++){
            var temp = cowboy_data["object"]["texcoord"]["data"][i]
            if (i%2 == 1){
                myCoord.push(1 - temp)
            } else {
                myCoord.push(temp)
            }
        }

        var arrays = {
            vpos : {numComponents : 3,
                    data: cowboy_data["object"]["vertex"]["data"]},
            vnormal : {numComponents : 3,
                      data : cowboy_data["object"]["normal"]["data"]},
            vcolor : {numComponents : 3,
                      data :  cowboy_data["object"]["color"]["data"]},
            vTexCoord : {numComponents : 2,
                      data :  myCoord}
        }

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    Boy.prototype.draw = function(drawingState) {
        var modelM = twgl.m4.scaling([this.size,this.size,this.size])
        twgl.m4.setTranslation(modelM, this.position, modelM)
        twgl.m4.rotateY(modelM, this.theta, modelM)

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

    Boy.prototype.center = function(drawingState) {
        return this.position
    }
})()
