/** @preserve Adapted from work by @author Jim Riecken - released under the MIT License. */
/**
 * Original liner notes:
 * A simple library for determining intersections of circles and
 * polygons using the Separating Axis Theorem.
 */
(function() {
    
    /**
     * A circle.
     * 
     * @param {Vector=} pos A vector representing the position of the center of the circle
     * @param {?number=} r The radius of the circle
     * @constructor
     */
    var Circle = function(pos, r) {
        this.pos = pos || Physics.vector();
        this.r = r || 0;
    };
    
    /**
     * A *convex* clockwise polygon.
     * 
     * @param {Vector=} pos A vector representing the origin of the polygon. (all other
     *   vertices are relative to this one)
     * @param {Array.<Vector>=} vertices An array of vectors representing the vertices in the polygon,
     *   in clockwise order.
     * @constructor
     */
    var Polygon = function(pos, vertices) {
        this.pos = pos || Physics.vector();
        this.vertices = vertices || [];
        this.recalc();
    };
    
    /**
     * Recalculate the edges and normals of the polygon.  This
     * MUST be called if the vertices array is modified at all and
     * the edges or normals are to be accessed.
     */
    Polygon.prototype.recalc = function() {
        var vertices = this.vertices;
        var len = vertices.length;
        this.edges = []; 
        this.normals = [];
        for (var i = 0; i < len; i++) {
            var p1 = vertices[i]; 
            var p2 = i < len - 1 ? vertices[i + 1] : vertices[0];
            var e = Physics.vector().clone(p2).vsub(p1);
            var n = Physics.vector().clone(e).perp().normalize();
            this.edges.push(e);
            this.normals.push(n);
        }
    };
    
    /**
     * An axis-aligned box, with width and height.
     * 
     * @param {Vector=} pos A vector representing the top-left of the box.
     * @param {?number=} w The width of the box.
     * @param {?number=} h The height of the box.
     * @constructor
     */
    var Box = function(pos, w, h) {
        this.pos = pos || Physics.vector();
        this.w = w || 0; 
        this.h = h || 0;
    };

    /**
     * Create a polygon that is the same as this box.
     * 
     * @return {Polygon} A new Polygon that represents this box.
     */
    Box.prototype.toPolygon = function() {
        var pos = this.pos;
        var w = this.w;
        var h = this.h;
        return new Polygon(Physics.vector(pos), [
         Physics.vector(), Physics.vector(w, 0), 
         Physics.vector(w,h), Physics.vector(0,h)
        ]);
    };
    

    /**
     * An object representing the result of an intersection. Contain information about:
     * - The two objects participating in the intersection
     * - The vector representing the minimum change necessary to extract the first object
     *   from the second one.
     * - Whether the first object is entirely inside the second, or vice versa.
     * 
     * @constructor
     */  
    var Result = function Result() {

        if (!(this instanceof Result)){
            return new Result();
        }

        this.a = null;
        this.b = null;
        this.overlapN = Physics.vector(); // Unit vector in the direction of overlap
        this.overlapV = Physics.vector(); // Subtract this from a's position to extract it from b
        this.clear();
    };

    /**
     * Set some values of the result back to their defaults.  Call this between tests if 
     * you are going to reuse a single Result object for multiple intersection tests (recommented)
     * 
     * @return {Result} This for chaining
     */
    Result.prototype.clear = function() {
        this.aInB = true; // Is a fully inside b?
        this.bInA = true; // Is b fully inside a?
        this.overlap = Number.MAX_VALUE; // Amount of overlap (magnitude of overlapV). Can be 0 (if a and b are touching)
        return this;
    };
    
    /**
     * Flattens the specified array of vertices onto a unit vector axis,
     * resulting in a one dimensional range of the minimum and 
     * maximum value on that axis.
     *
     * @param {Array.<Vector>} vertices The vertices to flatten.
     * @param {Vector} normal The unit vector axis to flatten on.
     * @param {Array.<number>} result An array.  After calling this function,
     *   result[0] will be the minimum value,
     *   result[1] will be the maximum value.
     */
    var flattenVerticesOn = function flattenVerticesOn(vertices, normal, result) {
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        var len = vertices.length;
        var dot;
        for (var i = 0; i < len; i++ ) {
            // Get the magnitude of the projection of the point onto the normal
            dot = vertices[i].dot(normal);
            if (dot < min) { min = dot; }
            if (dot > max) { max = dot; }
        }
        result[0] = min;
        result[1] = max;
    };
    
    /**
     * Check whether two convex clockwise polygons are separated by the specified
     * axis (must be a unit vector).
     * 
     * @param {Vector} aPos The position of the first polygon.
     * @param {Vector} bPos The position of the second polygon.
     * @param {Array.<Vector>} aVertices The vertices in the first polygon.
     * @param {Array.<Vector>} bVertices The vertices in the second polygon.
     * @param {Vector} axis The axis (unit sized) to test against.  The vertices of both polygons
     *   will be projected onto this axis.
     * @param {Result=} result A Result object (optional) which will be populated
     *   if the axis is not a separating axis.
     * @return {boolean} true if it is a separating axis, false otherwise.  If false,
     *   and a result is passed in, information about how much overlap and
     *   the direction of the overlap will be populated.
     */
    var isSeparatingAxis = function isSeparatingAxis(aPos, bPos, aVertices, bVertices, axis, result) {
        var scratch = Physics.scratchpad();
        var rangeA = scratch.array();
        var rangeB = scratch.array();
        var offsetV = scratch.vector();
        // Get the magnitude of the offset between the two polygons
        offsetV.clone(bPos).vsub(aPos);
        var projectedOffset = offsetV.dot(axis);
        // Project the polygons onto the axis.
        flattenVerticesOn(aVertices, axis, rangeA);
        flattenVerticesOn(bVertices, axis, rangeB);
        // Move B's range to its position relative to A.
        rangeB[0] += projectedOffset;
        rangeB[1] += projectedOffset;
        // Check if there is a gap. If there is, this is a separating axis and we can stop
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            scratch.done();
            return true;
        }
        // If we're calculating a result, calculate the overlap.
        if (result) {
            var overlap = 0;
            // A starts further left than B
            if (rangeA[0] < rangeB[0]) {
                result.aInB = false;
                // A ends before B does. We have to pull A out of B
                if (rangeA[1] < rangeB[1]) { 
                    overlap = rangeA[1] - rangeB[0];
                    result.bInA = false;
                // B is fully inside A.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            // B starts further left than A
            } else {
                result.bInA = false;
                // B ends before A ends. We have to push A out of B
                if (rangeA[1] > rangeB[1]) { 
                    overlap = rangeA[0] - rangeB[1];
                    result.aInB = false;
                // A is fully inside B.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            }
            // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
            var absOverlap = Math.abs(overlap);
            if (absOverlap < result.overlap) {
                result.overlap = absOverlap;
                result.overlapN.clone(axis);
                if (overlap < 0) {
                    result.overlapN.negate();
                }
            }      
        }
        scratch.done();
        return false;
    };

    /**
     * @const
     */
    var LEFT_VORNOI_REGION = -1;
    /**
     * @const
     */
    var MIDDLE_VORNOI_REGION = 0;
    /**
     * @const
     */
    var RIGHT_VORNOI_REGION = 1;
    
    /**
     * Calculates which Vornoi region a point is on a line segment.
     * It is assumed that both the line and the point are relative to (0, 0)
     * 
     *             |       (0)      | 
     *      (-1)  [0]--------------[1]  (1)
     *             |       (0)      | 
     * 
     * @param {Vector} line The line segment.
     * @param {Vector} point The point.
     * @return  {number} LEFT_VORNOI_REGION (-1) if it is the left region, 
     *          MIDDLE_VORNOI_REGION (0) if it is the middle region, 
     *          RIGHT_VORNOI_REGION (1) if it is the right region.
     */
    var vornoiRegion = function vornoiRegion(line, point) {
        var len2 = line.normSq();
        var dp = point.dot(line);
        if (dp < 0) { return LEFT_VORNOI_REGION; }
        else if (dp > len2) { return RIGHT_VORNOI_REGION; }
        else { return MIDDLE_VORNOI_REGION; }
    };
    
    /**
     * Check if two circles intersect.
     * 
     * @param {Body} bodyA The first circle.
     * @param {Body} bodyB The second circle.
     * @param {Result=} result Result object (optional) that will be populated if
     *   the circles intersect.
     * @return {boolean} true if the circles intersect, false if they don't. 
     */
    var testCircleCircle = function testCircleCircle(bodyA, bodyB, result) {
        var scratch = Physics.scratchpad();
        var differenceV = scratch.vector().clone(bodyB.state.pos).vsub(bodyA.state.pos);
        var rA = bodyA.geometry.radius;
        var rB = bodyB.geometry.radius;
        var totalRadius = rA + rB;
        var totalRadiusSq = totalRadius * totalRadius;
        var distanceSq = differenceV.normSq();
        if (distanceSq > totalRadiusSq) {
            // They do not intersect 
            scratch.done();
            return false;
        }
        // They intersect.  If we're calculating a result, calculate the overlap.
        if (result) { 
            var dist = Math.sqrt(distanceSq);
            result.a = bodyA;
            result.b = bodyB;
            result.overlap = totalRadius - dist;
            result.overlapN.clone(differenceV.normalize());
            result.overlapV.clone(differenceV).mult(result.overlap);
            result.aInB = rA <= rB && dist <= rB - rA;
            result.bInA = rB <= rA && dist <= rA - rB;
        }
        scratch.done();
        return true;
    };
    
    /**
     * Check if a polygon and a circle intersect.
     * 
     * @param {Polygon} polygon The polygon.
     * @param {Circle} circle The circle.
     * @param {Result=} result Result object (optional) that will be populated if
     *   they interset.
     * @return {boolean} true if they intersect, false if they don't.
     */
    var testPolygonCircle = function testPolygonCircle(polygon, circle, result) {
        var scratch = Physics.scratchpad();
        var circlePos = scratch.vector().clone(circle.pos).vsub(polygon.pos);
        var radius = circle.r;
        var radius2 = radius * radius;
        var vertices = polygon.vertices;
        var len = vertices.length;
        var edge = scratch.vector();
        var point = scratch.vector();
        
        // For each edge in the polygon
        for (var i = 0; i < len; i++) {
            var next = i === len - 1 ? 0 : i + 1;
            var prev = i === 0 ? len - 1 : i - 1;
            var overlap = 0;
            var overlapN = null;
            
            // Get the edge
            edge.clone(polygon.edges[i]);
            // Calculate the center of the cirble relative to the starting point of the edge
            point.clone(circlePos).vsub(vertices[i]);
            
            // If the distance between the center of the circle and the point
            // is bigger than the radius, the polygon is definitely not fully in
            // the circle.
            if (result && point.normSq() > radius2) {
                result.aInB = false;
            }
            
            // Calculate which Vornoi region the center of the circle is in.
            var region = vornoiRegion(edge, point);
            if (region === LEFT_VORNOI_REGION) { 
                // Need to make sure we're in the RIGHT_VORNOI_REGION of the previous edge.
                edge.clone(polygon.edges[prev]);
                // Calculate the center of the circle relative the starting point of the previous edge
                var point2 = scratch.vector().clone(circlePos).vsub(vertices[prev]);
                region = vornoiRegion(edge, point2);
                if (region === RIGHT_VORNOI_REGION) {
                    // It's in the region we want.  Check if the circle intersects the point.
                    var dist = point.norm();
                    if (dist > radius) {
                        // No intersection
                        scratch.done();
                        return false;
                    } else if (result) {
                        // It intersects, calculate the overlap
                        result.bInA = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
            } else if (region === RIGHT_VORNOI_REGION) {
                // Need to make sure we're in the left region on the next edge
                edge.clone(polygon.edges[next]);
                // Calculate the center of the circle relative to the starting point of the next edge
                point.clone(circlePos).vsub(vertices[next]);
                region = vornoiRegion(edge, point);
                if (region === LEFT_VORNOI_REGION) {
                    // It's in the region we want.  Check if the circle intersects the point.
                    var dist = point.norm();
                    if (dist > radius) {
                        // No intersection
                        scratch.done();
                        return false;              
                    } else if (result) {
                        // It intersects, calculate the overlap
                        result.bInA = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
            // MIDDLE_VORNOI_REGION
            } else {
                // Need to check if the circle is intersecting the edge,
                // Change the edge into its "edge normal".
                var normal = edge.perp().normalize();
                // Find the perpendicular distance between the center of the 
                // circle and the edge.
                var dist = point.dot(normal);
                var distAbs = Math.abs(dist);
                // If the circle is on the outside of the edge, there is no intersection
                if (dist > 0 && distAbs > radius) {
                    scratch.done();
                    return false;
                } else if (result) {
                    // It intersects, calculate the overlap.
                    overlapN = normal;
                    overlap = radius - dist;
                    // If the center of the circle is on the outside of the edge, or part of the
                    // circle is on the outside, the circle is not fully inside the polygon.
                    if (dist >= 0 || overlap < 2 * radius) {
                        result.bInA = false;
                    }
                }
            }
            
            // If this is the smallest overlap we've seen, keep it. 
            // (overlapN may be null if the circle was in the wrong Vornoi region)
            if (overlapN && result && Math.abs(overlap) < Math.abs(result.overlap)) {
                result.overlap = overlap;
                result.overlapN.clone(overlapN);
            }
        }
        
        // Calculate the final overlap vector - based on the smallest overlap.
        if (result) {
            result.a = polygon;
            result.b = circle;
            result.overlapV.clone(result.overlapN).mult(result.overlap);
        }
        scratch.done();
        return true;
    };
    
    /**
     * Check if a circle and a polygon intersect.
     * 
     * NOTE: This runs slightly slower than polygonCircle as it just
     * runs polygonCircle and reverses everything at the end.
     * 
     * @param {Circle} circle The circle.
     * @param {Polygon} polygon The polygon.
     * @param {Result=} result Result object (optional) that will be populated if
     *   they interset.
     * @return {boolean} true if they intersect, false if they don't.
     */
    var testCirclePolygon = function testCirclePolygon(circle, polygon, result) {
        var result = testPolygonCircle(polygon, circle, result);
        if (result && result) {
            // Swap A and B in the result.
            var a = result.a;
            var aInB = result.aInB;
            result.overlapN.negate();
            result.overlapV.negate();
            result.a = result.b; 
            result.b = a;
            result.aInB = result.bInA; 
            result.bInA = aInB;
        }
        return result;
    };
    
    /**
     * Checks whether two convex, clockwise polygons intersect.
     * 
     * @param {Polygon} a The first polygon.
     * @param {Polygon} b The second polygon.
     * @param {Result=} result Result object (optional) that will be populated if
     *   they interset.
     * @return {boolean} true if they intersect, false if they don't.
     */
    var testPolygonPolygon = function testPolygonPolygon(a, b, result) {
        var aVertices = a.vertices;
        var aLen = aVertices.length;
        var bVertices = b.vertices;
        var bLen = bVertices.length;
        // If any of the edge normals of A is a separating axis, no intersection.
        for (var i = 0; i < aLen; i++) {
            if (isSeparatingAxis(a.pos, b.pos, aVertices, bVertices, a.normals[i], result)) {
                return false;
            }
        }
        // If any of the edge normals of B is a separating axis, no intersection.
        for (var i = 0; i < bLen; i++) {
            if (isSeparatingAxis(a.pos, b.pos, aVertices, bVertices, b.normals[i], result)) {
                return false;
            }
        }
        // Since none of the edge normals of A or B are a separating axis, there is an intersection
        // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
        // final overlap vector.
        if (result) {
            result.a = a;
            result.b = b;
            result.overlapV.clone(result.overlapN).mult(result.overlap);
        }
        return true;
    };

    Physics.intersection = {
        result: Result,
        testCircleCircle: testCircleCircle,
        testPolygonCircle: testPolygonCircle,
        testPolygonPolygon: testPolygonPolygon
    };
})();