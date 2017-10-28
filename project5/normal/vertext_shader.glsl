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
varying vec3 light;
varying vec3 test;

void main()
{
  // Get the normal vector
  fNormal = normalize(normalMatrix * normal);
  
  // Model -> World -> Camera
  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  fPosition = pos.xyz;
  
  // Camera -> Screen
  gl_Position = projectionMatrix * pos;
  
  // Make my light direction in modle space
  vec3 light_model = vec3(sin(time*20.0), cos(time*20.0), 0.0);
  light = normalize(light_model).xyz;

}
