function MyApp(){"use strict"
    var canvas = document.getElementById('myCanvas')
    var context = canvas.getContext('2d')
    var m4 = twgl.m4
    var slider1 = document.getElementById('slider1')
    slider1.value = 0
    var slider2 = document.getElementById('slider2')
    slider2.value = 0

    // Move object to the center
    var offset_x = 250
    var offset_y = 300

    // Helper funciton to to moveTo in 3D
    function moveToTx(x,y,z,Tx){
        var loc = [x,y,z];
        var locTx = m4.transformPoint(Tx,loc)
        // We need to flip y and change origin here
        context.moveTo(locTx[0] + offset_x, -locTx[1] + offset_y)
    }

    // Helper function to do moveTo in 3D
    function lineToTx(x,y,z,Tx){
        var loc = [x,y,z];
        var locTx = m4.transformPoint(Tx,loc)
        // We don't need to flip y or change origin here
        context.lineTo(locTx[0] + offset_x, -locTx[1] + offset_y)
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

        var xt = 250, yt = 350, zt = 250
        // Distance vector
        var xb = 250, yb = 50, zb = 250
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

        // Return the location of body
        return [xt + xb * Math.sin((7/8) * Math.PI), yt + yb, zt]
    }

    // Draw the whole thing
    function draw(){
        // Clear the canvas
        canvas.width = canvas.width;
        var angle1 = slider1.value * 0.01 * Math.PI
        var angle2 = slider2.value * 0.01 * Math.PI
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
        var Tmodel_to_camera = m4.multiply(Tmodel_to_world,Tworld_to_camera)
        
        // We want to draw the axes in the camera transform, so when we rotate
        // the object horizontally axes wont change
        drawAxes(Tworld_to_camera)
        var bodyTop = drawCap(Tmodel_to_camera)
    }
    
      slider1.addEventListener("input",draw)
      slider2.addEventListener("input",draw)
      draw()
}
window.onload = MyApp

