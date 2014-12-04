//
// Autumn Leaves
//
// Example adapted from VerletJS
// https://github.com/subprotocol/verlet-js/blob/master/examples/tree.html
// @license MIT
Physics(function (world) {

    var viewWidth = window.innerWidth
        ,viewHeight = window.innerHeight
        // bounds of the window
        ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        ,edgeBounce
        ,renderer
        ;

    // create a renderer
    renderer = Physics.renderer('canvas', {
        el: 'viewport'
        ,width: viewWidth
        ,height: viewHeight
    });

    // add the renderer
    world.add(renderer);
    // render on each step
    world.on('step', function () {
        world.render();
    });

    // constrain objects to these bounds
    edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds
        ,restitution: 0.2
        ,cof: 0.8
    });

    // resize events
    window.addEventListener('resize', function () {

        viewWidth = window.innerWidth;
        viewHeight = window.innerHeight;

        renderer.el.width = viewWidth;
        renderer.el.height = viewHeight;

        viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);

    }, true);

    function lerp(a, b, p) {
        return (b-a)*p + a;
    }

    var treeStyles = {
        strokeStyle: '#7a7a7a'
        ,lineCap: 'round'
        ,lineWidth: 1
    };

    var leafStyles = {
        fillStyle: '#cb4b16'
    };

    // create a fractal tree
    var generateTree = function(origin, depth, branchLength, segmentCoef, theta) {

        var nodes = []
            ,constraints = Physics.behavior('verlet-constraints', {
                iterations: 2
            })
            ;

        // set up the base and root to define an angle constraint upwards to keep the tree upright
        var base = Physics.body('circle', {
            x: origin.x,
            y: origin.y,
            radius: 0.1,
            treatment: 'static',
            hidden: true,
            mass: 100
        });

        var root = Physics.body('circle', {
            x: origin.x,
            y: origin.y - 10,
            radius: 0.1,
            treatment: 'static',
            hidden: true,
            mass: 100
        });

        nodes.push( base, root );

        // recursive function to create branches
        var branch = function(parent, i, nMax, branchVec) {
            var particle = Physics.body('circle', { radius: 30, hidden: true, mass: 0.04 * branchVec.normSq() });
            particle.state.pos.clone( parent.state.pos ).vadd( branchVec );
            nodes.push( particle );

            constraints.distanceConstraint(parent, particle, 0.7);

            if (i < nMax) {
                var trans = Physics.transform( false, -theta, particle.state.pos );
                var a = branch(particle, i + 1, nMax, branchVec.rotate( trans ).mult( segmentCoef * segmentCoef ).clone());
                var b = branch(particle, i + 1, nMax, branchVec.rotate( trans.setRotation( 2 * theta ) ).clone());

                var jointStrength = lerp(0.7, 0, i/nMax);
                constraints.angleConstraint(parent, particle, a, jointStrength);
                constraints.angleConstraint(parent, particle, b, jointStrength);
            } else {

                var leaf = Physics.body('rectangle', { width: 10, height: 6, mass: 1, angle: Math.random(), styles: leafStyles });
                leaf.state.pos.clone( particle.state.pos );
                constraints.distanceConstraint(particle, leaf, .1);
                leaf.leaf = true;
                leaf.attached = true;
                nodes.push( leaf );
            }

            return particle;
        };

        var firstBranch = branch(root, 0, depth, Physics.vector(0, -branchLength));
        constraints.angleConstraint(base, root, firstBranch, 1);

        // add the constraints to the array so that the whole shebang can be added with world.add
        nodes.push( constraints );
        nodes.constraints = constraints;
        return nodes;
    };

    // create three trees
    [

        [{ x: viewWidth / 2, y: viewHeight - 10 }, 6, 70, 0.92, (Math.PI/2)/3],
        [{ x: viewWidth / 2 + 250, y: viewHeight - 10 }, 5, 40, 0.9, (Math.PI/2)/3],
        [{ x: viewWidth / 2 - 250, y: viewHeight - 10 }, 3, 50, 0.95, (Math.PI/1)/5]

    ].forEach(function( params ){

        var tree = generateTree.apply(this, params);
        world.add( tree );

        // handle detaching the leaves
        world.on('integrate:positions', function(){

            var constrs = tree.constraints.getConstraints().distanceConstraints
                ,c
                ,threshold = 0.35
                ,leaf
                ;

            for ( var i = 0, l = constrs.length; i < l; ++i ){

                c = constrs[ i ];

                if ( c.bodyA.leaf ){
                    leaf = c.bodyA;
                } else if ( c.bodyB.leaf ){
                    leaf = c.bodyB;
                } else {
                    leaf = false;
                }

                if ( leaf && (leaf.state.vel.norm() > threshold && Math.random() > 0.99 || Math.random() > 0.9999) ){

                    tree.constraints.remove( c );
                    leaf.state.vel.zero();
                    leaf.attached = false;
                }
            }

            // higher priority than constraint resolution
        }, null, 100);

        // render the branches
        world.on('render-trees', function( ctx ){

            var constrs = tree.constraints.getConstraints().distanceConstraints
                ,c
                ;

            for ( var i = 0, l = constrs.length; i < l; ++i ){

                c = constrs[ i ];
                treeStyles.lineWidth = ''+c.targetLength * c.targetLength * 0.0016;
                renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, treeStyles, ctx);
            }
        });
    });

    renderer.addLayer('trees', null, { zIndex: 0 }).render = function(){
        this.ctx.clearRect(0, 0, this.el.width, this.el.height);
        world.emit('render-trees', this.ctx);
    };

    // add wind
    Physics.behavior('wind', function( parent ){
        return {
            init: function( options ){
                parent.init.call(this, options);

                this.theta = 0;
                this.jitter = options.jitter || 1;
                this.radius = options.radius || 100;
                this.strength = options.strength || 0.000005;
                this.ground = options.ground;
            },
            behave: function( data ){
                var bodies = data.bodies
                ,scratch = Physics.scratchpad()
                ,dir = scratch.vector()
                ,tmp = scratch.vector()
                ,filter = this.filterType
                ,body
                ,mul = this.jitter * Math.PI * 2
                ,r = this.radius * this.strength
                ,cutoff = this.ground - 20
                ;

                for (var i = 0, l = bodies.length; i < l; i++){
                    body = bodies[ i ];
                    this.theta += (Math.random() - 0.5) * mul;
                    if (body.leaf){

                        if (body.attached){
                            tmp.zero();
                        } else {
                            tmp.set(Math.random()-0.5, Math.random()-0.5).mult( r * 1000 );
                        }

                        if (cutoff && body.state.pos.get(1) < cutoff){

                            body.applyForce( dir.clone({ x: Math.cos( this.theta ) * r, y: Math.sin( this.theta ) * r - (0.0004 - 0.00004) * body.mass }), tmp );
                        }
                    }
                }

                scratch.done();
            }
        };
    });

    // add some fun interaction
    var attractor = Physics.behavior('attractor', {
        order: 0,
        strength: 0.002
    });
    world.on({
        'interact:poke': function( pos ){
            attractor.position( pos );
            world.add( attractor );
        }
        ,'interact:move': function( pos ){
            attractor.position( pos );
        }
        ,'interact:release': function(){
            world.remove( attractor );
        }
    });

    // add things to the world
    world.add([
        Physics.integrator('verlet', { drag: 0.003 })
        ,Physics.behavior('interactive', { el: renderer.el })
        ,Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,Physics.behavior('wind', { ground: viewHeight })
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
