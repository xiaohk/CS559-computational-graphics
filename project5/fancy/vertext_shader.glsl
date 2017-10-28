precision highp float;
attribute vec3 position;
attribute vec3 normal;
uniform float time;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 fNormal;
varying vec3 fPosition;

// Self-defined variables
varying vec3 uPos;
const float PI = 3.14159265359;

void main()
{
  // fNormal is used also in the fragment shader
  fNormal = normalize(normalMatrix * normal);
  
  // Model -> World -> Camera
  // Rotate the model
  vec3 axis = vec3(1, 1, 1);
  float angle = sin(time);
  
  mat4 rotationMatrix = mat4(
    (1.0-cos(angle)) * axis.x * axis.x + cos(angle),
    (1.0-cos(angle)) * axis.x * axis.y - axis.z * sin(angle), 
    (1.0-cos(angle)) * axis.z * axis.x + axis.y * sin(angle),
    0.0,
    (1.0-cos(angle)) * axis.x * axis.y + axis.z * sin(angle),
    (1.0-cos(angle)) * axis.y * axis.y + cos(angle),
    (1.0-cos(angle)) * axis.y * axis.z - axis.x * sin(angle), 
    0.0,
    (1.0-cos(angle)) * axis.z * axis.x - axis.y * sin(angle),
    (1.0-cos(angle)) * axis.y * axis.z + axis.x * sin(angle),
    (1.0-cos(angle)) * axis.z * axis.z + cos(angle),
    0.0,
    0.0, 0.0, 0.0, 1.0);
  
  vec4 pos = modelViewMatrix * rotationMatrix * vec4(position, 1.0);
  fPosition = pos.xyz;
  uPos = position.xyz;
  
  // Project the camera view to the screen
  gl_Position = projectionMatrix * pos;
}
