class UI {
    constructor() {
        this.renderer = new Renderer();
        this.moving = false;
    }

    setObjects (objects) {
        this.objects = objects;
        this.objects.splice(0, 0, new Light());
        this.renderer.setObjects(this.objects);
    }

    update (timeSinceStart) {
        this.modelview = makeLookAt(eye.elements[0], eye.elements[1], eye.elements[2], 0, 0, 0, 0, 1, 0);
        this.projection = makePerspective(55, 1, 0.1, 100);
        this.modelviewProjection = this.projection.multiply(this.modelview);
        this.renderer.update(this.modelviewProjection, timeSinceStart);
    }

    mouseDown (x, y) {
        let t;
        const origin = eye;
        const ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);

        if (this.renderer.selectedObject != null) {
            const minBounds = this.renderer.selectedObject.getMinCorner();
            const maxBounds = this.renderer.selectedObject.getMaxCorner();
            t = Cube.intersect(origin, ray, minBounds, maxBounds);

            if (t < Number.MAX_VALUE) {
                const hit = origin.add(ray.multiply(t));

                if (Math.abs(hit.elements[0] - minBounds.elements[0]) < 0.001) this.movementNormal = Vector.create([-1, 0, 0]);
                else if (Math.abs(hit.elements[0] - maxBounds.elements[0]) < 0.001) this.movementNormal = Vector.create([+1, 0, 0]);
                else if (Math.abs(hit.elements[1] - minBounds.elements[1]) < 0.001) this.movementNormal = Vector.create([0, -1, 0]);
                else if (Math.abs(hit.elements[1] - maxBounds.elements[1]) < 0.001) this.movementNormal = Vector.create([0, +1, 0]);
                else if (Math.abs(hit.elements[2] - minBounds.elements[2]) < 0.001) this.movementNormal = Vector.create([0, 0, -1]);
                else this.movementNormal = Vector.create([0, 0, +1]);

                this.movementDistance = this.movementNormal.dot(hit);
                this.originalHit = hit;
                this.moving = true;

                return true;
            }
        }

        t = Number.MAX_VALUE;
        this.renderer.selectedObject = null;

        for (let i = 0; i < this.objects.length; i++) {
            const objectT = this.objects[i].intersect(origin, ray);
            if (objectT < t) {
                t = objectT;
                this.renderer.selectedObject = this.objects[i];
            }
        }

        return (t < Number.MAX_VALUE);
    }

    mouseMove (x, y) {
        if (this.moving) {
            const origin = eye;
            const ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);

            const t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
            const hit = origin.add(ray.multiply(t));
            this.renderer.selectedObject.temporaryTranslate(hit.subtract(this.originalHit));

            // clear the sample buffer
            this.renderer.pathTracer.sampleCount = 0;
        }
    }

    mouseUp (x, y) {
        if (this.moving) {
            const origin = eye;
            const ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);

            const t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
            const hit = origin.add(ray.multiply(t));
            this.renderer.selectedObject.temporaryTranslate(Vector.create([0, 0, 0]));
            this.renderer.selectedObject.translate(hit.subtract(this.originalHit));
            this.moving = false;
        }
    }

    render () {
        this.renderer.render();
    }

    selectLight () {
        this.renderer.selectedObject = this.objects[0];
    }

    deleteSelection () {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.renderer.selectedObject === this.objects[i]) {
                this.objects.splice(i, 1);
                this.renderer.selectedObject = null;
                this.renderer.setObjects(this.objects);
                break;
            }
        }
    }

    updateMaterial () {
        const newMaterial = parseInt(document.getElementById('material').value, 10);
        if (material !== newMaterial) {
            material = newMaterial;
            this.renderer.setObjects(this.objects);
        }
    }

    updateEnvironment () {
        const newEnvironment = parseInt(document.getElementById('environment').value, 10);
        if (environment !== newEnvironment) {
            environment = newEnvironment;
            this.renderer.setObjects(this.objects);
        }
    }

    updateGlossiness () {
        let newGlossiness = parseFloat(document.getElementById('glossiness').value);
        if (isNaN(newGlossiness)) newGlossiness = 0;
        newGlossiness = Math.max(0, Math.min(1, newGlossiness));
        if (material === MATERIAL_GLOSSY && glossiness !== newGlossiness) {
            this.renderer.pathTracer.sampleCount = 0;
        }
        glossiness = newGlossiness;
    }
}

