var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    uniform mat4 u_ProjMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform vec3 u_LightColor;
    uniform vec3 u_LightDirection;
    uniform vec3 u_AmbientLight;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        // 对法向量进行归一化
        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        // 计算光线和法向量的点积
        float nDotL = max(dot(normal, u_LightDirection), 0.0);
        // 计算漫反射
        vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
        // 计算环境光
        vec3 ambient = u_AmbientLight * a_Color.rgb;

        v_Color = vec4(diffuse + ambient, a_Color.a);
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
`;

canvas = document.getElementById('scene-3d');
gl = canvas.getContext('webgl');


function initShaders(gl, vshaderSource, fshaderSource){
    var vertexShader, fragmentShader, program;

    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vshaderSource);
    gl.shaderSource(fragmentShader, fshaderSource);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);
    gl.program = program;
}

function initVetexBuffers(gl){
    
    //create js buffer
    var vertices = new Float32Array([
        // cube vertices
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0,//front
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,

        1.0, 1.0, -1.0, 1.0, 1.0, 1.0,// right
        1.0, -1.0, 1.0, 1.0, -1.0, -1.0,

        1.0, 1.0, -1.0, -1.0, 1.0, -1.0,// up
        -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,

        -1.0, 1.0, -1.0, -1.0, -1.0, -1.0,// left
        -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0,// button
        1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        -1.0, 1.0, -1.0, 1.0, 1.0, -1.0,// back
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0
    ]);

    var colors = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,//front

        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,// right

        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,// up

        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,// left

        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,// bottom

        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 //back
    ]);

    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,//front

        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,// right

        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // up

        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,// left

        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // bottom

        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0//back
    ]);

    var faces = new Uint8Array([
        0, 1, 2, 0, 2, 3,//front
        4, 5, 6, 4, 6, 7,//right
        8, 9, 10, 8, 10, 11,//up
        12, 13, 14, 12, 14, 15,//left
        16, 17, 18, 16, 18, 19,//bottom
        20, 21, 22, 20, 22, 23 //back
    ]);

    initArrayBuffer(gl, 'a_Position', gl.FLOAT, vertices, 3);
    initArrayBuffer(gl, 'a_Color', gl.FLOAT, colors, 3);
    initArrayBuffer(gl, 'a_Normal', gl.FLOAT, normals, 3);

    initElementArrayBuffer(gl, faces);


    function initArrayBuffer(gl, attribute, type, data, num){
        var buffer = gl.createBuffer();
        var attrLocation;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        attrLocation = gl.getAttribLocation(gl.program, attribute);
        gl.vertexAttribPointer(attrLocation, num, type, false, 0, 0);
        gl.enableVertexAttribArray(attrLocation);

        return true;
    }

    function initElementArrayBuffer(gl, data){
        var buffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

        return true;
    }

    return faces.length;
};

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var nOE = initVetexBuffers( gl );

var projMatrix = new THREE.Matrix4();
var viewMatrix = new THREE.Matrix4();
var viewRotationMatrix = new THREE.Matrix4();
var viewRotationQua = new THREE.Quaternion();
var modelMatrix = new THREE.Matrix4();
var normalMatrix = new THREE.Matrix4();
var modelRotation = new THREE.Euler();

var cameraPos = new THREE.Vector3(0,0,5);
var g_near = 1, g_far = 100;
var fov = 40;
var aspect = 1;

var lightDir = new THREE.Vector3(0.5, 3.0, 4.0);

var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
var u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
var u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');

var u_LightColor = gl.getUniformLocation(gl.program,'u_LightColor');
var u_LightDirection = gl.getUniformLocation(gl.program,'u_LightDirection');
var u_AmbientLight = gl.getUniformLocation(gl.program,'u_AmbientLight');

modelRotation.reorder("YXZ");

viewRotationMatrix.lookAt(cameraPos, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
viewRotationQua.setFromRotationMatrix(viewRotationMatrix);
viewMatrix.compose(cameraPos, viewRotationQua, new THREE.Vector3(1,1,1));
viewMatrix.getInverse(viewMatrix);

var verticalLength = Math.tan(fov / 2 * Math.PI / 180) * g_near;
var horizontalLength = verticalLength * aspect;
projMatrix.makePerspective(-verticalLength,verticalLength,horizontalLength,-horizontalLength,g_near,g_far);

gl.clearColor(0,0,0,1);
gl.enable(gl.DEPTH_TEST);

document.onkeydown = function(e){
    var step = 0.01;
    switch(e.key){
        case "ArrowUp": modelRotation.x += step; break;
        case "ArrowDown": modelRotation.x -= step; break;
        case "ArrowRight": modelRotation.y += step; break;
        case "ArrowLeft": modelRotation.y -= step; break;
    }
    console.log('fov',fov);
    draw();
}

function draw(){
    document.getElementById('y').innerText = modelRotation.y;
    document.getElementById('x').innerText = modelRotation.x;

    modelMatrix.makeRotationFromEuler(modelRotation);
    normalMatrix.getInverse(modelMatrix);
    normalMatrix.transpose();

    lightDir.normalize();
    gl.uniform3f(u_LightDirection, lightDir.x, lightDir.y, lightDir.z);
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, nOE, gl.UNSIGNED_BYTE, 0);
}

draw();
