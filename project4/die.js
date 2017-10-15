function Die(){"use strict"
    var canvas = document.getElementById('myCanvas')
    var context = canvas.getContext('2d')
    var m4 = twgl.m4
    var slider1 = document.getElementById('slider1')
    slider1.value = 0 
    var slider2 = document.getElementById('slider2')
    slider2.value = 40
    var slider3 = document.getElementById('slider3')
    slider3.value = 0
    var slider4 = document.getElementById('slider4')
    slider4.value = 300

    var angle1 = Math.PI/2
    var angle2 = 0

    // Move object to the center
    var offsetX = 250
    var offsetY = 250

    // Triangle containers
    var triangles = []

    var usePerspective = checkbox1.checked

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
        moveToTx(triangle[0][0], triangle[0][1], triangle[0][2],Tx)
        lineToTx(triangle[1][0], triangle[1][1], triangle[1][2],Tx)
        lineToTx(triangle[2][0], triangle[2][1], triangle[2][2],Tx)
        context.closePath()
        context.fill()
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
        triangles.push([[100,100,100],[100,100,300],[100,300,300],"red",0.0])
        triangles.push([[100,100,100],[100,300,300],[100,300,100],"blue",0.0])
        triangles.push([[300,100,100],[300,100,300],[300,300,300],"green",0.0])
        triangles.push([[300,100,100],[300,300,300],[300,300,100],"purple",0.0])
    }

    // Draw the triangles in the var triangle
    function drawGeometry(Tx){
        for(var i = 0; i < triangles.length; i++){
            drawTriangle(triangles[i], Tx)
        }
    }

    function drawDie(){
        // Clear the canvas
        canvas.width = canvas.width
        var angle1 = slider1.value * 0.01 * Math.PI

        // Basis of the world coordinate
        var axis = [1,1,1]
        var eye = [500 * Math.cos(angle1), 200, 500 * Math.sin(angle1)]
        var target = [0,0,0]
        var up = [0,1,0]

        // Transformations
        var Tworld_to_camera = m4.inverse(m4.lookAt(eye, target, up))
        var Tmodel_to_world = m4.axisRotation(axis, angle2)
        var Tmodel_to_camera = times(Tmodel_to_world, Tworld_to_camera)
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
        // var Tprojection = m4.perspective(Math.PI/3, 1, 5, 400)
        var Tprojection=m4.ortho(-400, 400, -400, 400, -2, 2);

        // Viewport transformations
        var Tviewport = m4.multiply(m4.scaling([200,-200,200]),
                                    m4.translation([offsetX, offsetY, 0]))
    
        var Tworld_to_view = m4.multiply(m4.multiply(Tworld_to_camera,
                                                     Tprojection),
                                         Tviewport)
        var Tmodel_to_view = m4.multiply(Tmodel_to_world, Tworld_to_view)

        // Actually drawing
        drawAxes(Tworld_to_view)
        initGeometry()
        drawGeometry(Tmodel_to_view)
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
