var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    uniform mat4 u_ProjMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    varying vec3 v_Position;
    varying vec3 v_Normal;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        // 计算顶点坐标
        v_Position = vec3(u_ModelMatrix * a_Position);
        // 对法向量进行归一化
        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));

        v_Color = a_Color;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_LightPosition;
    uniform vec3 u_LightColor;
    uniform vec3 u_AmbientLight;

    varying vec3 v_Position;
    varying vec3 v_Normal;
    varying vec4 v_Color;

    void main(){
        // 对法线进行归一化，插值后的法线的长度未必为一
        vec3 normal = normalize(v_Normal);
        // 计算光线法线并归一化
        vec3 lightDirection = normalize(u_LightPosition - v_Position);
        // 计算光线和法向量的点积
        float nDotL = max(dot(normal, lightDirection), 0.0);
        // 计算漫反射
        vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
        // 计算环境光
        vec3 ambient = u_AmbientLight * v_Color.rgb;

        gl_FragColor = vec4(diffuse + ambient, v_Color.a);
    }
`;

canvas = document.getElementById('scene-3d');
gl = canvas.getContext('webgl2');


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

var lightPosition = new THREE.Vector3(0.0, 0.0, 1.0);

var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
var u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
var u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');

var u_LightColor = gl.getUniformLocation(gl.program,'u_LightColor');
var u_LightPosition = gl.getUniformLocation(gl.program,'u_LightPosition');
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
    case "ArrowUp": lightPosition.z += step; break;
    case "ArrowDown": lightPosition.z -= step; break;
    case "ArrowRight": modelRotation.y += step; break;
    case "ArrowLeft": modelRotation.y -= step; break;
}
console.log('fov',fov);
draw();
}

function draw(){
    document.getElementById('lightpositionz').innerText = lightPosition.z;
    document.getElementById('x').innerText = modelRotation.x;

    modelMatrix.makeRotationFromEuler(modelRotation);
    normalMatrix.getInverse(modelMatrix);
    normalMatrix.transpose();

    gl.uniform3f(u_LightPosition, lightPosition.x, lightPosition.y, lightPosition.z);
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
