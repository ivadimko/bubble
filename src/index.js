import '@/styles/main.scss';

import * as THREE from 'three';
import * as dat from 'dat.gui';

import test from './texture/test.jpg';

import fragment from './shaders/light/fragment.glsl';
import vertex from './shaders/light/vertex.glsl';


const OrbitControls = require('three-orbit-controls')(THREE);


class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerWidth);
    this.renderer.setClearColor(0xeeeeee, 1);

    this.container = document.querySelector(selector);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001, 1000,
    );

    const aspect = window.innerWidth / window.innerHeight;

    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.group = null;

    this.setupSettings();


    this.setupResize();
    this.resize();
    this.addObjects();
    this.animate();
  }

  setupSettings() {
    // @todo cut geometry to change number of dots
    const that = this;
    this.settings = {
      wireframe: false,
      displacement: 5,
      mFresnelBias: 0.1,
      mFresnelPower: 2.0,
      mFresnelScale: 1.0,
    };
    this.gui = new dat.GUI();

    // wireframe
    const wireframe = this.gui.add(this.settings, 'wireframe');
    wireframe.onChange((value) => {
      this.material.wireframe = value;
    });


    // displacement
    const displacement = this.gui.add(this.settings, 'displacement', 0, 10);
    displacement.onChange((value) => {
      this.material.uniforms.uDisplacement.value = value;
    });
  }


  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }


  render() {
    this.renderer.render(this.scene, this.camera);
  }


  addObjects() {
    const urls = [
      test, test,
      test, test,
      test, test,
    ];

    this.group = new THREE.Group();

    this.scene.add(this.group);

    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;

    // this.scene.background = new THREE.Color(0xff0000);
    this.scene.background = textureCube;

    const light = new THREE.PointLight(0x000080, 0.1);
    // We want it to be very close to our character
    light.position.set(0.0, -0.5, 0.5);
    this.group.add(light);

    const light2 = new THREE.PointLight(0x393939, 1);
    // We want it to be very close to our character
    light2.position.set(0, 0.5, 0.0);
    this.group.add(light2);

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      // side: THREE.DoubleSide,
      uniforms: Object.assign(
        {},
        THREE.UniformsLib.lights,
        {
          lightIntensity: { type: 'f', value: 1 },
          textureSampler: { type: 't', value: null },
          uDisplacement: { type: 'f', value: this.settings.displacement },
          uTime: { type: 'f', value: 0 },
          mRefractionRatio: { value: 1.02 },
          mFresnelBias: { value: 0.1 },
          mFresnelPower: { value: 2.0 },
          mFresnelScale: { value: 1.0 },
          tCube: { value: textureCube },
        },
      ),
      wireframe: this.settings.wireframe,
      transparent: true,
      lights: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    // this.material = new THREE.MeshStandardMaterial({color: '#fff', side: THREE.DoubleSide})

    this.geometry = new THREE.SphereGeometry(0.25, 64, 64);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.group.add(this.mesh);
  }


  animate() {
    this.time += 0.005;
    this.material.uniforms.uTime.value = this.time;

    this.group.quaternion.copy(this.camera.quaternion);


    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

new Sketch('#container');
