const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let img = null;
let dragging = false;
let offsetX = 0, offsetY = 0;

// 初始图片位置和缩放
let imageX = 50, imageY = 50;
let scale = 1;

function generateDateTimeWithRandom() {
  // 获取当前日期时间
  const now = new Date();
  
  // 格式化日期部分
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 格式化时间部分
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // 生成4位随机数
  const randomNum = String(Math.floor(Math.random() * 9000) + 1000);
  
  // 组合成最终字符串
  return `${year}${month}${day}_${hours}${minutes}${seconds}_${randomNum}`;
}

function updateCanvasSize() {
    const width = parseInt($('#canvasWidth').val());
    const height = parseInt($('#canvasHeight').val());
    canvas.width = width;
    canvas.height = height;
    draw();
}

$('#canvasWidth, #canvasHeight').on('input', updateCanvasSize);

$('#imageInput').on('change', function (e) {
    loadImageFromFile(e.target.files[0]);
});

function loadImageFromFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        const image = new Image();
        image.onload = function () {
            img = image;
            imageX = canvas.width / 2 - img.width / 2;
            imageY = canvas.height / 2 - img.height / 2;
            scale = 1;
            draw();
        };
        image.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) {
        ctx.save();
        ctx.translate(imageX + img.width * scale / 2, imageY + img.height * scale / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
    }
}

canvas.addEventListener('mousedown', function (e) {
    if (!img) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const imgLeft = imageX;
    const imgTop = imageY;
    const imgRight = imageX + img.width * scale;
    const imgBottom = imageY + img.height * scale;

    if (
        mouseX >= imgLeft &&
        mouseX <= imgRight &&
        mouseY >= imgTop &&
        mouseY <= imgBottom
    ) {
        dragging = true;
        offsetX = mouseX - imageX;
        offsetY = mouseY - imageY;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', function (e) {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        imageX = mouseX - offsetX;
        imageY = mouseY - offsetY;
        draw();
    }
});

window.addEventListener('mouseup', function () {
    dragging = false;
    canvas.style.cursor = 'grab';
});

// 鼠标滚轮缩放图片
canvas.addEventListener('wheel', function (e) {
    if (!img) return;
    e.preventDefault();

    const zoomFactor = 0.1;
    const oldScale = scale;

    if (e.deltaY < 0) {
        scale += zoomFactor;
    } else {
        scale -= zoomFactor;
    }

    scale = Math.min(Math.max(scale, 0.1), 5);

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - imageX;
    const dy = mouseY - imageY;
    imageX = mouseX - dx * (scale / oldScale);
    imageY = mouseY - dy * (scale / oldScale);

    draw();
});

// 拖放图片导入
canvas.addEventListener('dragover', function (e) {
    e.preventDefault(); // 允许放置
    canvas.style.border = '2px dashed #4285F4';
});

canvas.addEventListener('dragleave', function (e) {
    e.preventDefault();
    canvas.style.border = '1px solid #ccc';
});

canvas.addEventListener('drop', function (e) {
    e.preventDefault();
    canvas.style.border = '1px solid #ccc';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        loadImageFromFile(files[0]);
    }
});

// 导出图片按钮点击事件
$('#exportBtn').on('click', function () {
    if (!img) {
        alert("请先导入图片！");
        return;
    }

    const link = document.createElement('a');
    const fileName = $('#fileName').val() || generateDateTimeWithRandom();

    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

function init() {
    // 获取当前URL的查询参数部分（即?后面的部分）
    const urlParams = new URLSearchParams(window.location.search);
    const width = urlParams.get('width');
    const height = urlParams.get('height');
    const fileName = urlParams.get('fileName');
    // console.log(width, height);
    if (width) $('#canvasWidth').val(width);
    if (height) $('#canvasHeight').val(height);
    if (fileName) $('#fileName').val(fileName);
    updateCanvasSize();
}

window.onload = function() {
    init();
};