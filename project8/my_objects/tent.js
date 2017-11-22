/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Tent = undefined
var m4 = m4 || twgl.m4;
var v3 = v3 || twgl.v3;

// Adding the tent
function addTent(center, width, height, color, triangles, outVertexes=null){
    var topCenter = [center[0], center[1]+height, center[2]]
    var vertexes = [[center[0]-width/2, center[1], center[2]+width/2],
                    [center[0]+width/2, center[1], center[2]+width/2],
                    [center[0]+width/2, center[1], center[2]-width/2],
                    [center[0]-width/2, center[1], center[2]-width/2]]

    // Add Four triangles
    for(var i = 0; i < 4; i++){
        triangles.push([topCenter, vertexes[i], vertexes[(i+1)%4], color])
    }

    // Output the vertexes
    if(outVertexes){
        outVertexes.push(topCenter)
        outVertexes.push(...vertexes)
    }
}

(function() {
    "use strict"

    var tentShaderProgram = undefined
    var tentBuffers = undefined
    var poleShaderProgram = undefined
    var poleBuffers = undefined

    // constructor for Trunk
    Tent = function Tent(name, position, size, color, width, height) {
        this.name = name
        this.position = position || [0,0,0]
        this.size = size || 1.0
        this.color = color || [.7,.8,.9]
        this.width = width
        this.height = height
        this.vertexes = []
        this.poleOffset = 0.2
        this.poleColor = [160/255, 160/255, 160/255]
        this.poleRadius = 0.1
        this.poleCircleNum = 16
    }

    // One of the object necessary function
    Tent.prototype.init = function(drawingState) {
        // Get the gl content
        var gl=drawingState.gl
        var triangles = []
        var vertexPosRaw = []
        var vertexColorsRaw = []
        var vertexNormalRaw = []
        
        // Use the trunk shader for tent
        if (!tentShaderProgram) {
            tentShaderProgram = twgl.createProgramInfo(gl, ["trunk-vs", "trunk-fs"])
        }
        if (!poleShaderProgram) {
            poleShaderProgram = twgl.createProgramInfo(gl, ["pole-vs", "pole-fs"])
        }

        if (!tentBuffers) {
            // Add triangles
            addTent(this.position, this.width, this.height, this.color,
                    triangles, this.vertexes)

            // Convert triangles to webgl array info
            var results = triangleToVertex(triangles)
            vertexPosRaw.push(...results[0])
            vertexColorsRaw.push(...results[1])
            vertexNormalRaw.push(...results[2])

            var arrays = {
                vpos : {numComponents: 3, data: new Float32Array(vertexPosRaw)},
                vnormal : {numComponents:3, data: new Float32Array(vertexNormalRaw)},
                vcolor : {numComponents: 3, data: new Float32Array(vertexColorsRaw)}
            }

            tentBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
        }

        if (!poleBuffers) {
            // Clear the cache
            triangles = []
            vertexPosRaw = []
            vertexColorsRaw = []
            vertexNormalRaw = []

            // Add triangles
            // Compute the length of each pole
            var poleVertexes = []
            for(var i = 0; i < this.vertexes.length; i++){
                poleVertexes[i] = [this.vertexes[i][0] + this.poleOffset,
                                   this.vertexes[i][1],
                                   this.vertexes[i][2] + this.poleOffset]
            }
            
            var poleHeight = v3.length(v3.subtract(this.vertexes[0],
                this.vertexes[1]))
        

            addCylinderRotate(this.vertexes[1], this.poleRadius, this.poleCircleNum,
                this.poleColor, poleHeight, triangles,
                m4.axisRotation(v3.subtract(this.vertexes[4],
                    this.vertexes[2]), Math.PI/4))

            addCylinderRotate(this.vertexes[2], this.poleRadius, this.poleCircleNum,
                this.poleColor, poleHeight, triangles,
                m4.axisRotation(v3.subtract(this.vertexes[1],
                    this.vertexes[3]), Math.PI/4))

            addCylinderRotate(this.vertexes[3], this.poleRadius, this.poleCircleNum,
                this.poleColor, poleHeight, triangles,
                m4.axisRotation(v3.subtract(this.vertexes[2],
                    this.vertexes[4]), Math.PI/4))

            addCylinderRotate(this.vertexes[4], this.poleRadius, this.poleCircleNum,
                this.poleColor, poleHeight, triangles,
                m4.axisRotation(v3.subtract(this.vertexes[3],
                    this.vertexes[1]), Math.PI/4))


            // Convert triangles to webgl array info
            var results = triangleToVertex(triangles)
            vertexPosRaw.push(...results[0])
            vertexColorsRaw.push(...results[1])
            vertexNormalRaw.push(...results[2])

            var arrays = {
                vpos : {numComponents: 3, data: new Float32Array(vertexPosRaw)},
                vnormal : {numComponents:3, data: new Float32Array(vertexNormalRaw)},
                vcolor : {numComponents: 3, data: new Float32Array(vertexColorsRaw)}
            }

            poleBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays)
        }
    }

    Tent.prototype.draw = function(drawingState) {
        // we make a model matrix to place the tent in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size])
        twgl.m4.setTranslation(modelM,this.position,modelM)

        var gl = drawingState.gl

        // Draw the tent
        gl.useProgram(tentShaderProgram.program)

        // Bounding buffers
        twgl.setBuffersAndAttributes(gl, tentShaderProgram, tentBuffers)

        // Set up uniforms
        twgl.setUniforms(tentShaderProgram,{
            view: drawingState.view,
            proj: drawingState.proj,
            lightdir: drawingState.sunDirection,
            model: modelM })

        // Draw call
        twgl.drawBufferInfo(gl, gl.TRIANGLES, tentBuffers)

        // Draw the poles
        gl.useProgram(poleShaderProgram.program)

        // Bounding buffers
        twgl.setBuffersAndAttributes(gl, poleShaderProgram, poleBuffers)

        // Set up uniforms
        twgl.setUniforms(poleShaderProgram,{
            view: drawingState.view,
            proj: drawingState.proj,
            lightdir: drawingState.sunDirection,
            model: modelM })

        // Draw call
        twgl.drawBufferInfo(gl, gl.TRIANGLES, poleBuffers)

    }

    Tent.prototype.center = function(drawingState) {
        return this.position
    }
})()

// Tent(name, position, size, color, width, height)



