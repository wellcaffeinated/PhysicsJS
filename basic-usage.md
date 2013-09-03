---
layout: default
title: Basic Usage | PhysicsJS
---

# Basic Usage

## Hello, `world` - Setting the stage

The foundation for all physics simulations is a `world` object. You must create a world,
add objects and behaviors, and then advance the simulation.

There are several ways to create a world object, all of which involve calling `Physics`
as a function. The following three `world`s are equivalent:

{% highlight js %}
var world = Physics();
{% endhighlight %}
{% highlight js %}
Physics(function(world){
    // use "world"
});
{% endhighlight %}
{% highlight js %}
Physics(function(){
    var world = this;
    // use "world"
});
{% endhighlight %}

**The return value, the function argument, and the "this" variable all 
refer to the same world**. The benefit of using the last two methods is 
that it encourages a coding style that does *not polute the global scope*. 
Many worlds can be created this way which will be properly scoped and modular.

Example:

{% highlight js %}
var ballSim = function(world){
    // create ball simulation...
};

var chainSim = function(world){
    // create chains...  
};

var init = function(){
    var ballWorld = Physics(ballSim);
    var chainWorld = Physics(chainSim);
    //...
};
{% endhighlight %}


## Configure your `world`

Several configuration options are settable when constructing a world. To set
any options, pass in a configuration object as the first argument to `Physics`.

Example:

{% highlight js %}
Physics({
    // set the timestep
    timestep: 1000.0 / 160,
    // maximum number of iterations per step
    maxIPF: 16,
    // set the integrator (may also be set with world.add())
    integrator: 'verlet'
}, function(world){
    // use "world"
});
{% endhighlight %}


## Making things "go" - Advancing the simulation

In order to advance the simulation by one frame, simply call the `.step()` method
with the current time as a parameter. This can be done in any way you like,
but usually this will be called inside an animation loop, using
`window.requestAnimationFrame` or similar. 

A helper is provided with PhysicsJS to facilitate animation loops:
`Physics.util.ticker`. The ticker methods will use `requestAnimationFrame`
when available and fallback to `setTimeout` when necessary. To use the ticker,
just `subscribe()` to it, and call the `start()` method.

Example:

{% highlight js %}
// subscribe to the ticker
Physics.util.ticker.subscribe(function(time, dt){
    world.step( time );
    // Note: FPS ~= 1/dt
});
// start the ticker
Physics.util.ticker.start();
{% endhighlight %}


## Add things to the `world`

The "Swiss Army Knife" method of the world, is `world.add()`. This method
will accept several types of "things" that can be added or replaced in the
world: **bodies** (objects), **behaviors**, **renderers**, and **integrators**.

Any number of **bodies** and **behaviors** may be added to the world, but
only one **renderer** and one **integrator** can be added to any one world
at any one time.


### Bodies

[Read more about Bodies on the wiki][wiki-bodies].

Bodies are the "what" of a physics simulation. They represent physical objects that
can be rendered as DOM Elements, or drawn on canvas, or however you'd like to display
them. They are not by default tied to any particular "view" or visual representation.

Bodies, like **points**, **circles**, or **convex polygons**, are available as extensions.

Creating a body is done using the `Physics.body()` factory function.

Example:

{% highlight js %}
var ball = Physics.body('circle', {
    x: 50, // x-coordinate
    y: 30, // y-coordinate
    vx: 0.2, // velocity in x-direction
    vy: 0.01, // velocity in y-direction
    radius: 20
});
// add the circle to the world
world.add( ball );
{% endhighlight %}

Custom bodies can also be created and bodies can be extended.
[Read the wiki entry on bodies to learn more][wiki-bodies].


### Behaviors (or Behaviours)

[Read more about Behaviors on the wiki](wiki-behaviors).

Behaviors (or Behaviours) are the "how" of a physics simulation. They are rules applied
to the world that act on bodies during every timestep to simulate specific physical laws.
A world without any behaviors will act as an infinite, frictionless vacuum.
(No behaviors are included in the core library)

The most familiar example of a behavior is adding "**gravity**" to a simulation. What is most often
meant by "gravity" is a constant acceleration in the downward (positive "y") direction.
Because of the frequent need for this, a "constant-acceleration" behavior is available
as an extra.

Example:

