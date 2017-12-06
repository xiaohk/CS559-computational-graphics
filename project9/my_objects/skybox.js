/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Skybox = undefined
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"

    // constructor for Trunk
    Skybox = function Skybox(name, position, size) {
        this.shaderProgram = undefined
        this.shaderProgramStone = undefined
        this.buffer = undefined
        this.buffers = []
        this.texture = null
        this.vertexNum = 0

        this.name = name
        this.position = position
        this.size = size
    }

    // One of the object necessary function
    Skybox.prototype.init = function(drawingState) {
        var triangles = []
        var vertexPosRaw = []
        var vertexColorsRaw = []
        var vertexNormalRaw = []
        this.buffer = null

        // Get the gl content
        var gl=drawingState.gl

        // Create Webgl shader for the stones
        var vertexSource = document.getElementById("skybox-vs").text
        var fragmentSource = document.getElementById("skybox-fs").text
        this.program = createGLProgram(gl, vertexSource, fragmentSource)

        this.attributes = findAttribLocations(gl, this.program,
            ["vpos"])
        this.uniforms = findUniformLocations(gl, this.program,
            ["view", "proj", "model", "lightdir"])

        //drawStones(this.position, 2.2, 1, [1,1,1],
        //           triangles, [1,1,1])
        addCenterCube(this.position, [0,0,0], triangles, m4.rotationY(0),
                m4.scaling([1,1,1]))

        // Convert triangles to webgl array info
        var results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])

        this.vertexNum = this.vertexNum + vertexPosRaw.length / 3

        // Generate texture coordinate for the stone
        var texCoord = []
        for(var i = 0; i < 6; i++){
            texCoord.push(...[0,1, 0,0, 1,1, 1,0, 1,1, 0,0])
        }

        // this.texture = createGLTexture(gl, image_rock2, true)
        this.texture = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture)

        // Map 6 planes
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, image_posx)
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, image_negx)
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, image_posy)
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, image_negy)
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, image_posz)
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, image_negz)

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP)

        this.buffers[0] = createGLBuffer(gl, new Float32Array(vertexPosRaw),
            gl.STATIC_DRAW)
        this.buffers[1] = createGLBuffer(gl, new Float32Array(vertexNormalRaw),
            gl.STATIC_DRAW)
        this.buffers[2] = createGLBuffer(gl, new Float32Array(vertexColorsRaw),
            gl.STATIC_DRAW)
        this.buffers[3] = createGLBuffer(gl, new Float32Array(texCoord),
            gl.STATIC_DRAW)
    }

    Skybox.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size])
        twgl.m4.setTranslation(modelM,this.position,modelM)

        var gl = drawingState.gl

        // Draw the stones
        gl.useProgram(this.program)
        gl.disable(gl.CULL_FACE)

        // Set up uniforms
        gl.uniformMatrix4fv(this.uniforms.view, gl.FALSE, drawingState.view)
        gl.uniformMatrix4fv(this.uniforms.proj, gl.FALSE, drawingState.proj)
        gl.uniformMatrix4fv(this.uniforms.model, gl.FALSE, modelM)
        gl.uniform3fv(this.uniforms.lightdir, drawingState.sunDirection)

        // Set up attributes
        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0])
        gl.vertexAttribPointer(this.attributes.vpos, 3, gl.FLOAT, false, 0, 0)

        // Draw call
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);
    }

    Skybox.prototype.center = function(drawingState) {
        return this.position
    }
})()


var my_skybox = new Skybox(name = "Skybox",
                          position = [0,0,0],
                          size = 100)
grobjects.push(my_skybox)
