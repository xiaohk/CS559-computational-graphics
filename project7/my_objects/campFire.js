/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var CampFire = undefined
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"

    // constructor for Trunk
    CampFire = function CampFire(name, position, size, color, stoneColor, radius,
                                 poleRadius, numPole, numCircle, height, theta,
                                 stoneScale) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position
        this.size = size
        this.color = color
        this.stoneColor = stoneColor
        this.radius = radius
        this.poleRadius = poleRadius
        this.numCircle = numCircle
        this.numPole = numPole
        this.height = height
        this.theta = theta
        this.stoneScale = stoneScale
    }

    // One of the object necessary function
    CampFire.prototype.init = function(drawingState) {
        var triangles = []
        var vertexPosRaw = []
        var vertexColorsRaw = []
        var vertexNormalRaw = []
        this.buffer = null

        // Get the gl content
        var gl=drawingState.gl

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["trunk-vs", "trunk-fs"]);
        
        // Add triangles
        drawCampfire(this.position, this.radius, this.poleRadius, this.numPole,
                     this.numCircle, this.color, this.height, this.theta,
                     triangles) 
        drawStones(this.position, this.radius + 0.2, 10, this.stoneColor,
                   triangles, this.stoneScale)

        // Convert triangles to webgl array info
        var results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])

        var arrays = {
            vpos : {numComponents:3, data: new Float32Array(vertexPosRaw)},
            vnormal : {numComponents:3, data: new Float32Array(vertexNormalRaw)},
            vcolor : {numComponents:3, data: new Float32Array(vertexColorsRaw)}
        }

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    CampFire.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size])
        twgl.m4.setTranslation(modelM,this.position,modelM)

        var gl = drawingState.gl
        gl.useProgram(this.shaderProgram.program)
        twgl.setBuffersAndAttributes(gl,this.shaderProgram, this.buffer)
        twgl.setUniforms(this.shaderProgram,{
            view:drawingState.view,
            proj:drawingState.proj,
            lightdir:drawingState.sunDirection,
            cubecolor:this.color,
            model: modelM })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer)
    }

    CampFire.prototype.center = function(drawingState) {
        return this.position
    }
})()
