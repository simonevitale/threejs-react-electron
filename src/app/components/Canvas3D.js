import React, {Component} from 'react';

import * as THREE from '../../../../three.js';

import { OrbitControls } from '../../../../three.js/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../../../../three.js/examples/jsm/loaders/FBXLoader';

export default class Canvas3D extends Component {
	get Scene() { return this._scene; }
	get Camera() { return this._camera; }
	get Renderer() { return this._renderer; }
	get Mixer() { return this._mixer; }
	get Clock() { return this._clock; }
	get CanvasSize() { return [window.innerWidth - 16, window.innerHeight - 50]; }

	componentDidMount() {
	  	this.init();
	}

	init() {
		this._scene = new THREE.Scene();
		this._clock = new THREE.Clock();

		this._camera = new THREE.PerspectiveCamera(45, this.CanvasSize[0] / this.CanvasSize[1], 1, 2000);
		this.Camera.position.set( 100, 200, 300 );

		this.Scene.background = new THREE.Color( 0xa0a0a0 );
		this.Scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

		// Load Light
		const ambientLight = new THREE.AmbientLight( 0x000099 );
		this.Scene.add( ambientLight );

		const light1 = new THREE.HemisphereLight(0xffffff, 0x444444);
		light1.position.set(0, 200, 0);
		this.Scene.add(light1);

		const light2 = new THREE.DirectionalLight( 0xffffff );
		light2.position.set(0, 200, 100);
		light2.castShadow = true;
		light2.shadow.camera.top = 180;
		light2.shadow.camera.bottom = - 100;
		light2.shadow.camera.left = - 120;
		light2.shadow.camera.right = 120;
		this.Scene.add(light2);

		// Add a Ground Mesh
		const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		mesh.rotation.x = - Math.PI / 2;
		mesh.receiveShadow = true;
		this.Scene.add(mesh);

		// Draw a Grid
		const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.Scene.add( grid );

		// Init Renderer
		this._renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.Renderer.setPixelRatio( window.devicePixelRatio );
		this.Renderer.setSize(this.CanvasSize[0], this.CanvasSize[1]);
		this.Renderer.shadowMap.enabled = true;

		if(this.mount !== undefined)
			this.mount.appendChild(this.Renderer.domElement);

		const controls = new OrbitControls(this.Camera, this.Renderer.domElement);
		controls.target.set( 0, 100, 0 );
		controls.update();

		this.Renderer.render(this.Scene, this.Camera);

		window.addEventListener('resize', this.onWindowResize, false);
	}

	load3DModel = (model) => {
		const loader = new FBXLoader();
    
		loader.load(model, (object) => {
			console.log("Loading 3D model: ", object);

			this._mixer = new THREE.AnimationMixer(object);

			const action = this._mixer.clipAction( object.animations[ 0 ] );
			action.play();

			object.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
		
			this.Scene.add( object );
			//this.Renderer.render( this.Scene, Home.Camera );
		
			this.animate();
		}, function (e) {
			console.log(e);
		});
  	}
	
	animate = () => {
		requestAnimationFrame(this.animate);

		 var delta = this.Clock.getDelta();

		 if (this._mixer) this._mixer.update(delta);

		this.Renderer.render( this.Scene, this.Camera );
	}

	onWindowResize = () => {
		const width = this.CanvasSize[0];
		const height = this.CanvasSize[1];

		this.Camera.aspect = width / height;
		this.Camera.updateProjectionMatrix();

		this.Renderer.setSize( width, height );
	}

	loadSambaDancer = () => {
		var path = require('path');
		const modelPath = path.join(path.dirname(__dirname), '../models', 'Samba Dancing.fbx');

		this.load3DModel(modelPath);
	}

	render() {
    	return (<div>
					<div className="container" data-tid="container" ref={ref => (this.mount = ref)}></div>

					<button onClick={this.loadSambaDancer}>Load Samba Dancer</button>
				</div>);
	}
}