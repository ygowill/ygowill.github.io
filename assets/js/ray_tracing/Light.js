class Light {
    constructor() {
        this.temporaryTranslation = Vector.create([0, 0, 0]);
    }

    getGlobalCode() {
        return 'uniform vec3 light;';
    }

    getIntersectCode() {
        return '';
    }

    getShadowTestCode() {
        return '';
    }

    getMinimumIntersectCode() {
        return '';
    }

    getNormalCalculationCode() {
        return '';
    }

    setUniforms(renderer) {
        renderer.uniforms.light = light.add(this.temporaryTranslation);
    }

    temporaryTranslate(translation) {
        const tempLight = light.add(translation);
        this._clampPosition(tempLight);
        this.temporaryTranslation = tempLight.subtract(light);
    }

    translate(translation) {
        light = light.add(translation);
        this._clampPosition(light);
    }

    getMinCorner () {
        return light.add(this.temporaryTranslation).subtract(Vector.create([lightSize, lightSize, lightSize]));
    }

    getMaxCorner () {
        return light.add(this.temporaryTranslation).add(Vector.create([lightSize, lightSize, lightSize]));
    }

    intersect (origin, ray) {
        return Number.MAX_VALUE;
    }

    _clampPosition (position) {
        for (let i = 0; i < position.elements.length; i++) {
            position.elements[i] = Math.max(lightSize - 1, Math.min(1 - lightSize, position.elements[i]));
        }
    }
}