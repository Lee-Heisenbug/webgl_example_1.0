var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ProjMatrix;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;
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
    var verticesColor = new Float32Array([
        // three triangles form the right
        0.0, 1.0, 0.0, 0.4, 0.4, 1.0,// in the front
        -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
        0.5, -1.0, 0.0, 1.0, 0.4, 0.4,
        
        -0.25, 1.0, 0.0, 1.0, 1.0, 0.4,// in the middle
        -0.75, -1.0, 0.0, 1.0, 1.0, 0.4,
        0.25, -1.0, 0.0, 1.0, 0.4, 0.4,
    ]);
    var n = 6;
    var FSIZE = verticesColor.BYTES_PER_ELEMENT;

    // create buffer
    var vertexBuffer = gl.createBuffer();
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

    return n;
};

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var nOV = initVetexBuffers( gl );

var projMatrix = new THREE.Matrix4();
var viewMatrix = new THREE.Matrix4();
var rotationMatrix = new THREE.Matrix4();
var rotationQua = new THREE.Quaternion();
var cameraPos = new THREE.Vector3(0,0,5);
var g_near = 1, g_far = 100;
var fov = 30;
var aspect = 1;
var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
var u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
var polygonOffsetEnabled = false;

gl.clearColor(0,1,1,1);
gl.enable(gl.DEPTH_TEST);

document.getElementById("enable-po").onclick = function(){
    polygonOffsetEnabled = !polygonOffsetEnabled;
    draw();
}
document.onkeydown = function(e){
    var step = 0.01;
    switch(e.key){
        case "ArrowUp": fov += step; break;
        case "ArrowDown": fov -= step; break;
        case "ArrowRight": cameraPos.x += step; break;
        case "ArrowLeft": cameraPos.x -= step; break;
    }
    console.log('fov',fov);
    draw();
}

function draw(){
    document.getElementById('fov').innerText = fov;
    document.getElementById('x').innerText = cameraPos.x;
    document.getElementById('polygon-offset').innerText = polygonOffsetEnabled;
    rotationMatrix.lookAt(cameraPos, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    rotationQua.setFromRotationMatrix(rotationMatrix);
    viewMatrix.compose(cameraPos, rotationQua, new THREE.Vector3(1,1,1));
    viewMatrix.getInverse(viewMatrix);
    var verticalLength = Math.tan(fov / 2 * Math.PI / 180) * g_near;
    var horizontalLength = verticalLength * aspect;
    projMatrix.makePerspective(-verticalLength,verticalLength,horizontalLength,-horizontalLength,g_near,g_far);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, nOV / 2);
    if(polygonOffsetEnabled){
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);
    }
    gl.drawArrays(gl.TRIANGLES, nOV / 2, nOV / 2);

    if(polygonOffsetEnabled){
        gl.disable(gl.POLYGON_OFFSET_FILL);
    }

}

draw();
