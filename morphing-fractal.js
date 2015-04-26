(function() {
/* Morphing Fractals 

    // Inspired by Dan Gries : dangries.com
    // Lots of comments below, 
        PS (θ = variable)
*/

    // Get canvas element set dimensions
    var cEl = document.getElementById("canvas");
    cEl.width = '1280';
    cEl.height = '720';
    // Get context and declare vars 
    var context = cEl.getContext("2d"),
        circles,
        timer,
        i, j, maxR, minR,
        twoRadians = 2 * Math.PI;
    // Options 
    var opt = {
        numCircles: 4,
        maxMaxRadius: cEl.width/2,
        minMaxRadius: 300,
        minRadiusFactor: 0,
        iterations: 8,
        drawsPerFrame: 1,
        lineWidth: 8,
        lineCap: 'round',
        strokeStyle: 'rgba(180,0,0,0.6)',
        fillStyle: 'rgba(255,0,0,0.5)',
        morphDuration: 1 / 60,
        spinSpeed: 20,
        stutter: 1 // 0 to 1. 1 = smoothest
    };
    // RAF! 
    var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            return setTimeout(callback, 1000 / 60);
        };

    // irregularCurve 
    function irregularCurve(iter) {
            var pointList = {},
                minRatio = 0.5,
                minY = 1,
                maxY = 1,
                point,
                nextPoint,
                newPoint,
                dx,
                newX,
                newY,
                ratio;
            pointList.first = {
                x: 0,
                y: 1
            };
            pointList.first.next = {
                x: 1,
                y: 1
            };

            function setPoints() {
                while (point.next) {
                    pointNextByVal = point.next; // So we don't create a circular reference
                    dx = point.next.x - point.x; // differnce of new and old x point
                    newX = 0.5 * (point.x + point.next.x); // Average of new and old x point 
                    newY = 0.5 * (point.y + point.next.y); // Average of new and old y point
                    newY += dx * (Math.random() * 2 - 1); // Increment y by difference with randomness
                
                    // create new object over newPoint per iteration
                    newPoint = {
                        x: newX,
                        y: newY
                    }; 

                    // Set to newY to restrict explosions 
                    if (newY < minY) {
                        minY = newY;
                    }else if (newY > maxY) {
                        maxY = newY;
                    }

                    //put between points
                    newPoint.next = point.next; // add pont next as 3rd property
                    point.next = newPoint; // stores the above so point.next.x is accessible next iteration
                    // BTW pointNexByVal is assigned to point.next
                    point = pointNextByVal; 
                }
            }

            // Loop the function per iterations in options
            for (var i = 0; i < iter; i++) {
                point = pointList.first;
                setPoints();
            }


            // Normalizes vals between 0 and 1, reguates magniture
            if (maxY !== minY) {
                var normalizeRate = 1 / (maxY - minY);
                point = pointList.first;
                while (point) {
                    point.y = normalizeRate * (point.y - minY);
                    point = point.next;
                }
            }

            // If max = min set all points equal to 1.
            else {
                point = pointList.first;
                while (point) {
                    point.y = 1;
                    point = point.next;
                }
            }
            return pointList;
        }

        // Initialize shape, make pointsList irregular & push to circles array 
    void function setCircles() {
        circles = [];
        for (i = 0; i < opt.numCircles; i++) {
            maxR = opt.minMaxRadius + Math.random() * (opt.maxMaxRadius - opt.minMaxRadius);
            minR = opt.minRadiusFactor * maxR;
            var newCircle = {
                centerX: cEl.width / 2,
                centerY: cEl.height / 2,
                maxRadius: maxR,
                minRadius: minR,
                param: 0,
                phase: Math.random() * twoRadians, //the phase to use for a single fractal curve.
            };
            newCircle.pointList1 = irregularCurve(opt.iterations);
            newCircle.pointList2 = irregularCurve(opt.iterations);
            circles.push(newCircle);
        }
    }(); // Self exec
    /* Animation loop */
    function morph() {
        var c,
            radius,
            point1,
            point2,
            x0,
            y0,
            cosParam;
        //clear screen
        context.clearRect(0, 0, cEl.width, cEl.height);
        // 
        function morphLoop() {
                c = circles[i]; // c = current circle
                c.param += opt.morphDuration; // incrementation of morph per draw
                if (c.param > opt.stutter) {
                    c.param = 0;
                    c.pointList1 = c.pointList2;
                    c.pointList2 = irregularCurve(opt.iterations);
                }
                cosParam = 0.5 - Math.cos(Math.PI * c.param) / 2;
                context.strokeStyle = opt.strokeStyle;
                context.lineWidth = opt.lineWidth;
                context.fillStyle = opt.fillStyle;
                context.beginPath();
                point1 = c.pointList1.first;
                point2 = c.pointList2.first;
                // Rotate the circle
                c.phase += (opt.spinSpeed / 10000);
                while (point1.next) {
                    point1 = point1.next;
                    point2 = point2.next;
                    // θ =  2 radians * line point x + morph val * (diff of old & ne line points) + rotation iteration
                    θ = twoRadians * (point1.x + cosParam * (point2.x - point1.x)) + c.phase;
                    // 
                    radius = c.minRadius + (point1.y + cosParam * (point2.y - point1.y)) * (c.maxRadius - c.minRadius);
                    //   Slight reverse to Dans method
                    //   center of canvas + radius * ratio 
                    x0 = c.centerX + radius * Math.sin(θ);
                    y0 = c.centerY + radius * Math.cos(θ);
                    context.lineTo(x0, y0);
                }
                context.closePath();
                context.fill();
                context.lineCap = opt.lineCap;
                context.stroke();
            }
            // Number of changes per frame 
        for (j = 0; j < opt.drawsPerFrame; j++) {
            // Animation per change
            for (i = 0; i < opt.numCircles; i++) {
                morphLoop();
            }
        }
        rAF(morph); // Animation loop
    }
    rAF(morph); // Fn init 
}());
