precision highp float;
uniform float time;
uniform mat4 modelViewMatrix;
uniform vec2 resolution;
varying vec3 fPosition;
varying vec3 fNormal;

// Self-defined variables
varying vec3 light;
varying vec3 test;
const vec3 spe_light = vec3(0.0,1.0,0.0);
const float ambient_coef = 0.2;
const float diffuse_coef = 0.9;
const float specular_coef = 0.1;
const float focus_power = 1.5;


vec3 convert_rgb(in int r, in int g, in int b){
  return vec3(float(r)/255.0, float(g)/255.0, float(b)/255.0);
}

void main()
{
  
  // Add Ambient and diffuse light
  vec3 color = convert_rgb(217, 151, 47);
  vec3 diffuse_color = (diffuse_coef * 0.5 * (dot(fNormal, light) + 
                        1.0)) * color;
  vec3 ambient_color = ambient_coef * color;
  
  // Add specular light
  vec3 reflect_v = reflect(spe_light, fNormal);
  float power = pow(max(0.0, dot(fNormal, (spe_light 
                                 + (-fPosition)))), focus_power);
  vec3 specular_color = power * specular_coef * color;
  
  gl_FragColor = vec4(ambient_color + diffuse_color + 
                      specular_color, 1.0);

}
