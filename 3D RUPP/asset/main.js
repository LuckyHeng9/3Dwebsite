const canvas = document.querySelector('.canvas');
const card = document.querySelector('.info-panel');
const labelLine = document.querySelector('.vertical-line');
const bc = ["./asset/buildA.jpg", "./asset/buildT.jpg", "./asset/buildB.jpg","./asset/buildD.jpg" ,"./asset/STEM.jpg"];

const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const Fov = 75;

const camera = new THREE.PerspectiveCamera(Fov, sizes.width / sizes.height, 1, 10000);
camera.position.set(0, 155, 160);

scene.add(camera);

const initialCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
//const initialCameraTarget = new THREE.Vector3(0, 89, 90);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 110;
controls.maxDistance = 160;


// Set rotation constraints
controls.maxAzimuthAngle = Math.PI / 4; // Limit horizontal rotation to 45 degrees
controls.minAzimuthAngle = -Math.PI / 4; // Limit horizontal rotation to -45 degrees

controls.maxPolarAngle = Math.PI / 3; // Limit vertical rotation to 90 degrees
controls.minPolarAngle = Math.PI / 5; // Limit vertical rotation to 45 degrees

controls.mouseButtons = {
    RIGHT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    LEFT: THREE.MOUSE.PAN
};

const building = [];
const btnLabels = [];
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const loader = new THREE.GLTFLoader();
const modelPath = null;

const buildingMap = {
    'Building A': bc[0],
    'Building T': bc[1],
    'Building B': bc[2],
    'Building D': bc[3],
    'Building STEM': bc[4]
};

const createBuilding = (x, y, z, labelText, modelPath,scale) => {
    loader.load(modelPath, function (gltf) {
        const model = gltf.scene;

        model.position.set(x, y, z);

         // Set the scale of the model using the provided scale value
         model.scale.set(scale.x, scale.y, scale.z);
        model.rotation.y = 11;

        scene.add(model);
        building.push(model);

        const btn = document.createElement('div');
        btn.className = 'btnlabel';
        btn.innerHTML = labelText;
        document.body.appendChild(btn);
        btnLabels.push(btn);

        btn.addEventListener('click', (event) => onBtnLabelClick(event, model, labelText), true);
    });
};


// Different model paths for each building
const buildingModels = {
    'Building D': '/asset/Test building.glb',
    'Building T': '/asset/Test building.glb',
    'Building A': '/asset/Test building.glb',
    'Building B': '/asset/Test building.glb',
    'Building STEM': '/asset/Building/BuildingSteam.gltf'
};

// Call createCube with specific model paths for each building
createBuilding(-140, 0, -84, 'Building D', buildingModels['Building D'], { x: 0.2, y: 0.2, z: 0.2 });
createBuilding(150, 0, -150, 'Building T', buildingModels['Building T'],{ x: 0.2, y: 0.2, z: 0.2 });
createBuilding(10, 0, 31, 'Building A', buildingModels['Building A'],{ x: 0.2, y: 0.2, z: 0.2 });
createBuilding(-100, 0, -150, 'Building B', buildingModels['Building B'],{ x: 0.2, y: 0.2, z: 0.2 });
createBuilding(10, 0, -90, 'Building STEM', buildingModels['Building STEM'], { x: 1, y: 1, z: 1 });




loader.load('/asset/Stadium.gltf', function (gltf) {
    const stadium = gltf.scene;
    stadium.position.set(120, -4.8, -40);
    stadium.scale.set(2.2,2.2,2.2);
    scene.add(stadium);
}, undefined, function (error) {
    console.error(error);
});

const roadInstances = [
    { position: { x: 80, y: 0, z: -40 }, scale: { x: 0.02, y: 0.05, z: 1.5 } , rotation: {x: 0, y: 0, z: 0} },
    { position: { x: -80, y: 0, z: -40 }, scale: { x: 0.02, y: 0.05, z: 1.5 } , rotation: {x: 0, y: 0, z: 0}},
    { position: { x: -50, y: 0, z: -120 }, scale: { x: 2, y: 0.05, z:  0.05}, rotation: {x: 0, y: 0, z: 10} },
    { position: { x: -50, y: 0, z: 60 }, scale: { x: 2, y: 0.05, z:  0.05}, rotation: {x: 0, y: 0, z: 10} },
    { position: { x: -5, y: 0, z: -65 }, scale: { x: 0.65, y: 0.05, z:  0.05}, rotation: {x: 0, y: 0, z: 10} },
    
];

