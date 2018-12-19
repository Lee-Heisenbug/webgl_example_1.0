var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ProjMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_Color = a_Color;
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
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,

        1.0, -1.0, -1.0, 0.0, 1.0, 0.0,
        1.0, 1.0, -1.0, 0.0, 1.0, 1.0,
        -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, -1.0, 0.0, 0.0, 0.0,
    ]);

    var color = new Float32Array([])

    var faces = new Uint8Array([
        0, 1, 2, 0, 2, 3,//front
        0, 3, 4, 0, 4, 5,//right
        0, 5, 6, 0, 6, 1,//up
        1, 6, 7, 1, 7, 2,//left
        7, 4, 3, 7, 3, 2,//bottom
        4, 7, 6, 4, 6, 5 //back
    ]);
    var FSIZE = verticesColor.BYTES_PER_ELEMENT;

    // create buffer
    var vertexBuffer = gl.createBuffer();
    var faceBuffer = gl.createBuffer();

    if(!vertexBuffer){
        console.log('failed to create the buffer object ');
        return -1;
    }

    // bind buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );

    // transfer the js buffer to gl buffer
    gl.bufferData( gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW );

    // get the position of position attribute
    var a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    if(a_Position < 0){
        console.warn('Failed to get the location of a_Position');
    }

    // assign the gl buffer to the position attribute
    gl.vertexAttribPointer( a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_Position );


    // get the position of pointSize attribute
    var a_Color = gl.getAttribLocation( gl.program, 'a_Color' );
    if(a_Color < 0){
        console.warn('Failed to get the location of a_PoitSize');
    }

    // assign the gl buffer to the position attribute
    gl.vertexAttribPointer( a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_Color );


    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, faceBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);

    return faces.length;
};

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var nOE = initVetexBuffers( gl );

var projMatrix = new THREE.Matrix4();
var viewMatrix = new THREE.Matrix4();
var viewRotationMatrix = new THREE.Matrix4();
var viewRotationQua = new THREE.Quaternion();
var modelMatrix = new THREE.Matrix4();
var modelRotation = new THREE.Euler();
var cameraPos = new THREE.Vector3(0,0,5);
var g_near = 1, g_far = 100;
var fov = 40;
var aspect = 1;
var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
var u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');

modelRotation.reorder("YXZ");

viewRotationMatrix.lookAt(cameraPos, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
viewRotationQua.setFromRotationMatrix(viewRotationMatrix);
viewMatrix.compose(cameraPos, viewRotationQua, new THREE.Vector3(1,1,1));
viewMatrix.getInverse(viewMatrix);

var verticalLength = Math.tan(fov / 2 * Math.PI / 180) * g_near;
var horizontalLength = verticalLength * aspect;
projMatrix.makePerspective(-verticalLength,verticalLength,horizontalLength,-horizontalLength,g_near,g_far);

gl.clearColor(0,1,1,1);
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
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, nOE, gl.UNSIGNED_BYTE, 0);
}

draw();
