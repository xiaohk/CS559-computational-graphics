/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Trunk = undefined
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"

    // constructor for Trunk
    Trunk = function Trunk(name, position, size, color, radius, numCircle,
                           height) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position || [0,0,0]
        this.size = size || 1.0
        this.color = color || [.7,.8,.9]
        this.radius = radius
        this.numCircle = numCircle
        this.height = height
    }

    // One of the object necessary function
    Trunk.prototype.init = function(drawingState) {
        var triangles = []
        var vertexPosRaw = []
        var vertexColorsRaw = []
        var vertexNormalRaw = []
        this.buffer = null

        // Get the gl content
        var gl=drawingState.gl

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["stone-vs", "stone-fs"]);
        
        // Add triangles
        addCylinder(this.position, this.radius, this.numCircle,
                    this.color, this.height, triangles)

        console.log(triangles.length)

        // Convert triangles to webgl array info
        var results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])

        // Try to make a texture coordinate for this cylinder
        var texCoord = []
        var slice = 1 / this.numCircle / 2
        for(var i = 0; i < triangles.length; i++){
            // The top and bottom circles
            if (i < triangles.length/2){
                for (var j = 0; j < 3; j++){
                    var rd = 0.01 * Math.random()
                    texCoord.push(...[0.5+rd, 0.5+rd])
                }
            } else {
                var t = i - triangles.length/2
                if (t % 2 == 0){
                    texCoord.push(...[t * slice, 0, 
                                     t * slice, 1,
                                     ((t+2) % (triangles.length/2)) * slice, 0])
                    texCoord.push(...[t * slice, 1,
                                     ((t+2) % (triangles.length/2)) * slice, 1,
                                     ((t+2) % (triangles.length/2)) * slice, 0])
                }
            }
        }

        var textureImage = image_trunk1
        if (this.name == "Trunk1"){
            textureImage = image_trunk2
        }
        this.texture = twgl.createTexture(gl, {
            target: gl.TEXTURE_2D_ARRAY,
            min: gl.NEAREST_MIPMAP_LINEAR,
            src: textureImage
        })

        var arrays = {
            vpos : {numComponents:3, data: new Float32Array(vertexPosRaw)},
            vnormal : {numComponents:3, data: new Float32Array(vertexNormalRaw)},
            vcolor : {numComponents:3, data: new Float32Array(vertexColorsRaw)},
            vTexCoord : {numComponents : 2, data : texCoord}
        }

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    Trunk.prototype.draw = function(drawingState) {
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
    Trunk.prototype.center = function(drawingState) {
        return this.position
    }
})()

//Trunk(name, position, size, color, radius, numCircle, height)
