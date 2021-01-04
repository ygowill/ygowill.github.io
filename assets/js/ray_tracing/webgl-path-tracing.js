// 响应鼠标按键按下
document.onmousedown = function (event) {
    const mouse = canvasMousePos(event);
    oldX = mouse.x;
    oldY = mouse.y;

    if (mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
        mouseDown = !ui.mouseDown(mouse.x, mouse.y);
        // 取消选中状态
        return false;
    }

    return true;
};

// 响应鼠标移动
document.onmousemove = function (event) {
    const mouse = canvasMousePos(event);

    if (mouseDown) {
        // 更新角度
        angleY -= (mouse.x - oldX) * 0.01;
        angleX += (mouse.y - oldY) * 0.01;

        // 防止上下颠倒
        angleX = Math.max(angleX, -Math.PI / 2 + 0.01);
        angleX = Math.min(angleX, Math.PI / 2 - 0.01);

        // 清空采样buffer
        ui.renderer.pathTracer.sampleCount = 0;

        // 保存角度
        oldX = mouse.x;
        oldY = mouse.y;
    } else {
        ui.mouseMove(mouse.x, mouse.y);
    }
};

// 响应鼠标按键释放
document.onmouseup = function (event) {
    mouseDown = false;

    const mouse = canvasMousePos(event);
    ui.mouseUp(mouse.x, mouse.y);
};

// 检测键盘事件
document.onkeydown = function (event) {
    // if there are no <input> elements focused
    if (inputFocusCount === 0) {
        // if backspace or delete was pressed
        if (event.key === 'Backspace' || event.key === "Delete") {
            ui.deleteSelection();

            // don't let the backspace key go back a page
            return false;
        }
    }
};
