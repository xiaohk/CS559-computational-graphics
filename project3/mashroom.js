function Vileplume(){"use strict"
    var canvas = document.getElementById('myCanvas')
    var context = canvas.getContext('2d')
    var m4 = twgl.m4
    var slider1 = document.getElementById('slider1')
    slider1.value = 1
    var slider2 = document.getElementById('slider2')
    slider2.value = 0
    var angle1 = Math.PI/2
    var angle2 = 0

    // Move object to the center
    var offset_x = 250
    var offset_y = 300

    // Animation variables
    var fpsInterval, now, last
    var speed = 1
    var jumpOffset = -2
    var handAngleOffset = 1 
    var handAngle = 60 * Math.PI/180
    var footAngle = 80 * Math.PI/180

    // Cap center information
    var xt = 0, yt = 100, zt = 0
    var xb = 250, yb = 50, zb = 250

    // Helper funciton to to moveTo in 3D
    function moveToTx(x, y, z, Tx){
        var loc = [x, y, z];
        var locTx = m4.transformPoint(Tx, loc)
        // We need to flip y and change origin here
        context.moveTo(locTx[0] + offset_x, -locTx[1] + offset_y)
    }

    // Helper function to do moveTo in 3D
    function lineToTx(x, y, z, Tx){
        var loc = [x, y, z];
        var locTx = m4.transformPoint(Tx,loc)
        // We don't need to flip y or change origin here
        context.lineTo(locTx[0] + offset_x, -locTx[1] + offset_y)
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

        // Next we want to draw the eyes and mouth of vileplume
        // I fount its actually very hard to draw a circle on a curved 
        // surface, maybe its easier to to using projection?
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
    function drawLimbs(angleHand, angleFeet, Tworld_to_camera, Tmodel_to_world){
        context.strokeStyle = "rgb(116, 133, 171)"
        // Compute the hand translation coordinates
        var coords = limbsCoord()
        // Left hand
        var TleftHand_to_world = times(times(m4.rotationY(Math.PI/2),
                                             m4.rotationZ(angleHand)),
                                       m4.translation(coords[0]))
        drawLimb(10, 10, 40, times(times(TleftHand_to_world, Tmodel_to_world),
                                   Tworld_to_camera))
        // Right hand
        var TrightHand_to_world = times(times(m4.rotationY(-Math.PI/2),
                                             m4.rotationZ(-angleHand)),
                                       m4.translation(coords[1]))
        drawLimb(10, 10, 40, times(times(TrightHand_to_world, Tmodel_to_world),
                                   Tworld_to_camera))
        // Left foot
        // Compute the rotation axis
        var raLeft = twgl.v3.cross([0, 1, 0], [1, 0, 1])
        var raRight = twgl.v3.cross([0, 1, 0], [-1, 0, 1])
        var TleftFoot_to_world = times(times(m4.rotationY(Math.PI/4),
                                             m4.axisRotation(raLeft, angleFeet)),
                                       m4.translation(coords[2]))
        drawLimb(20, 10, 70, times(times(TleftFoot_to_world, Tmodel_to_world),
                                   Tworld_to_camera))
        // Right foot
        var TrightFoot_to_world = times(times(m4.rotationY(-Math.PI/4),
                                             m4.axisRotation(raRight, angleFeet)),
                                        m4.translation(coords[3]))
        drawLimb(20, 10, 70, times(times(TrightFoot_to_world, Tmodel_to_world),
                                   Tworld_to_camera))

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
            angle1 += Math.PI/360
            angle2 = yStatus * 50 * Math.PI/180
        } else {
            angle1 = Math.PI/2
            angle2 = 0
        }
    }


    // Draw the whole thing
    function draw(){
        // Clear the canvas
        canvas.width = canvas.width;
        // var angle1 = slider1.value * 0.01 * Math.PI
        // var angle2 = slider2.value * 0.01 * Math.PI
        // var angle3 = 0
        var cameraRadius = 500

        // Basis of our world coordinate
        var axis = [1,1,1]
        var eye = [cameraRadius * Math.cos(angle1),
                   200,
                   cameraRadius * Math.sin(angle1)]
        var target = [0,0,0]
        var up = [0,1,0]

        var Tworld_to_camera = m4.inverse(m4.lookAt(eye,target,up))
        var Tmodel_to_world  = m4.axisRotation(axis,angle2)
        // In Twgl convention, first transformation is on the left
        var Tmodel_to_camera = times(Tmodel_to_world,Tworld_to_camera)
        
        // We want to draw the axes in the camera transform, so when we rotate
        // the object horizontally axes wont change
        // drawAxes(Tworld_to_camera)
        // Better to draw the body first, so it looks more real
        drawLimbs(handAngle, footAngle, Tworld_to_camera, Tmodel_to_world)
        drawBody(Tmodel_to_camera)
        drawCap(Tmodel_to_camera)
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
            draw()
        }
    }

    function tt(){
        console.log(10)
    }

    slider1.addEventListener("input",draw)
    slider2.addEventListener("input",draw)

    // Add checkbox listener
    var checkbox = document.querySelector("input[id=checkbox1]");
    checkbox.addEventListener('change', update)
    startAnimation(15)
    // draw()
}

window.onload = Vileplume

