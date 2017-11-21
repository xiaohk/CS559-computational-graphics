/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Tree = undefined
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"

    // constructor for Trunk
    Tree = function Tree(name, position, size, color, trunkColor, radius,
                         trunkRadius, numCircle, trunkNumCircle, height,
                         theta, numLayer, heightRatio) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position
        this.size = size
        this.color = color
        this.trunkColor = trunkColor
        this.radius = radius
        this.trunkRadius = trunkRadius
        this.numCircle = numCircle
        this.trunkNumCircle = trunkNumCircle
        this.height = height
        this.theta = theta
        this.numLayer = numLayer
        this.heightRatio = heightRatio
    }

    // One of the object necessary function
    Tree.prototype.init = function(drawingState) {
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
        // Get the layer information
        var result = computePineTree(this.position, this.heightRatio,
                                     this.height, this.radius, this.numLayer)
        
        for(var i = 0; i < result[0].length; i++){
            addCone(result[0][i], result[1][i], this.numCircle, this.color,
                result[2][i], triangles, m4.rotationY(this.theta))

            addCylinder(this.position, this.trunkRadius, this.trunkNumCircle,
                        this.trunkColor, this.heightRatio * this.height / 2,
                        triangles)
        }

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

    Tree.prototype.draw = function(drawingState) {
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

    Tree.prototype.center = function(drawingState) {
        return this.position
    }
})()
