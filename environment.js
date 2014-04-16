Environment = function () {
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML = "";

	}

	var parameters = {
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1
	}

	var waterNormals;

	this.init(parameters);
}

var container, stats;
var camera, scene, renderer;

Environment.prototype.init = function(parameters) {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 3000 );

	camera.position.set( 0, 1, 1 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.userPan = false;
	controls.userPanSpeed = 0.0;
	controls.maxDistance = 5000.0;
	controls.maxPolarAngle = Math.PI * 0.495;

	directionalLight = new THREE.DirectionalLight( 0xffff55, 1 );
	directionalLight.position.set( - 1, 0.4, - 1 );
	scene.add( directionalLight );

	// load skybox

	var cubeMap = new THREE.Texture( [] );
	cubeMap.format = THREE.RGBFormat;
	cubeMap.flipY = false;

	var loader = new THREE.ImageLoader();
	loader.load( 'textures/skyboxsun25degtest.png', function ( image ) {

		var getSide = function ( x, y ) {

			var size = 1024;

			var canvas = document.createElement( 'canvas' );
			canvas.width = size;
			canvas.height = size;

			var context = canvas.getContext( '2d' );
			context.drawImage( image, - x * size, - y * size );

			return canvas;

		};

		cubeMap.image[ 0 ] = getSide( 2, 1 ); // px
		cubeMap.image[ 1 ] = getSide( 0, 1 ); // nx
		cubeMap.image[ 2 ] = getSide( 1, 0 ); // py
		cubeMap.image[ 3 ] = getSide( 1, 2 ); // ny
		cubeMap.image[ 4 ] = getSide( 1, 1 ); // pz
		cubeMap.image[ 5 ] = getSide( 3, 1 ); // nz
		cubeMap.needsUpdate = true;

	} );

	var cubeShader = THREE.ShaderLib['cube'];
	cubeShader.uniforms['tCube'].value = cubeMap;

	var skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: cubeShader.fragmentShader,
		vertexShader: cubeShader.vertexShader,
		uniforms: cubeShader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

	var skyBox = new THREE.Mesh(
		new THREE.BoxGeometry( 1000, 1000, 1000 ),
		skyBoxMaterial
	);
	
	scene.add( skyBox );

	//add ground 
	var grassTex = THREE.ImageUtils.loadTexture('textures/grass.png'); 
	grassTex.wrapS = THREE.RepeatWrapping; 
	grassTex.wrapT = THREE.RepeatWrapping; 
	grassTex.repeat.x = 256; 
	grassTex.repeat.y = 256; 
	var groundMat = new THREE.MeshBasicMaterial({map:grassTex}); 

	var groundGeo = new THREE.PlaneGeometry(400,400); 

	var ground = new THREE.Mesh(groundGeo,groundMat); 
	ground.position.y = -1.9; //lower it 
	ground.rotation.x = -Math.PI/2; //-90 degrees around the xaxis 
	//IMPORTANT, draw on both sides 
	ground.doubleSided = true; 
	scene.add(ground); 

	//

	function animate() {

		requestAnimationFrame( animate );
		render();

	}

	function render() {

		controls.update();
		renderer.render( scene, camera );

	}

}