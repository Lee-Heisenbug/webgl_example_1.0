var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ProjMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ProjMatrix * a_Position;
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
        0.0, 0.6, 0.0, 1.0, 0.0, 0.0,
        -0.6, -0.6, 0.0, 0.0, 1.0, 0.0,
        0.6, -0.6, 0.0, 0.0, 0.0, 1.0,

        0.0, 0.5, 0.25, 0.0, 1.0, 0.0,
        -0.5, -0.5, 0.25, 0.0, 0.0, 1.0,
        0.5, -0.5, 0.25, 1.0, 0.0, 0.0,

        0.0, 0.4, 0.5, 0.0, 0.0, 1.0,
        -0.4, -0.4, 0.5, 1.0, 0.0, 0.0,
        0.4, -0.4, 0.5, 0.0, 1.0, 0.0
    ]);
    var n = 9;
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
var g_near = 0.0, g_far = 0.5;
var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');

gl.clearColor(0,1,1,1);

document.onkeydown = function(e){
    var step = 0.01;
    switch(e.key){
        case "ArrowRight": g_near += step; break;
        case "ArrowLeft": g_near -= step; break;
        case "ArrowUp": g_far += step; break;
        case "ArrowDown": g_far -= step; break;
    }
    draw();
}

function draw(){
    document.getElementById('far').innerText = g_far;
    document.getElementById('near').innerText = g_near;
    projMatrix.makeOrthographic(-1.0,1.0,1.0,-1.0,g_near,g_far);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, nOV);
}

draw();
