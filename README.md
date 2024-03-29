# Timestretcher #

This is an HTML5 implementation of the Timestretcher installation made by Bill Spinhoven in 1987. It currently works only/best in [Google Chrome](http://chrome.google.com).

## Demo ##

See [this fiddle](https://jsfiddle.net/o2ork0fw/2/).

## Usage ##
**Important** -- Note that the ```webkitURL.createObjectURL()``` API used to access the user's webcam only works if the document is loaded from ```http://``` locations, not from ```file://``` locations (as when documents are opened it from your hard disk). Hence, for this to work, host it somewhere as a website ("online" or using a webserver).

You can also see ```example.html``` for a working example. Include timestretcher.js into your document:  
    
    <script src="path/to/timestretcher.js"></script>

Create a new ```Timestretcher``` object, and call the ```init()``` function when the document is ready:  

    <script>
      var timestretcher = new Timestretcher({ parent: 'body' });
      
      $(document).ready(function() {
        timestretcher.init();
      });
    </script>

The Timestretcher constructor takes an options object and honours the following attrubutes, default values as specified:  
    
    var options = {
      parent:           'body',   // Parent element used 
      canvas_id:        'canvas', // ID of the actual video
      capture_width:    320,      // Resolution of the capture...
      capture_height:   240,      //   (decrease for better performance)
      display_width:    640,      // The output will be stretched to
      display_height:   480,      //   this size
      frame_rate:       30,       // Desired frame rate
      segment_size:     4,        // The number of lines took together
                                  //   less is slower but nicer
      upwards:          true,     // Direction of the time
      mirrored:         true,     // Mirror output image?
      allow_fullscreen: true,     // Go fullscreen when F-key is pressed

      skip_top:         50,           // Number of lines to skip from top
      skip_bottom:      50,           // Number of lines to skip from bottom
      mask:             './mask.png'  // Masking image
    }

The ```Timestretcher``` object further supports the following functions to change settings on the fly:

    timestretcher.setDirection(bool); // If parameter is true, go upwards, else downwards
    timestretcher.setMirrored(bool);
    timestretcher.setFramerate(frameRate);

There are several keyboard shortcuts:
    
    T   - Go to debug/live mode
    F   - Go to fullscreen mode
    U   - Toggle direction of time-wave
    M   - Toggle mirrored mode

In debug mode:  

    I/O - Move skip_top guide down/up
    K/L - Move skip_bottom guide up/down

## License ##
This work is released under the MIT license.
  
	Copyright (c) <2012> <Jan Kolkmeier>, <dnart.me>
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