{% highlight js %}
// add some gravity
var gravity = Physics.behavior('constant-acceleration', {
    acc: { x : 0, y: 0.0004 } // this is the default
});
world.add( gravity );
// later... flip the world upside down!
gravity.setAcceleration({ x: 0, y: -0.0004 });
{% endhighlight %}

Some behaviors act as "detectors", which don't modify bodies directly. Instead
they detect specific events and announce them to the world's [pubsub][wiki-pubsub]
system so other behaviors can take appropriate actions. One example of this is
[collision detection and response][wiki-collisions]. There are separate behaviors 
for collision detection, collision response, and even so-called "sweep and prune"
optimization algorithms.

**Note**: Because some english speaking countries (like Canada and the Great Britain)
spell the word with a "u" (behaviour), an alias has been created so that
**`.behavior()`** and **`.behaviour()`** are both valid.

Custom behaviors can also be created and behaviors can be extended.
[Read the wiki entry on behaviors to learn more][wiki-behaviors].


### Renderers

[Read more about Renderers on the wiki](wiki-renderers).

Renderers are the user's viewport into the simulation. At this stage, renderers
are primitive and their capabilities limited. [Simple renderers exist for DOM and
HTML Canvas rendering][wiki-renderers]. It is likely that for any involved simulations
or animations, you will have to [write your own renderer][wiki-renderers]... but never fear, it's
not all that bad.

Adding an HTML Canvas renderer to the world is simple.

{% highlight js %}
var renderer = Physics.renderer('canvas', {
    el: 'element-id',
    width: 500,
    height: 300,
    meta: false, // don't display meta data
    styles: {
        // set colors for the circle bodies
        'circle' : {
            strokeStyle: 'hsla(60, 37%, 17%, 1)',
            lineWidth: 1,
            fillStyle: 'hsla(60, 37%, 57%, 0.8)',
            angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
        }
    }
});
// add the renderer
world.add( renderer );
{% endhighlight %}

In order to render the state of the world to the canvas, you
will have to call the `world.render()` method on every step.


{% highlight js %}
var renderer = Physics.renderer('canvas', {
    //...
});
// add the renderer
world.add( renderer );
world.subscribe('step', function(){
    // Note: equivalent to just calling world.render() after world.step()
    world.render();
});
{% endhighlight %}


Custom renderers can be created and renderers can be extended.
[Read the wiki entry on renderers to learn more][wiki-renderers].


### Integrators

[Read more about Integrators on the wiki](wiki-integrators).

An integrator is the mathematical workhorse of a simulation. An integrator
will [numerically integrate](http://en.wikipedia.org/wiki/Numerical_integration) 
the physical properties of the bodies. In other words, it will move them to
their next positions and velocities every "tick".

[Different integrators have different benefits and drawbacks][codeflow-integrators].
Currently the **default** integrator is the
[verlet](http://en.wikipedia.org/wiki/Verlet_integration) integrator because
of its benefits for rigid constraints. An "improved euler" integrator exists
and community contributions are welcome (wishlist: [RK4](http://en.wikipedia.org/wiki/RK4)).

The integrator for the world can be set when the world is created, or afterwards.

{% highlight js %}
Physics({
    integrator: 'verlet'
}, function(world){
    // set up...
});
// equivalent to...
Physics(function(world){
    world.add( Physics.integrator('verlet') );
    // set up...
});
{% endhighlight %}

Custom integrators can be created and integrators can be extended.
[Read the wiki entry on integrators to learn more][wiki-integrators].


## Full Example

The example code snippets from these basic instructions can be found in this
little example simulation:

<p data-height="351" data-theme-id="0" data-slug-hash="vCqHb" data-user="wellcaffeinated" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/wellcaffeinated/pen/vCqHb'>vCqHb</a> by Jasper (<a href='http://codepen.io/wellcaffeinated'>@wellcaffeinated</a>) on <a href='http://codepen.io'>CodePen</a></p>
<script async="async" src="http://codepen.io/assets/embed/ei.js"></script>


[wiki-bodies]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Bodies
[wiki-behaviors]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Behaviors
[wiki-pubsub]: https://github.com/wellcaffeinated/PhysicsJS/wiki/PubSub
[wiki-collisions]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Collisions
[wiki-renderers]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Renderers
[wiki-integrators]: https://github.com/wellcaffeinated/PhysicsJS/wiki/Integrators

[codeflow-integrators]: http://codeflow.org/entries/2010/aug/28/integration-by-example-euler-vs-verlet-vs-runge-kutta/
