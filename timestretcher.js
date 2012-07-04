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
  
  this.real_time = false;
  
  this.tdt = 0;
  
  this.mask = new Image();
  this.mask.src = options.mask || false;

  this.element = {};
  this.localVideo = {};
  this.ctx = {};
  this.timer = {};
  
  this.skip_top = options.skip_top || 0;
  this.skip_bottom = options.skip_bottom || 0;
  
  this.debug_skip_top = this.skip_top;
  this.debug_skip_bottom = this.skip_bottom;
  
  this.allowFullscreen = options.allow_fullscreen;

  // Time Stretcher Vars
  var segmentSize = options.segment_size || 4;
  //var numPixels = this.capture_width * this.capture_height;
  this.imageBuffer = new Array(this.capture_height-(this.skip_top+this.skip_bottom));
  this.counter = new Array(this.capture_height);
  this.imageData;

  // Set-up Buffer
  for (var line = 0; line < this.imageBuffer.length; line++) {
    this.counter[line] = 0;
    var numFrames = Math.round(line/segmentSize)+1
    this.imageBuffer[line] = new Array(numFrames);
    for (var frame = 0; frame < numFrames; frame++) {
      this.imageBuffer[line][frame] = new Array(this.capture_width*3);
    }
  }
}

Timestretcher.prototype.nextFrame = function() {
  this.ctx_c.save();
  if (this.mirrored) {
    this.ctx_c.translate(this.capture_width, 0);
    this.ctx_c.scale(-1, 1);
  }
  
  this.ctx_c.drawImage(this.localVideo, 0, 0, this.capture_width, this.capture_height);
  
  this.imageData = this.ctx_c.getImageData(0, this.skip_top, this.capture_width, this.imageBuffer.length);
  var pixels = this.imageData.data;
  
  for (var row = 0; row < this.imageBuffer.length; row++) {
    var rowlen = this.imageBuffer[row].length;
    var nextCounter = (this.counter[row]+1) % this.imageBuffer[row].length;
    for (var col = 0; col < this.capture_width; col++) {
      var p;
      if (this.upwards) p = (this.imageBuffer.length-(row+1))*this.capture_width+col;
      else p = row*this.capture_width+col;
      
      for (var rgb = 0;rgb < 3; rgb++) {
        this.imageBuffer[row][this.counter[row]][col*3+rgb] = pixels[p*4+rgb];
        pixels[p*4+rgb] = this.imageBuffer[row][nextCounter][col*3+rgb];
      }
    }
    this.counter[row] = nextCounter;
  }
  
  
  this.ctx_c.restore();
  if (this.real_time) this.drawDebug();
  
  if (!this.real_time) {
    this.ctx_c.putImageData(this.imageData, 0, this.skip_top);
    var d = this.display_height/this.capture_height;
    var mappedOffset = this.skip_top*d;
    var mappedHeight = this.imageBuffer.length*d;
    //this.ctx.drawImage(this.canvas_c, 0, mappedOffset, this.display_width, mappedHeight);
  }
  
  this.ctx.drawImage(this.canvas_c, 0, 0, this.display_width, this.display_height);
  
  
  //this.ctx_c.putImageData(this.imageData, 0, 0);
  
  this.timer = setTimeout(this.nextFrame.bind(this), this.delay);
  
  
  if (this.mask.src) this.ctx.drawImage(this.mask, 0, 0, this.display_width, this.display_height);
}

//
Timestretcher.prototype.drawDebug = function() {

  this.ctx_c.beginPath();
    this.ctx_c.moveTo(0,this.debug_skip_top);
    this.ctx_c.lineTo(this.capture_width,this.debug_skip_top);
    this.ctx_c.lineWidth = 1;
  this.ctx_c.closePath();
  this.ctx_c.stroke('red');
  
  this.ctx_c.beginPath();
    this.ctx_c.moveTo(0,this.capture_height-this.debug_skip_bottom);
    this.ctx_c.lineTo(this.capture_width,this.capture_height-this.debug_skip_bottom);
    this.ctx_c.lineWidth = 1;
  this.ctx_c.closePath();
  this.ctx_c.stroke();
  
  this.ctx_c.fillText("skip_top: "+this.debug_skip_top, this.capture_width/2-70, this.debug_skip_top+15); 
  this.ctx_c.fillText("skip_bottom: "+this.debug_skip_bottom, this.capture_width/2-70, this.capture_height-this.debug_skip_bottom-7); 
  
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
        "' width='"+this.display_width+
        "' height='"+this.display_height+
        "' style='display:block;background:#000;' </canvas>";
  this.element.innerHTML +=
    "<canvas id='_timestretcher_capture'"+
        " width='"+this.capture_width+
        "' height='"+this.capture_height+
        "' style='display:none;visibility:hidden;' </canvas>";
  this.element.innerHTML +=
    "<video id='_timestretcher_live'"+ 
        "  width='"+this.capture_width+
        "' height='"+this.capture_height+
        "' style='display:none;visibility:hidden;'"+
        "  autoplay></video>";
  
  this.element.innerHTML += "<style>canvas#"+this.canvas_id+" { width:"+this.display_width+"px; height:"+this.display_height+"px; } "+
    "canvas#"+this.canvas_id+":-webkit-full-screen { width:100%; height:100%; }</style>"
  
  
  this.canvas_c = this.$("#_timestretcher_capture");
  this.ctx_c = this.canvas_c.getContext('2d');
  this.ctx_c.strokeStyle = 'red';
  
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
  
  document.addEventListener("keydown", function(e) {
    if (this.allowFullscreen && e.keyCode == 70) {
      this.toggleFullScreen();
    } else if (e.keyCode == 84) {
      this.real_time = !this.real_time;
    } else if (e.keyCode == 85) {
      this.upwards = !this.upwards;
    } else if (e.keyCode == 77) {
      this.mirrored = !this.mirrored;
    } else if (e.keyCode == 73) {
      this.debug_skip_top += 1;
    } else if (e.keyCode == 79) {
      this.debug_skip_top += -1;
    } else if (e.keyCode == 75) {
      this.debug_skip_bottom += 1;
    } else if (e.keyCode == 76) {
      this.debug_skip_bottom += -1;
    } 
  }.bind(this), false);
  
  canvas.addEventListener('click', this.toggleFullScreen.bind(this), false);
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
