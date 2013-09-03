---
layout: default
title: Installation | PhysicsJS
---

# Installation

You can use PhysicsJS as an [AMD module](http://requirejs.org/docs/whyamd.html) (requireJS), a CommonJS module, or a regular browser global.

## As an AMD Module with requireJS

**This is the recommended way to use PhysicsJS**. [Read about requireJS](http://requirejs.org) to learn how to set it up.

Tell requireJS where to find the PhysicsJS source.

{% highlight js %}
require.config({
    baseUrl: './',
    // ...
    paths: {
        'pjs': 'path/to/physicsjs',
        'physicsjs': 'path/to/physicsjs/physicsjs-0.5.0.min'
        //...
    }
});
{% endhighlight %}

Now require the dependencies you need.

{% highlight js %}
require([
    'physicsjs',
    'pjs/bodies/circle' // will mix into the PhysicsJS library
], function( Physics ){
    
    // do something fun with circles!
});
{% endhighlight %}

## As a browser global

Simply include the library in your html.

{% highlight html %}
<script src="scripts/physicsjs/physicsjs-VER.min.js"></script>
{% endhighlight %}

Start using it.

{% highlight js %}
Physics(function(world){
  // code...
});
{% endhighlight %}

PhysicsJS was made to be modular. So any non-core functionality is separate and must be included separately.
For example, if you want circles, you would have to include that script after including PhysicsJS.

{% highlight html %}
<script src="scripts/physicsjs/physicsjs-VER.min.js"></script>
<script src="scripts/physicsjs/bodies/circle.js"></script>
{% endhighlight %}

This could get quite tedious, which is why using requirejs (and its optimizer) is recommended. However,
if you know you'll want most or all extras, you can use the "full" version of the script, which includes
all non-core functionality.

{% highlight html %}
<script src="scripts/physicsjs/physicsjs-full-VER.min.js"></script>
{% endhighlight %}


## As a node.js (commonJS) module

**This has not yet been tested** but it should be entirely possible to run PhysicsJS in node.js by requiring
the correct file.

{% highlight js %}
var Physics = require('./path/to/physicsjs/physicsjs-full-0.5.0');

Physics(function(world){
  // code...
});
{% endhighlight %}