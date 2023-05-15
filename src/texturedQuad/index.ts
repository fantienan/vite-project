import {  initShaders } from './utils';

type WebGLWithProgram = WebGLRenderingContext & { program: WebGLProgram };

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  void main () {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
  }
`;
const FSHADER_SOURCE = `
  precision mediump float; // 使用精度限定词来指定变量的精度和范围
  uniform sampler2D u_Sampler;// sampler意为取样器，该变量用来接收机纹理图像
  varying vec2 v_TexCoord;
  void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`;
export function main(image: HTMLImageElement) {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;
  if (!canvas) return;
    canvas.width = image.width
    canvas.height = image.height
    const gl = canvas.getContext('webgl') as WebGLWithProgram;
    if (!gl) return;
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;
    const n = initVectexBuffers(gl);
    if (n < 0) return;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 配置纹理
    if (!initTextures(gl, n, image)) {
      console.log('初始化纹理失败');
    }
}
function initVectexBuffers(gl: WebGLWithProgram) {
  const n = 4;
  const verticesTexCoords = new Float32Array([
    // 顶点坐标和纹理坐标
    ...[-0.5, 0.5, 0.0, 1.0],
    ...[-0.5, -0.5, 0.0, 0.0],
    ...[0.5, 0.5, 1.0, 1.0],
    ...[0.5, -0.5, 1.0, 0.0],
  ]);
  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  const vertexTexBuffer = gl.createBuffer();
  if (!vertexTexBuffer) return -1;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) return -1;
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);
  const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) return -1;
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);
  return n;
}
function initTextures(gl: WebGLWithProgram, n: number, image: HTMLImageElement) {
  // 创建纹理对象以存储纹理图像
  const texture = gl.createTexture();
  if (!texture) {
    console.log('创建纹理对象失败');
    return false;
  }
  // 获取u_Sampler变量的存储位置
  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('获取u_Smapler变量位置信息失败');
    return false;
  }
  loadTexture(gl, n, texture, u_Sampler, image);
  return true;
}
// 为WebGL配置纹理
function loadTexture(
  gl: WebGLWithProgram,
  n: number,
  texture: WebGLTexture,
  u_Sampler: WebGLUniformLocation,
  image: HTMLImageElement,
) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
