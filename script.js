<<<<<<< HEAD
/* Poly Heart model by Quaternius [CC0] (https://creativecommons.org/publicdomain/zero/1.0/) via Poly Pizza (https://poly.pizza/m/1yCRUwFnwX)
 */

import * as THREE from "https://cdn.skypack.dev/three@0.135.0";
import { gsap } from "https://cdn.skypack.dev/gsap@3.8.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader";
class World {
  constructor({
    canvas,
    width,
    height,
    cameraPosition,
    fieldOfView = 75,
    nearPlane = 0.1,
    farPlane = 100 })
  {
    this.parameters = {
      count: 1500,
      max: 12.5 * Math.PI,
      a: 2,
      c: 4.5 };

    this.textureLoader = new THREE.TextureLoader();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16000a);
    this.clock = new THREE.Clock();
    this.data = 0;
    this.time = { current: 0, t0: 0, t1: 0, t: 0, frequency: 0.0005 };
    this.angle = { x: 0, z: 0 };
    this.width = width || window.innerWidth;
    this.height = height || window.innerHeight;
    this.aspectRatio = this.width / this.height;
    this.fieldOfView = fieldOfView;
    this.camera = new THREE.PerspectiveCamera(
    fieldOfView,
    this.aspectRatio,
    nearPlane,
    farPlane);

