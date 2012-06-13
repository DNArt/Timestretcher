function Timestretcher(options) {

  this.parent = options.parent || "body";
  
  this.canvas_id = options.canvas_id || "canvas";

  this.capture_width = options.capture_width || 320;
  this.capture_height = options.capture_height || 240;

  this.display_width = options.display_width || 640;
  this.display_height = options.display_height || 480;

  this.upwards = options.upwards;
  this.mirrored = options.mirrored;
  
  this.delay = 1000/(options.frame_rate || 30);
  
  this.tdt = 0;

  this.element = {};
  this.localVideo = {};
  this.ctx = {};
  this.timer = {};
  
  this.allowFullscreen = options.allow_fullscreen;

  // Time Stretcher Vars
  var segmentSize = options.segment_size || 4;
  var numPixels = this.capture_width * this.capture_height;
  this.imageBuffer = new Array(this.capture_height);
  this.counter = new Array(this.capture_height);
  this.imageData;

  // Set-up Buffer
  for (var line = 0; line < this.capture_height; line++) {
    this.counter[line] = 0;
    var numFrames = Math.round(line/segmentSize)+1
    this.imageBuffer[line] = new Array(numFrames);
    for (var frame = 0; frame < numFrames; frame++) {
      this.imageBuffer[line][frame] = new Array(this.capture_width*3);
    }
  }
}

Timestretcher.prototype.nextFrame = function() {
  this.ctx.drawImage(this.localVideo, 0, 0, this.capture_width, this.capture_height);
  this.imageData = this.ctx.getImageData(0, 0, this.capture_width, this.capture_height);
  var pixels = this.imageData.data;
  
  for (var row = 0; row < this.capture_height; row++) {
    var rowlen = this.imageBuffer[row].length;
    var nextCounter = (this.counter[row]+1) % this.imageBuffer[row].length;
    for (var col = 0; col < this.capture_width; col++) {
      var p;
      if (this.upwards) p = (this.capture_height-(row+1))*this.capture_width+col;
      else p = row*this.capture_width+col;
      
      for (var rgb = 0;rgb < 3; rgb++) {
        // mirrored:
        if (this.mirrored) this.imageBuffer[row][this.counter[row]][(this.capture_width-(col+1))*3+rgb] = pixels[p*4+rgb];
        else this.imageBuffer[row][this.counter[row]][col*3+rgb] = pixels[p*4+rgb];
        pixels[p*4+rgb] = this.imageBuffer[row][nextCounter][col*3+rgb];
      }
    }
    this.counter[row] = nextCounter;
  }
  this.ctx.putImageData(this.imageData, 0, 0);
  this.timer = setTimeout(this.nextFrame.bind(this), this.delay);
}

// User Media Stuff...
Timestretcher.prototype.onUserMediaSuccess = function(stream) {
  if (window.webkitURL) {
    this.localVideo.src = window.webkitURL.createObjectURL(stream);
  } else {
    this.localVideo.src = stream;
  }
  
  this.nextFrame();
}
    
Timestretcher.prototype.onUserMediaError = function(error){
  console.log("Couldn't get user media: "+error);
}

Timestretcher.prototype.$ = function(name) {
  if (name[0] === '#') {
    return document.getElementById(name.substring(1));
  } else if (name[0] === '.') {
    return document.getElementsByClassName(name.substring(1))[0];
  } else {
    return document.getElementsByTagName(name)[0];
  }
}

Timestretcher.prototype.init = function() {
  
  this.element = this.$(this.parent);
  this.element.innerHTML +=
    "<canvas id='"+this.canvas_id+
        "' width='"+this.capture_width+
        "' height='"+this.capture_height+
        "' style='display:block;border:0;background:#000;' </canvas>";
  this.element.innerHTML +=
    "<video id='_timestretcher_live'"+ 
        "  width='"+this.capture_width+
        "' height='"+this.capture_height+
        "' style='display:none;visibility:hidden;'"+
        "  autoplay></video>";
  
  this.element.innerHTML += "<style>canvas#"+this.canvas_id+" { width:"+this.display_width+"px; height:"+this.display_height+"px; } "+
    "canvas#"+this.canvas_id+":-webkit-full-screen { width:100%; height:100%; }</style>"
  
  this.localVideo = this.$("#_timestretcher_live");
  this.canvas = this.$("#"+this.canvas_id);
  this.ctx = this.canvas.getContext('2d');
  if (navigator.webkitGetUserMedia) {
    try {
      navigator.webkitGetUserMedia({audio:false, video:true}, this.onUserMediaSuccess.bind(this), this.onUserMediaError.bind(this));
    } catch (e) {
      try {
        navigator.webkitGetUserMedia("video", this.onUserMediaSuccess.bind(this), this.onUserMediaError.bind(this));
      } catch (e) {
        alert("wekitGetUserMedia() failed. Is the MediaStream flag enabled in about:flags? Exception: " + e.message);
      }
    }
  } else if (navigator.getUserMedia) {
    try {
      navigator.getUserMedia({audio:false, video:true}, this.onUserMediaSuccess.bind(this), this.onUserMediaError.bind(this));
    } catch (e) {
      console.log("getUserMedia failed. Exception: " + e.message);
    }
  }
  
  if (this.allowFullscreen) {
    document.addEventListener("keydown", function(e) {
      if (e.keyCode == 70) {
        this.toggleFullScreen();
      }
    }.bind(this), false);
  }
}

Timestretcher.prototype.toggleFullScreen = function() {
  if (!document.mozFullScreen && !document.webkitFullScreen) {
    if (this.canvas.mozRequestFullScreen) {
      this.canvas.mozRequestFullScreen();
    } else {
      this.canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitCancelFullScreen();
    }
  }
}
  
Timestretcher.prototype.setDirection = function(u) {
  this.upwards = u;
}
  
Timestretcher.prototype.setMirrored = function(m) {
  this.mirrored = m;
}

Timestretcher.prototype.setFramerate = function(f) {
  this.delay = 1000/f;
}
