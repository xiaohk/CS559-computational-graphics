"use strict"

function Sun(context, radius, theta, speed) {
    this.context = context
    this.theta = theta
    // The magic number 673 is calculated by me
    // (find a circle using three points), then use the centeral
    // point as a new coordinate system
    this.x = Math.cos(this.theta) * 673
    this.y = Math.sin(this.theta) * 673
    this.triangleAngle = 0
    this.speed = speed
    this.radius = radius
}

/*
Prototype funciton to draw the circle of sun
*/
Sun.prototype.drawCircle = function() {
    this.context.save()
    this.context.translate(300, 773)
    this.context.beginPath()
    this.context.arc(this.x, -this.y, this.radius, 0, 2 * Math.PI)
    this.context.fillStyle = "tomato"
    this.context.fill()

    // Lets give sun a creepy face!
    this.context.beginPath()
    this.context.fillStyle = "white"
    this.context.arc(this.x - 10, -(this.y + 5), 4, 0, 2 * Math.PI)
    this.context.fill()
    this.context.beginPath()
    this.context.arc(this.x + 10, -(this.y + 5), 4, 0, 2 * Math.PI)
    this.context.fill()
    this.context.beginPath()
    this.context.arc(this.x, -(this.y - 10), 10, 0, Math.PI)
    this.context.fill()
    this.context.restore()
}

/*
Prototype function to draw the "fire" triangle around the sun
*/
Sun.prototype.addTriangle = function() {
    this.context.beginPath()
    this.context.fillStyle = "tomato";
    this.context.moveTo(0, -this.radius - 3)
    this.context.lineTo(-10, -this.radius - 3)
    this.context.lineTo(0, -this.radius - 20)
    this.context.lineTo(10, -this.radius - 3)
    this.context.closePath()
    this.context.fill()
}

/*
Draw the triangles while rotationg
*/
Sun.prototype.drawTriangle = function() {
    this.context.save()
    // To the center of path circle, then to the center of sun
    this.context.translate(300, 773)
    this.context.translate(this.x, -this.y)
    this.context.rotate(this.triangleAngle)
    this.addTriangle()
    for (var i = 0; i < 12; i++) {
        this.context.rotate(Math.PI / 6)
        this.addTriangle()
    }
    this.context.restore()
}

/*
Update the position of the sun
*/
Sun.prototype.update = function() {
    this.theta -= 0.01 * this.speed / 5
    // To the right edge, return to the left
    if (this.theta <= Math.PI / 2 - 0.55) {
        this.theta = Math.PI / 2 + 0.55
    }
    this.x = Math.cos(this.theta) * 673
    this.y = Math.sin(this.theta) * 673

    // Let the triangles rotate too
    this.triangleAngle += (1 * Math.PI / 180) * this.speed
}

/*
Draw Sun it self
*/
Sun.prototype.draw = function() {
    this.drawCircle()
    this.drawTriangle()
}
