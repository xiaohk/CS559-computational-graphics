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
        this.buffers = []
        this.texture = null
        this.vertexNum = 0

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
        
        // Create Webgl shader for the stones
        var vertexSource = document.getElementById("stone-vs").text
        var fragmentSource = document.getElementById("stone-fs").text
        this.program = createGLProgram(gl, vertexSource, fragmentSource)

        this.attributes = findAttribLocations(gl, this.program,
            ["vpos", "vnormal", "vcolor", "vTexCoord"])
        this.uniforms = findUniformLocations(gl, this.program,
            ["view", "proj", "model", "lightdir"])

        drawStones(this.position, this.radius + 0.2, 10, this.stoneColor,
                   triangles, this.stoneScale)
        //var Tx_scale = m4.scaling([2,2,2])
        //addCube(this.position, this.color, triangles, m4.rotationY(0), Tx_scale)

        // Convert triangles to webgl array info
        var results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])


        this.vertexNum = this.vertexNum + vertexPosRaw.length / 3

        // Generate texture coordinate for the stone
        var texCoord = []
        for(var i = 0; i < 60; i++){
            texCoord.push(...[0,1, 0,0, 1,1, 1,0, 1,1, 0,0])
        }

        this.texture = createGLTexture(gl, image_rock2, true)
        this.buffers[0] = createGLBuffer(gl, new Float32Array(vertexPosRaw),
            gl.STATIC_DRAW)
        this.buffers[1] = createGLBuffer(gl, new Float32Array(vertexNormalRaw),
            gl.STATIC_DRAW)
        this.buffers[2] = createGLBuffer(gl, new Float32Array(vertexColorsRaw),
            gl.STATIC_DRAW)
        this.buffers[3] = createGLBuffer(gl, new Float32Array(texCoord),
            gl.STATIC_DRAW)
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
        gl.useProgram(this.program)
        gl.disable(gl.CULL_FACE)

        // Set up uniforms
        gl.uniformMatrix4fv(this.uniforms.view, gl.FALSE, drawingState.view)
        gl.uniformMatrix4fv(this.uniforms.proj, gl.FALSE, drawingState.proj)
        gl.uniformMatrix4fv(this.uniforms.model, gl.FALSE, modelM)
        gl.uniform3fv(this.uniforms.lightdir, drawingState.sunDirection)

        // Set up the texture
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(this.uniforms.uTexture, 1)

        // Set up attributes
        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0])
        gl.vertexAttribPointer(this.attributes.vpos, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1])
        gl.vertexAttribPointer(this.attributes.vnormal, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2])
        gl.vertexAttribPointer(this.attributes.vcolor, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3])
        gl.vertexAttribPointer(this.attributes.vTexCoord, 2, gl.FLOAT, false, 0, 0)

        // Draw call
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);

    }

    CampFire.prototype.center = function(drawingState) {
        return this.position
    }
})()
