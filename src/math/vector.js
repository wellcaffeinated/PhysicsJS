(function(Physics){

// cached math functions
var sqrt = Math.sqrt
    ,min = Math.min
    ,max = Math.max
    ;

/**
 * begin Vector Class
 * @class Vector
 */
var Vector = function Vector(x, y) {

    // enforce instantiation
    if ( !(this instanceof Vector) ){

        return new Vector( x, y );
    }

    // x = _[0]
    // y = _[1]
    // norm = _[3]
    // normsq = _[4]
    this._ = [];
    this.recalc = true; //whether or not recalculate norms
    this.set( x || 0.0, y || 0.0);
};

/**
 * Static functions
 */

/** 
 * Return sum of two Vectors
 */
Vector.vadd = function(v1, v2) {

    return new Vector( v1._[0] + v2._[0], v1._[1] + v2._[1] );
};

/** 
 * Subtract v2 from v1
 */
Vector.vsub = function(v1, v2) {

    return new Vector( v1._[0] - v2._[0], v1._[1] - v2._[1] );
};

/**
 * Multiply v1 by a scalar m
 */
Vector.mult = function(m, v1){

    return new Vector( v1._[0]*m, v1._[1]*m );
};

/** 
 * Project v1 onto v2
 */
Vector.proj = function(v1, v2) {

    return Vector.mult( v1.dot(v2) / v2.normSq(), v2 );
};


/**
 * Methods
 */

/**
 * Sets the components of this Vector.
 */
Vector.prototype.set = function(x, y) {

    this.recalc = true;

    this._[0] = x;
    this._[1] = y;
    return this;
};

/**
 * Add Vector to this
 */
Vector.prototype.vadd = function(v) {

    this.recalc = true;

    this._[0] += v._[0];
    this._[1] += v._[1];
    return this;
};

/**
 * Subtract Vector from this
 */
Vector.prototype.vsub = function(v) {

    this.recalc = true;

    this._[0] -= v._[0];
    this._[1] -= v._[1];
    return this;
};

/**
 * Add scalars to Vector's components
 */
Vector.prototype.add = function(x, y){
    
    this.recalc = true;

    this._[0] += x;
    this._[1] += y === undefined? x : y;
    return this;
};

/**
 * Subtract scalars to Vector's components
 */
Vector.prototype.sub = function(x, y){
    
    this.recalc = true;

    this._[0] -= x;
    this._[1] -= y === undefined? x : y;
    return this;
};

/* 
 * Multiply by a scalar
 */
Vector.prototype.mult = function(m) {
    
    if ( !this.recalc ){

        this._[4] *= m * m;
        this._[3] *= m;
    }

    this._[0] *= m;
    this._[1] *= m;
    return this;
};

/* 
 * Get the dot product
 */
Vector.prototype.dot = function(v) {

    return (this._[0] * v._[0]) + (this._[1] * v._[1]);
};

/** 
 * Get the cross product
 */
Vector.prototype.cross = function(v) {

    return (this._[0] * v._[1]) - (this._[1] * v._[0]);
};

/**
 * Get projection of this along v
 */
Vector.prototype.proj = function(v){

    var m = this.dot( v ) / v.normSq();
    return this.clone( v ).mult( m );
};

/**
 * Get the norm (length)
 */
Vector.prototype.norm = function() {

    if (this.recalc){
        this.recalc = false;
        this._[4] = (this._[0] * this._[0] + this._[1] * this._[1]);
        this._[3] = sqrt( this._[4] );
    }
    
    return this._[3];
};

/**
 * Get the norm squared
 */
Vector.prototype.normSq = function() {

    if (this.recalc){
        this.recalc = false;
        this._[4] = (this._[0] * this._[0] + this._[1] * this._[1]);
        this._[3] = sqrt( this._[4] );
    }

    return this._[4];
};

/** 
 * Get distance to other Vector
 */
Vector.prototype.dist = function(v) {
  
    var dx, dy;
    return sqrt(
        (dx = v._[0] - this._[0]) * dx + 
        (dy = v._[1] - this._[1]) * dy
    );
};

/**
 * Get distance squared to other Vector
 */
Vector.prototype.distSq = function(v) {

    var dx, dy;
    return (
        (dx = v._[0] - this._[0]) * dx + 
        (dy = v._[1] - this._[1]) * dy
    );
};

/**
 * Normalises this Vector, making it a unit Vector
 */
Vector.prototype.normalize = function() {

    var m = this.norm();

    // means it's a zero Vector
    if ( m === 0 ){
        return this;
    }

    this._[0] /= m;
    this._[1] /= m;

    this._[3] = 1.0;
    this._[4] = 1.0;

    return this;
};

/**
 * Returns clone of current Vector
 * Or clones provided Vector to this one
 */
Vector.prototype.clone = function(v) {
    
    if (v){
        
        this.recalc = v.recalc;
        this._[3] = v._[3];
        this._[4] = v._[4];

        this._[0] = v._[0];
        this._[1] = v._[1];
        return this;
    }

    return new Vector( this._[0], this._[1] );
};

/**
 * Create a litteral object
 */
Vector.prototype.toNative = function(){

    return {
        x: this._[0],
        y: this._[1]
    };
};

/**
 * Copies components of this Vector to other Vector
 */
Vector.prototype.copyTo = function(v) {
    
    v.clone( this );
    return this;
};


/**
 * Zero the Vector
 */
Vector.prototype.zero = function() {

    this._[3] = 0.0;
    this._[4] = 0.0;

    this._[0] = 0.0;
    this._[1] = 0.0;
    return this;
};

/**
 * Make this a Vector in the opposite direction
 */
Vector.prototype.negate = function(){

    this._[0] = -this._[0];
    this._[1] = -this._[1];
    return this;
};

/**
 * Constrain Vector components to minima and maxima
 */
Vector.prototype.clamp = function(minV, maxV){

    this._[0] = min(max(this._[0], minV._[0]), maxV._[0]);
    this._[1] = min(max(this._[1], minV._[1]), maxV._[1]);
    this.recalc = true;
    return this;
};

/**
 * Render string
 */
Vector.prototype.toString = function(){

    return '('+this._[0] + ', ' + this._[1]+')';
};

Physics.vector = Vector;

/**
 * end Vector class
 */
}(Physics));
