---
layout: default
title: 'Tutorial: Creating a scene of interacting polygons | PhysicsJS'
---

# Creating a scene of interacting polygons

So... you want to see how polygons collide? Well then, let's get started.
First set up PhysicsJS as described in the [Basic Usage][basic-usage] documentation.
You can use this [jsFiddle as a boilerplate](http://jsfiddle.net/wellcaffeinated/kgEZm/) to follow along with.

Let's first set up the scene. All of our javascript can go inside the PhysicsJS world initializer.

{% highlight js %}
Physics(function( world ){
   // code here... 
});
{% endhighlight %}

So all further javascript in this tutorial should be placed there.

We need to add a canvas element for the renderer.
So we'll add this to the html body:

{% highlight html %}
<canvas id="viewport" width="500" height="500"></canvas>
{% endhighlight %}

Let's set up the renderer and add it to the world. If the DOM is not expected to be ready,
you'll need to place this code inside a function that checks for the readiness of the DOM
(eg: `jQuery.ready()`).

{% highlight js %}
var renderer = Physics.renderer('canvas', {
    el: 'viewport', // id of the canvas element
    width: 500,
    height: 500
});
world.add( renderer );
{% endhighlight %}

Next let's add a body to the world to make sure everything is rendering properly.
We'll use the `convex-polygon` extension to create a square with edge 50px in length
(remember to `require` the `convex-polygon` extension if necessary).

{% highlight js %}
var square = Physics.body('convex-polygon', {
    x: 250,
    y: 250,
    vertices: [
        {x: 0, y: 50},
        {x: 50, y: 50},
        {x: 50, y: 0},
        {x: 0, y: 0}
    ]
});
world.add( square );
world.render();
{% endhighlight %}

Now you should see a square in the center of the canvas. So far we haven't begun simulating
anything yet. We just rendered the current state of the world. We need to hook up
the world to a ticker (an animation loop) so that `world.step()` gets repeatedly called.

Let's do that:

{% highlight js %}
// subscribe to ticker to advance the simulation
Physics.util.ticker.subscribe(function( time, dt ){
    world.step( time );
});

// start the ticker
Physics.util.ticker.start();
{% endhighlight %}

We'll also need to subscribe to the world's "step" event and call `world.render()` to refresh
the view every frame.

{% highlight js %}
world.subscribe('step', function(){
    world.render();
});
{% endhighlight %}


Aaaaand... nothing happened. That's because our square has a velocity of (0, 0). So it won't move.
Let's give it a small velocity in the x direction:

{% highlight js %}
var square = Physics.body('convex-polygon', {
    x: 250,
    y: 250,
    vx: 0.01,
    vertices: [
        {x: 0, y: 50},
        {x: 50, y: 50},
        {x: 50, y: 0},
        {x: 0, y: 0}
    ]
});
// ...
{% endhighlight %}

Hey! The square is moving! Fancy that.

This is a little bit boring. Let's add some constant acceleration downwards (gravity) and watch the square fall to the ground.
For this we'll need the `constant-acceleration` behavior.

{% highlight js %}
world.add( Physics.behavior('constant-acceleration') );
{% endhighlight %}

Okay, it falls, but now it's falling through the ground. Well... not really. There is no ground.
We need to define some boundaries and add a collision response behavior to get things looking "realistic".

First let's define a bounding box for the boundaries of our canvas:

{% highlight js %}
var bounds = Physics.aabb(0, 0, 500, 500);
{% endhighlight %}

Now, let's add the `edge-collision-detection`, and `body-impulse-response` behaviors and see what happens.

{% highlight js %}
world.add( Physics.behavior('edge-collision-detection', {
    aabb: bounds
}) );
// ensure objects bounce when edge collision is detected
world.add( Physics.behavior('body-impulse-response') );
{% endhighlight %}

Woah! That square is bouncing all over the place now. That's because we have perfectly
elastic collision responses by default. That corresponds to a restitution setting of `1.0`.
Let's play with the restitution of the edge collision a bit and make it `0.3`.

{% highlight js %}
world.add( Physics.behavior('edge-collision-detection', {
    aabb: bounds,
    restitution: 0.3
}) );
{% endhighlight %}

That's a bit better. Let's add some more polygons and see what happens!

{% highlight js %}
world.add( Physics.body('convex-polygon', {
    x: 250,
    y: 50,
    vx: 0.05,
    vertices: [
        {x: 0, y: 80},
        {x: 60, y: 40},
        {x: 60, y: -40},
        {x: 0, y: -80}
    ]
}) );

world.add( Physics.body('convex-polygon', {
    x: 400,
    y: 200,
    vx: -0.02,
    vertices: [
        {x: 0, y: 80},
        {x: 80, y: 0},
        {x: 0, y: -80},
        {x: -30, y: -30},
        {x: -30, y: 30}
    ]
}) );
{% endhighlight %}

Interesting shapes... but they don't collide with each other. That's because we only
have the behavior for collision detection with *edges* not between bodies. For that
we'll need the `body-collision-detection` extension. We'll also use it with the
`sweep-prune` broad phase collision detection to optimize things a bit. This is
generally always a good idea.

{% highlight js %}
world.add( Physics.behavior('body-collision-detection') );
world.add( Physics.behavior('sweep-prune') );
{% endhighlight %}


Now, we're talking! Colliding polygons!

[basic-usage]: ../basic-usage
