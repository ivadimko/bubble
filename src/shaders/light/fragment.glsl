precision highp float;

varying vec2 vUv;
varying vec3 vecPos;
varying vec3 vecNormal;

uniform float lightIntensity;
uniform sampler2D textureSampler;

uniform samplerCube tCube;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

struct PointLight {
  vec3 color;
  vec3 position; // light position, in camera coordinates
  float distance; // used for attenuation purposes. Since
                  // we're writing our own shader, it can
                  // really be anything we want (as long as
                  // we assign it to our light in its
                  // "distance" field
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main(void) {
  // Pretty basic lambertian lighting...
  vec4 addedLights = vec4(0.0,
                          0.0,
                          0.0,
                          1.0);
  for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
      vec3 lightDirection = normalize(vecPos
                            - pointLights[l].position);
      addedLights.rgb += clamp(dot(-lightDirection,
                               vecNormal), 0.0, 1.0)
                         * pointLights[l].color
                         * lightIntensity;
  }

  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
//  vec4 reflectedColor = vec4(0., 0., 0., 1.);
  vec4 refractedColor = vec4( 1. );
//
  refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

  gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
  gl_FragColor += addedLights;


//  gl_FragColor = vec4(1., 1., 1., 1.)
//                 * addedLights;
}
