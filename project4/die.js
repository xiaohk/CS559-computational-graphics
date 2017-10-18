function Die(){"use strict"
    var canvas = document.getElementById('myCanvas')
    var context = canvas.getContext('2d')
    var m4 = twgl.m4
    var v3 = twgl.v3
    var slider1 = document.getElementById('slider1')
    slider1.value = 0 
    var slider2 = document.getElementById('slider2')
    slider2.value = 0 
    var slider3 = document.getElementById('slider3')
    slider3.value = 400 
    var slider4 = document.getElementById('slider4')
    slider4.value = 300

    var angle1 = Math.PI/2
    var angle2 = 0 

    // Move object to the center
    var offsetX = 250
    var offsetY = 250
    var usePerspective = checkbox1.checked

    // Triangle containers
    var triangles = []

    // Color variables
    var light = v3.normalize([0,-1,-1])
    var dieColor = [240, 60, 90]
    var topColor = [192, 192, 192]
    var circleColor = [203, 203, 203]
    var dieColorString = colorToString(dieColor)
    var topColorString = colorToString(topColor)
    var circleColorString = colorToString(circleColor)

    // Helper function to write color in string (RGB)
    function colorToString(color){
        return "rgb(" + Math.floor(color[0]) + "," + 
                        Math.floor(color[1]) + "," + 
                        Math.floor(color[2]) + ")"
    }

    function stringToColor(color){
        // Use regular expression here
        var reg = /^rgb\((\d+),(\d+),(\d+)\)/
        var result = reg.exec(color)
        if (result == null){
            console.log(color)
        }
        return [Math.floor(result[1]), Math.floor(result[2]),
                Math.floor(result[3])]
    }

    // Implementation of merge sort
    function mergeSort (arr) {
        if (arr.length === 1) {
            // return once we hit an array with a single item
            return arr
        }

        const middle = Math.floor(arr.length / 2)
        const left = arr.slice(0, middle) 
        const right = arr.slice(middle)

        return merge(
            mergeSort(left),
            mergeSort(right)
        )
    }

    // Merge from bottom to top
    function merge (left, right) {
        let result = []
        let indexLeft = 0
        let indexRight = 0

        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft] < right[indexRight]) {
            result.push(left[indexLeft])
            indexLeft++
            } else {
                result.push(right[indexRight])
                indexRight++
            }
        }
        return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
    }

    // Helper function to call m4.multiply()
    function times(m1, m2){
        return m4.multiply(m1, m2)
    }

    // Helper funciton to to moveTo in 3D
    function moveToTx(x, y, z, Tx){
        var loc = [x, y, z]
        var locTx = m4.transformPoint(Tx, loc)
        // We dont need to flip y and change origin here if using viwport
        context.moveTo(locTx[0], locTx[1])
    }

    // Helper function to do moveTo in 3D
    function lineToTx(x, y, z, Tx){
        var loc = [x, y, z]
        var locTx = m4.transformPoint(Tx,loc)
        // We don't need to flip y or change origin here
        context.lineTo(locTx[0], locTx[1])
    }

    // Helper function to draw a triangle on the context
    // The argument triangle should be like [[first vertex], [second vertex],
    // [third vertex], color]
    function drawTriangle(triangle,Tx){
        context.beginPath()
        context.fillStyle = triangle[3]
        context.strokeStyle = triangle[3]
        moveToTx(triangle[0][0], triangle[0][1], triangle[0][2],Tx)
        lineToTx(triangle[1][0], triangle[1][1], triangle[1][2],Tx)
        lineToTx(triangle[2][0], triangle[2][1], triangle[2][2],Tx)
        context.closePath()
        context.fill()
        context.stroke()
    }

    function drawNormal(Tx){
        context.strokeStyle = "red"
        for(var i = 0; i < triangles.length; i++){
            var cur = triangles[i]
            var mid = [(cur[0][0] + cur[1][0] + cur[2][0]) / 3,
                       (cur[0][1] + cur[1][1] + cur[2][1]) / 3,
                       (cur[0][2] + cur[1][2] + cur[2][2]) / 3]
            var trans = [m4.transformPoint(Tx, cur[0]),
                         m4.transformPoint(Tx, cur[1]),
                         m4.transformPoint(Tx, cur[2])]
            var norm = v3.normalize(v3.cross(v3.subtract(trans[1], trans[0]),
                                             v3.subtract(trans[2], trans[0])))
            var longNorm = v3.mulScalar(norm, 100)
            context.beginPath()
            moveToTx(mid[0], mid[1], mid[2], Tx)
            lineToTx(mid[0]+longNorm[0],mid[1]+longNorm[1],mid[2]+longNorm[2],Tx)
            context.closePath()
            context.stroke()
        }
    }

    // Draw the axes
    function drawAxes(Tx){
        context.strokeStyle = "black"
        // X axis
        context.beginPath()
        moveToTx(0,0,0,Tx)
        lineToTx(50,0,0,Tx)
        context.stroke()
        context.closePath()
        
        // Y axis
        context.beginPath()
        moveToTx(0,0,0,Tx)
        lineToTx(0,150,0,Tx)
        context.stroke()
        context.closePath()

        // Z axis
        context.beginPath()
        moveToTx(0,0,0,Tx)
        lineToTx(0,0,250,Tx)
        context.stroke()
        context.closePath()
    }

    // Add triangles into var triangles
    function initGeometry(){
        // Front
        triangles.push([[100,100,100],[100,100,300],[100,300,300],"red",0.0])
        triangles.push([[100,100,100],[100,300,300],[100,300,100],"blue",0.0])
        // Back
        triangles.push([[300,100,100],[300,100,300],[300,300,300],"green",0.0])
        triangles.push([[300,100,100],[300,300,300],[300,300,100],"purple",0.0])
        // Top
        triangles.push([[100,300,100],[300,300,100],[100,300,300],"black",0.0])
        triangles.push([[100,300,300],[300,300,100],[300,300,300],"yellow",0.0])
        // Bottom
        triangles.push([[100,100,100],[300,100,100],[100,100,300],"orange",0.0])
        triangles.push([[100,100,300],[300,100,100],[300,100,300],"pink",0.0])
        // Left
        triangles.push([[100,100,300],[100,300,300],[300,300,300],"coral",0.0])
        triangles.push([[100,100,300],[300,100,300],[300,300,300],"aquamarine",0.0])
        // Right
        triangles.push([[100,100,100],[100,300,100],[300,300,100],"coral",0.0])
        triangles.push([[100,100,100],[300,100,100],[300,300,100],"aquamarine",0.0])
    }

    // Add triangles for a cube based on the center point and length
    function addCube(center, length, color, encode, Tx){
        var baseX = center[0] - length / 2
        var baseY = center[1] - length / 2
        var baseZ = center[2] - length / 2
        var localTriangles = []
        // Front
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX,baseY+length,baseZ+length],
                        [baseX,baseY,baseZ+length], color, 0.0, 1])
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX,baseY+length,baseZ],
                        [baseX,baseY+length,baseZ+length], color, 0.0, 1])
        // Back
        localTriangles.push([[baseX+length,baseY,baseZ],
                        [baseX+length,baseY,baseZ+length],
                        [baseX+length,baseY+length,baseZ+length],color,0.0, 1])
        localTriangles.push([[baseX+length,baseY,baseZ],
                        [baseX+length,baseY+length,baseZ+length],
                        [baseX+length,baseY+length,baseZ],color,0.0, 1])
        // Top
        localTriangles.push([[baseX,baseY+length,baseZ],
                        [baseX+length,baseY+length,baseZ],
                        [baseX,baseY+length,baseZ+length],color,0.0, 1])
        localTriangles.push([[baseX,baseY+length,baseZ+length],
                        [baseX+length,baseY+length,baseZ],
                        [baseX+length,baseY+length,baseZ+length],color,0.0, 1])
        // Bottom
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX,baseY,baseZ+length],
                        [baseX+length,baseY,baseZ], color,0.0, 1])
        localTriangles.push([[baseX,baseY,baseZ+length],
                        [baseX+length,baseY,baseZ+length],
                        [baseX+length,baseY,baseZ], color,0.0, 1])
        // Left
        localTriangles.push([[baseX,baseY,baseZ+length],
                        [baseX,baseY+length,baseZ+length],
                        [baseX+length,baseY+length,baseZ+length],color,0.0, 1])
        localTriangles.push([[baseX,baseY,baseZ+length],
                        [baseX+length,baseY+length,baseZ+length],
                        [baseX+length,baseY,baseZ+length],color,0.0, 1])
        // Right
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX+length,baseY+length,baseZ],
                        [baseX,baseY+length,baseZ], color,0.0, 1])
        localTriangles.push([[baseX,baseY,baseZ],[baseX+length,baseY,baseZ],
                        [baseX+length,baseY+length,baseZ],color,0.0, 1])

        // Encode those local triangles
        encode(Tx, localTriangles)
        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }

        // Add circles on each plane
        var centers = 
        [[[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length*1/3,baseY+length*2/10,baseZ+length], m4.rotationX(Math.PI/2)],
        [[baseX+length*1/3,baseY+length*5/10,baseZ+length], m4.rotationX(Math.PI/2)],
        [[baseX+length*1/3,baseY+length*8/10,baseZ+length], m4.rotationX(Math.PI/2)],
        [[baseX+length*2/3,baseY+length*2/10,baseZ+length], m4.rotationX(Math.PI/2)],
        [[baseX+length*2/3,baseY+length*5/10,baseZ+length], m4.rotationX(Math.PI/2)],
        [[baseX+length*2/3,baseY+length*8/10,baseZ+length], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)],
        [[baseX+length/2,baseY+length/2,baseZ], m4.rotationX(Math.PI/2)]]
        // Front
        /*
        var center = [baseX+length/2,baseY+length/2,baseZ]
        addDieCircle(center, 20, 16, encodeDieCircle, circleColorString,
                  Tx, m4.rotationX(Math.PI/2))
        // Back
        center = [baseX+length/2,baseY+length/2,baseZ+length]
        addDieCircle(center, 20, 16, encodeDieCircle, circleColorString,
                  Tx, m4.rotationX(Math.PI/2))
        */
        for(var i = 0; i < centers.length; i++){
            addDieCircle(centers[i][0], 20, 16, encodeDieCircle, circleColorString,
                  Tx, centers[i][1])
        }

    }

    // Add triangles to draw a circle
    function addDieCircle(center, radius, num, encoder, color, Tx_encode, Tx_rotate){
        var Tlocal_to_die = times(Tx_rotate, m4.translation(center))
        var points = getCircleBottomPoints([0,0,0], radius, num)
        var localTriangles = []
        for(var i = 0; i < points.length - 1; i++){
            localTriangles.push([
                m4.transformPoint(Tlocal_to_die, [0,0,0]),
                m4.transformPoint(Tlocal_to_die, points[i],),
                m4.transformPoint(Tlocal_to_die, points[i+1]),
                color, 0.0, 1])
        }
        // Add the last one to close the plane
        localTriangles.push([
                m4.transformPoint(Tlocal_to_die, [0,0,0]),
                m4.transformPoint(Tlocal_to_die, points[points.length-1],),
                m4.transformPoint(Tlocal_to_die, points[0]),
                color, 0.0, 1])

        // Encode the triangles
        encoder(Tx_encode, localTriangles)
        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    // Get the triangle bottom points
    function getCircleBottomPoints(center, radius, numOfPoints){
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

    // Add pointers for the tapers on the top
    // The order of drawing triangles matters
    function addTop(top, center, radius, num, encoder, Tx, color1, color2){
        var points = getCircleBottomPoints(center, radius, num)
        var localTriangles = []
        var curColor
        // Stop before the last one
        for(var i = 0; i < points.length - 1; i++){
            if ((i) % 2 == 0){
                curColor = color2
            } else {
                curColor = color1
            }
            localTriangles.push([top, points[i], points[i+1], curColor, 0.0, 0])
        }
        // Add the last one to close the plane
        localTriangles.push([top, points[points.length-1], points[0],
                             color1, 0.0, 0])
        // Encode those triangles
        encoder(Tx, localTriangles)
        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    // Add triangles for the tapers on the bottom
    // The order of drawing triangles matters
    function addBottom(top, center, radius, num, encoder, Tx){
        var points = getCircleBottomPoints(center, radius, num)
        var localTriangles = []
        // Stop before the last one
        for(var i = 0; i < points.length - 1; i++){
            localTriangles.push([top, points[i+1], points[i], topColorString, 0.0, 0])
        }
        // Add the last one to close the plane
        localTriangles.push([top, points[0], points[points.length-1],
                       topColorString, 0.0, 0])
        // Encode those triangles
        encoder(Tx, localTriangles)
        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    // Add triangles to draw a circle
    function addCircle(center, radius, num, encoder, Tx, color1, color2){
        var points = getCircleBottomPoints(center, radius, num)
        var localTriangles = []
        var curColor
        for(var i = 0; i < points.length - 1; i++){
            if ((i) % 2 == 0){
                curColor = color2
            } else {
                curColor = color1
            }

            localTriangles.push([center, points[i], points[i+1], curColor, 0.0, 0])
        }
        // Add the last one to close the plane
        localTriangles.push([center, points[points.length-1], points[0],
                             color1, 0.0, 0])
        // Encode the triangles
        encoder(Tx, localTriangles)
        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    // Define different triangle encoders for different positions
    function encodeCenter(Tx, triangles){
        for(var i = 0; i < triangles.length; i++){
            // Compute the middle point of a triangle
            var cur = triangles[i]
            var mid = [(cur[0][0] + cur[1][0] + cur[2][0]) / 3,
                       (cur[0][1] + cur[1][1] + cur[2][1]) / 3,
                       (cur[0][2] + cur[1][2] + cur[2][2]) / 3]
            // Transfer the mid from model to camera
            var mid_camera = m4.transformPoint(Tx, mid)
            // Record the z value
            cur[4] = mid_camera[2]
        }
    }

    function encodeFirst(Tx, triangles){
        for(var i = 0; i < triangles.length; i++){
            var cur = triangles[i]
            // Record the z value
            cur[4] = m4.transformPoint(Tx, cur[0])[2]
        }
    }

    function encodeDieCircle(Tx, triangles){
        for(var i = 0; i < triangles.length; i++){
            var cur = triangles[i]
            var mid = [(cur[1][0] + cur[2][0]) / 2,
                       (cur[1][1] + cur[2][1]) / 2,
                       (cur[1][2] + cur[2][2]) / 2]
            // Transfer the mid from model to camera
            var mid_camera = m4.transformPoint(Tx, mid)
            // Add 1 to make the order of circle always higher than the plane
            cur[4] = mid_camera[2] + 50 
        }
    }

    function addSpinTop(Tx){
        addTop([0,400,0], [0,100,0], 100, 32, encodeCenter, Tx,
               topColorString, topColorString)
        addTop([0,150,0], [0,50,0], 300, 64, encodeFirst, Tx,
               topColorString, dieColorString)
        addCircle([0,50,0], 300, 64, encodeFirst, Tx,
               topColorString, dieColorString)
        addBottom([0,-350,0], [0,50,0], 100, 32, encodeCenter, Tx)
    }

    // Add shader to each triangles
    function addShader(Tx0, Tx1, ambient, diffuse){
        for(var i = 0; i < triangles.length; i++){
            // Use different Tx for different triangles space
            var localTx
            var cur = triangles[i]
            if (cur[5] == 0){
                localTx = Tx0
            } else if (cur[5] == 1){
                localTx = Tx1
            }
            var color = stringToColor(cur[3])
            // Compute ambient color
            var aColor = v3.mulScalar(color, ambient)
            // Compute diffuse color
            var trans = [m4.transformPoint(localTx, cur[0]),
                         m4.transformPoint(localTx, cur[1]),
                         m4.transformPoint(localTx, cur[2])]
            //trans = cur
            var norm = v3.normalize(v3.cross(v3.subtract(trans[1], trans[0]),
                                             v3.subtract(trans[2], trans[0])))
            var dColor = v3.mulScalar(color, diffuse * 
                                      (0.5 * (1 + v3.dot(norm, light))))
            triangles[i][3] = colorToString(v3.add(aColor, dColor))
        }
    }

    // Encode triangles into their distance
    function encodeTriangleCenter(Tmodel_to_camera, localTriangles){
        for(var i = 0; i < localTriangles.length; i++){
            // Compute the middle point of a triangle
            var cur = localTriangles[i]
            var mid = [(cur[0][0] + cur[1][0] + cur[2][0]) / 3,
                       (cur[0][1] + cur[1][1] + cur[2][1]) / 3,
                       (cur[0][2] + cur[1][2] + cur[2][2]) / 3]
            // Transfer the mid from model to camera
            var mid_camera = m4.transformPoint(Tmodel_to_camera, mid)
            // Record the z value
            cur[4] = mid_camera[2]
        }
    }

    // Sort triangles in the var trainalge
    function sortGeometry(){
        triangles.sort(function(t1, t2){
            return t1[4] - t2[4]
        })
    }

    // Draw the triangles in the var triangle
    function drawGeometry(Tx0, Tx1){
        var localTx
        var cur
        for(var i = 0; i < triangles.length; i++){
            cur = triangles[i]
            if (cur[5] == 0){
                localTx = Tx0
            } else if (cur[5] == 1){
                localTx = Tx1
            }
            drawTriangle(cur, localTx)
        }
    }

    function drawDie(){
        // Clear the canvas
        canvas.width = canvas.width
        // Super super important! Init your triangles!!!
        triangles = []
        var angle1 = slider1.value * 0.01 * Math.PI
        var angle2 = slider2.value * 0.01 * Math.PI
        var angle3 = 0

        // Basis of the world coordinate
        var axis = [0,1,0]
        var eye = [700 * Math.cos(angle1), slider3.value, 700 * Math.sin(angle1)]
        var target = [0,0,0]
        var up = [0,1,0]

        // Transformations
        var Tworld_to_camera = m4.inverse(m4.lookAt(eye, target, up))
        var Tmodel_to_world = m4.axisRotation(axis, angle2)
        var Tdie_to_world = m4.axisRotation([1,1,1], angle3)
        var Tmodel_to_camera = times(Tmodel_to_world, Tworld_to_camera)
        var Tdie_to_camera = times(Tdie_to_world, Tworld_to_camera)
        var Tdie_to_model = times(Tdie_to_world, m4.inverse(Tmodel_to_world))
        // var Tprojection

        // Doing zooming in different projection mode
        /*
        var zooming_scale = (slider4.value - slider4.min) /
                                (slider4.max - slider4.min)
        if (usePerspective){
            var zooming = zooming_scale * 6 + 2
            Tprojection=m4.perspective(Math.PI/zooming, 1, 5, 400)
        } else {
            var zooming = (1 - zooming_scale) * 300 + 90
            Tprojection = m4.ortho(-zooming, zooming, 
                -zooming, zooming, -2, 2)
        }
        */
        var Tprojection = m4.perspective(Math.PI/3, 1, 1, 400)
        // var Tprojection=m4.ortho(-400, 400, -400, 400, -2, 2);

        // Viewport transformations
        var Tviewport = m4.multiply(m4.scaling([200,-200,200]),
                                    m4.translation([offsetX, offsetY, 0]))
    
        var Tworld_to_view = m4.multiply(m4.multiply(Tworld_to_camera,
                                                     Tprojection),
                                         Tviewport)
        var Tmodel_to_view = m4.multiply(Tmodel_to_world, Tworld_to_view)
        var Tdie_to_view = times(Tdie_to_world, Tworld_to_view)

        // Actually drawing
        
        //initGeometry()
        //addCube([80,-300,200], 100, dieColorString, encodeCenter, Tdie_to_camera)
        addCube([0,0,0], 200, dieColorString, encodeCenter, Tdie_to_camera)
        //addSpinTop(Tmodel_to_camera)
        
        // encodeTriangleCenter(Tmodel_to_camera, triangles)
        sortGeometry()
        addShader(Tmodel_to_world, Tdie_to_world, 0.05, 0.95)
        drawGeometry(Tmodel_to_view, Tdie_to_view)
        //drawNormal(Tmodel_to_view)
        //drawAxes(Tworld_to_view)
        //getCircleBottomPoints(Tmodel_to_view)
        drawAxes(Tmodel_to_view) 
        //drawGeometry(Tmodel_to_view)
    }

    slider1.addEventListener("input",drawDie)
    slider2.addEventListener("input",drawDie)
    slider3.addEventListener("input",drawDie)
    slider3.addEventListener("input",drawDie)

    // Add checkbox listener
    var checkbox_1 = document.querySelector("input[id=checkbox1]");
    checkbox_1.addEventListener('change', drawDie)
    drawDie()
}

window.onload = Die
