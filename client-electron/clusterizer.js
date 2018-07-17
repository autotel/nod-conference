const EventEmitter = require('events');

var clusterizer = new (function () {
    var emitter = new EventEmitter();
    var dimensions = {};
    var data = [];
    var update = function () {
        for (var dataitem of data) {
            for (var dimension in dimensions) {
                if (dataitem[dimension] === undefined) {
                    dataitem[dimension] = 0;
                }
            }
        }
    }
    this.append = function (idata) {
        for (var varname in idata) {
            if (!isNaN(idata[varname])) {
                if (dimensions[varname] === undefined) {
                    dimensions[varname] = {
                        normal: 1 / idata[varname],
                        max: idata[varname]
                    }
                } else {
                    if (dimensions[varname].max < idata[varname]) {
                        dimensions[varname] = {
                            normal: 1 / idata[varname],
                            max: idata[varname]
                        }
                    }
                }
                data.push(idata);
            }
        }

        update();

        emitter.emit('new point', idata);
    }
    var Konva = false;
    this.konvaGraph = function (iKonva) {
        Konva = iKonva;
        var size = { x: 800, y: 500 }
        var stage = new Konva.Stage({
            container: 'clusterizer',
            width: size.x,
            height: size.y
        });

        var layer = new Konva.Layer();

        var fr = 20;

        var anim = new Konva.Animation(function (frame) {
        }, layer);

        anim.start();

        var pointsList = [];

        var max = {
            x: 1, y: 1, z: 1
        }

        var text = new Konva.Text();

        layer.add(text);
        var Point = function (pos) {
            this.destroy = false;
            var self = this;
            // console.log(pos);
            pointsList.push(this);
            var crossHair = new Konva.Group();
            var scale = pos.z;
            var linea = new Konva.Line({
                points: [-4, 0, 4, 0],
                stroke: pos.color || "red",
                strokeWidth: 1
            });
            var lineb = new Konva.Line({
                points: [0, -4, 0, 4],
                stroke: pos.color || "red",
                strokeWidth: 1
            });
            var circle = new Konva.Circle({ width: 10, height: 10, fill: pos.color || 'red', opacity: 0.2 });
            crossHair.add(linea);
            crossHair.add(lineb);
            crossHair.add(circle);
            crossHair.setX(pos.x);
            crossHair.setY(pos.y);
            crossHair.scale(pos.z);
            crossHair.on('mouseenter', function () {
                console.log(pos);
                text.setText(`x:${pos.x},y:${pos.y}`);
                var normx = pos.x * (1 / max.x);
                var normy = pos.y * (1 / max.y);
                text.setX(normx * size.x);
                text.setY(normy * size.y);
            });
            crossHair.on('mouseleave', function () {
                text.setText(``);
            });
            crossHair.on('mouseup', function () {
                crossHair.destroy();
                self.destroy = true;
                redraw();
            });


            this.pos = pos;
            this.updatePosition = function () {
                var normx = pos.x * (1 / max.x);
                var normy = pos.y * (1 / max.y);
                var normz = pos.z * (1 / max.z);
                // crossHair.setX(normx * size.x);
                // crossHair.setY(normy * size.y);
                // crossHair.scale(normz);

                var tween = new Konva.Tween({
                    node: crossHair,
                    x: normx * size.x,
                    y: normy * size.y,
                    scale: normz,
                    duration: 0.5,
                    easing: Konva.Easings.EaseInOut
                });

                // play tween
                tween.play();
            }

            // add the shape to the layer
            layer.add(crossHair);
        }
        // var testp = new Point({ x: 10, y: 10, z: 1 });
        // add the layer to the stage
        stage.add(layer);
        var redraw = function () {
            max.x = 0;
            max.y = 0;
            max.z = 0;
            for (var pn in pointsList) {
                // console.log(pn);
                var point = pointsList[pn];
                if(!point.destroy)
                for (var c of ['x', 'y', 'z']) {
                    if (max[c] < point.pos[c]) {
                        max[c] = point.pos[c];
                    }
                }
            }
            for (var point of pointsList) {
                if (!point.destroy)
                point.updatePosition();
            }
            // console.log(max);
        };

        var runningtime=0;

        emitter.on('new point', function (newdata) {
            if (newdata.strength && newdata.frequency && newdata.slopeAverage) {
                var f = {
                    // x: newdata.slopeAverage,
                    x: newdata.strength,
                    y: newdata.frequency,
                };
                if (newdata.color) f.color = newdata.color;
                var np = new Point(f);
                redraw();
                // console.log("newpoint", newdata);
            } else {
                // console.log("no point", newdata);
            }
        });

        // draw the image
        layer.draw();
    }
})();