function Vileplume(){"use strict"
    var canvas = document.getElementById('myCanvas')
    var context = canvas.getContext('2d')
    var m4 = twgl.m4
    var slider1 = document.getElementById('slider1')
    slider1.value = (slider1.max - slider1.min) / 2 
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
    var offsetY = 300

    // Animation variables
    var fpsInterval, now, last
    var speed = 1
    var jumpOffset = -1
    var handAngleOffset = 1 
    var handAngle = 60 * Math.PI/180
    var footAngle = 80 * Math.PI/180

    // Meta settings
    checkbox1.checked = true
    var useVileView = checkbox2.checked
    var usePerspective = checkbox3.checked

    // Cap center information
    var xt = 0, yt = 100, zt = 0
    var xb = 250, yb = 50, zb = 250

    // Helper funciton to to moveTo in 3D
    function moveToTx(x, y, z, Tx){
        var loc = [x, y, z];
        var locTx = m4.transformPoint(Tx, loc)
        // We dont need to flip y and change origin here if using viwport
        context.moveTo(locTx[0], locTx[1])
    }

    // Helper function to do moveTo in 3D
    function lineToTx(x, y, z, Tx){
        var loc = [x, y, z];
        var locTx = m4.transformPoint(Tx,loc)
        // We don't need to flip y or change origin here
        context.lineTo(locTx[0], locTx[1])
    }

    // Helper function to call m4.multiply()
    function times(m1, m2){
        return m4.multiply(m1, m2)
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

    // Draw the cap of vileplume
    function drawCap(Tx){
        context.strokeStyle = "rgb(217, 78, 101)"
        var theta = 0, phi = 0
        
        // We only need to draw 4 ellipse for the longitude
        for (phi = 0; phi <= 2 * Math.PI; phi += (1/4) * Math.PI){
            context.beginPath()
            context.setLineDash([0.5, 3])
            context.lineWidth = 2
            theta = 0
            moveToTx(xt + xb * Math.sin(theta) * Math.cos(phi),
                     yt + yb * Math.cos(theta),
                     zt + zb * Math.sin(theta) * Math.sin(phi),
                     Tx)
            // Control how smooth the segments to be
            for (theta = (1/64) * Math.PI; theta <= Math.PI; 
                theta += (1/64) * Math.PI){
                lineToTx(xt + xb * Math.sin(theta) * Math.cos(phi),
                yt + yb * Math.cos(theta),
                zt + zb * Math.sin(theta) * Math.sin(phi),
                Tx)
            }
            context.stroke()
            context.closePath()
        }
       
        // We only need to draw 2 ellipse for the latitude
        var latitudeTime = 0
        for (theta = (1/4) * Math.PI; theta < Math.PI;
             theta += (1/4) * Math.PI){
            context.beginPath()
            latitudeTime += 1
            phi = 0
            moveToTx(xt + xb * Math.sin(theta) * Math.cos(phi),
                     yt + yb * Math.cos(theta),
                     zt + zb * Math.sin(theta) * Math.sin(phi),
                     Tx)

            for (phi = (1/64) * Math.PI; phi <= 2 * Math.PI;
                 phi += (1/64) * Math.PI){
                lineToTx(xt + xb * Math.sin(theta) * Math.cos(phi),
                         yt + yb * Math.cos(theta),
                         zt + zb * Math.sin(theta) * Math.sin(phi),
                         Tx)
            }
            if (latitudeTime == 2){
                context.setLineDash([1, 0])
                context.lineWidth = 3 
            } else {
                context.setLineDash([1, 3])
                context.lineWidth = 2
            }
            context.stroke()
            context.closePath()
        }

        // Return the location of cap
        return [xt + xb * Math.sin((7/8) * Math.PI), yt + yb, zt]
    }

    function drawBody(Tx){
        // Starting for the lower part of cap
        var theta = -(27/32) * Math.PI
        var phi = 0
        var location = []
        var topPoint = []
        var bottomPoint = []

        context.strokeStyle = "rgb(116, 133, 171)"
        context.setLineDash([1, 3])

        for (var yOffset = 0; yOffset <= 150; yOffset += 30){
            phi = 0
            var phiTime = 0
            context.beginPath()
            moveToTx(xt + (xb + yOffset/3) * Math.sin(theta) * Math.cos(phi),
                     yt + yb * Math.cos(theta) - yOffset,
                     zt + (zb + yOffset/3) * Math.sin(theta) * Math.sin(phi),
                     Tx)
            for (phi = (1/64) * Math.PI; phi <= 2 * Math.PI;
                 phi += (1/64) * Math.PI){
                phiTime += 1
                location = [xt + (xb + yOffset/3) * Math.sin(theta) * Math.cos(phi),
                            yt + yb * Math.cos(theta) - yOffset,
                            zt + (zb + yOffset/3) * Math.sin(theta) * Math.sin(phi)]
                lineToTx(location[0], location[1], location[2],Tx)

                // Record the top and bottom circle points
                if (yOffset == 0){
                    if (phiTime % 2 == 0){
                        topPoint.push(location)
                    }
                } else if (yOffset == 150){
                    if (phiTime % 2 == 0){
                        bottomPoint.push(location)
                    }
                }
            }
            context.stroke()
            context.closePath()
        }
        
        // Then we connect the top and bottom using line segments
        context.setLineDash([0.5, 3])
        for (var i = 0; i < topPoint.length; i++){
            // JS has unpack operators too, neat!
            moveToTx(...topPoint[i], Tx)
            lineToTx(...bottomPoint[i], Tx)
            context.stroke()
        }
    }

    // Function to draw the hand and feet of vileplume
    function drawLimb(xWidth, yWidth, zWidth, Tx){
        var rotate = 0
        var x = 0, y = 0, z = 0
        var xbl = xWidth, ybl = yWidth, zbl = zWidth
        var xtl = x, ytl = y, ztl = z + zbl
        var theta = 0, phi = 0
        
        // We only need to draw 4 ellipse for the longitude
        for (phi = 0; phi <= 2 * Math.PI; phi += (1/16) * Math.PI){
            context.beginPath()
            context.setLineDash([0.5, 3])
            context.lineWidth = 2
            theta = 0
            moveToTx(xtl + xbl * Math.sin(theta) * Math.cos(phi),
                     ytl + ybl * Math.cos(theta),
                     ztl + zbl * Math.sin(theta) * Math.sin(phi),
                     Tx)
            // Control how smooth the segments to be
            for (theta = (1/32) * Math.PI; theta <= Math.PI; 
                theta += (1/32) * Math.PI){
                lineToTx(xtl + xbl * Math.sin(theta) * Math.cos(phi),
                ytl + ybl * Math.cos(theta),
                ztl + zbl * Math.sin(theta) * Math.sin(phi),
                Tx)
            }
            context.stroke()
            context.closePath()
        }

        for (theta = (1/16) * Math.PI; theta < Math.PI;
             theta += (1/16) * Math.PI){
            context.beginPath()
            phi = 0
            moveToTx(xtl + xbl * Math.sin(theta) * Math.cos(phi),
                     ytl + ybl * Math.cos(theta),
                     ztl + zbl * Math.sin(theta) * Math.sin(phi),
                     Tx)

            for (phi = (1/32) * Math.PI; phi <= 2 * Math.PI;
                 phi += (1/32) * Math.PI){
                lineToTx(xtl + xbl * Math.sin(theta) * Math.cos(phi),
                         ytl + ybl * Math.cos(theta),
                         ztl + zbl * Math.sin(theta) * Math.sin(phi),
                         Tx)
            }
            context.stroke()
            context.closePath()
        }
    }

    // Compute the coordinate of limps
    function limbsCoord(){
        var coords = []
        var theta = (27/32) * Math.PI
        // Hands
        coords.push([
            xt + (xb + 70/3) * Math.sin(theta),
            yt + yb * Math.cos(theta) - 70,
            zt
        ])
        coords.push([
            xt + (xb + 70/3) * Math.sin(theta) * (-1),
            yt + yb * Math.cos(theta) - 70,
            zt
        ])

        // Feet
        // theta = (10/32) * Math.PI
        coords.push([
            xt + (xb - 150) * Math.sin(theta),
            yt + yb * Math.cos(theta) - 150,
            zt
        ])
        coords.push([
            xt + (xb - 150) * Math.sin(theta) * (-1),
            yt + yb * Math.cos(theta) - 150,
            zt
        ])
        return coords
    }

    // Draw 4 limps hierarchically
    function drawLimbs(angleHand, angleFeet, Tworld_to_view, Tmodel_to_world,
                        color){
        context.strokeStyle = "rgb(116, 133, 171)"
        // Compute the hand translation coordinates
        var coords = limbsCoord()
        // Left hand
        var TleftHand_to_world = times(times(m4.rotationY(Math.PI/2),
                                             m4.rotationZ(angleHand)),
                                       m4.translation(coords[0]))
        drawLimb(10, 10, 40, times(times(TleftHand_to_world, Tmodel_to_world),
                                   Tworld_to_view))

        // Right hand
        var TrightHand_to_world = times(times(m4.rotationY(-Math.PI/2),
                                             m4.rotationZ(-angleHand)),
                                       m4.translation(coords[1]))
        drawLimb(10, 10, 40, times(times(TrightHand_to_world, Tmodel_to_world),
                                   Tworld_to_view))
        // Left foot
        // Compute the rotation axis
        var raLeft = twgl.v3.cross([0, 1, 0], [1, 0, 1])
        var raRight = twgl.v3.cross([0, 1, 0], [-1, 0, 1])
        var TleftFoot_to_world = times(times(m4.rotationY(Math.PI/4),
                                             m4.axisRotation(raLeft, angleFeet)),
                                       m4.translation(coords[2]))
        drawLimb(20, 10, 70, times(times(TleftFoot_to_world, Tmodel_to_world),
                                   Tworld_to_view))
        // Right foot
        var TrightFoot_to_world = times(times(m4.rotationY(-Math.PI/4),
                                             m4.axisRotation(raRight, angleFeet)),
                                        m4.translation(coords[3]))
        drawLimb(20, 10, 70, times(times(TrightFoot_to_world, Tmodel_to_world),
                                   Tworld_to_view))

    }

    // Use balls to draw eyes
    function drawEyes(Tworld_to_view, Tmodel_to_world){
        var theta = (27/32) * Math.PI
        var lEyeC = [xt + (xb + 70/3) * Math.sin(theta) *
                            Math.cos(70 * Math.PI/180),
                     yt + yb * Math.cos(theta) - 70,
                     zt + zb * Math.sin(theta) * Math.sin(70 * Math.PI/180)]
        var rEyeC = [xt + (xb + 70/3) * Math.sin(theta) *
                            Math.cos(100 * Math.PI/180),
                     yt + yb * Math.cos(theta) - 70,
                     zt + zb * Math.sin(theta) * Math.sin(100 * Math.PI/180)]

        var TlEye = times(m4.rotationY(Math.PI/2), m4.translation(lEyeC))
        var TrEye = times(m4.rotationY(Math.PI/2), m4.translation(rEyeC))
        context.strokeStyle = "rgb(208, 46, 50)"
        drawLimb(2, 10, 10, times(times(TlEye, Tmodel_to_world), Tworld_to_view))
        drawLimb(2, 10, 10, times(times(TrEye, Tmodel_to_world), Tworld_to_view))

    }
    
    // Animation of vileplume
    function update(){
        speed = slider1.value
        if (yt >= 300 || yt <= 100){
            jumpOffset *= -1
            handAngleOffset *= -1
        }
        yt += jumpOffset * speed
        var yStatus = (200 - yt) / 200
        handAngle = yStatus * 120 * Math.PI/180 
        footAngle = -Math.min(0.0, -yStatus) * 160 * Math.PI/180

        // Control rotate or not
        if (checkbox1.checked){
            angle1 += Math.PI/360 * speed
            angle2 = yStatus * 50 * Math.PI/180
        } else {
            angle1 = Math.PI/2
            angle2 = 0
        }

        // Control meta settings
        useVileView = checkbox2.checked
        usePerspective = checkbox3.checked
    }

    function drawCircle(x, y, z, xr, yr, zr, phi, Tx){
        var xbl = xr, ybl = yr, zbl = zr
        var xtl = x, ytl = y, ztl = z
        
        context.beginPath()
        context.lineWidth = 2
        var theta = 0
        
        // Draw the circle
        moveToTx(xtl, ytl + ybl, ztl, Tx)
        for (theta = 0; theta <= 2 * Math.PI; theta += (1/32) * Math.PI){
            lineToTx(xtl + xbl * Math.sin(theta) * Math.cos(phi),
                ytl + ybl * Math.cos(theta),
                ztl + zbl * Math.sin(theta) * Math.sin(phi),
                Tx)
        }
        context.stroke()
        context.fill()
        context.closePath()
    }

    // Function to draw gameboy cube
    function drawGameboyCube(Tx){
        context.setLineDash([1, 0])
        context.strokeStyle = "rgb(192, 191, 187)"
        context.fillStyle = "rgb(213, 208, 205)"

        // Back
        context.beginPath()
        moveToTx(-100, -100, -40, Tx)
        lineToTx(100, -100, -40, Tx); lineToTx(100, 200, -40, Tx)
        lineToTx(-100, 200, -40, Tx); lineToTx(-100, -100, -40, Tx)
        context.fill(); context.stroke()
        context.closePath()

        context.beginPath()
        moveToTx(-100, -100, 0, Tx)
        lineToTx(100, -100, 0, Tx); lineToTx(100, -100, -40, Tx)
        lineToTx(-100, -100, -40, Tx); lineToTx(-100, -100, 0, Tx)
        context.fill(); context.stroke()
        context.closePath() 

        context.beginPath()
        moveToTx(-100, -100, 0, Tx)
        lineToTx(-100, 200, 0, Tx); lineToTx(-100, 200, -40, Tx)
        lineToTx(-100, -100, -40, Tx); lineToTx(-100, -100, 0, Tx)
        context.fill(); context.stroke()
        context.closePath() 

        context.beginPath()
        moveToTx(100, -100, 0, Tx)
        lineToTx(100, 200, 0, Tx); lineToTx(100, 200, -40, Tx)
        lineToTx(100, -100, -40, Tx); lineToTx(100, -100, 0, Tx)
        context.fill(); context.stroke()
        context.closePath() 

        context.beginPath()
        moveToTx(-100, 200, 0, Tx)
        lineToTx(100, 200, 0, Tx); lineToTx(100, 200, -40, Tx)
        lineToTx(-100, 200, -40, Tx); lineToTx(-100, 200, 0, Tx)
        context.fill(); context.stroke()
        context.closePath() 

        // Front
        context.beginPath()
        moveToTx(-100, -100, 0, Tx)
        lineToTx(100, -100, 0, Tx); lineToTx(100, 200, 0, Tx)
        lineToTx(-100, 200, 0, Tx); lineToTx(-100, -100, 0, Tx)
        context.fill(); context.stroke()
        context.closePath()
    }

    // Draw the front face of gameboy
    function drawFrontFace(Tx){
        // Add A B buttons
        context.setLineDash([1, 0])
        context.strokeStyle = "black"
        context.fillStyle = "rgb(177, 53, 103)"
        drawCircle(60, -20, 0, 10, 10, 10, 0, Tx)
        drawCircle(30, -50, 0, 10, 10, 10, 0, Tx)
        
        // Add controller cross
        context.strokeStyle = "rgb(84, 84, 84)"
        context.fillStyle = "rgb(84, 84, 84)"
        context.beginPath()
        moveToTx(-60, -30, 0, Tx); lineToTx(-20, -30, 0, Tx)
        lineToTx(-20, -20, 0, Tx); lineToTx(-60, -20, 0, Tx)
        context.stroke(); context.fill()
        context.closePath()
        context.beginPath()
        moveToTx(-45, -45, 0, Tx); lineToTx(-45, -5, 0, Tx)
        lineToTx(-35, -5, 0, Tx); lineToTx(-35, -45, 0, Tx)
        context.stroke(); context.fill()
        context.closePath()

        // Draw the screen
        context.beginPath()
        moveToTx(-80, 20, 0, Tx); lineToTx(80, 20, 0, Tx)
        lineToTx(80, 180, 0, Tx); lineToTx(-80, 180, 0, Tx)
        lineToTx(-80, 20, 0, Tx)
        context.stroke()
        context.fillStyle = "rgb(193, 214, 186)"
        context.fill()
        context.closePath
    }

    // Function to draw gameboy
    function drawGameboy(){
        // Clear the canvas
        canvas.width = canvas.width;
        var angle3 = slider2.value * 0.01 * Math.PI
        var angle4 = slider3.value * 0.01 * Math.PI

        // Fix vileplume position in gameboy view
        if (checkbox1.checked == false){
            angle1 = 0
        }

        // Basis of our world coordinate
        var axis = [1,1,1]
        var eye = [500 * Math.cos(angle3), 200, 500 * Math.sin(angle3)]
        var target = [0,0,0]
        var up = [0,1,0]

        var Tworld_to_camera = m4.inverse(m4.lookAt(eye,target,up))
        var Tgame_to_world  = m4.axisRotation(axis,angle4)
        // In Twgl convention, first transformation is on the left

        var Tprojection
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

        var Tviewport = m4.multiply(m4.scaling([200, -200, 200]),
                                    m4.translation([offsetX, offsetY, 0]))
    
        var Tworld_to_view = m4.multiply(m4.multiply(Tworld_to_camera,
                                                     Tprojection),
                                         Tviewport)
        var Tgame_to_view = m4.multiply(Tgame_to_world, Tworld_to_view)

        // Transformations for vileplume
        var Tvile_to_world  = m4.multiply(m4.rotationY(angle1),
                                          m4.axisRotation(axis,angle2))

        var vileEye = [500 * Math.cos(angle1), 200, 500 * Math.sin(angle1)]
        var Tvile_world_to_camera =  m4.inverse(m4.lookAt(vileEye,target,up))
        var Tvile_world_to_view =  m4.multiply(m4.multiply(Tvile_world_to_camera,
                                                     Tprojection),
                                               Tviewport)

        var Tworld_to_game = m4.multiply(m4.scaling([0.25, 0.25, 0]),
                                    m4.translation([0, 80, 0]))

        var Tvile_to_game_world = m4.multiply(m4.multiply(Tvile_to_world, 
                                                          Tworld_to_game),
                                              Tgame_to_world)

        // Make vile yrotate, use Tvile_world_to_view below and in limp
        var Tvile_to_game_world_view = m4.multiply(Tvile_to_game_world,
                                                   Tworld_to_view)

        
        drawGameboyCube(Tgame_to_view)

        if (0 < angle3 && angle3 < Math.PI){
            drawFrontFace(Tgame_to_view)
            drawLimbs(handAngle, footAngle, Tworld_to_view,
                      Tvile_to_game_world)
            drawBody(Tvile_to_game_world_view)
            drawEyes(Tworld_to_view, Tvile_to_game_world)
            drawCap(Tvile_to_game_world_view)
            update()
        } else {
            context.beginPath()
            moveToTx(-100, -100, -40, Tgame_to_view)
            lineToTx(100, -100, -40, Tgame_to_view)
            lineToTx(100, 200, -40, Tgame_to_view)
            lineToTx(-100, 200, -40, Tgame_to_view)
            lineToTx(-100, -100, -40, Tgame_to_view)
            context.fill(); context.stroke()
            context.closePath()
        }
    }

    // Draw the whole thing
    function drawVile(){
        // Clear the canvas
        canvas.width = canvas.width;
        // var angle1 = slider1.value * 0.01 * Math.PI
        // var angle2 = slider2.value * 0.01 * Math.PI

        // Basis of our world coordinate
        var axis = [1,1,1]
        var eye = [500 * Math.cos(angle1), 200, 500 * Math.sin(angle1)]
        var target = [0,0,0]
        var up = [0,1,0]

        var Tworld_to_camera = m4.inverse(m4.lookAt(eye,target,up))
        var Tmodel_to_world  = m4.axisRotation(axis,angle2)
        // In Twgl convention, first transformation is on the left
        var Tmodel_to_camera = times(Tmodel_to_world,Tworld_to_camera)
        var Tprojection
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

        var Tviewport = m4.multiply(m4.scaling([200,-200,200]),
                                    m4.translation([offsetX, offsetY, 0]))
    
        var Tworld_to_view = m4.multiply(m4.multiply(Tworld_to_camera,
                                                     Tprojection),
                                         Tviewport)
        var Tmodel_to_view = m4.multiply(Tmodel_to_world, Tworld_to_view)
        
        // Better to draw the body first, so it looks more real
        drawLimbs(handAngle, footAngle, Tworld_to_view, Tmodel_to_world)
        drawBody(Tmodel_to_view)
        drawEyes(Tworld_to_view, Tmodel_to_world)
        drawCap(Tmodel_to_view)
        update()
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
            drawSwitch()    
        }
    }
    
    // Helper switch function
    function drawSwitch(){
        if (useVileView){
            drawVile()
        } else {
            drawGameboy()
        }
    }

    slider1.addEventListener("input",drawSwitch)
    slider2.addEventListener("input",drawSwitch)
    slider3.addEventListener("input",drawSwitch)

    // Add checkbox listener
    var checkbox_1 = document.querySelector("input[id=checkbox1]");
    checkbox_1.addEventListener('change', update)

    var checkbox_2 = document.querySelector("input[id=checkbox2]");
    checkbox_2.addEventListener('change', update)

    var checkbox_3 = document.querySelector("input[id=checkbox3]");
    checkbox_3.addEventListener('change', update)

    startAnimation(15)
}

window.onload = Vileplume

