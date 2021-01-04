// augment Sylvester some
Matrix.Translation = function (v) {
    let r;
    if (v.elements.length === 2) {
        r = Matrix.I(3);
        r.elements[2][0] = v.elements[0];
        r.elements[2][1] = v.elements[1];
        return r;
    }

    if (v.elements.length === 3) {
        r = Matrix.I(4);
        r.elements[0][3] = v.elements[0];
        r.elements[1][3] = v.elements[1];
        r.elements[2][3] = v.elements[2];
        return r;
    }

    throw "Invalid length for Translation";
}

Matrix.prototype.flatten = function () {
    const result = [];
    if (this.elements.length === 0)
        return [];


    for (let j = 0; j < this.elements[0].length; j++)
        for (let i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
}

//
// gluLookAt
//
function makeLookAt(ex, ey, ez,
                    cx, cy, cz,
                    ux, uy, uz) {
    const eye = $V([ex, ey, ez]);
    const center = $V([cx, cy, cz]);
    const up = $V([ux, uy, uz]);

    const z = eye.subtract(center).toUnitVector();
    const x = up.cross(z).toUnitVector();
    const y = z.cross(x).toUnitVector();

    const m = $M([[x.e(1), x.e(2), x.e(3), 0],
        [y.e(1), y.e(2), y.e(3), 0],
        [z.e(1), z.e(2), z.e(3), 0],
        [0, 0, 0, 1]]);

    const t = $M([[1, 0, 0, -ex],
        [0, 1, 0, -ey],
        [0, 0, 1, -ez],
        [0, 0, 0, 1]]);
    return m.x(t);
}

// 透视效果
function makePerspective(fovy, aspect, znear, zfar) {
    const ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    const ymin = -ymax;
    const xmin = ymin * aspect;
    const xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

// 创建一个三棱台
function makeFrustum(left, right,
                     bottom, top,
                     znear, zfar) {
    const X = 2 * znear / (right - left);
    const Y = 2 * znear / (top - bottom);
    const A = (right + left) / (right - left);
    const B = (top + bottom) / (top - bottom);
    const C = -(zfar + znear) / (zfar - znear);
    const D = -2 * zfar * znear / (zfar - znear);

    return $M([[X, 0, A, 0],
        [0, Y, B, 0],
        [0, 0, C, D],
        [0, 0, -1, 0]]);
}

// 设置uniform
function setUniforms(program, uniforms) {
    for (const name in uniforms) {
        if(uniforms.hasOwnProperty(name)) {
            const value = uniforms[name];
            const location = gl.getUniformLocation(program, name);
            if (location == null) continue;
            if (value instanceof Vector) {
                gl.uniform3fv(location, new Float32Array([value.elements[0], value.elements[1], value.elements[2]]));
            } else if (value instanceof Matrix) {
                gl.uniformMatrix4fv(location, false, new Float32Array(value.flatten()));
            } else {
                gl.uniform1f(location, value);
            }
        }
    }
}

function concat(objects, func) {
    let text = '';
    for (let i = 0; i < objects.length; i++) {
        text += func(objects[i]);
    }
    return text;
}

function compileSource(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw 'compile error: ' + gl.getShaderInfoLog(shader);
    }
    return shader;
}

// 编译着色器
function compileShader(vertexSource, fragmentSource) {
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, compileSource(vertexSource, gl.VERTEX_SHADER));
    gl.attachShader(shaderProgram, compileSource(fragmentSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw 'link error: ' + gl.getProgramInfoLog(shaderProgram);
    }
    return shaderProgram;
}

// 获取元素位置
function elementPos(element) {
    let x = 0, y = 0;
    while (element.offsetParent) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
    }
    return {x: x, y: y};
}

// 获取事件位置
function eventPos(event) {
    return {
        x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
    };
}

// 获取canvas的鼠标位置
function canvasMousePos(event) {
    const mousePos = eventPos(event);
    const canvasPos = elementPos(canvas);
    return {
        x: mousePos.x - canvasPos.x,
        y: mousePos.y - canvasPos.y
    };
}

// 视线
function getEyeRay(matrix, x, y) {
    return matrix.multiply(Vector.create([x, y, 0, 1])).divideByW().ensure3().subtract(eye);
}

