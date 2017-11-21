// Draw the sheep.objjs file

/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Sheep = undefined
// Have to use semicolon below, weird JS
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"
    // constructor for Sheep

    Sheep = function Sheep(name, position, size, color) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position || [0,0,0]
        this.size = size || 1.0
        this.color = color
        this.rotating = false
        this.rotatingPos = position
        this.theta = 0
        this.backing = false
    }

    // One of the object necessary function
    Sheep.prototype.init = function(drawingState) {
        this.now = drawingState.realtime
        this.buffer = null
        // Get the gl content
        var gl=drawingState.gl

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["trunk-vs", "trunk-fs"]);

        // Didn't do texture yet, just paint to one color
        var vertexColorsRaw = []
        for(var i = 0; i < sheep_data["object"]["vertex"]["data"].length; i++){
            vertexColorsRaw.push(...this.color)
        }


        var arrays = {
            vpos : {numComponents : 3,
                    data: sheep_data["object"]["vertex"]["data"]},
            vnormal : {numComponents : 3,
                       data : sheep_data["object"]["normal"]["data"]},
            vcolor : {numComponents : 3,
                      data : vertexColorsRaw}
        }

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    Sheep.prototype.draw = function(drawingState) {

        var modelM = twgl.m4.scaling([this.size,this.size,this.size])

        // Move sheeps using real time
        var zOffset = (Number(drawingState.realtime - this.now) / 1000.0) % 8 

        if (this.backing){
            var newPosition = [this.rotatingPos[0], this.rotatingPos[1],
                               this.rotatingPos[2] - zOffset]
        } else {
            var newPosition = [this.rotatingPos[0], this.rotatingPos[1],
                               this.rotatingPos[2] + zOffset]
        }

        if (zOffset > 7 && !this.rotating){
            this.backing = false
            this.rotating = true
            this.now = drawingState.realtime
            this.rotatingPos = newPosition
        }

        if (this.rotating){
            this.theta += Number(drawingState.realtime - this.now)/800.0
            if (this.rotatingPos[2] > 0) {
                if (this.theta > 99*Math.PI/100.0){
                    this.rotating = false
                    this.now = drawingState.realtime
                    this.backing = true
                    this.theta = Math.PI
                }
            } else {
                if (this.theta > 2*99*Math.PI/100.0){
                    this.rotating = false
                    this.now = drawingState.realtime
                    this.backing = false
                    this.theta = 0
                }
            }
            twgl.m4.setTranslation(modelM, this.rotatingPos, modelM)
            twgl.m4.rotateY(modelM, this.theta, modelM)
        } else {
            twgl.m4.setTranslation(modelM, newPosition, modelM)
            twgl.m4.rotateY(modelM, this.theta, modelM)
        }

        var gl = drawingState.gl
        gl.useProgram(this.shaderProgram.program)
        twgl.setBuffersAndAttributes(gl,this.shaderProgram, this.buffer)
        twgl.setUniforms(this.shaderProgram,{
            view:drawingState.view,
            proj:drawingState.proj,
            lightdir:drawingState.sunDirection,
            model: modelM })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer)
    }

    Sheep.prototype.center = function(drawingState) {
        return this.position
    }
})()