loader.load('/asset/Road/Road.gltf', function (gltf) {
    roadInstances.forEach((instance) => {
        const road = gltf.scene.clone(); // Clone the model to create multiple instances
        road.position.set(instance.position.x, instance.position.y, instance.position.z);
        road.scale.set(instance.scale.x, instance.scale.y, instance.scale.z);
        road.rotation.set(instance.rotation.x, instance.rotation.y, instance.rotation.y);
        scene.add(road);
    });
}, undefined, function (error) {
    console.error(error);
});


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    updateButtonLabelPositions();
    controls.update();
}
animate();

// Create a ground plane with green color
const groundGeometry = new THREE.PlaneGeometry(1000, 1000); // Adjust the size as needed
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

// Rotate the plane to lie flat (horizontal)
ground.rotation.x = -Math.PI / 2; // Rotate 90 degrees along the X-axis to make it horizontal

// Set the position of the ground if necessary
ground.position.y = 0; // Adjust the height if needed

// Add the ground to the scene
scene.add(ground);


let zoomedIn = false;
let zoomTarget = null;

gsap.set(card, { opacity: 0, display: 'none' });

function toggleInfo() {
    if (zoomedIn) {
        card.classList.add('fadeInUp');
        card.style.display = 'block';
        gsap.to(card, { opacity: 1, duration: 1 });
        setTimeout(() => {
            card.classList.remove('fadeInUp');
        }, 7000);
    } else {
        gsap.to(card, { opacity: 0, duration: 1, onComplete: () => card.style.display = 'none' });
    }
}

function zoomAt(target, zoomFactor = 1) {
    const aabb = new THREE.Box3().setFromObject(target);
    const center = aabb.getCenter(new THREE.Vector3());
    const size = aabb.getSize(new THREE.Vector3());

    // Calculate and adjust the new position with zoomFactor
    const newPosition = new THREE.Vector3(
        center.x,
        center.y + size.y * 1.5 * zoomFactor,
        center.z + size.z * 2.5 * zoomFactor
    );


    // Clamp the distance to stay within min and max distances
    const distance = newPosition.distanceTo(center);
    const clampedDistance = THREE.MathUtils.clamp(distance, controls.minDistance, controls.maxDistance);
    newPosition.subVectors(newPosition, center).setLength(clampedDistance).add(center);
   

    gsap.timeline()
        .to(camera.position, {
            x: newPosition.x,
            y: newPosition.y - 30,
            z: newPosition.z + 19,
            duration: 1.8,
            ease: "power2.inOut"
        })
        .to(controls.target, {
            x: center.x,
            y: center.y,
            z: center.z,
            duration: 1.8,
            ease: "power2.inOut"
        }, "<")
        .eventCallback("onUpdate", () => {
            camera.lookAt(center);
            controls.target.copy(center);
        })
        .eventCallback("onComplete", () => {
            controls.update();
            controls.enabled = false;
        });
}




function resetCamera() {
    const targetPosition = new THREE.Vector3(2, 5, 10);

    gsap.to(camera.position, {
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,
        z: initialCameraPosition.z,
        duration: 1.3,
        onUpdate: () => {
            camera.lookAt(targetPosition);
        },
        onComplete: () => {
            zoomedIn = false;
            zoomTarget = null;
            card.style.display = 'none';
            btnLabels.forEach(btn => btn.style.display = 'block');
            controls.enabled = true;
        }
    });

    gsap.to(controls.target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.6,
        onUpdate: () => {
            controls.update();
        }
    });

    gsap.to(card, {
        opacity: 0,
        duration: 0.01,
        onComplete: () => card.style.display = 'none'
    });
}

window.addEventListener('click', onMouseClick, false);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && !zoomedIn) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject !== ground) {
            zoomTarget = intersectedObject;
            zoomAt(intersectedObject);
            zoomedIn = true;
            toggleInfo();
            btnLabels.forEach(btn => btn.style.display = 'none');
        }
    } else {
        resetCamera();
    }
}


function updateButtonLabelPositions() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const halfWidth = windowWidth / 2;
    const halfHeight = windowHeight / 2;

    building.forEach((model, index) => {
        const vector = model.position.clone().project(camera);
        const btn = btnLabels[index];
        const btnWidth = btn.offsetWidth;
        const btnHeight = btn.offsetHeight;
        const x = (vector.x * halfWidth) + halfWidth - (btnWidth / 2);
        const y = -(vector.y * halfHeight) + halfHeight - (btnHeight / 2);

        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
    });
}

