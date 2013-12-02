---
layout: default
title: 'Tutorial: Creating a Custom Renderer | PhysicsJS'
---

# Creating a Custom Renderer

> This was written at the time of PhysicsJS v0.5.3-alpha

So looks like you're ready to dive into deeper waters! This tutorial is going to quickly show you how to create a custom renderer for PhysicsJS. We're going to create an ASCII renderer... because we can. This will be a pretty pathetic renderer (it's ascii!), but keep in mind, the purpose of this tutorial is to get you started making renderers... not to create the world's best ASCII scene renderer.

Firstly, check out the [wiki documentation on creating custom renderers][wikirender]. That should get you the basics. 

We're going to ignore the suggested pattern and just overwrite the `.render()` method because our ASCII rendering strategy will involve looping over each row and column of the ASCII screen, and drawing either a period ".", or an "@". We'll determine which character to draw based on whether or not the current point is inside a body or not.

First, let's set up our renderer code:

{% highlight js %}
Physics.renderer('ascii', function( parent ){
    
    var defaults = {
        width: 200,
        height: 200,
        fontSize: 4
    };

    // helper function
    var newEl = function( node, content ){
        var el = document.createElement(node || 'div');
        if (content){
            el.innerHTML = content;
        }
        return el;
    };
    
    return {
        init: function( options ){
            
            options = Physics.util.extend( defaults, options );
            parent.init.call(this, options);

        }
        // other methods go here...
    };
});
{% endhighlight %}

All we're doing is setting up some different default options and declaring a private helper function to create HTML elements. Now let's set up our HTML containers. Inside our init function, we'll create a "pre" tag to hold the ascii scene, and some span tags to hold the meta info (if we need them).

{% highlight js %}
// ... inside init()
var pre = document.createElement('pre');
pre.style.fontFamily = 'Courier New, Monospace';
pre.style.letterSpacing = '1.5px';
pre.style.fontSize = options.fontSize + 'px';
pre.style.lineHeight = '1';
pre.style.fontWeight = 'bold';
pre.style.width = this.options.width * this.options.fontSize + 'px';
pre.style.height = this.options.height * this.options.fontSize + 'px';
this.el.appendChild(pre);
this.pre = pre;

this.els = {};

if (this.options.meta){
    var stats = newEl();
    stats.className = 'pjs-meta';
    this.els.fps = newEl('span');
    this.els.ipf = newEl('span');
    stats.appendChild(newEl('span', 'fps: '));
    stats.appendChild(this.els.fps);
    stats.appendChild(newEl('br'));
    stats.appendChild(newEl('span', 'ipf: '));
    stats.appendChild(this.els.ipf);

    this.el.appendChild(stats);
}
{% endhighlight %}

There. Now we'll have the needed HTML elements to render our scene which will get added inside of the wrapper element specified in the options.

Let's add our `drawMeta` method

{% highlight js %}
drawMeta: function( meta ){
    this.els.fps.innerHTML = meta.fps.toFixed(2);
    this.els.ipf.innerHTML = meta.ipf;
},
{% endhighlight %}

That just replaces the text inside the elements. Almost done! Let's get to the meat of the rendering. We'll need an `isInside()` helper function to check whether or not a point is inside a body. This should do the trick:

{% highlight js %}
function isInside(pos, body){
    var scratch = Physics.scratchpad()
        ,T = scratch.transform().setRotation(body.state.angular.pos).setTranslation(body.state.pos)
        ,ret = false
        ;
    
    pos.translateInv(T).rotateInv(T);
    if (body.geometry.name === 'circle'){
        ret = pos.norm() < body.geometry.radius;
    } else {
        throw "unrenderable body type";
    }

    pos.rotate(T).translate(T);
    scratch.done();
    return ret;
}
{% endhighlight %}

We'll put that just below our other helper: `newEl()`. Notice we're using a [Scratchpad][scratchpad] to speed things up a bit.

Now we'll add our `drawScene()` method. This will loop over each point in the scene and append the correct character depending on whether or not it's inside a body.

{% highlight js %}
drawScene: function( bodies ){
            
    var buffer = '';
    var w = this.options.width;
    var h = this.options.height;
    var scratch = Physics.scratchpad();
    var pos = scratch.vector();
    var inside = false;
    
    for (var y = 0; y < h; y+=1){
        for (var x = 0; x < w; x+=1){
            inside = false;
            pos.set( x, y );
            for (var i = 0, l = bodies.length; i < l; i++) {
                if ( isInside(pos, bodies[i]) ){
                    inside = true;
                    break;
                }
            }
            if (inside){
                buffer += '@';
            } else {
                buffer += '.';
            }
        }
        
        buffer += '\n';
    }
    this.pre.innerHTML = buffer;
    scratch.done();
}
{% endhighlight %}

Finally, we'll override the render method and put it all together:

{% highlight js %}
render: function(bodies, meta) {

    this._world.publish({
        topic: 'beforeRender',
        renderer: this,
        bodies: bodies,
        meta: meta
    });

    if (this.options.meta){
        this.drawMeta( meta );
    }
    
    this.drawScene( bodies );
},
{% endhighlight %}

We start by emitting an event to the world anouncing that we're starting to render, in case anyone's listening. We then render the meta data if applicable. Finally we draw our ascii scene!

Here's the final product on jsFiddle:

<iframe width="100%" height="600" src="http://jsfiddle.net/wellcaffeinated/PJqQw/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

[scratchpad]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Scratchpads
[wikirender]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Renderers#creating-a-custom-renderer