    this.camera.position.set(
    cameraPosition.x,
    cameraPosition.y,
    cameraPosition.z);

    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true });

    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.timer = 0;
    this.addToScene();
    this.addButton();

    this.render();
    this.listenToResize();
    this.listenToMouseMove();
  }
  start() {}
  render() {
    this.renderer.render(this.scene, this.camera);
    this.composer && this.composer.render();
  }
  loop() {
    this.time.elapsed = this.clock.getElapsedTime();
    this.time.delta = Math.min(
    60,
    (this.time.current - this.time.elapsed) * 1000);

    if (this.analyser && this.isRunning) {
      this.time.t = this.time.elapsed - this.time.t0 + this.time.t1;
      this.data = this.analyser.getAverageFrequency();
      this.data *= this.data / 2000;
      this.angle.x += this.time.delta * 0.001 * 0.63;
      this.angle.z += this.time.delta * 0.001 * 0.39;
      const justFinished = this.isRunning && !this.sound.isPlaying;
      if (justFinished) {
        this.time.t1 = this.time.t;
        this.audioBtn.disabled = false;
        this.isRunning = false;
        const tl = gsap.timeline();
        this.angle.x = 0;
        this.angle.z = 0;
        tl.to(this.camera.position, {
          x: 0,
          z: 4.5,
          duration: 4,
          ease: "expo.in" });

        tl.to(this.audioBtn, {
          opacity: () => 1,
          duration: 1,
          ease: "power1.out" });

      } else {
        this.camera.position.x = Math.sin(this.angle.x) * this.parameters.a;
        this.camera.position.z = Math.min(
        Math.max(Math.cos(this.angle.z) * this.parameters.c, 1.75),
        6.5);

      }
    }
    this.camera.lookAt(this.scene.position);
    if (this.heartMaterial) {
      this.heartMaterial.uniforms.uTime.value +=
      this.time.delta * this.time.frequency * (1 + this.data * 0.2);
    }
    if (this.model) {
      this.model.rotation.y -= 0.0005 * this.time.delta * (1 + this.data);
    }
    if (this.snowMaterial) {
      this.snowMaterial.uniforms.uTime.value +=
      this.time.delta * 0.0004 * (1 + this.data);
    }
    this.render();

    this.time.current = this.time.elapsed;
    requestAnimationFrame(this.loop.bind(this));
  }
  listenToResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Update camera
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }
  listenToMouseMove() {
    window.addEventListener("mousemove", e => {
      const x = e.clientX;
      const y = e.clientY;
      gsap.to(this.camera.position, {
        x: gsap.utils.mapRange(0, window.innerWidth, 0.2, -0.2, x),
        y: gsap.utils.mapRange(0, window.innerHeight, 0.2, -0.2, -y) });

    });
  }
  addHeart() {
    this.heartMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById("fragmentShader").textContent,
      vertexShader: document.getElementById("vertexShader").textContent,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.2 },
        uTex: {
          value: new THREE.TextureLoader().load(
          "https://assets.codepen.io/74321/heart.png") } },



      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true });

    const count = this.parameters.count; //2000
    const scales = new Float32Array(count * 1);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const randoms = new Float32Array(count);
    const randoms1 = new Float32Array(count);
    const colorChoices = [
    "white",
    "red",
    "pink",
    "crimson",
    "hotpink",
    "green"];


    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    this.instancedGeometry = new THREE.InstancedBufferGeometry();
    Object.keys(squareGeometry.attributes).forEach(attr => {
      this.instancedGeometry.attributes[attr] = squareGeometry.attributes[attr];
    });
    this.instancedGeometry.index = squareGeometry.index;
    this.instancedGeometry.maxInstancedCount = count;

    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const i3 = 3 * i;
      randoms[i] = Math.random();
      randoms1[i] = Math.random();
      scales[i] = Math.random() * 0.35;
      const colorIndex = Math.floor(Math.random() * colorChoices.length);
      const color = new THREE.Color(colorChoices[colorIndex]);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      speeds[i] = Math.random() * this.parameters.max;
    }
    this.instancedGeometry.setAttribute(
    "random",
    new THREE.InstancedBufferAttribute(randoms, 1, false));

    this.instancedGeometry.setAttribute(
    "random1",
    new THREE.InstancedBufferAttribute(randoms1, 1, false));

    this.instancedGeometry.setAttribute(
    "aScale",
    new THREE.InstancedBufferAttribute(scales, 1, false));

    this.instancedGeometry.setAttribute(
    "aSpeed",
    new THREE.InstancedBufferAttribute(speeds, 1, false));

    this.instancedGeometry.setAttribute(
    "aColor",
    new THREE.InstancedBufferAttribute(colors, 3, false));

    this.heart = new THREE.Mesh(this.instancedGeometry, this.heartMaterial);
    console.log(this.heart);
    this.scene.add(this.heart);
  }
  addToScene() {
    this.addModel();
    this.addHeart();
    this.addSnow();
  }
  async addModel() {
    this.model = await this.loadObj(
    "https://assets.codepen.io/74321/heart.glb");

    this.model.scale.set(0.01, 0.01, 0.01);
    this.model.material = new THREE.MeshMatcapMaterial({
      matcap: this.textureLoader.load(
      "https://assets.codepen.io/74321/3.png",
      () => {
        gsap.to(this.model.scale, {
          x: 0.35,
          y: 0.35,
          z: 0.35,
          duration: 1.5,
          ease: "Elastic.easeOut" });

      }),

      color: "#ff89aC" });

    this.scene.add(this.model);
  }
  addButton() {
    this.audioBtn = document.querySelector("button");
    this.audioBtn.addEventListener("click", () => {
      this.audioBtn.disabled = true;
      if (this.analyser) {
        this.sound.play();
        this.time.t0 = this.time.elapsed;
        this.data = 0;
        this.isRunning = true;
        gsap.to(this.audioBtn, {
          opacity: 0,
          duration: 1,
          ease: "power1.out" });

      } else {
        this.loadMusic().then(() => {
          console.log("music loaded");
        });
      }
    });
  }
  loadObj(path) {
    const loader = new GLTFLoader();
    return new Promise(resolve => {
      loader.load(
      path,
      response => {
        resolve(response.scene.children[0]);
      },
      xhr => {},
      err => {
        console.log(err);
      });

    });
  }
  loadMusic() {
    return new Promise(resolve => {
      const listener = new THREE.AudioListener();
      this.camera.add(listener);
      // create a global audio source
      this.sound = new THREE.Audio(listener);
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load(
      "https://assets.codepen.io/74321/ukulele.mp3",
      buffer => {
        this.sound.setBuffer(buffer);
        this.sound.setLoop(false);
        this.sound.setVolume(0.5);
        this.sound.play();
        this.analyser = new THREE.AudioAnalyser(this.sound, 32);
        // get the average frequency of the sound
        const data = this.analyser.getAverageFrequency();
        this.isRunning = true;
        this.t0 = this.time.elapsed;
        resolve(data);
      },
      progress => {
        gsap.to(this.audioBtn, {
          opacity: () => 1 - progress.loaded / progress.total,
          duration: 1,
          ease: "power1.out" });

      },

      error => {
        console.log(error);
      });

    });
  }
  addSnow() {
    this.snowMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById("fragmentShader1").textContent,
      vertexShader: document.getElementById("vertexShader1").textContent,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.3 },
        uTex: {
          value: new THREE.TextureLoader().load(
          "https://assets.codepen.io/74321/heart.png") } },



      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true });

    const count = 550;
    const scales = new Float32Array(count * 1);
    const colors = new Float32Array(count * 3);
    const phis = new Float32Array(count);
    const randoms = new Float32Array(count);
    const randoms1 = new Float32Array(count);
    const colorChoices = ["red", "pink", "hotpink", "green"];

    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    this.instancedGeometry = new THREE.InstancedBufferGeometry();
    Object.keys(squareGeometry.attributes).forEach(attr => {
      this.instancedGeometry.attributes[attr] = squareGeometry.attributes[attr];
    });
    this.instancedGeometry.index = squareGeometry.index;
    this.instancedGeometry.maxInstancedCount = count;

    for (let i = 0; i < count; i++) {
      const phi = (Math.random() - 0.5) * 10;
      const i3 = 3 * i;
      phis[i] = phi;
      randoms[i] = Math.random();
      randoms1[i] = Math.random();
      scales[i] = Math.random() * 0.35;
      const colorIndex = Math.floor(Math.random() * colorChoices.length);
      const color = new THREE.Color(colorChoices[colorIndex]);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    this.instancedGeometry.setAttribute(
    "phi",
    new THREE.InstancedBufferAttribute(phis, 1, false));

    this.instancedGeometry.setAttribute(
    "random",
    new THREE.InstancedBufferAttribute(randoms, 1, false));

    this.instancedGeometry.setAttribute(
    "random1",
    new THREE.InstancedBufferAttribute(randoms1, 1, false));

    this.instancedGeometry.setAttribute(
    "aScale",
    new THREE.InstancedBufferAttribute(scales, 1, false));

    this.instancedGeometry.setAttribute(
    "aColor",
    new THREE.InstancedBufferAttribute(colors, 3, false));

    this.snow = new THREE.Mesh(this.instancedGeometry, this.snowMaterial);
    this.scene.add(this.snow);
  }}


