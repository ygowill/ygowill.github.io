// 一些全局变量
let gl;
let light;
let glossiness;
let nextObjectId;
let material;
let environment;
let ui;
let error;
let canvas;
let inputFocusCount = 0;
let angleX = 0;
let angleY = 0;
const zoomZ = 2.5;
const MATERIAL_DIFFUSE = 0;
const MATERIAL_MIRROR = 1;
const MATERIAL_GLOSSY = 2;
light = Vector.create([-0.7, 0.4, -0.7]);

nextObjectId = 0;
material = MATERIAL_DIFFUSE;
glossiness = 0.5;

// 默认选择红绿
const RED_GREEN_CORNELL_BOX = 0;
environment = RED_GREEN_CORNELL_BOX;

let mouseDown = false, oldX, oldY;
const eye = Vector.create([0, 0, 0]);

// shader相关的常量
// 反弹次数
const bounces = '5';
// 光源大小
const lightSize = 0.1;
// 光源亮度
const lightVal = 0.6;
// 两个数学常量
const epsilon = '0.0001';
const infinity = '10000.0';
