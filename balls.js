var flyingBalls = [];
var ballsOnBase = [];
var idDeletedBalls = [];

var outNode = document.getElementsByClassName("flyingBalls")[0];
var generalNode = document.getElementsByClassName("general")[0];

var widthFlyingZone = getComputedStyle(outNode).width;
widthFlyingZone = widthFlyingZone.slice(0, -2);
var heightFlyingZone = getComputedStyle(outNode).height;
heightFlyingZone = heightFlyingZone.slice(0, -2);

var proportionsOfBall = 50;

var ball = function() {
    this.x;
    this.trandX = 1;
    this.y;
    this.trandY = 1;
    this.background;
};

ball.prototype.setBackground = function() {
    var colorsOfBackground = ["grey", "red", "green", "yellow", "blue", "purple", "violet", "teal" ];
    return colorsOfBackground[Math.floor(Math.random() * colorsOfBackground.length)];
}

function getCoords(elem) { // кроме IE8-
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {
        top: top,
        left: left
    };
}

function mouseDown (event) {
    if (event.which === 1) {
        var ballNode = event.target;

        var pathOnMoveY = [];
        pathOnMoveY.length = 5;
        var pathOnMoveX = [];
        pathOnMoveX.length = 5;

        var generalNodeMarginTop = getCoords(generalNode).top; //отступ
        var generalNodeMarginLeft = getCoords(generalNode).left; //элемента

        var shiftX = event.pageX - getCoords(ballNode).left; //Смешение курсора
        var shiftY = event.pageY - getCoords(ballNode).top;  //относительно обьекта

        var currentY;
        var currentX;

        function MoveBall (event) {
            currentY = event.pageY;
            currentX = event.pageX;
            ballNode.style.top = currentY - generalNodeMarginTop - shiftY + 'px';
            ballNode.style.left = currentX - generalNodeMarginLeft - shiftX + 'px';

            ballsOnBase[ballNode.id].y = currentY - generalNodeMarginTop - shiftY;
            ballsOnBase[ballNode.id].x = currentX - generalNodeMarginLeft - shiftX;

            pathOnMoveY.push(currentY);
            pathOnMoveY.shift();
            pathOnMoveX.push(currentX);
            pathOnMoveX.shift();
        }

        function addBallForFlying() {
            var outNodeTop = getCoords(outNode).top; //Отступ от блока
            var outNodeLeft = getCoords(outNode).left; //для полета шариков

            //Проверка положения шарика перед добавлением.
            if ((currentX - outNodeLeft - shiftX > 0) &&
                (currentX - outNodeLeft - shiftX < widthFlyingZone - proportionsOfBall) &&
                (currentY - outNodeTop - shiftY > 0) &&
                (currentY - outNodeTop - shiftY < heightFlyingZone - proportionsOfBall)) {

                flyingBalls.push(new ball);
                flyingBalls[flyingBalls.length-1].background = ballNode.style.background;
                flyingBalls[flyingBalls.length-1].nodeElement = ballNode.cloneNode(true);
                flyingBalls[flyingBalls.length-1].nodeElement.style.cursor = "auto";
                flyingBalls[flyingBalls.length-1].nodeElement.className = "ball";
                flyingBalls[flyingBalls.length-1].y = currentY - outNodeTop - shiftY;
                flyingBalls[flyingBalls.length-1].nodeElement.style.top = flyingBalls[flyingBalls.length-1].y + "px";
                flyingBalls[flyingBalls.length-1].x = currentX - outNodeLeft - shiftX;
                flyingBalls[flyingBalls.length-1].nodeElement.style.left = flyingBalls[flyingBalls.length-1].x + "px";

                var speedY = 0;
                var speedX = 0;
                for (var i = 0; i < pathOnMoveY.length; i++) {
                    speedY += pathOnMoveY[i] - pathOnMoveY[0];
                    speedX += pathOnMoveX[i] - pathOnMoveX[0];
                }

                flyingBalls[flyingBalls.length-1].trandY = speedY / 10;
                flyingBalls[flyingBalls.length-1].trandX = speedX / 10;

                if (ballNode) {
                    ballNode.parentNode.removeChild(ballNode);
                    //generalNode.removeChild(ballNode); //Тут бывает странная ошибка
                    outNode.appendChild(flyingBalls[flyingBalls.length-1].nodeElement);
                }
                idDeletedBalls.push(event.target.id); //сохраняем id в idDeletedBalls
            }
            generalNode.removeEventListener("mousemove", MoveBall);
            generalNode.removeEventListener("mouseup", addBallForFlying);
        }

        ball.ondragstart = function() {
            return false;
        };

        generalNode.addEventListener("mousemove", MoveBall);
        generalNode.addEventListener("mouseup", addBallForFlying);

    }
}