const buildingInfo = {
    'Building A': {
        title: 'Building A',
        description: 'Building A is the old building in the University of Phnom Penh. Created in 1993.',
        rooms: [
            { number: '100A', info: 'A normal classroom.' },
            { number: '101A', info: 'A normal classroom.' },
            { number: '102A', info: 'Have a special class.' },
            { number: '103A', info: 'Is a physical class and play Batman.' },
            { number: '104A', info: 'A normal classroom.' },
            { number: '105A', info: 'A normal classroom.' },
            { number: '106A', info: 'DEPARTMENT OF ENVIRONMENTAL SCIENCE and RESEARCH OFFICE.' },
            { number: '107A(a)', info: 'ENGLISH LANGUAGE SUPPORT UNIT.' }
        ]
    },
    'Building T': {
        title: 'Building T',
        description: 'Building T is the old building in the University of Phnom Penh. Created in 1996.',
        rooms: [
            { number: '100T', info: 'A normal classroom.' },
            { number: '101T', info: 'A normal classroom.' },
            { number: '102T', info: 'A special class.' },
            { number: '103T', info: 'A physical classroom.' },
            { number: '104T', info: 'A normal classroom.' },
            { number: '105T', info: 'A normal classroom.' },
            { number: '106T', info: 'DEPARTMENT OF ENVIRONMENTAL SCIENCE and RESEARCH OFFICE.' },
            { number: '107T(a)', info: 'ENGLISH LANGUAGE SUPPORT UNIT.' }
        ]
    },
    'Building B': {
        title: 'Building B',
        description: 'Building B is the old building in the University of Phnom Penh. Created in 1997.',
        rooms: [
            { number: '100B', info: 'A normal classroom.' },
            { number: '101B', info: 'A normal classroom.' },
            { number: '102B', info: 'A special class.' },
            { number: '103B', info: 'A physical classroom.' },
            { number: '104B', info: 'A normal classroom.' },
            { number: '105B', info: 'A normal classroom.' },
            { number: '106B', info: 'DEPARTMENT OF ENVIRONMENTAL SCIENCE and RESEARCH OFFICE.' },
            { number: '107B(a)', info: 'ENGLISH LANGUAGE SUPPORT UNIT.' }
        ]
    },
    'Building D': {
        title: 'Building D',
        description: 'Building D is the old building in the University of Phnom Penh. Created in 1997.',
        rooms: [
            { number: '100B', info: 'A normal classroom.' },
            { number: '101B', info: 'A normal classroom.' },
            { number: '102B', info: 'A special class.' },
            { number: '103B', info: 'A physical classroom.' },
            { number: '104B', info: 'A normal classroom.' },
            { number: '105B', info: 'A normal classroom.' },
            { number: '106B', info: 'DEPARTMENT OF ENVIRONMENTAL SCIENCE and RESEARCH OFFICE.' },
            { number: '107B(a)', info: 'ENGLISH LANGUAGE SUPPORT UNIT.' }
        ]
    },'Building STEM': {
    title: 'STEAM',
    description: 'Building STEAM is the new building in the University of Phnom Penh.',
    rooms: [
        { number: '100', info: 'A normal classroom.' },
        { number: '101', info: 'A normal classroom.' },
        { number: '102', info: 'A special class.' },
        { number: '103', info: 'A physical classroom.' },
        { number: '104', info: 'A normal classroom.' },
        { number: '105', info: 'A normal classroom.' },
        { number: '106', info: 'DEPARTMENT OF ENVIRONMENTAL SCIENCE and RESEARCH OFFICE.' },
        { number: '107', info: 'ENGLISH LANGUAGE SUPPORT UNIT.' }
    ]
}

    
};

function onBtnLabelClick(event, model, labelText) {
    event.stopPropagation();
    console.log("Clicked Label:", labelText); // Debugging output

    if (!zoomedIn || zoomTarget !== model) {
        zoomTarget = model;
        zoomAt(model);
        zoomedIn = true;
        toggleInfo();
        btnLabels.forEach(btn => btn.style.display = 'none');
    }

    const info = buildingInfo[labelText];

    if (!info) {
        console.error(`No information found for ${labelText}`);
        return;
    }

    const cardTitle = document.querySelector('.card-title');
    cardTitle.textContent = info.title;

    const buildingDescription = document.querySelector('.building-description');
    buildingDescription.textContent = info.description;

    const roomInfoContainer = document.querySelector('.room-info');
    ///roomInfoContainer.innerHTML = ''; // Clear previous content
    info.rooms.forEach(room => {
        const roomInfo = document.createElement('p');
        roomInfo.innerHTML = `<strong>${room.number} :</strong> ${room.info}`;
        roomInfoContainer.appendChild(roomInfo);
    });

    // Update the card header image
    const cardHeaderImg = document.querySelector('.card-header img');
    cardHeaderImg.src = buildingMap[labelText];
}

