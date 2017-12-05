/**
 * Created by Jay Wong on 12/5/17.
 */

// Global object list
var grobjects = grobjects || []
var Skybox = undefined
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"

    // constructor for Skybox
    Skybox = function Skybox(name, position, size, color, rotate, scale) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position || [0,0,0]
        this.size = size || 1.0
        this.color = color || [.7,.8,.9]
        this.rotate = rotate
        this.scale = scale
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

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["stone-vs", "stone-fs"]);
       
        // Create a cube
        addCube(this.position, this.color, triangles, this.rotate, this.scale)

        // Convert triangles to webgl array info
        var results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])

        var texCoord = []
        for(var i = 0; i < 6; i++){
            texCoord.push(...[0,1, 0,0, 1,1, 1,0, 1,1, 0,0])
        }

        console.log(vertexPosRaw.length)
        console.log(texCoord.length)

        console.log(typeof(image_posx))
        this.texture = twgl.createTexture(gl, {
            target: gl.TEXTURE_CUBE_MAP,
            src: [
                image_posx.src,
                image_negx.src,
                image_posy.src,
                image_negy.src,
                image_posz.src,
                image_negz.src
            ]
        })

        var arrays = {
            vpos : {numComponents:3, data: new Float32Array(vertexPosRaw)},
            vnormal : {numComponents:3, data: new Float32Array(vertexNormalRaw)},
            vcolor : {numComponents:3, data: new Float32Array(vertexColorsRaw)},
            vTexCoord : {numComponents : 2, data : texCoord}
        }

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    Skybox.prototype.draw = function(drawingState) {
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
            model: modelM,
            texSampler: this.texture
        })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer)
    }

    Skybox.prototype.center = function(drawingState) {
        return this.position
    }
})()

//Skybox(name, position, size, color, rotate, scale)
var my_skybox = new Skybox(name = "Skybox",
                          position = [1,0,1],
                          size = 1,
                          color = [1, 0, 0], 
                          rotate = m4.rotationY(0),
                          scale = m4.scaling([1,1,1]))
grobjects.push(my_skybox)
