<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue';
import { refThrottled } from '@vueuse/core'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvasRef = ref<HTMLCanvasElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
const scenes: THREE.Scene[] = [];

const scrollPosition = ref(0)
const scrollPositionThrottle = refThrottled(scrollPosition, 100, false)
watch(scrollPositionThrottle, (position) => {
  window.scrollTo({
    behavior: 'smooth',
    top: position
  })
})

onMounted(() => {
  init();
  animate();

  window.addEventListener('wheel', (event) => {
    scrollPosition.value += event.deltaY
    if (scrollPosition.value < 0) scrollPosition.value = 0
  });
})

function init() {
  if (!canvasRef.value || !contentRef.value) return

  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 12, 8),
    new THREE.DodecahedronGeometry(0.5),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
  ];

  for (let i = 0; i < 40; i++) {
    const scene = new THREE.Scene();

    // make a list item
    const element = document.createElement('div');
    element.className = 'list-item';

    const sceneElement = document.createElement('div');
    element.appendChild(sceneElement);

    const descriptionElement = document.createElement('div');
    descriptionElement.innerText = 'Scene ' + (i + 1);
    element.appendChild(descriptionElement);

    // the element that represents the area we want to render the scene
    scene.userData.element = sceneElement;
    contentRef.value.appendChild(element);

    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
    camera.position.z = 2;
    scene.userData.camera = camera;

    const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.enableZoom = false;
    scene.userData.controls = controls;

    // add one random mesh to each scene
    const geometry = geometries[geometries.length * Math.random() | 0];

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 1, 0.75, THREE.SRGBColorSpace),
      roughness: 0.5,
      metalness: 0,
      flatShading: true
    });

    scene.add(new THREE.Mesh(geometry, material));

    scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 3));

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 1, 1);
    scene.add(light);

    scenes.push(scene);
  }

  renderer.value = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true });
  renderer.value.setClearColor(0xffffff, 1);
  renderer.value.setPixelRatio(window.devicePixelRatio);
}

function updateSize() {
  if (!canvasRef.value) return

  const width = canvasRef.value.clientWidth;
  const height = canvasRef.value.clientHeight;

  if (canvasRef.value.width !== width || canvasRef.value.height !== height) {
    renderer.value?.setSize(width, height, false);
  }
}

function animate() {
  render();
  requestAnimationFrame(animate);
}

function render() {
  if (!canvasRef.value || !renderer.value) return

  updateSize();

  canvasRef.value.style.transform = `translateY(${window.scrollY}px)`;

  renderer.value.setClearColor(0xffffff);
  renderer.value.setScissorTest(false);
  renderer.value.clear();

  renderer.value.setClearColor(0xe0e0e0);
  renderer.value.setScissorTest(true);

  scenes.forEach(function (scene) {

    // so something moves
    scene.children[0].rotation.y = Date.now() * 0.001;

    // get the element that is a place holder for where we want to
    // draw the scene
    const element = scene.userData.element;

    // get its position relative to the page's viewport
    const rect = element.getBoundingClientRect();

    // check if it's offscreen. If so skip it
    if (rect.bottom < 0 || rect.top > renderer.value!.domElement.clientHeight ||
      rect.right < 0 || rect.left > renderer.value!.domElement.clientWidth) {
      return; // it's off screen
    }

    // set the viewport
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = renderer.value!.domElement.clientHeight - rect.bottom;

    renderer.value!.setViewport(left, bottom, width, height);
    renderer.value!.setScissor(left, bottom, width, height);

    const camera = scene.userData.camera;

    renderer.value!.render(scene, camera);
  });
}
</script>

<template>
  <canvas ref="canvasRef" />
  <div ref="contentRef" class="content"></div>
</template>

<style>
body {
	margin: 0;
	background-color: #000;
	color: #fff;
	font-family: Monospace;
	font-size: 13px;
	line-height: 24px;
	overscroll-behavior: none;
}

canvas {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
}

.content {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
  padding: 3em 0 0 0;
}

.list-item {
  display: inline-block;
  margin: 1em;
  padding: 1em;
  box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);
}

.list-item>div:nth-child(1) {
  width: 200px;
  height: 200px;
}

.list-item>div:nth-child(2) {
  color: #888;
  font-family: sans-serif;
  font-size: large;
  width: 200px;
  margin-top: 0.5em;
}
</style>
