(function(Physics){
/**
 * begin vector Class
 * @class vector
 */
var vector = function vector(x, y) {

    // force instantiation
    if ( !(this instanceof vector) ){

        return new vector( x, y );
    }

    this.set( x || 0, y || 0);
};

/**
 * Static functions
 */

/** 
 * Return sum of two vectors
 */
vector.vadd = function(v1, v2) {

    return new vector( v1.x + v2.x, v1.y + v2.y );
};

/** 
 * Subtract v2 from v1
 */
vector.vsub = function(v1, v2) {

    return new vector( v1.x - v2.x, v1.y - v2.y );
};

/**
 * Multiply v1 by a scalar m
 */
vector.mult = function(m, v1){

    return new vector( v1.x*m, v.y*m );
};

/** 
 * Project v1 onto v2
 */
vector.proj = function(v1, v2) {

    return vector.mult( v1.dot(v2) / v2.normSq(), v2 );
};


/**
 * Methods
 */

/**
 * Sets the components of this vector.
 */
vector.prototype.set = function(x, y) {

    this._norm = false;
    this._normSq = false;

    this.x = x;
    this.y = y;
    return this;
};

/**
 * Add vector to this
 */
vector.prototype.vadd = function(v) {

    this._norm = false;
    this._normSq = false;

    this.x += v.x;
    this.y += v.y;
    return this;
};

/**
 * Subtract vector from this
 */
vector.prototype.vsub = function(v) {

    this._norm = false;
    this._normSq = false;

    this.x -= v.x;
    this.y -= v.y;
    return this;
};

/**
 * Add scalars to vector's components
 */
vector.prototype.add = function(x, y){
    
    this._norm = false;
    this._normSq = false;

    this.x += x;
    this.y += y === undefined? x : y;
    return this;
};

/**
 * Subtract scalars to vector's components
 */
vector.prototype.sub = function(x, y){
    
    this._norm = false;
    this._normSq = false;

    this.x -= x;
    this.y -= y === undefined? x : y;
    return this;
};

/* 
 * Multiply by a scalar
 */
vector.prototype.mult = function(m) {
    
    if ( this._normSq ){

        this._normSq *= m;
        this._norm *= m;
    }

    this.x *= m;
    this.y *= m;
    return this;
};

/* 
 * Get the dot product
 */
vector.prototype.dot = function(v) {

    return (this.x * v.x) + (this.y * v.y);
};

/** 
 * Get the cross product
 */
vector.prototype.cross = function(v) {

    return (this.x * v.y) - (this.y * v.x);
};

/**
 * Get projection of this along v
 */
vector.prototype.proj = function(v){

    var m = this.dot( v ) / v.normSq();
    return this.clone( v ).mult( m );
};

/**
 * Get the norm (length)
 */
vector.prototype.norm = function() {

    return this._norm !== false? this._norm : this._norm = Math.sqrt( this._normSq = (this.x * this.x + this.y * this.y) );
};

/**
 * Get the norm squared
 */
vector.prototype.normSq = function() {

    return this._normSq !== false? this._normSq : this._normSq = (this.x * this.x) + (this.y * this.y);
};

/** 
 * Get distance to other vector
 */
vector.prototype.dist = function(v) {
  
    var dx, dy;
    return Math.sqrt(
        (dx = v.x - this.x) * dx + 
        (dy = v.y - this.y) * dy
    );
};

/**
 * Get distance squared to other vector
 */
vector.prototype.distSq = function(v) {

    var dx, dy;
    return (
        (dx = v.x - this.x) * dx + 
        (dy = v.y - this.y) * dy
    );
};

/**
 * Normalises this vector, making it a unit vector
 */
vector.prototype.normalize = function() {

    var m = this.norm();

    // means it's a zero vector
    if ( m === 0 ){
        return this;
    }

    this.x /= m;
    this.y /= m;

    this._norm = 1;
    this._normSq = 1;

    return this;
};

/**
 * Returns clone of current vector
 * Or clones provided vector to this one
 */
vector.prototype.clone = function(v) {
    
    if(v){
        
        this._norm = false;
        this._normSq = false;

        this.x = v.x;
        this.y = v.y;
        return this;
    }

    return new vector( this.x, this.y );
};

/**
 * Create a litteral object
 */
vector.prototype.toNative = function(){

    return {
        x: this.x,
        y: this.y
    };
};

/**
 * Copies components of this vector to other vector
 */
vector.prototype.copyTo = function(v) {
    
    v.clone( this );
    return this;
};


/**
 * Zero the vector
 */
vector.prototype.zero = function() {

    this._norm = 0;
    this._normSq = 0;

    this.x = 0.0;
    this.y = 0.0;
    return this;
};

/**
 * Make this a vector in the opposite direction
 */
vector.prototype.negate = function(){

    this.x = -this.x;
    this.y = -this.y;
    return this;
};

/**
 * Constrain vector components to minima and maxima
 */
vector.prototype.clamp = function(minV, maxV){

    this.x = Math.min(Math.max(this.x, minV.x), maxV.x);
    this.y = Math.min(Math.max(this.y, minV.y), maxV.y);
    this._norm = this._normSq = false;
    return this;
}

/**
 * Render string
 */
vector.prototype.toString = function(){

    return '('+this.x + ', ' + this.y+')';
};

Physics.vector = vector;

/**
 * end vector class
 */
}(Physics));