const world = new World({
  canvas: document.querySelector("canvas.webgl"),
  cameraPosition: { x: 0, y: 0, z: 4.5 } });


world.loop();
=======
 function getJSOrganization() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('name') || "Love";
        }

        const JSOrganization = getJSOrganization();
        document.querySelectorAll('[id^="JSOrganization-placeholder"]').forEach(el => el.textContent = JSOrganization);

        function showProposal(id) {
            document.querySelectorAll('.proposal-screen').forEach(screen => screen.style.display = 'none');
            document.getElementById(id).style.display = 'block';
            if (id === 'proposal-yes') {
                document.body.style.backgroundColor = '#ffecf0';
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        }

        function moveRandomEl(Sowrov) {
            Sowrov.style.position = "absolute";
            Sowrov.style.top = Math.floor(Math.random() * 90 + 5) + "%";
            Sowrov.style.left = Math.floor(Math.random() * 90 + 5) + "%";
        }

        function _0x4a86(_0x3ffc64,_0x2e39ad){const _0x57ce0d=_0x57ce();return _0x4a86=function(_0x4a860e,_0x2bbfb6){_0x4a860e=_0x4a860e-0x1f0;let _0x274696=_0x57ce0d[_0x4a860e];return _0x274696;},_0x4a86(_0x3ffc64,_0x2e39ad);}const _0x2db35d=_0x4a86;function _0x57ce(){const _0x5945c7=['Sowrov5','https://botfather.cloud/Assets/Sticker/jumping_together_with_love.json','proposal-1','Sowrov3','target','74092tlrJlL','https://botfather.cloud/Assets/Sticker/sad_duck.json','loadAnimation','https://botfather.cloud/Assets/Sticker/crying_wtr_duck.json','DOMContentLoaded','Sowrov2','https://botfather.cloud/Assets/Sticker/pleading_face.json','34uYGJwu','4221636GfZAfN','Sowrov4','6457940bpChEw','54672kHGfDz','7hlydAt','1254GYtOVA','svg','click','1290717nfeFAk','93HvFKvd','4396XUvrju','mouseenter','3800305oICswl','https://botfather.cloud/Assets/Sticker/loud_cry_duck.json','getElementById','addEventListener','16bkzSTM','Sowrov1'];_0x57ce=function(){return _0x5945c7;};return _0x57ce();}(function(_0x2686d5,_0x2d42dc){const _0x1b2dbc=_0x4a86,_0x2dd2ec=_0x2686d5();while(!![]){try{const _0x27a769=-parseInt(_0x1b2dbc(0x1f1))/0x1*(-parseInt(_0x1b2dbc(0x1fc))/0x2)+parseInt(_0x1b2dbc(0x1fb))/0x3*(-parseInt(_0x1b2dbc(0x209))/0x4)+parseInt(_0x1b2dbc(0x1fe))/0x5+-parseInt(_0x1b2dbc(0x1f2))/0x6*(parseInt(_0x1b2dbc(0x1f6))/0x7)+parseInt(_0x1b2dbc(0x202))/0x8*(-parseInt(_0x1b2dbc(0x1fa))/0x9)+parseInt(_0x1b2dbc(0x1f4))/0xa+-parseInt(_0x1b2dbc(0x1f7))/0xb*(-parseInt(_0x1b2dbc(0x1f5))/0xc);if(_0x27a769===_0x2d42dc)break;else _0x2dd2ec['push'](_0x2dd2ec['shift']());}catch(_0x21e668){_0x2dd2ec['push'](_0x2dd2ec['shift']());}}}(_0x57ce,0x6a47e),document[_0x2db35d(0x201)](_0x2db35d(0x20d),()=>{const _0xa8ac0b=_0x2db35d;showProposal(_0xa8ac0b(0x206));const _0x437996=document[_0xa8ac0b(0x200)]('move-random');_0x437996[_0xa8ac0b(0x201)](_0xa8ac0b(0x1fd),_0x4a8ba9=>moveRandomEl(_0x4a8ba9['target'])),_0x437996[_0xa8ac0b(0x201)](_0xa8ac0b(0x1f9),_0x3acd6b=>moveRandomEl(_0x3acd6b[_0xa8ac0b(0x208)])),lottie[_0xa8ac0b(0x20b)]({'container':document[_0xa8ac0b(0x200)](_0xa8ac0b(0x203)),'renderer':'svg','loop':!![],'autoplay':!![],'path':_0xa8ac0b(0x1f0)}),lottie[_0xa8ac0b(0x20b)]({'container':document[_0xa8ac0b(0x200)](_0xa8ac0b(0x20e)),'renderer':_0xa8ac0b(0x1f8),'loop':!![],'autoplay':!![],'path':_0xa8ac0b(0x20a)}),lottie[_0xa8ac0b(0x20b)]({'container':document[_0xa8ac0b(0x200)](_0xa8ac0b(0x207)),'renderer':'svg','loop':!![],'autoplay':!![],'path':_0xa8ac0b(0x20c)}),lottie[_0xa8ac0b(0x20b)]({'container':document['getElementById'](_0xa8ac0b(0x1f3)),'renderer':'svg','loop':!![],'autoplay':!![],'path':_0xa8ac0b(0x1ff)}),lottie[_0xa8ac0b(0x20b)]({'container':document['getElementById'](_0xa8ac0b(0x204)),'renderer':_0xa8ac0b(0x1f8),'loop':!![],'autoplay':!![],'path':_0xa8ac0b(0x205)});}));
>>>>>>> fd86726 (first commit)
