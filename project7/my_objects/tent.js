/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Tent = undefined
var m4 = m4 || twgl.m4
var v3 = v3 || twgl.v3
//var SpinningCube = undefined;


// Helper functions

// Add triangles to draw a circle
// Center would be the center of the bottom circle
// This function adds rotation transform
function addCylinderRotate(center, radius, num, color, height, triangles,
                           Tx_rotate){
    var Tlocal_to_tent = m4.multiply(Tx_rotate, m4.translation(center))
    var topCenter = [center[0], center[1]+height, center[2]]
    var topCenter = [0, height, 0]
    var center = [0, 0, 0]
    var topPoints = getCirclePoints(topCenter, radius, num)
    var bottomPoints = getCirclePoints(center, radius, num)

    // Transform all vertex to the new position
    center = m4.transformPoint(Tlocal_to_tent, center)
    topCenter = m4.transformPoint(Tlocal_to_tent, topCenter)
    for(var i = 0; i < num; i++){
        topPoints[i] = m4.transformPoint(Tlocal_to_tent, topPoints[i])
        bottomPoints[i] = m4.transformPoint(Tlocal_to_tent, bottomPoints[i])
    }

    var localTriangles = []

    // Add triangles for the top circle
    var cur = color
    for(var i = 0; i < num - 1; i++){
        localTriangles.push([topPoints[i], topCenter, topPoints[i+1], color])
    }
    // Add the last one to close the plane
    localTriangles.push([topPoints[num-1], topCenter, topPoints[0], color])

    // Add triangles for the bottom circle
    // Reverse the order of adding vertexes
    for(var i = 0; i < num - 1; i++){
        localTriangles.push([bottomPoints[i], bottomPoints[i+1], center, color])
    }

    // Add the last one to close the plane
    localTriangles.push([bottomPoints[num-1],bottomPoints[0], center, color])

    // Add triangles that connect both circles
    for(var i = 0; i < num - 1; i++){
        localTriangles.push([bottomPoints[i], topPoints[i], bottomPoints[i+1], color])
        localTriangles.push([topPoints[i], topPoints[i+1], bottomPoints[i+1], color])
    }

    // Finish up with triangles off the loop
    localTriangles.push([bottomPoints[num-1], topPoints[num-1],
                         bottomPoints[0], color])
    localTriangles.push([topPoints[num-1], topPoints[0], bottomPoints[0], color])

    // Push local triangles into global triangles
    for(var i = 0; i < localTriangles.length; i++){
        triangles.push(localTriangles[i])
    }
}

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

function printNormal(num, numCir, normals){
    console.log(normals[(num-1)*3*numCir])
    console.log(normals[(num-1)*3*numCir + 1])
    console.log(normals[(num-1)*3*numCir + 2])
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



