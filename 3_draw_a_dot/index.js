var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
        gl_FragColor = u_FragColor;
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

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');

var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

if(a_Position < 0){
    console.warn('Failed to get the location of a_Position');
}

var position = {x:0.0,y:0.0}
var pointSize = 10.0;
var color = [0.0,0.0];

gl.vertexAttrib2f(a_Position, position.x, position.y);
gl.vertexAttrib1f(a_PointSize, pointSize);

gl.clearColor(0,1,1,1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.drawArrays(gl.POINTS, 0, 1);


canvas.addEventListener("mousemove",function(e){
    position.x = -1 + (e.offsetX / 400) * 2;
    position.y = 1 - (e.offsetY / 400) * 2;
    color[0] = e.offsetX / 400;
    color[1] = e.offsetY / 400;

    gl.vertexAttrib2f(a_Position,position.x,position.y);
    gl.vertexAttrib1f(a_PointSize,pointSize);
    gl.uniform4f(u_FragColor, color[0], color[1], 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
})