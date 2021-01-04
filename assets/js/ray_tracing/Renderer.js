class Renderer {
    constructor() {
        const vertices = [
            0, 0, 0,
            1, 0, 0,
            0, 1, 0,
            1, 1, 0,
            0, 0, 1,
            1, 0, 1,
            0, 1, 1,
            1, 1, 1
        ];
        const indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 2, 6, 3, 7
        ];

        // 创建顶点缓冲器
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // 创建索引缓冲器
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        //创建线着色器
        this.lineProgram = compileShader(lineVertexSource, lineFragmentSource);
        this.vertexAttribute = gl.getAttribLocation(this.lineProgram, 'vertex');
        gl.enableVertexAttribArray(this.vertexAttribute);

        this.objects = [];
        this.selectedObject = null;
        this.pathTracer = new PathTracer();
    }

    setObjects(objects) {
        this.objects = objects;
        this.selectedObject = null;
        this.pathTracer.setObjects(objects);
    }

    update(modelviewProjection, timeSinceStart) {
        const jitter = Matrix.Translation(Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]).multiply(1 / 512));
        const inverse = jitter.multiply(modelviewProjection).inverse();
        this.modelviewProjection = modelviewProjection;
        this.pathTracer.update(inverse, timeSinceStart);
    }

    render() {
        this.pathTracer.render();

        if (this.selectedObject != null) {
            gl.useProgram(this.lineProgram);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.vertexAttribPointer(this.vertexAttribute, 3, gl.FLOAT, false, 0, 0);
            setUniforms(this.lineProgram, {
                cubeMin: this.selectedObject.getMinCorner(),
                cubeMax: this.selectedObject.getMaxCorner(),
                modelviewProjection: this.modelviewProjection
            });
            gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
        }
    }
}