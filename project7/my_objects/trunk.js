/**
 * Created by Jay Wong on 11/19/17.
 */

// Global object list
var grobjects = grobjects || []
var Trunk = undefined
var m4 = m4 || twgl.m4
var v3 = v3 || twgl.v3

// Helper functions

// Get the vertex from a circle from my P6
function getCirclePoints(center, radius, numOfPoints){
    // Center information
    var xt = center[0], yt = center[1], zt = center[2]
    var xb = radius, yb = 0, zb = radius
    var theta = Math.PI / 2
    var phi = 0

    var location = []
    var points = []

    phi = 0
    points.push([xt + xb * Math.sin(theta) * Math.cos(phi),
                 yt + yb * Math.cos(theta),
                 zt + zb * Math.sin(theta) * Math.sin(phi)])
    for (phi = (1/(numOfPoints/2)) * Math.PI; phi <= 2 * Math.PI;
         phi += (1/(numOfPoints/2)) * Math.PI){
        location = [xt + xb * Math.sin(theta) * Math.cos(phi),
                    yt + yb * Math.cos(theta),
                    zt + zb * Math.sin(theta) * Math.sin(phi)]
        points.push(location)
    }
    return points
}

// A function to convert an array of triangles into an array of vertexes,
// and an array of color information, it also computes the normal for 
// each triangle in the given space, and append the results into the normal
// raw array.
function triangleToVertex(triangles) {
    var vertexes = []
    var colors = []
    var normals = []
    var cur
    for(var i = 0; i < triangles.length; i++){
        cur = triangles[i]
        vertexes.push(...cur[0], ...cur[1], ...cur[2])
        colors.push(...cur[3], ...cur[3], ...cur[3])

        var norm = v3.normalize(v3.cross(v3.subtract(cur[1], cur[0]),
                                         v3.subtract(cur[2], cur[0])))
        normals.push(...norm, ...norm, ...norm)
    }
    return [vertexes, colors, normals]
}

// Add triangles to draw a circle
// Center would be the center of the bottom circle
function addCylinder(center, radius, num, color, height, triangles){
  
    var topCenter = [center[0], center[1]+height, center[2]]
    var topPoints = getCirclePoints(topCenter, radius, num)
    var bottomPoints = getCirclePoints(center, radius, num)

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
    localTriangles.push([bottomPoints[num-1], topPoints[num-1], bottomPoints[0], color])
    localTriangles.push([topPoints[num-1], topPoints[0], bottomPoints[0], color])

    // Push local triangles into global triangles
    for(var i = 0; i < localTriangles.length; i++){
        triangles.push(localTriangles[i])
    }
}

function printNormal(num, numCir, normals){
    console.log(normals[(num-1)*3*numCir])
    console.log(normals[(num-1)*3*numCir + 1])
    console.log(normals[(num-1)*3*numCir + 2])
}

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
        this.shaderProgram = twgl.createProgramInfo(gl, ["trunk-vs", "trunk-fs"]);
        
        // Add triangles
        addCylinder(this.position, this.radius, this.numCircle,
                    this.color, this.height, triangles)

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
            model: modelM })
        twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffer)
    }
    Trunk.prototype.center = function(drawingState) {
        return this.position
    }
})()

//Trunk(name, position, size, color, radius, numCircle, height)
