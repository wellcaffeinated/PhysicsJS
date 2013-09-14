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
                restitution: 0.1,
                cof: 0
            })
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

        var generateTree = function(origin, depth, branchLength, segmentCoef, theta) {

            var nodes = []
                ,constraints = Physics.behavior('verlet-constraints', {
                    iterations: 2
                })
                ;

            var base = Physics.body('circle', {
                x: origin.x,
                y: origin.y,
                radius: 3,
                fixed: true
            });

            var root = Physics.body('circle', {
                x: origin.x,
                y: origin.y - 10,
                radius: 3,
                fixed: true
            });

            nodes.push( base, root );

            var branch = function(parent, i, nMax, branchVec) {
                var particle = Physics.body('circle', { radius: 1, hidden: true });
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

                    var leaf = Physics.body('circle', { radius: 5 });
                    leaf.state.pos.clone( particle.state.pos );
                    constraints.distanceConstraint(particle, leaf, .1);
                    leaf.leaf = true;
                    nodes.push( leaf );
                }

                return particle;
            };

            var firstBranch = branch(root, 0, depth, Physics.vector(0, -branchLength));
            constraints.angleConstraint(base, root, firstBranch, 1);

            nodes.push( constraints );
            nodes.constraints = constraints;
            return nodes;
        };

        var tree = generateTree({ x: viewWidth / 2, y: viewHeight - 10 }, 5, 70, 0.9, (Math.PI/2)/3)

        world.add( tree );

        world.subscribe('integrate:positions', function(){

            var constrs = tree.constraints.getConstraints().distanceConstraints
                ,c
                ,threshold = 0.4
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
                }
            }

            // higher priority than constraint resolution
        }, null, 100);

        // render
        world.subscribe('render', function( data ){

            var renderer = data.renderer
                ,constrs = tree.constraints.getConstraints().distanceConstraints
                ,c
                ;

            for ( var i = 0, l = constrs.length; i < l; ++i ){
                
                c = constrs[ i ];
                renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, {
                    strokeStyle: '#543324',
                    lineCap: 'round',
                    lineWidth: c.targetLength * 0.1
                });
            }
        });
        
        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );

        // add wind
        Physics.behavior('wind', function( parent ){
            return {
                init: function( options ){
                    parent.init.call(this, options);
                    
                    this.theta = 0;
                    this.jitter = options.jitter || 1;
                    this.radius = options.radius || 100;
                    this.strength = options.strength || 0.000005;
                },
                behave: function( data ){
                    var bodies = data.bodies
                        ,scratch = Physics.scratchpad()
                        ,dir = scratch.vector()
                        ,filter = this.filterType
                        ,body
                        ,mul = this.jitter * Math.PI * 2
                        ,r = this.radius * this.strength
                        ;
                    
                    for (var i = 0, l = bodies.length; i < l; i++){
                        body = bodies[ i ];
                        this.theta += (Math.random() - 0.5) * mul;
                        if (body.leaf){
                            
                            body.accelerate( dir.clone({ x: Math.cos( this.theta ) * r, y: Math.sin( this.theta ) * r - 0.0004 + 0.00004 }) );
                        }
                    }
                    
                    scratch.done();
                }
            };
        });

        world.add( Physics.behavior('wind') );
    };

    sim.title = "Autumn Leaves";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/tree.js";

    return sim;
});