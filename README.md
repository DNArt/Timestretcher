# Timestretcher #

This is an HTML5 implementation of the [Timestretcher](http://dnart.meteor.com/dnart/dnart_timestretcher/) installation made by Bill Spinhoven van Oosten in 1987. It currently works only/best in [Google Chrome](http://chrome.google.com).

## Usage ##

Include timestretcher.js into your document:  

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
	  parent:         'body',   // Parent element used 
      canvas_id:      'canvas', // ID of the actual video
      capture_width:  320,      // Resolution of the capture...
      capture_height: 240,      //   (decrease for better performance)
      display_width:  640,      // The output will be stretched to
      display_height: 480,      //   this size
      frame_rate:     30,       // Desired frame rate
	  segment_size:   4,        // The number of lines took together combined
      upwards:        true,     // Direction of the time
      mirrored:       true      // Mirror output image?
    }

See example.html for a working example.

**Important** -- Note that the ```webkitURL.createObjectURL()``` API used to access the user's webcam only works if the document is loaded from ```http://``` locations, not from ```file://``` locations (as when documents are opened it from your hard disk). Hence, for this to work, host it somewhere as a website ("online" or using a webserver).

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