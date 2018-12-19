var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    void main(){
        gl_Position = a_Position;
    }
`;

var FSHADER_SOURCE = `
    void main(){
        gl_FragColor = vec4(gl_FragCoord.x / 400.0, 0, gl_FragCoord.y / 400.0, 1.0);
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
    //  draw triangle
    // var vertices = new Float32Array([
    //     0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    // ]);
    // var n = vertices.length / 2;

    //  draw rectangle
    var vertices = new Float32Array([
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
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

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var nOV = initVetexBuffers( gl );

gl.clearColor(0,1,1,1);
gl.clear(gl.COLOR_BUFFER_BIT);

// gl.drawArrays(gl.TRIANGLES, 0, nOV); //draw triangle

// gl.drawArrays(gl.TRIANGLE_STRIP, 0, nOV); //draw rectangle

gl.drawArrays(gl.TRIANGLE_FAN, 0, nOV); //draw triangle fan