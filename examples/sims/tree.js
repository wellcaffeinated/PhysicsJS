define([
    
    'jquery'

], function(
    $
){
    /*
        Example adapted from VerletJS
        https://github.com/subprotocol/verlet-js/blob/master/examples/tree.html
        @license MIT
     */
    var sim = function( world, Physics ){

        // begin
        var $win = $(window)
            ,viewWidth = $win.width()
            ,viewHeight = $win.height()
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.0,
                cof: 1
            })
            ,square = [
                { x: 0, y: 6 },
                { x: 10, y: 6 },
                { x: 10, y: 0 },
                { x: 0, y: 0 }
            ]
            ;

        $(window).on('resize', function(){

            viewWidth = $win.width();
            viewHeight = $win.height();
            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            edgeBounce.setAABB( viewportBounds );

        }).trigger('resize');

        world.add( Physics.integrator('verlet', { drag: 0.003 }) );

        function lerp(a, b, p) {
            return (b-a)*p + a;
        }

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
                fixed: true,
                hidden: true,
                mass: 100
            });

            var root = Physics.body('circle', {
                x: origin.x,
                y: origin.y - 10,
                radius: 0.1,
                fixed: true,
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

                    var leaf = Physics.body('convex-polygon', { vertices: square, mass: 1, angle: Math.random() });
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
        Physics.util.each([

            [{ x: viewWidth / 2, y: viewHeight - 10 }, 6, 70, 0.92, (Math.PI/2)/3],
            [{ x: viewWidth / 2 + 250, y: viewHeight - 10 }, 5, 40, 0.9, (Math.PI/2)/3],
            [{ x: viewWidth / 2 - 250, y: viewHeight - 10 }, 3, 50, 0.95, (Math.PI/1)/5]

        ], function( params ){

            var tree = generateTree.apply(this, params);
            world.add( tree );

            // handle detaching the leaves
            world.subscribe('integrate:positions', function(){

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
            world.subscribe('beforeRender', function( data ){

                var renderer = data.renderer
                    ,constrs = tree.constraints.getConstraints().distanceConstraints
                    ,c
                    ;

                for ( var i = 0, l = constrs.length; i < l; ++i ){
                    
                    c = constrs[ i ];
                    renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, {
                        strokeStyle: '#543324',
                        lineCap: 'round',
                        lineWidth: c.targetLength * c.targetLength * 0.0016
                    });
                }
            });
        });

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

        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('wind', { ground: viewHeight }) );
    };

    sim.title = "Autumn Leaves";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/tree.js";

    return sim;
});