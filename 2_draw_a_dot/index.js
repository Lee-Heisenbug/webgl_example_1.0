var VSHADER_SOURCE = `
    void main(){
        gl_Position = vec4(0.5, 0.0, 1.1, 1.1);
        gl_PointSize = 10.0;
    }
`;

var FSHADER_SOURCE = `
    void main(){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
    }
`;

canvas = document.getElementById('scene-3d');
gl = canvas.getContext('webgl');
gl.clearColor(1,1,0,1);
gl.clear(gl.COLOR_BUFFER_BIT);

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

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);


gl.drawArrays(gl.POINTS, 0, 1);
