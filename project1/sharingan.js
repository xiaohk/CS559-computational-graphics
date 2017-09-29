function Sharingan(context, x, y, radius, speed, theta){
    this.x = x
    this.y = y
    this.radius = radius
    this.context = context
    this.speed = speed
    this.theta = theta
}

// Fill the back ground color
Sharingan.prototype.fillBack = function(){
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius, 0, 2*Math.PI)
    this.context.fillStyle = "rgb(172, 6, 15)"
    this.context.fill()
}

// Draw the frame of Sharingan
Sharingan.prototype.drawFrames = function(){
    // Draw a black dot at the center
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius*0.2, 0, 2*Math.PI)
    this.context.fillStyle = "black"
    this.context.fill()

    // Draw the outter circle
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius, 0, 2*Math.PI)
    this.context.lineWidth = "4"
    this.context.stroke()

    // Draw the inner circle
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius*0.6, 0, 2*Math.PI)
    this.context.lineWidth = "3"
    // Add dash to simulate the cool "eye effects"
    this.context.setLineDash([3, 1])
    this.context.strokeStyle = "rgb(117, 4, 11)"
    this.context.stroke()
}

// Add one single magatama
Sharingan.prototype.addMagatama = function(){
    // Its actually very hard to draw the magatama without using curves
    // I will use ordered fill to cover previous circle to make the tail
    // So the order is: upper circle -> small circle -> mide circle

    // Fill the upper circle
    this.context.beginPath()
    this.context.arc(this.radius*0.16*0.6, -this.radius*0.6,
                     this.radius*0.25, Math.PI, 1.8*Math.PI)
    this.context.closePath()
    this.context.fillStyle = "black"
    this.context.fill()

    // Fill the right circle
    this.context.beginPath()
    this.context.arc(this.radius*0.6*Math.sin(20*Math.PI/180), -this.radius*0.6,
                     this.radius*0.16, Math.PI, 1.8*Math.PI)
    this.context.fillStyle=("rgb(172, 6, 15)")
    this.context.closePath()
    this.context.fill()

    // Fill the center circle upon the previous circles
    context.beginPath()
    this.context.arc(0, -this.radius*0.6, this.radius*0.16, 0, 2*Math.PI)
    this.context.fillStyle = "black"
    this.context.fill()
}

// Draw three magatama
Sharingan.prototype.drawMagatamas = function(){
    this.context.save()
    // Repeate 3 times
    this.context.translate(this.x, this.y)
    this.context.rotate(this.theta)
    this.addMagatama()
    this.context.rotate(2/3*Math.PI)
    this.addMagatama()
    this.context.rotate(2/3*Math.PI)
    this.addMagatama()
    this.context.restore()
}

// Draw sharingan itself
Sharingan.prototype.draw = function(){
    // We first fill the background color
    this.fillBack()
    // Then add the frames
    this.drawFrames()
    // Finally add 3 magatamas (top layer)
    this.drawMagatamas()
}

// Rotate the sharingan
Sharingan.prototype.update = function(){
    this.theta += (2 * Math.PI / 180) * this.speed
}
