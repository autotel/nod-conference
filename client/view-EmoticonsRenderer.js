
var EmoticonsRenderer = function () {
    var emoticonsField = document.createElement('div');
    emoticonsField.classList.add('emoticons-field');
    var body = document.getElementsByTagName("BODY")[0];
    body.appendChild(emoticonsField);

    var representations = {}
    var EmoticonRepresentation = function () {
        var self = this;
        this.appended = false;
        var domEl = document.createElement('div');
        var domElImg = document.createElement('img');
	var domEltxt = document.createElement('p');
        domEl.appendChild(domElImg);
	domEl.appendChild(domEltxt);
        var domElName = document.createElement('p');
        domEl.appendChild(domElName);
        domElImg.src = "./res/dlc.bmp";
        this.appear = function () {
            emoticonsField.appendChild(domEl);
        }
        this.disappear = function () {
	    try{
            	emoticonsField.removeChild(domEl);
	    }catch(e){
   		console.log("error removing node for emoticon with unique",self.unique);
		console.log(e);
	    }
        }
        var restoreTimeout = false;
        var currentGesture = "neutral";
        this.represent = function (value) {
	    domEltxt.innerHTML=value;
            if (currentGesture !== value) {
                domElImg.src = "./res/" + value + ".gif";
                currentGesture = value
            }
            if (restoreTimeout) {
                console.log("clear timeout");
                clearTimeout(restoreTimeout);
                restoreTimeout = false;
            }
            if (value !== "neutral") {
                restoreTimeout = setTimeout(function () {
                    console.log("timeout neutrak");
                    self.represent('neutral');
                    restoreTimeout = false;
                }, 1000);
            }
        }
        this.represent('neutral');
        this.setName = function (name) {
            domElName.innerHTML = name;
        }
    }
    var self=this;
    this.add = function (a) {
        console.log("+EMOT", a);
        if (!representations[a]) {
            representations[a] = new EmoticonRepresentation();
        }
        var emoticon = representations[a];
        emoticon.unique=a;

    }
    this.getOrAdd=function(a){
        if(representations[a]===undefined){
            self.add(a);
        }
        return representations[a];
    }
    this.remove = function (a) {
        console.log("EMOT", a);
        var emoticon = self.getOrAdd(a);
        var emoticon = representations[a];
        emoticon.disappear();
    }
    this.setName = function (a, name) {
	console.log("name",a);
        var emoticon = self.getOrAdd(a);
        if(name!=="undefined" && name!=="unnamed")  emoticon.appear();
        emoticon.setName(name+a);
        console.log("set name");
    }
    this.gesture = function (a, gesture) {
        console.log("G EMOT", a); 
        var emoticon = self.getOrAdd(a);
        emoticon.appear();
        emoticon.represent(gesture);
        console.log(a, "repreesent", gesture);
    }
    this.message = function (a) {
    }
}
var emoticons = new EmoticonsRenderer();
module.exports = emoticons;
