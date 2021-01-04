// 对sylvester的vector功能扩充

Vector.prototype.ensure3 = function () {
    return Vector.create([this.elements[0], this.elements[1], this.elements[2]]);
};

Vector.prototype.divideByW = function () {
    const w = this.elements[this.elements.length - 1];
    const newElements = [];
    for (let i = 0; i < this.elements.length; i++) {
        newElements.push(this.elements[i] / w);
    }
    return Vector.create(newElements);
};

Vector.prototype.componentDivide = function (vector) {
    if (this.elements.length !== vector.elements.length) {
        return null;
    }
    const newElements = [];
    for (let i = 0; i < this.elements.length; i++) {
        newElements.push(this.elements[i] / vector.elements[i]);
    }
    return Vector.create(newElements);
};

Vector.min = function (a, b) {
    if (a.length !== b.length) {
        return null;
    }
    const newElements = [];
    for (let i = 0; i < a.elements.length; i++) {
        newElements.push(Math.min(a.elements[i], b.elements[i]));
    }
    return Vector.create(newElements);
};

Vector.max = function (a, b) {
    if (a.length !== b.length) {
        return null;
    }
    const newElements = [];
    for (let i = 0; i < a.elements.length; i++) {
        newElements.push(Math.max(a.elements[i], b.elements[i]));
    }
    return Vector.create(newElements);
};

Vector.prototype.minComponent = function () {
    let value = Number.MAX_VALUE;
    for (let i = 0; i < this.elements.length; i++) {
        value = Math.min(value, this.elements[i]);
    }
    return value;
};

Vector.prototype.maxComponent = function () {
    let value = -Number.MAX_VALUE;
    for (let i = 0; i < this.elements.length; i++) {
        value = Math.max(value, this.elements[i]);
    }
    return value;
};