function Die() {

    // Set up Canvas
    var canvas = document.getElementById("myCanvas")
    var gl = canvas.getContext("webgl")
    var m4 = twgl.m4

    // Set up HTML interface
    var slider1 = document.getElementById('slider1')
    slider1.value = 0 
    var slider2 = document.getElementById('slider2')
    slider2.value = 0 
    var slider3 = document.getElementById('slider3')
    slider3.value = 400 
    var slider4 = document.getElementById('slider4')
    slider4.value = -71 
    var slider5 = document.getElementById('slider5')
    slider5.value = 0

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
    
    shaderProgram.uMVP= gl.getUniformLocation(shaderProgram,"uMVP")

    // vertex positions
    var vertexPos = new Float32Array ([
        0.0,  0.0,  0.0,   0.0,  100.0,  0.0,   0.0,  0.0,  100.0,
        0.0,  0.0,  0.0,   100.0,  0.0,  0.0,   0.0,  0.0,  100.0,
        0.0,  0.0,  0.0,   100.0,  0.0,  0.0,   0.0,  100.0,  0.0,
        0.0,  100.0,  0.0,   100.0,  0.0,  0.0,   0.0,  0.0,  100.0 ]) 

    // vertex colors
    var vertexColors = new Float32Array ([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,    
        0.0, 1.0, 0.0,    
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 0.0,    
        1.0, 1.0, 0.0,    
        1.0, 1.0, 0.0 ])
    
    // vertex index
    var triangleIndices = new Uint8Array([
           0, 1, 2,
           3, 4, 5,
           6, 7, 8,
           9,10,11 ])

    // Make pipeline to the position buffer
    var trianglePosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW)
    trianglePosBuffer.itemSize = 3
    trianglePosBuffer.numItems = 12
    
    // Color buffer
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW)
    colorBuffer.itemSize = 3
    colorBuffer.numItems = 12

    // Buffer indices
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW)

    
    // Helper function to call m4.multiply()
    function times(m1, m2){
        return m4.multiply(m1, m2)
    }

    function draw() {
        var angle1 = slider1.value * 0.01 * Math.PI
        var angle2 = slider2.value * 0.01 * Math.PI
    
        // Camera rotates around the y-axis
        var eye = [300 * Math.sin(angle1), 150.0, 300.0 * Math.cos(angle1)]
        var target = [0,40,0]
        var up = [0,1,0]
   
        // Transformation matrixes
        var Tmodel_to_world = m4.axisRotation([0,1,0],angle2)
        var Tworld_to_camera = m4.inverse(m4.lookAt(eye,target,up))
        var Tmodel_to_camera = times(Tmodel_to_world, Tworld_to_camera)
        var Tprojection
        var zooming_scale = (slider4.value - slider4.min) /
                                (slider4.max - slider4.min)
        var zooming = zooming_scale * 6 + 2
        Tprojection=m4.perspective(Math.PI/zooming, 1, 1, 400)
        var Tworld_to_view = times(Tworld_to_camera, Tprojection)
        var Tmodel_to_view = times(Tmodel_to_world, Tworld_to_view)
    
        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
        // Set up attribute and uniforms
        gl.uniformMatrix4fv(shaderProgram.uMVP,false, Tmodel_to_view)
                 
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.vertexAttribPointer(shaderProgram.vColor, colorBuffer.itemSize,
            gl.FLOAT,false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer)
        gl.vertexAttribPointer(shaderProgram.vPos, trianglePosBuffer.itemSize,
            gl.FLOAT, false, 0, 0)

        // Draw call
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0)

    }

    slider1.addEventListener("input",draw)
    slider2.addEventListener("input",draw)
    slider3.addEventListener("input",draw)
    slider4.addEventListener("input",draw)
    draw();
}
window.onload = Die
