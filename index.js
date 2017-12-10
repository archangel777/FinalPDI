var pointSize = 10;

var canvas;
var ctx;

var pointHeldIndex = -1;

var interpolate;

var squared = false;

window.onload = function() {

	$('.button').mousedown(() => false);

	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	updateInterpolation();

	updateCanvas();

}

var points = [];

function updatePointsOrder() {
	points.sort((x1, x2) => x1[0] - x2[0]);
}

function updateInterpolation() {
	updatePointsOrder();
	let newPoints = [[0, canvas.height/2]].concat(points).concat([[canvas.width, canvas.height/2]]);
	interpolate = d3.scaleLinear()
		.domain(newPoints.map(p => p[0]))
		.range(newPoints.map(p => (1 - 2*p[1]/canvas.height)));
	if (squared) {
		interpolate = d3.scaleLinear()
			.domain(newPoints.map(p => p[0]))
			.range(newPoints.map(p => (1 - 2*p[1]/canvas.height)))
			.interpolate(d3.interpolateRound);
	}
}

function changeToLinear() {
	squared = false;
	updateCanvas();
}

function changeToSquare() {
	squared = true;
	updateCanvas();
}

function distance(p1, p2) {
	let x = p2[0] - p1[0];
	let y = p2[1] - p1[1];
	return Math.sqrt(x*x + y*y);
}

function clickedPointIndex(x, y) {
	for (let i in points)
		if (distance(points[i], [x, y]) < pointSize)
			return +i;
	return -1;
}

function canvasMouseDown(e) {
	let x = e.offsetX;
	let y = e.offsetY;
	pointHeldIndex = clickedPointIndex(x, y);
}

function canvasMouseUp(e) {
	pointHeldIndex = -1;
}

function canvasMouseMove(e) {
	let x = e.offsetX;
	let y = e.offsetY;
	if (pointHeldIndex !== -1) {
		if (pointHeldIndex > 0 && x < points[pointHeldIndex-1][0]) {
			points[pointHeldIndex] = points[pointHeldIndex-1];
			pointHeldIndex--;
		}
		else if (pointHeldIndex < points.length-1 && x > points[pointHeldIndex+1][0]) {
			points[pointHeldIndex] = points[pointHeldIndex+1];
			pointHeldIndex++;
		}
		
		points[pointHeldIndex] = [x, y];
		updateCanvas();
	}
}

function canvasDoubleClick(e) {
	let x = e.offsetX;
	let y = e.offsetY;
	let pointIndex = clickedPointIndex(x, y);
	
	if (pointIndex === -1)
		points.push([x, y]);
	else 
		points.splice(pointIndex, 1);

	updateCanvas();
}

function updateCanvas() {
	updateInterpolation();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i in points) {
		let point = points[i];
		ctx.beginPath();
		ctx.arc(point[0], point[1], pointSize, 0, 2*Math.PI);
		ctx.fill();
	}
	ctx.beginPath();
	for (let i = 0; i < canvas.width; i++) {
		ctx.lineTo(i, (1 - interpolate(i))*canvas.height/2);
	}
	ctx.stroke();
}