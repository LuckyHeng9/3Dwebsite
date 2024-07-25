const canvas = document.querySelector('.canvas');
const card = document.querySelector('.info-panel');
const labelLine = document.querySelector('.vertical-line');
const bc = ["./asset/buildA.jpg", "./asset/buildT.jpg", "./asset/buildB.jpg"];

const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const Fov = 75;

const camera = new THREE.PerspectiveCamera(Fov, sizes.width / sizes.height, 1, 10000);
camera.position.set(0, 79, 80);


scene.add(camera);


const initialCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
const initialCameraTarget = new THREE.Vector3(0, 79, 80);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
//controls.maxDistance = 90;
//controls.minDistance = 18;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
// Set rotation constraints
controls.maxAzimuthAngle = Math.PI / 4; // Limit horizontal rotation to 45 degrees
controls.minAzimuthAngle = -Math.PI / 4; // Limit horizontal rotation to -45 degrees

controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation to 90 degrees
controls.minPolarAngle = Math.PI / 4; // Limit vertical rotation to 45 degrees

controls.mouseButtons = {
    RIGHT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    LEFT: THREE.MOUSE.PAN
};

const cubes = [];
const btnLabels = [];
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const loader = new THREE.GLTFLoader();
const modelPath = '/asset/Test building.glb';

const buildingMap = {
    'Building A': bc[0],
    'Building T': bc[1],
    'Building B': bc[2]
};

const createCube = (x, y, z, labelText) => {
    loader.load(modelPath, function (gltf) {
        const model = gltf.scene;

        model.position.set(x, y, z);

        const scaleFactor = 0.13;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.rotation.y = 11;

        scene.add(model);
        cubes.push(model);

        const btn = document.createElement('div');
        btn.className = 'btnlabel';
        btn.innerHTML = labelText;
        document.body.appendChild(btn);
        btnLabels.push(btn);

        btn.addEventListener('click', (event) => onBtnLabelClick(event, model, labelText), true);
    });
};

createCube(12, 2, -100, 'Building A');
createCube(-20, 10, -400, 'Building T');
createCube(40, 1.5, 31, 'Building B');
createCube(-70, 2, -60, 'Building A');

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    updateButtonLabelPositions();
    controls.update();
}
animate();

loader.load('/asset/scene.gltf', function (gltf) {
    const groundModel = gltf.scene;
    groundModel.position.set(35, 0, 0);
    groundModel.rotation.y = -Math.PI / 2;
    groundModel.scale.set(200, 200, 200);
    scene.add(groundModel);
}, undefined, function (error) {
    console.error(error);
});

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function zoomAt(target) {
    // Calculate the bounding box of the target object
    const aabb = new THREE.Box3().setFromObject(target);
    const center = aabb.getCenter(new THREE.Vector3());
    const size = aabb.getSize(new THREE.Vector3());

    // Determine the new camera position
    const newPosition = new THREE.Vector3(center.x, center.y + size.y * 1.5, center.z + size.z * 2.5);

    // Create a GSAP timeline
    const tl = gsap.timeline();

    // Animate camera position
    tl.to(camera.position, {
        x: newPosition.x,
        y: newPosition.y - 9,
        z: newPosition.z + 10,
        duration: 1.8, // Adjust duration as needed
        ease: "power2.inOut"
    })
        // Animate controls target
        .to(controls.target, {
            x: center.x,
            y: center.y,
            z: center.z,
            duration: 1.8,
            ease: "power2.inOut"
        }, "<") // "<" ensures this animation starts at the same time as the camera position animation
        // Update camera lookAt and controls state on each frame
        .eventCallback("onUpdate", () => {
            const lookAtPosition = new THREE.Vector3(center.x, center.y, center.z);
            camera.lookAt(lookAtPosition);
            controls.target.copy(lookAtPosition);
        })
        // Finalize animation
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
    const scale = 1;

    cubes.forEach((cube, index) => {
        const vector = cube.position.clone().project(camera);
        const btn = btnLabels[index];
        const btnWidth = btn.offsetWidth;
        const btnHeight = btn.offsetHeight;
        const x = (vector.x * halfWidth) + halfWidth - (btnWidth / 2);
        const y = -(vector.y * halfHeight) + halfHeight - (btnHeight / 2);

        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.transform = `scale(${scale - 0.01})`;
    });
}

function onBtnLabelClick(event, cube, labelText) {
    event.stopPropagation();

    if (!zoomedIn || zoomTarget !== cube) {
        zoomTarget = cube;
        zoomAt(cube);
        zoomedIn = true;
        toggleInfo();
        btnLabels.forEach(btn => btn.style.display = 'none');
    }

    const cardHeaderImg = document.querySelector('.card-header img');
    cardHeaderImg.src = buildingMap[labelText];
    const cardTitle = document.querySelector('.card-title');
    cardTitle.textContent = labelText;
}
