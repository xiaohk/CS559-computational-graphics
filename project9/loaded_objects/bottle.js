// Draw the sheep.objjs file

/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Bottle = undefined
// Have to use semicolon below, weird JS
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

(function() {
    "use strict"
    // constructor for Sheep

    Bottle = function Bottle(name, position, size, color, theta) {
        this.shaderProgram = undefined
        this.buffer = undefined
        this.name = name
        this.position = position || [0,0,0]
        this.size = size || 1.0
        this.color = color
        this.theta = theta
    }

    // One of the object necessary function
    Bottle.prototype.init = function(drawingState) {
        this.now = drawingState.realtime
        this.buffer = null
        // Get the gl content
        var gl=drawingState.gl

        // Share the shader with all trunks
        this.shaderProgram = twgl.createProgramInfo(gl, ["glass-vs", "glass-fs"]);

        // Process the vertex and normal array
        /* 
        var preVertexes = LoadedOBJFiles["beer.obj"].vertices
        var preNormal = LoadedOBJFiles["beer.obj"].normals
        console.log(preVertexes)
        console.log(preNormal)
        var vertex = []
        var normal = []
        var vertexColorsRaw = []
        var myCoord = []

        for (var i = 0; i < preVertexes.length; i++){
            vertex.push(...preVertexes[i])
            // Dont care color and tex coord
            vertexColorsRaw.push(...[1,1,1])
            myCoord.push(...[1,1])
        }
        console.log(vertex)
        console.log(normal)
        */
        

        this.texture = twgl.createTexture(gl, {
            target: gl.TEXTURE_2D_ARRAY,
            src: image_negy
        })

        
        var arrays = {
            vpos : {numComponents : 3,
                    data : bottle_data["Mesh"]["vertex"]["data"]},
            vnormal : {numComponents : 3,
                      data : bottle_data["Mesh"]["normal"]["data"]},
            vcolor : {numComponents : 3,
                      data : bottle_data["Mesh"]["color"]["data"]},
            vTexCoord : {numComponents : 2,
                      data : bottle_data["Mesh"]["texcoord"]["data"]}
        }
        
        /*
        var arrays = {
            vpos : {numComponents : 3,
                    data : vertex},
            vnormal : {numComponents : 3,
                      data : normal},
            vcolor : {numComponents : 3,
                      data : vertexColorsRaw},
            vTexCoord : {numComponents : 2, data :myCoord}
        }
        */

        this.buffer = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
    }

    Bottle.prototype.draw = function(drawingState) {
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

    Bottle.prototype.center = function(drawingState) {
        return this.position
    }
})()
