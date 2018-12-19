var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_xformMatrix;
    void main(){
        gl_Position = u_xformMatrix * a_Position;
    }
`;

var FSHADER_SOURCE = `
    void main(){
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
    }
`;

canvas = document.getElementById('scene-3d');
gl = canvas.getContext('webgl');
initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
gl.clearColor(0,1,1,1);

var nOV = initVetexBuffers( gl );


// create animation
var xformMatrix = new THREE.Matrix4();
var rotationMatrix = new THREE.Matrix4();
var offsetAngle = 0, angleStepPerSec = 45;
var clock = new THREE.Clock();
var u_xformMatrix = gl.getUniformLocation( gl.program, 'u_xformMatrix' );

xformMatrix.makeTranslation( 0.5, 0, 0 );
clock.start();
animate();

function animate(){
    // calculate currentAngle
    // console.log(clock.getDelta());
    offsetAngle = clock.getDelta() * angleStepPerSec;
    rotationMatrix.makeRotationZ(offsetAngle * Math.PI / 180);

    xformMatrix.premultiply( rotationMatrix );

    gl.uniformMatrix4fv( u_xformMatrix, false, xformMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, nOV); //draw rectangle

    requestAnimationFrame(animate);
}



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
    //  draw triangle
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = vertices.length / 2;

    // create buffer
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('failed to create the buffer object ');
        return -1;
    }

    // bind buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );

    // transfer the js buffer to gl buffer
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    // get the position of position attribute
    var a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    if(a_Position < 0){
        console.warn('Failed to get the location of a_Position');
    }

    // assign the gl buffer to the position attribute
    gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, 0, 0 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_Position );

    return n;
};