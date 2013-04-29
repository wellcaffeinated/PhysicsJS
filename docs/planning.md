# Plans

state class

Vector position
Vector velocity
Vector acceleration
Number angularPosition
Number angularVelocity
Number angularAcceleration

geometry class

Array[Vector] vertices = body.geometry.getVertices()
Array[Arc] arcs = body.geometry.getArcs()

// arc collision

Arc arc1 = body1.geometry.getArcs()[0]
Arc arc2 = body2.geometry.getArcs()[0]
Vector center1 = arc1.center // clone here
Vector center2 = arc2.center

Vector c12 = center2.vsub( center1 )

Number rot1 = body.state.angularPosition

Number ang = c12.angle();

if ( ang >= (arc1.min - rot1) && ang <= (arc1.max - rot1) )
    then c12 intersects arc


// edge collide

make an overlap helper
Physics.geometry.getOverlaps(geometry1, geometry2) ?
returns [vector, vector, ...]

// collision

collision.behave():

for each two bodies: bodyA, bodyB (bodyA !== bodyB)
    
    gjk = checkHullOverlap( bodyA, bodyB )

    if ( !gjk.overlap ) continue;

    gjk = checkCoreOverlap( bodyA, bodyB )

    if ( gjk.overlap )
        do deep penetration test (EPA) on A and B
        return

    else
        // not accurate... but might be enough...
        // overlap is negative
        var overlap = gjk.distance - (bodyA.geometry.getMargin() + bodyB.geometry.getMargin());
        // vector minimum transit for extracting B
        var mtvAB = Physics.vector().clone( gjk.closest.a ).vsub( gjk.closest.b ).normalize().mult( overlap );

        collisionPt = projected core point to hull. choose point that is farthest from its object's center
        normal = edge normal with smallest dot product to mtvAB
            // or edge normal with smallest dot product to relative velocity. Probably this is better.

        applyImpulses( bodyA, bodyB, collisionPt, normal )


// use pubsub more

// inside setWorld
this._world.subscribe(event, blah)

// use world publish to trigger all behavior?


