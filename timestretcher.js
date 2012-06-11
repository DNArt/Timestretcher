function Timestretcher(options) {

  this.parent = options.parent || "body";
  
  this.canvas_id = options.canvas_id || "canvas";

  this.capture_width = options.capture_width || 320;
  this.capture_height = options.capture_height || 240;

  this.display_width = options.display_width || 640;
  this.display_height = options.display_height || 480;

  this.upwards = options.upwards || true;
  this.mirrored = options.mirrored || true;
  
  this.delay = 1000/(options.frame_rate || 30);
  
  this.tdt = 0;

  this.element = {};
  this.localStream = {};
  this.localVideo = {};
  this.ctx = {};
  this.timer = {};

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

Timestretcher.prototype.startStretcher = function() {
  this.timer = setInterval(this.nextFrame.bind(this), this.delay);
}

Timestretcher.prototype.nextFrame = function() {
  this.ctx.drawImage(this.localVideo, 0, 0, this.capture_width, this.capture_height);
  this.imageData = this.ctx.getImageData(0, 0, this.capture_width, this.capture_height);
  var pixels = this.imageData.data;
  /*
  for (var p = 0; p < numPixels; p++) {
    for (var rgb = 0; rgb < 3; rgb++)
      pixels[p*4+rgb] = pixels[p*4+(3-rgb)];
  }*/
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
        else imageBuffer[row][this.counter[row]][col*3+rgb] = pixels[p*4+rgb];
        pixels[p*4+rgb] = this.imageBuffer[row][nextCounter][col*3+rgb];
      }
    }
    this.counter[row] = nextCounter;
  }
  this.ctx.putImageData(this.imageData, 0, 0);
}

// User Media Stuff...
Timestretcher.prototype.onUserMediaSuccess = function(stream) {
  console.log(this);
  // TODO: Different browsers.
  this.localVideo.src = window.webkitURL.createObjectURL(stream);
  this.localStream = stream;
  this.startStretcher();
}
    
Timestretcher.prototype.onUserMediaError = function(error){
  console.log("Couldn't get user media: "+error);
}

Timestretcher.prototype.init = function() {
  this.element = $(this.parent);
  
  this.element.append("<canvas width='"+this.capture_width+"' height='"+this.capture_height+"' style='display:block;border:0;background:#000; width:"+this.display_width+"px; height:"+this.display_height+"px;' id='"+this.canvas_id+"'></canvas>");
  this.element.append("<video width='"+this.capture_width+"' height='"+this.capture_height+"' id='_timestretcher_live' style='display:none;visibility:hidden;' autoplay></video>");
  
  this.localVideo = $("video#_timestretcher_live").get()[0];
  
  this.canvas = $("canvas#"+this.canvas_id);
  
  this.ctx = this.canvas.get()[0].getContext('2d');
  try {
    navigator.webkitGetUserMedia({audio:true, video:true}, this.onUserMediaSuccess.bind(this), this.onUserMediaError.bind(this));
  } catch (e) {
    try {
    navigator.webkitGetUserMedia("video,audio", this.onUserMediaSuccess.bind(this), this.onUserMediaError.bind(this));
    } catch (e) {
      alert("webkitGetUserMedia() failed. Is the MediaStream flag enabled in about:flags?");
      console.log("webkitGetUserMedia failed with exception: " + e.message);
    }
  }

  /*
  this.localVideo.addEventListener('timeupdate', function(e) {
    console.log(this.localVideo.playbackRate);
    //var t = (new Date()).getTime();
    //console.log(t-tdt);
    //tdt = t;
  }.bind(this));*/
  
}

  
Timestretcher.prototype.setDirection = function(u) {
  this.upwards = u;
}
  
Timestretcher.prototype.setMirrored = function(m) {
  this.mirrored = m;
}
  