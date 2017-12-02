// Brokeback mountain scene description file

// +++++++++++++++++++++++++ Trunks +++++++++++++++++++++++++++++++++
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
                          height = 1.2)
grobjects.push(my_trunk1)
grobjects.push(my_trunk2)

// +++++++++++++++++++++++ Tent ++++++++++++++++++++++++++++++++++++
var my_tent = new Tent(name = "Tent",
                       position = [0,0,0],
                       size = 1,
                       color = [203/255, 181/255, 182/255],
                       width = 3,
                       height = 2)
grobjects.push(my_tent)

// +++++++++++++++++++++++ Sheeps +++++++++++++++++++++++++++++++++++

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

// +++++++++++++++++++++++ Cowboys +++++++++++++++++++++++++++++++++++

var myBoy1 = new Boy(name = "Jack",
                     position = [-1,0,3],
                     size = 0.001,
                     color = [236/255, 205/255, 182/255],
                     theta = Math.PI*1/5)

var myBoy2 = new Boy(name = "Ennis",
                     position = [-1.2,0,3.8],
                     size = 0.001,
                     color = [201/255, 156/255, 132/255],
                     theta = Math.PI*3/5)

grobjects.push(myBoy1)
grobjects.push(myBoy2)

// +++++++++++++++++++++++ Campfire +++++++++++++++++++++++++++++++++++

var myCampFire = new CampFire(name = "campfire",
                              position = [0.5, 0, 1.7],
                              size = 1,
                              color = [96/255, 65/255, 48/255],
                              stoneColor = [117/255, 108/255, 104/255],
                              radius = 0.5,
                              poleRadius = 0.05,
                              numPole = 9,
                              numCircle = 8,
                              height = 0.7,
                              theta = Math.PI/3.5,
                              stoneScale = [0.15, 0.1, 0.12])
grobjects.push(myCampFire)

// +++++++++++++++++++++++ Trees +++++++++++++++++++++++++++++++++++

var treeColor1 = [44/255, 67/255, 46/255]
var treeColor2 = [50/255, 68/255, 49/255]
var treeColor3 = [83/255, 104/255, 66/255]
var trunkColor = [96/255, 65/255, 48/255] 


var myTree1 = new Tree(name = "tree1",
                       position = [-2.5, 0, -2.7],
                       size = 0.5,
                       color = treeColor1,
                       trunkColor = trunkColor,
                       radius = 1,
                       trunkRadius = 0.2,
                       numCircle = 4,
                       TrunkNumCircle = 16,
                       height = 5,
                       theta = Math.PI/4,
                       numLayer = 3,
                       heightRatio = 3/5)

var myTree2 = new Tree(name = "tree2",
                       position = [-1.7, 0, -2.7],
                       size = 0.5,
                       color = treeColor1,
                       trunkColor = trunkColor,
                       radius = 1.3,
                       trunkRadius = 0.2,
                       numCircle = 4,
                       TrunkNumCircle = 16,
                       height = 6,
                       theta = 0,
                       numLayer = 4,
                       heightRatio = 3/5)

var myTree3 = new Tree(name = "tree3",
                       position = [-0.7, 0, -2.7],
                       size = 0.6,
                       color = treeColor1,
                       trunkColor = trunkColor,
                       radius = 1.3,
                       trunkRadius = 0.2,
                       numCircle = 5,
                       TrunkNumCircle = 16,
                       height = 6,
                       theta = 0,
                       numLayer = 4,
                       heightRatio = 3/5)

var myTree4 = new Tree(name = "tree4",
                       position = [0.2, 0, -2.7],
                       size = 0.5,
                       color = treeColor1,
                       trunkColor = trunkColor,
                       radius = 1.3,
                       trunkRadius = 0.2,
                       numCircle = 4,
                       TrunkNumCircle = 16,
                       height = 6,
                       theta = Math.PI/5,
                       numLayer = 3,
                       heightRatio = 3/5)

var myTree5 = new Tree(name = "tree5",
                       position = [1, 0, -2.7],
                       size = 0.5,
                       color = treeColor1,
                       trunkColor = trunkColor,
                       radius = 1,
                       trunkRadius = 0.2,
                       numCircle = 16,
                       TrunkNumCircle = 16,
                       height = 7,
                       theta = Math.PI/5,
                       numLayer = 3,
                       heightRatio = 3/5)

var myTree6 = new Tree(name = "tree6",
                       position = [1.8, 0, -2.7],
                       size = 0.5,
                       color = treeColor1,
                       trunkColor = trunkColor,
                       radius = 1.3,
                       trunkRadius = 0.3,
                       numCircle = 6,
                       TrunkNumCircle = 16,
                       height = 9,
                       theta = Math.PI/3,
                       numLayer = 3,
                       heightRatio = 3/5)

grobjects.push(myTree1)
grobjects.push(myTree2)
grobjects.push(myTree3)
grobjects.push(myTree4)
grobjects.push(myTree5)
grobjects.push(myTree6)
