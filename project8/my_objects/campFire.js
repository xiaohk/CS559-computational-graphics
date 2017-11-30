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
        this.shaderProgramStone = undefined
        this.buffer = undefined
        this.bufferStone = undefined
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
        this.shaderProgram = twgl.createProgramInfo(gl, ["trunk-vs", "trunk-fs"])
        this.shaderProgramStone = twgl.createProgramInfo(gl,
                                    ["stone-vs", "stone-fs"])
        
        // Add triangles
        drawCampfire(this.position, this.radius, this.poleRadius, this.numPole,
                     this.numCircle, this.color, this.height, this.theta,
                     triangles) 

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


        // Clear the variables to draw stone
        triangles = []
        vertexPosRaw = []
        vertexColorsRaw = []
        vertexNormalRaw = []
        arrays = []
        this.bufferStone = null

        drawStones(this.position, this.radius + 0.2, 10, this.stoneColor,
                   triangles, this.stoneScale)
        //var Tx_scale = m4.scaling([2,2,2])
        //addCube(this.position, this.color, triangles, m4.rotationY(0), Tx_scale)

        // Convert triangles to webgl array info
        var results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])

        // Generate texture coordinate for the stone
        var stoneTextureCoord = []
        for(var i = 0; i < 60; i++){
            stoneTextureCoord.push(...[0,1, 0,0, 1,1, 1,0, 1,1, 0,0])
        }

        // Make texture
        this.textureStone = twgl.createTexture(gl, {
            target: gl.TEXTURE_2D_ARRAY,
            source: "https://i.imgur.com/SCvNEHf.jpg"
        })

        arrays = {
            vTexCoord : {numComponents:2, data: new Float32Array(stoneTextureCoord)},
            vpos : {numComponents:3, data: new Float32Array(vertexPosRaw)},
            vnormal : {numComponents:3, data: new Float32Array(vertexNormalRaw)},
            vcolor : {numComponents:3, data: new Float32Array(vertexColorsRaw)}
        }

        this.bufferStone = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    CampFire.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size])
        twgl.m4.setTranslation(modelM,this.position,modelM)

        var gl = drawingState.gl

        // Draw the campfire
        gl.useProgram(this.shaderProgram.program)
        twgl.setBuffersAndAttributes(gl,this.shaderProgram, this.buffer)
        twgl.setUniforms(this.shaderProgram,{
            view:drawingState.view,
            proj:drawingState.proj,
            lightdir:drawingState.sunDirection,
            cubecolor:this.color,
            model: modelM })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer)

        // Draw the stones
        gl.useProgram(this.shaderProgramStone.program)
        twgl.setBuffersAndAttributes(gl,this.shaderProgramStone, this.bufferStone)
        twgl.setUniforms(this.shaderProgramStone,{
            view:drawingState.view,
            proj:drawingState.proj,
            lightdir:drawingState.sunDirection,
            cubecolor:this.color,
            model: modelM,
            texSampler: this.textureStone
        })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.bufferStone)
    }

    CampFire.prototype.center = function(drawingState) {
        return this.position
    }
})()
