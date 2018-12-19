var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 10.0;
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
        0.0, 0.5, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 1.0
    ]);
    var n = 3;
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
    gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_Position );

    // get the position of pointSize attribute
    var a_Color = gl.getAttribLocation( gl.program, 'a_Color' );
    if(a_Color < 0){
        console.warn('Failed to get the location of a_PoitSize');
    }

    // assign the gl buffer to the position attribute
    gl.vertexAttribPointer( a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_Color );

    return n;
};

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var nOV = initVetexBuffers( gl );

gl.clearColor(0,1,1,1);
gl.clear(gl.COLOR_BUFFER_BIT);

// gl.drawArrays(gl.POINTS, 0, 2);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, nOV);
