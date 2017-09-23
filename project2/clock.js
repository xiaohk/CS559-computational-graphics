"use strict"

// Clock class definition
function Clock(context, x, y, radius, speed, shakeDegree,
    color1, color2, color3) {
    this.context = context
    // Set default configures
    this.x = x || 300
    this.y = y || 350
    this.radius = radius || 50
    this.gap = 5
    // Pointer angles
    this.hourAngle = 0
    this.minuteAngle = 0
    this.hammerAngle = 0
    this.hammerDirection = 1
    this.speed = speed
    this.shakeDegree = shakeDegree
    this.color1 = color1 || "black"
    this.color2 = color2 || "white"
    this.color3 = color3 || "black"
}

/*
Prototype function to draw the body of clock
*/
Clock.prototype.drawBody = function() {
    // Draw the outter circle of the clock first, so we can fill
    // the ring!
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius + this.gap, 0, 2 * Math.PI)
    this.context.fillStyle = this.color1;
    this.context.fill()

    // Draw the inner circle of the clock
    // Reset the path
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    this.context.fillStyle = this.color2
    this.context.fill()
    this.context.fillStyle = this.color3



    // We can add a central dot to the clock
    this.context.beginPath()
    this.context.arc(this.x, this.y, 4, 0, 2 * Math.PI)
    this.context.fill()
}

/*
Prototype function to draw only one ear on an alarm clock
*/
Clock.prototype.drawEar = function() {
    var startY = -(this.radius + this.gap)
    // Draw a short line
    this.context.lineWidth = "3"
    this.context.beginPath()

    // Remember the origin will be changed
    this.context.moveTo(0, startY)
    this.context.lineTo(0, startY - 10)
    this.context.stroke()

    // Draw the ear on the line
    this.context.beginPath()
    this.context.lineWidth = "1"
    this.context.arc(0, startY - 7, 20, Math.PI, 0)
    this.context.closePath()
    this.context.fill()
    this.context.stroke()

    // Also we can draw the feet of this clock in this step
    this.context.beginPath()
    this.context.lineWidth = "3"
    this.context.moveTo(0, -startY)
    this.context.lineTo(0, -startY + 10)
    this.context.stroke()

    // Add a small ball on the end of the feet
    this.context.beginPath()
    this.context.arc(0, -startY + 10, 2, 0, 2 * Math.PI)
    this.context.fill()
    this.context.stroke()
}

/*
Prototype function to draw two ears of an alarm clock (using rotate)
*/
Clock.prototype.drawEars = function() {
    this.context.save()
    // Rotate from the center of the clock
    this.context.translate(this.x, this.y)
    this.context.rotate(-30 * Math.PI / 180)
    this.drawEar()
    this.context.rotate(60 * Math.PI / 180)
    this.drawEar()
    this.context.restore()
    // Add a bridge between two ears
    this.context.beginPath()
    this.context.save()
    this.context.translate(this.x, this.y)
    this.context.moveTo(-30, -70)
    this.context.bezierCurveTo(-15, -95, 15, -95, 30, -70)
    this.context.stroke()
    this.context.restore()
}

/*
Prototype function to draw the watch face with numbers
*/
Clock.prototype.drawFace = function() {
    var yPos = -0.8 * this.radius
    // Rotate in a loop while drawing numbers
    this.context.font = '15px serif'
    // We don't want the number is written off from point center
    this.context.textBaseline = "middle"
    this.context.textAlign = "center"

    // Start writing numbers
    this.context.save()
    this.context.translate(this.x, this.y)
    this.context.rotate(Math.PI / 6)
    for (var i = 1; i < 13; i++) {
        this.context.fillText(i.toString(), 0, yPos)
        this.context.rotate(Math.PI / 6)
    }
    this.context.restore()
}

/*
Prototype function to add pointers
*/
Clock.prototype.addPointer = function(length, width) {
    this.context.lineCap = "round"
    this.context.lineWidth = width.toString()
    this.context.beginPath()
    this.context.moveTo(0, 0)
    this.context.lineTo(0, length)
    this.context.stroke()
}

/*
Prototype function to draw two pointers
*/
Clock.prototype.drawPointers = function() {
    this.context.save()
    this.context.translate(this.x, this.y)
    this.context.rotate(this.hourAngle)
    this.addPointer(18, 5)
    this.context.rotate(this.minuteAngle - this.hourAngle)
    this.addPointer(30, 3)
    this.context.restore()
}

/*
Prototype function to draw a small hammer on the top of the clock
*/
Clock.prototype.drawHammer = function() {
    this.context.save()
    this.context.translate(this.x, this.y - (this.radius + this.gap))
    this.context.rotate(this.hammerAngle)
    this.context.lineWidth = "2"
    // Short line
    this.context.beginPath()
    this.context.moveTo(0, 0)
    this.context.lineTo(0, -15)
    this.context.stroke()
    // Head of hammer
    this.context.beginPath()
    this.context.rect(-8, -20, 16, 5)
    this.context.fill()
    this.context.stroke()
    this.context.restore()
}

/*
Prototype function to change the angle of pointers and little hammer
*/
Clock.prototype.update = function() {
    this.hourAngle += 1 / 60 * Math.PI / 180 * this.speed
    this.minuteAngle += 1 * Math.PI / 180 * this.speed
    // The hammer is not doing 360 degree rotation
    if (this.hammerAngle >= 0.5 || this.hammerAngle <= -0.5) {
        this.hammerDirection *= -1
    }
    this.hammerAngle += this.hammerDirection * 0.01 * this.speed
}

/*
Prototype function to draw the clock itself
*/
Clock.prototype.draw = function() {
    // Moving around the clock is boring, we can shake it!
    // Get random shaking offset
    var x_off = this.shakeDegree * (Math.random() - 0.5)
    var y_off = this.shakeDegree * (Math.random() - 0.5)
    this.context.save()
    this.context.translate(x_off, y_off)

    this.drawBody()
    this.drawEars()
    this.drawFace()
    this.drawPointers()
    this.drawHammer()

    this.context.translate(-x_off, -y_off)
    //this.context.restore()
}
