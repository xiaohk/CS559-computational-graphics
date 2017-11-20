/**
 * Created by gleicher on 10/9/2015.
 */

/**
 this file defines what a "graphics object" is for the graphics town system
 rather than defining a class, as you would in a conventional programming language,
 we define the properties that the objects must have.

 when you make a new object to put in the world, it must do the required things.
 you can make your own objects that do the right things.
 you can have these objects refer to the example objects as prototypes
 you can make your own prototypes
 and so forth...

 you should define your objects in javascript files that are loaded before the "main" part
 of graphics town

 your files should put these objects into the "grobjects" global array. if this list doesn't exist
 you must make it.

 it also provides the specifcaton for what the drawing state object will look like
 **/

var grobjects =[];

// GrObject - a GrObject must have the following:
//
// fields:
// name - a unique string (each instance must be a unique string)
//
//
// note: the methods are always called using the method invocation pattern
//  (so "this" is what you expect)
//
// methods:
// draw - a function that is called each time the image is redrawn
//   it takes a single parameter: a "DrawingState Object"
// init - a function that is called once (per object) before the first draw
//   but AFTER the GL context is prepares. It takes a drawing state object
//   as a parameter
// center - a function that takes a DrawingState and returns a 3-vector that is
//   the position ofthe center of the object. this is used for "inspection" mode


/*
the DrawingState

the DrawingState object (which is passed to the draw and init methods) has the following
fields defined:

 gl - the gl context to draw into

 Things for viewing:
 view - the viewing transform: from world to camera
   note: because the view transform is a rotate, translate, uniform scale,
   it can be used to transform normals if desired
    (personally, I prefer to do lighting computations in world space)
 camera - the camera transform: this is the inverse of the view
   transform (it goes from the camera coordinates to world coords)
 proj - the projection matrix

 Things for animating:
 realtime - a number that is (roughly) the number of milliseconds since the program
  started running. the user interface allows for "stopping" this clock. you can use
  this variable to make things move

 Things for lighting:
 timeOfDay - a number between 0-24 (military time 12=noon, 15=3pm) that is a "time of day"
   this is controlled by a slider in the UI - it is mainly used as a way to set the sun direction
 sunDirection - a unit vector of the sun's lighting direction. it is vertical at noon
   at night, it will be from "under ground". so basically, from 6pm to 6am, you should turn off sunlight

 */


//
// utility routines
// find an object with a particular name
function findObj(name) {
    var rv = null;
    grobjects.forEach(function(obj) {
        if (obj.name == name) {
            rv = obj;
        }
    });
    return rv;
};