setInterval( function flying () {
    //debugger;
    for (var i = 0; i < flyingBalls.length; i++) {
        if (flyingBalls[i].x + proportionsOfBall >= heightFlyingZone || flyingBalls[i].x <= 0) {
            flyingBalls[i].trandX = flyingBalls[i].trandX * -1;
        }
        if (flyingBalls[i].y + proportionsOfBall >= widthFlyingZone || flyingBalls[i].y <= 0) {
            flyingBalls[i].trandY = flyingBalls[i].trandY * -1;
        }

        flyingBalls[i].nodeElement.style.top = flyingBalls[i].y  + "px";
        flyingBalls[i].nodeElement.style.left = flyingBalls[i].x + "px";
        flyingBalls[i].x = flyingBalls[i].x + flyingBalls[i].trandX;
        flyingBalls[i].y = flyingBalls[i].y + flyingBalls[i].trandY;
    }

    sessionStorage.setItem("ballsOnBase", JSON.stringify(ballsOnBase)); //сохраняем массив "шаров на базе" (не удаляются)

    if (flyingBalls.length > 0) {
        sessionStorage.setItem("flyingBalls", JSON.stringify(flyingBalls)); //сохраняем текущий обьект
        sessionStorage.setItem("idDeletedBalls", JSON.stringify(idDeletedBalls)); //сохраняем индексы использованныых обьектов
    }
}, 50);

if (sessionStorage.getItem("flyingBalls")) {
    flyingBalls = JSON.parse(sessionStorage.getItem("flyingBalls"));
    //console.log("sessionStorage=", flyingBalls);
    for (var i = 0; i < flyingBalls.length; i++) {
        flyingBalls[i].nodeElement = document.createElement("div");
        flyingBalls[i].nodeElement.className = "ball";
        flyingBalls[i].nodeElement.style.background = flyingBalls[i].background;
        flyingBalls[i].nodeElement.style.top = flyingBalls[i].y  + "px";
        flyingBalls[i].nodeElement.style.left = flyingBalls[i].x + "px";
        outNode.appendChild(flyingBalls[i].nodeElement);
    }

    if (sessionStorage.getItem("idDeletedBalls").length > 0) {
        ballsOnBase = JSON.parse(sessionStorage.getItem("ballsOnBase"));
        idDeletedBalls = JSON.parse(sessionStorage.getItem("idDeletedBalls"));
        //console.log("sessionStorage idDeletedBalls =", idDeletedBalls);

        //debugger;
        for (var i = 0; i < ballsOnBase.length ; i++) {
            var match = false;
            for (var j = 0; j < idDeletedBalls.length; j++) {
                if (i == idDeletedBalls[j]) {
                    match = true;
                    continue;
                }
            }
            //нарисовать шарики если нет совпадений
            if (match == false) {
                var nodeBallForDrag = document.createElement("div");
                nodeBallForDrag.style.background = ballsOnBase[i].background;
                nodeBallForDrag.className = "ballForDrag";
                nodeBallForDrag.id = new String(i);
                nodeBallForDrag.style.top = ballsOnBase[i].y + "px";
                nodeBallForDrag.style.left = ballsOnBase[i].x + "px";
                generalNode.appendChild(nodeBallForDrag);
                nodeBallForDrag.addEventListener("mousedown", mouseDown);
                nodeBallForDrag.addEventListener("dragstart", function () { return false; });
            }
        }
    }
}
else {
    //create elements for drag
    for (var i = 0; i < 10; i++) {
        var ballForDrag = new ball();
        var nodeBallForDrag = document.createElement("div");
        nodeBallForDrag.className = "ballForDrag";
        nodeBallForDrag.id = new String(i);
        ballForDrag.background = ballForDrag.setBackground();
        nodeBallForDrag.style.background = ballForDrag.background;
        ballForDrag.y = Math.floor(Math.random() * 250) + 225;
        ballForDrag.x = Math.floor(Math.random() * 50) + 25;
        nodeBallForDrag.style.top = ballForDrag.y + "px";
        nodeBallForDrag.style.left = ballForDrag.x + "px";
        ballsOnBase.push(ballForDrag);
        generalNode.appendChild(nodeBallForDrag);
        nodeBallForDrag.addEventListener("mousedown", mouseDown);
        nodeBallForDrag.addEventListener("dragstart", function () { return false; });
    }
}