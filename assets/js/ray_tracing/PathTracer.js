class PathTracer {
    constructor() {
        const vertices = [
            -1, -1,
            -1, +1,
            +1, -1,
            +1, +1
        ];

        // 创建顶点buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // 创建framebuffer
        this.framebuffer = gl.createFramebuffer();

        // 创建纹理
        const type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;
        this.textures = [];
        for (let i = 0; i < 2; i++) {
            this.textures.push(gl.createTexture());
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, type, null);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);

        // 创建着色器
        this.renderProgram = compileShader(renderVertexSource, renderFragmentSource);
        this.renderVertexAttribute = gl.getAttribLocation(this.renderProgram, 'vertex');
        gl.enableVertexAttribArray(this.renderVertexAttribute);

        // 初始化变量
        this.objects = [];
        this.sampleCount = 0;
        this.tracerProgram = null;
    }

    setObjects(objects){
        this.uniforms = {};
        this.sampleCount = 0;
        this.objects = objects;

        // create tracer shader
        if (this.tracerProgram != null) {
            gl.deleteProgram(this.shaderProgram);
        }
        this.tracerProgram = compileShader(tracerVertexSource, makeTracerFragmentSource(objects));
        this.tracerVertexAttribute = gl.getAttribLocation(this.tracerProgram, 'vertex');
        gl.enableVertexAttribArray(this.tracerVertexAttribute);
    }

    update (matrix, timeSinceStart) {
        // 计算uniforms
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].setUniforms(this);
        }
        this.uniforms.eye = eye;
        this.uniforms.glossiness = glossiness;
        this.uniforms.ray00 = getEyeRay(matrix, -1, -1);
        this.uniforms.ray01 = getEyeRay(matrix, -1, +1);
        this.uniforms.ray10 = getEyeRay(matrix, +1, -1);
        this.uniforms.ray11 = getEyeRay(matrix, +1, +1);
        this.uniforms.timeSinceStart = timeSinceStart;
        this.uniforms.textureWeight = this.sampleCount / (this.sampleCount + 1);

        // 设置uniforms
        gl.useProgram(this.tracerProgram);
        setUniforms(this.tracerProgram, this.uniforms);

        // 渲染纹理
        gl.useProgram(this.tracerProgram);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[1], 0);
        gl.vertexAttribPointer(this.tracerVertexAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // 交替渲染输出
        this.textures.reverse();
        this.sampleCount++;
    };

    // 渲染
    render() {
        gl.useProgram(this.renderProgram);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.renderVertexAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}