var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main(){
        gl_Position = a_Position;
        v_TexCoord = a_TexCoord;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    void main(){
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
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
    var verticesTexCoords = new Float32Array([
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);
    var n = 4;
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    // create buffer
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('failed to create the buffer object ');
        return -1;
    }

    // bind buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );

    // transfer the js buffer to gl buffer
    gl.bufferData( gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW );

    // get the position of position attribute
    var a_Position = gl.getAttribLocation( gl.program, 'a_Position' );
    if(a_Position < 0){
        console.warn('Failed to get the location of a_Position');
    }

    // assign the gl buffer to the position attribute
    gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_Position );

    // get the position of pointSize attribute
    var a_TexCoord = gl.getAttribLocation( gl.program, 'a_TexCoord' );
    if(a_TexCoord < 0){
        console.warn('Failed to get the location of a_TexCoord');
    }

    // assign the gl buffer to the position attribute
    gl.vertexAttribPointer( a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2 );

    // link a_Position and the assigned buffer
    gl.enableVertexAttribArray( a_TexCoord );

    return n;
};

function initTextures(gl, n, callback){
    var texture = gl.createTexture();

    var u_Sampler = gl.getUniformLocation( gl.program, 'u_Sampler');

    var image = new Image();

    image.onload = function(){
        callback(gl, n, texture, u_Sampler, image);
    };

    image.src = './images/texture.jfif';

    return true;
}

function onTextureLoad(gl, n, texture, u_Sampler, image){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler, 0);

    gl.clearColor(0,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var nOV = initVetexBuffers( gl );

if(!initTextures(gl, nOV, onTextureLoad)){
    console.log("failed to initTextures.");
}


