'use strict'
var renderer=new(function(){
  var drawVars=new Set();
  var width,height
  var center={ x: window.innerWidth/2, y: window.innerHeight/2};
  var layer;
  var drawing=false;
  document.addEventListener('DOMContentLoaded', function(){
    drawing=true;
    var stage = new Konva.Stage({
      container: 'konva',   // id of container <div>
      width: window.innerWidth,
      height: window.innerHeight
    });
    layer = new Konva.Layer();
    stage.add(layer);
    width=stage.getWidth();
    height=stage.getHeight();
    center={x:width/2,y:height/2}

    // var testCircle=new Konva.Circle({x:10,y:10,radius:10,fill:"black"});
    console.log(center);
    // layer.add(testCircle);
    layer.draw();
  });

  this.addVar=function(ivar){

      drawVars.add(ivar);
  }


  this.redraw=function(){
    if(!drawing)return;
    var amt=drawVars.size
    var itarr=Array.from(drawVars);


    for(var axisn in itarr){
      var cartesianDirection={x:Math.sin(Math.PI*2*axisn/amt),y:Math.cos(Math.PI*2*axisn/amt)};
      // console.log("MM");
      var axis=itarr[axisn];
      // console.log(axis);
      if(!axis.representation){
        axis.representation=new Konva.Circle({
          x: center.x,
          y: center.y,
          radius: 5,
          fill: axis.colour
        });
        layer.add(axis.representation);
        var simpleText = new Konva.Text({
          x: center.x,
          y: center.y,
          text: "--------------------"+axis.name,
          fontSize: 10,
          fill: axis.colour,
          rotation:(-axisn/amt)*360+90
        });
        layer.add(simpleText)
      }
      // console.log("AX",axis.value);

      axis.representation.setX(cartesianDirection.x*(axis.value*60)+center.x);
      axis.representation.setY(cartesianDirection.y*(axis.value*60)+center.y);
      //
      for(var a in axis.process){
        var process=axis.process[a];
        if(!process.representation){
          process.representation=new Konva.Circle({
            x: center.x,
            y: center.y,
            radius: 7,
            stroke: axis.colour
          });
          layer.add(process.representation);
        }
        process.representation.setX(cartesianDirection.x*(process.value*60)+center.x);
        process.representation.setY(cartesianDirection.y*(process.value*60)+center.y);
      }
    }

    layer.draw();
  }

  return this;
})();
