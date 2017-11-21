// Global Helper functions

function printNormal(num, numCir, normals){
    console.log(normals[(num-1)*3*numCir])
    console.log(normals[(num-1)*3*numCir + 1])
    console.log(normals[(num-1)*3*numCir + 2])
}

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

// Add triangles to draw a circle
// Center would be the center of the bottom circle
// This function adds rotation transform
function addCylinderRotate(center, radius, num, color, height, triangles,
                           Tx_rotate){
    var Tlocal_to_tent = m4.multiply(Tx_rotate, m4.translation(center))
    var topCenter = [center[0], center[1]+height, center[2]]
    topCenter = [0, height, 0]
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
        localTriangles.push([bottomPoints[i], topPoints[i],
            bottomPoints[i+1], color])
        localTriangles.push([topPoints[i], topPoints[i+1],
            bottomPoints[i+1], color])
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

// Add cone triangles
// Similar to draw cylinder, but we connect bottom circle points to a single 
// top point
function addCone(center, radius, num, color, height, triangles, Tx_rotate){

    var Tlocal_to_world = m4.multiply(Tx_rotate, m4.translation(center))
    var topCenter = [0, height, 0]
    center = [0, 0, 0]
    var bottomPoints = getCirclePoints(center, radius, num)
    
    // Transform all vertex to the new position
    topCenter = m4.transformPoint(Tlocal_to_world, topCenter)
    center = m4.transformPoint(Tlocal_to_world, center)
    for(var i = 0; i < num; i++){
        bottomPoints[i] = m4.transformPoint(Tlocal_to_world, bottomPoints[i])
    }

    var localTriangles = []

    // Add triangles for the top circle
    var cur = color

    // Add triangles for the bottom circle
    // Reverse the order of adding vertexes
    for(var i = 0; i < num - 1; i++){
        localTriangles.push([bottomPoints[i], bottomPoints[i+1], center, color])
    }

    // Add the last one to close the plane
    localTriangles.push([bottomPoints[num-1],bottomPoints[0], center, color])

    // Add triangles that connect top and bottom circles
    for(var i = 0; i < num - 1; i++){
        localTriangles.push([topCenter, bottomPoints[i+1], bottomPoints[i], color])
    }

    // Finish up with triangles off the loop
    localTriangles.push([topCenter, bottomPoints[num-1], bottomPoints[0], color])

    // Push local triangles into global triangles
    for(var i = 0; i < localTriangles.length; i++){
        triangles.push(localTriangles[i])
    }
}

// Compute the position and height for each layer of pine trees
function computePineTree(basePosition, heightRatio, finalHeight,
                         baseRadius, numLayer){
    var height = finalHeight * (1-heightRatio)
    var perHeight = height / numLayer
    var firstLayer = [basePosition[0], basePosition[1] + height/2, basePosition[2]]
    var centers = []
    var radius = []
    var heights = []
    for (var i = 0; i < numLayer; i++){
        centers.push([firstLayer[0], firstLayer[1] + perHeight * i,
                      firstLayer[2]])
        radius.push(baseRadius * (1 - i / numLayer))
        heights.push(perHeight + 2 * perHeight / numLayer)
    }
    return [centers, radius, heights]
}