function tick(timeSinceStart) {
    eye.elements[0] = zoomZ * Math.sin(angleY) * Math.cos(angleX);
    eye.elements[1] = zoomZ * Math.sin(angleX);
    eye.elements[2] = zoomZ * Math.cos(angleY) * Math.cos(angleX);

    document.getElementById('glossiness-factor').style.display = (material === MATERIAL_GLOSSY) ? 'inline' : 'none';

    ui.updateMaterial();
    ui.updateGlossiness();
    ui.updateEnvironment();
    ui.update(timeSinceStart);
    ui.render();
}

function makeTableAndChair() {
    const objects = [];

    // 桌面
    objects.push(new Cube(Vector.create([-0.5, -0.35, -0.5]), Vector.create([0.3, -0.3, 0.5]), nextObjectId++));

    // 桌腿
    objects.push(new Cube(Vector.create([-0.45, -1, -0.45]), Vector.create([-0.4, -0.35, -0.4]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.2, -1, -0.45]), Vector.create([0.25, -0.35, -0.4]), nextObjectId++));
    objects.push(new Cube(Vector.create([-0.45, -1, 0.4]), Vector.create([-0.4, -0.35, 0.45]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.2, -1, 0.4]), Vector.create([0.25, -0.35, 0.45]), nextObjectId++));

    // 椅面
    objects.push(new Cube(Vector.create([0.3, -0.6, -0.2]), Vector.create([0.7, -0.55, 0.2]), nextObjectId++));

    // 椅腿
    objects.push(new Cube(Vector.create([0.3, -1, -0.2]), Vector.create([0.35, -0.6, -0.15]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.3, -1, 0.15]), Vector.create([0.35, -0.6, 0.2]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.65, -1, -0.2]), Vector.create([0.7, 0.1, -0.15]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.65, -1, 0.15]), Vector.create([0.7, 0.1, 0.2]), nextObjectId++));

    // 椅背
    objects.push(new Cube(Vector.create([0.65, 0.05, -0.15]), Vector.create([0.7, 0.1, 0.15]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.65, -0.55, -0.09]), Vector.create([0.7, 0.1, -0.03]), nextObjectId++));
    objects.push(new Cube(Vector.create([0.65, -0.55, 0.03]), Vector.create([0.7, 0.1, 0.09]), nextObjectId++));

    // 球体
    objects.push(new Sphere(Vector.create([-0.1, -0.05, 0]), 0.25, nextObjectId++));

    return objects;
}

window.onload = function () {
    gl = null;
    error = document.getElementById('error');
    canvas = document.getElementById('canvas');
    try {
        gl = canvas.getContext('experimental-webgl');
    } catch (e) {
    }

    if (gl) {
        error.innerHTML = 'Loading...';

        const inputs = document.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].onfocus = function () {
                inputFocusCount++;
            };
            inputs[i].onblur = function () {
                inputFocusCount--;
            };
        }

        material = parseInt(document.getElementById('material').value, 10);
        environment = parseInt(document.getElementById('environment').value, 10);
        ui = new UI();
        ui.setObjects(makeTableAndChair());
        const start = new Date();
        error.style.zIndex = -1;
        setInterval(function () {
            tick((new Date() - start) * 0.001);
        }, 1000 / 60);
    } else {
        error.innerHTML = 'Your browser does not support WebGL.<br>Please see <a href="http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">Getting a WebGL Implementation</a>.';
    }
};