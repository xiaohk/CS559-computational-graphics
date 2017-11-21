// Brokeback mountain scene description file

var my_trunk1 = new Trunk(name = "Trunk1",
                          position = [-2.1,0,2.1],
                          size = 1,
                          color = [68/255, 36/255, 29/255], 
                          radius = 0.5,
                          numCirlce = 32,
                          height = 0.75)

var my_trunk2 = new Trunk(name = "Trunk2",
                          position = [-2.1,0,1.3],
                          size = 1,
                          color = [68/255, 36/255, 29/255], 
                          radius = 0.8,
                          numCirlce = 32,
                          height = 1.3)
grobjects.push(my_trunk1)
grobjects.push(my_trunk2)

var my_tent = new Tent(name = "Tent",
                       position = [0,0,0],
                       size = 1,
                       color = [203/255, 181/255, 182/255],
                       width = 3,
                       height = 2)
grobjects.push(my_tent)


// Adding sheeps
var sheep1 = new Sheep(name = "Sheep1",
                       position = [3,0,-3],
                       size = 1,
                       color = [218/255, 211/255, 192/255])

var sheep2 = new Sheep(name = "Sheep2",
                       position = [4,0,-2.5],
                       size = 1,
                       color = [218/255, 211/255, 192/255])

var sheep3 = new Sheep(name = "Sheep3",
                       position = [3.5,0,-4],
                       size = 1,
                       color = [218/255, 211/255, 192/255])

grobjects.push(sheep1)
grobjects.push(sheep2)
grobjects.push(sheep3)
