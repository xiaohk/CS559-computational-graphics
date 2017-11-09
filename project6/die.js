function Die() {
    // Set up Canvas
    var canvas = document.getElementById("myCanvas")
    var gl = canvas.getContext("webgl")
    var m4 = twgl.m4
    var v3 = twgl.v3

    // Set up HTML interface
    var slider1 = document.getElementById('slider1')
    slider1.value = 0 
    var slider2 = document.getElementById('slider2')
    slider2.value = 5 
    var slider3 = document.getElementById('slider3')
    slider3.value = 400 
    var slider4 = document.getElementById('slider4')
    slider4.value = -71 
    var slider5 = document.getElementById('slider5')
    slider5.value = 0

    var dieView = checkbox1.checked
    var simulateTime = checkbox2.checked
    var changeColor = 1 

    var angle1 = Math.PI/2
    var angle2 = 0 
    var angle3 = 0
    var angle4 = 0
    var angle5 = 0
    var fpsInterval, now, last
    var speed = 0
    var startTime = Date.now()

    // Color variables
    var dieColor = [240/255, 60/255, 90/255]
    var topColor = [192/255, 192/255, 192/255]
    var circleColor = [203/255, 203/255, 203/255]
    var light = v3.normalize([-1,-1,-1])
    var triangles = []

    // Read shader from HTML
    var vertexSource = document.getElementById("vs").text
    var fragmentSource = document.getElementById("fs").text

    // Compile Vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader,vertexSource)
    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader))
        return null
    }
    
    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader,fragmentSource)
    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader))
        return null
    }
    
    // Link vertex shader and fragment shader 
    var shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders")
    }
    gl.useProgram(shaderProgram)
    

    // Get the attribute and uniform JS variables
    shaderProgram.vPosition= gl.getAttribLocation(shaderProgram, "vPosition")
    gl.enableVertexAttribArray(shaderProgram.vPosition)
    
    shaderProgram.vColor = gl.getAttribLocation(shaderProgram, "vColor")
    gl.enableVertexAttribArray(shaderProgram.vColor)

    shaderProgram.vNormal = gl.getAttribLocation(shaderProgram, "vNormal")
    gl.enableVertexAttribArray(shaderProgram.vNormal)
    
    shaderProgram.modelViewMatrix= gl.getUniformLocation(shaderProgram,
        "modelViewMatrix")
    shaderProgram.projectionMatrix= gl.getUniformLocation(shaderProgram,
        "projectionMatrix")
    shaderProgram.normalMatrix = gl.getUniformLocation(shaderProgram,
        "normalMatrix")
    shaderProgram.light = gl.getUniformLocation(shaderProgram,
        "light")
    shaderProgram.time = gl.getUniformLocation(shaderProgram,
        "time")
    shaderProgram.changeColor = gl.getUniformLocation(shaderProgram,
        "changeColor")

    // vertex positions
    var vertexPosRaw = []

    // vertex colors
    var vertexColorsRaw = [] 

    // Normal vectors
    var vertexNormalRaw = []

    // Buffers
    var trianglePosBuffer = gl.createBuffer()
    var colorBuffer = gl.createBuffer()
    var normalBuffer = gl.createBuffer()

    // A function to create and link buffers (pos and color)
    function addBuffer() {
        // Convert property raw arrays to float32array
        var vertexPos = new Float32Array(vertexPosRaw)
        var vertexColors = new Float32Array(vertexColorsRaw)
        var vertexNormal = new Float32Array(vertexNormalRaw)

        // Make pipeline to the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW)
        trianglePosBuffer.itemSize = 3
        trianglePosBuffer.numItems = vertexPos.length / 3

        // Color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW)
        colorBuffer.itemSize = 3
        colorBuffer.numItems = vertexColors.length / 3

        // Normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexNormal, gl.STATIC_DRAW)
        normalBuffer.itemSize = 3
        normalBuffer.numItems = vertexNormal.length / 3
    }

    // Helper function to call m4.multiply()
    function times(m1, m2){
        return m4.multiply(m1, m2)
    }

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
        // Convert integer RGB to Float scale
        return [Number((result[1]/255.0).toFixed(4)),
                Number((result[2]/255.0).toFixed(4)),
                Number((result[3]/255.0).toFixed(4))]
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
    function addTop(top, center, radius, num, color1, color2){
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
            localTriangles.push([top, points[i], points[i+1], curColor])
        }
        // Add the last one to close the plane
        localTriangles.push([top, points[points.length-1], points[0], color1])
      
        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    // Add triangles for the tapers on the bottom
    // The order of drawing triangles matters
    function addBottom(top, center, radius, num){
        var points = getCircleBottomPoints(center, radius, num)
        var localTriangles = []
        // Stop before the last one
        for(var i = 0; i < points.length - 1; i++){
            localTriangles.push([top, points[i+1], points[i], topColor])
        }
        // Add the last one to close the plane
        localTriangles.push([top, points[0], points[points.length-1], topColor])

        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    // Add triangles to draw a circle
    function addCircle(center, radius, num, color1, color2){
        var points = getCircleBottomPoints(center, radius, num)
        var localTriangles = []
        var curColor
        for(var i = 0; i < points.length - 1; i++){
            if ((i) % 2 == 0){
                curColor = color2
            } else {
                curColor = color1
            }

            localTriangles.push([center, points[i], points[i+1], curColor])
        }
        // Add the last one to close the plane
        localTriangles.push([center, points[points.length-1], points[0], color1])

        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
    }

    function addSpinTop(){
        addTop([0,400,0], [0,100,0], 100, 32, topColor, topColor)
        addTop([0,150,0], [0,50,0], 300, 64, topColor, dieColor)
        addCircle([0,50,0], 300, 64, topColor, dieColor)
        addBottom([0,-350,0], [0,50,0], 100, 32)
    }

    // Add triangles for a cube based on the center point and length
    function addCube(center, length, color){
        var baseX = center[0] - length / 2
        var baseY = center[1] - length / 2
        var baseZ = center[2] - length / 2
        var localTriangles = []
        // Front
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX,baseY+length,baseZ+length],
                        [baseX,baseY,baseZ+length], color])
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX,baseY+length,baseZ],
                        [baseX,baseY+length,baseZ+length], color])
        // Back
        localTriangles.push([[baseX+length,baseY,baseZ],
                        [baseX+length,baseY,baseZ+length],
                        [baseX+length,baseY+length,baseZ+length],color])
        localTriangles.push([[baseX+length,baseY,baseZ],
                        [baseX+length,baseY+length,baseZ+length],
                        [baseX+length,baseY+length,baseZ],color])
        // Top
        localTriangles.push([[baseX,baseY+length,baseZ],
                        [baseX+length,baseY+length,baseZ],
                        [baseX,baseY+length,baseZ+length],color])
        localTriangles.push([[baseX,baseY+length,baseZ+length],
                        [baseX+length,baseY+length,baseZ],
                        [baseX+length,baseY+length,baseZ+length],color])
        // Bottom
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX,baseY,baseZ+length],
                        [baseX+length,baseY,baseZ], color])
        localTriangles.push([[baseX,baseY,baseZ+length],
                        [baseX+length,baseY,baseZ+length],
                        [baseX+length,baseY,baseZ], color])
        // Left
        localTriangles.push([[baseX,baseY,baseZ+length],
                        [baseX,baseY+length,baseZ+length],
                        [baseX+length,baseY+length,baseZ+length],color])
        localTriangles.push([[baseX,baseY,baseZ+length],
                        [baseX+length,baseY+length,baseZ+length],
                        [baseX+length,baseY,baseZ+length],color])
        // Right
        localTriangles.push([[baseX,baseY,baseZ],
                        [baseX+length,baseY+length,baseZ],
                        [baseX,baseY+length,baseZ], color])
        localTriangles.push([[baseX,baseY,baseZ],[baseX+length,baseY,baseZ],
                        [baseX+length,baseY+length,baseZ],color])

        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }

        // Add circles
        var zf = 0.1
        var centers = 
        //1
        [[[baseX+length/2,baseY+length/2,baseZ-zf], m4.rotationX(Math.PI/2),1],
        //6
        [[baseX+length*1/3,baseY+length*2/10,baseZ+zf+length],
            m4.rotationX(Math.PI/2),0],
        [[baseX+length*1/3,baseY+length*5/10,baseZ+zf+length],
            m4.rotationX(Math.PI/2),0],
        [[baseX+length*1/3,baseY+length*8/10,baseZ+zf+length],
            m4.rotationX(Math.PI/2),0],
        [[baseX+length*2/3,baseY+length*2/10,baseZ+zf+length],
            m4.rotationX(Math.PI/2),0],
        [[baseX+length*2/3,baseY+length*5/10,baseZ+zf+length],
            m4.rotationX(Math.PI/2),0],
        [[baseX+length*2/3,baseY+length*8/10,baseZ+zf+length],
            m4.rotationX(Math.PI/2),0],
        //2
        [[baseX+length*3/10,baseY+length+zf,baseZ+length*1/3], m4.rotationY(Math.PI/2),0],
        [[baseX+length*7/10,baseY+length+zf,baseZ+length*2/3], m4.rotationY(Math.PI/2),0],
        //5
        [[baseX+length*3/10,baseY-zf,baseZ+length*3/10], m4.rotationY(Math.PI/2),1],
        [[baseX+length*7/10,baseY-zf,baseZ+length*7/10], m4.rotationY(Math.PI/2),1],
        [[baseX+length*3/10,baseY-zf,baseZ+length*7/10], m4.rotationY(Math.PI/2),1],
        [[baseX+length*7/10,baseY-zf,baseZ+length*3/10], m4.rotationY(Math.PI/2),1],
        [[baseX+length*5/10,baseY-zf,baseZ+length*5/10], m4.rotationY(Math.PI/2),1],
        //3
        [[baseX+zf+length,baseY+length*2/10,baseZ+length*2/10],
            m4.rotationZ(Math.PI/2),1],
        [[baseX+zf+length,baseY+length*5/10,baseZ+length*5/10],
            m4.rotationZ(Math.PI/2),1],
        [[baseX+zf+length,baseY+length*8/10,baseZ+length*8/10],
            m4.rotationZ(Math.PI/2),1],
        //4
        [[baseX-zf,baseY+length*3/10,baseZ+length*3/10], m4.rotationZ(Math.PI/2),0],
        [[baseX-zf,baseY+length*7/10,baseZ+length*7/10], m4.rotationZ(Math.PI/2),0],
        [[baseX-zf,baseY+length*3/10,baseZ+length*7/10], m4.rotationZ(Math.PI/2),0],
        [[baseX-zf,baseY+length*7/10,baseZ+length*3/10], m4.rotationZ(Math.PI/2),0]
        ]

        for(var i = 0; i < centers.length; i++){
            addDieCircle(centers[i][0], length/10, 16, circleColor,
                centers[i][1], centers[i][2], 0.1)
        }
    }

    // Add triangles to draw a circle
    function addDieCircle(center, radius, num, color, Tx_rotate, mode, zf){
        var Tlocal_to_die = times(Tx_rotate, m4.translation(center))
        var points = getCircleBottomPoints([0,0,0], radius, num)
        var localTriangles = []

        for(var i = 0; i < points.length - 1; i++){
            if (mode == 0){
                localTriangles.push([
                    m4.transformPoint(Tlocal_to_die, [0,0,0]),
                    m4.transformPoint(Tlocal_to_die, points[i]),
                    m4.transformPoint(Tlocal_to_die, points[i+1]),
                    color])
            } else {
                localTriangles.push([
                    m4.transformPoint(Tlocal_to_die, [0,0,0]),
                    m4.transformPoint(Tlocal_to_die, points[i+1]),
                    m4.transformPoint(Tlocal_to_die, points[i]),
                    color])
            }
        }
        // Add the last one to close the plane
        if (mode == 0){
            localTriangles.push([
                m4.transformPoint(Tlocal_to_die, [0,0,0]),
                m4.transformPoint(Tlocal_to_die, points[points.length-1]),
                m4.transformPoint(Tlocal_to_die, points[0]),
                color])
        } else {
            localTriangles.push([
                m4.transformPoint(Tlocal_to_die, [0,0,0]),
                m4.transformPoint(Tlocal_to_die, points[0]),
                m4.transformPoint(Tlocal_to_die, points[points.length-1]),
                color])
        }

        // Push local triangles into global triangles
        for(var i = 0; i < localTriangles.length; i++){
            triangles.push(localTriangles[i])
        }
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

            // Compute the normal
            // var trans = [m4.transformPoint(Tx, cur[0]),
            //             m4.transformPoint(Tx, cur[1]),
            //             m4.transformPoint(Tx, cur[2])]

            var norm = v3.normalize(v3.cross(v3.subtract(cur[1], cur[0]),
                                             v3.subtract(cur[2], cur[0])))
            normals.push(...norm, ...norm, ...norm)
        }
        return [vertexes, colors, normals]
    }

    function draw(time) {
        // Clear the triangles
        triangles = []
        vertexPosRaw = []
        vertexColorsRaw = []
        vertexNormalRaw = []

        angle1 = slider1.value * 0.01 * Math.PI
        if (! simulateTime){
            angle5 = slider5.value * 0.01 * Math.PI
        }

        light = v3.normalize([300*Math.cos(angle5), 300*Math.sin(angle5), -1])

        // Camera rotates around the y-axis
        var eye = [700 * Math.sin(angle1),  slider3.value, 700 * Math.cos(angle1)]
        var target = [0,40,0]
        var up = [0,1,0]
   
        // Transformation matrixes
        var transto = []
        if (dieView){
            transto = [0,0,0]
        } else {
            transto = [80, -300, 200]
        }
        var Tdie_to_world = times(times(times(times(
            m4.axisRotation([0,0,1], Math.PI/4),
            m4.axisRotation([1,0,0], 0.6154797)),
            m4.axisRotation([0,1,0], angle3)),
            m4.translation(transto)),
            m4.axisRotation([0,1,0], angle4))

        var Tmodel_to_world = m4.axisRotation([0,1,0], angle2)
        var Tworld_to_camera = m4.inverse(m4.lookAt(eye,target,up))
        var Tmodel_to_camera = times(Tmodel_to_world, Tworld_to_camera)
        var Tdie_to_camera = times(Tdie_to_world, Tworld_to_camera)
        var Tprojection
        var zooming_scale = (slider4.value - slider4.min) /
                                (slider4.max - slider4.min)
        var zooming = zooming_scale * 6 + 2
        Tprojection=m4.perspective(Math.PI/zooming, 1, 1, 10000)
        var Tworld_to_view = times(Tworld_to_camera, Tprojection)
        var Tmodel_to_view = times(Tmodel_to_world, Tworld_to_view)
        var Tnormal = m4.transpose(m4.inverse(Tmodel_to_camera))
        var Tnormal_die = m4.transpose(m4.inverse(Tdie_to_camera))

        // Clear screen, prepare for rendering
            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.enable(gl.DEPTH_TEST)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Draw the spinning top
        if (!dieView){
            addSpinTop()
            triangleToVertex(triangles)
            results = triangleToVertex(triangles)
            vertexPosRaw.push(...results[0])
            vertexColorsRaw.push(...results[1])
            vertexNormalRaw.push(...results[2])
            addBuffer()
        
            // Set up attribute and uniforms
            gl.uniformMatrix4fv(shaderProgram.modelViewMatrix,
                false, Tmodel_to_camera)
            gl.uniformMatrix4fv(shaderProgram.projectionMatrix, false,
                Tprojection)
            gl.uniformMatrix4fv(shaderProgram.normalMatrix, false, Tnormal)
            gl.uniform3fv(shaderProgram.light, light)
            gl.uniform1f(shaderProgram.time, time)
            gl.uniform1f(shaderProgram.changeColor, changeColor)
                     
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
            gl.vertexAttribPointer(shaderProgram.vColor, colorBuffer.itemSize,
                gl.FLOAT,false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer)
            gl.vertexAttribPointer(shaderProgram.vPos, trianglePosBuffer.itemSize,
                gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
            gl.vertexAttribPointer(shaderProgram.vNormal, normalBuffer.itemSize,
                gl.FLOAT, false, 0, 0)

            // Draw call
            gl.drawArrays(gl.TRIANGLES, 0, trianglePosBuffer.numItems)
        }

        // Draw the cube
        // Clear the triangles
        triangles = []
        vertexPosRaw = []
        vertexColorsRaw = []
        vertexNormalRaw = []

        if (dieView){
            addCube([0,0,0], 300, dieColor)
        } else {
            addCube([0,0,0], 100, dieColor)
        }
        triangleToVertex(triangles)
        results = triangleToVertex(triangles)
        vertexPosRaw.push(...results[0])
        vertexColorsRaw.push(...results[1])
        vertexNormalRaw.push(...results[2])
        addBuffer()
    
        // Set up attribute and uniforms
        gl.uniformMatrix4fv(shaderProgram.modelViewMatrix, false, Tdie_to_camera)
        gl.uniformMatrix4fv(shaderProgram.projectionMatrix, false, Tprojection)
        gl.uniformMatrix4fv(shaderProgram.normalMatrix, false, Tnormal_die)
        gl.uniform3fv(shaderProgram.light, light)
        gl.uniform1f(shaderProgram.time, time)
        gl.uniform1f(shaderProgram.changeColor, changeColor)
                 
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.vertexAttribPointer(shaderProgram.vColor, colorBuffer.itemSize,
            gl.FLOAT,false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer)
        gl.vertexAttribPointer(shaderProgram.vPos, trianglePosBuffer.itemSize,
            gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
        gl.vertexAttribPointer(shaderProgram.vNormal, normalBuffer.itemSize,
            gl.FLOAT, false, 0, 0)

        // Draw call
        gl.drawArrays(gl.TRIANGLES, 0, trianglePosBuffer.numItems)

        update()
    }

    function update(){
        if (dieView != checkbox1.checked){
            dieView = checkbox1.checked
            if (checkbox1.checked){
                slider2.value = 0.5
            } else {
                slider2.value = 5
            }
        }
        speed = slider2.value
        simulateTime = checkbox2.checked
        if (checkbox3.checked){
            changeColor = 1
        } else {
            changeColor = 0
        }
        angle2 += Math.PI/360 * speed
        angle3 += Math.PI/360 * 8 * speed
        angle4 -= Math.PI/360 * speed
        if (simulateTime){
            angle5 += Math.PI/360 * 2
        }
    }

    // Start animation
    function startAnimation(fps){
        fpsInterval = 1000 / fps
        last = Date.now()
        animate()
    }

    // Funciton to call animation and control the FPS
    function animate(){
        requestAnimationFrame(animate)
        // Compare the time interval
        now = Date.now()
        if (now - last > fpsInterval){
            last = now - ((now - last) % fpsInterval)
            draw(now - startTime)    
        }
    }

    slider1.addEventListener("input",draw)
    slider2.addEventListener("input",draw)
    slider3.addEventListener("input",draw)
    slider4.addEventListener("input",draw)
    slider5.addEventListener("input",draw)

    // Add checkbox listener
    var checkbox_1 = document.querySelector("input[id=checkbox1]");
    checkbox_1.addEventListener('change', update)
    var checkbox_2 = document.querySelector("input[id=checkbox2]");
    checkbox_2.addEventListener('change', update)
    var checkbox_3 = document.querySelector("input[id=checkbox3]");
    checkbox_3.addEventListener('change', update)

    startAnimation(40)
}
window.onload = Die
