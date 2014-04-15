(function( window ){

    var _Physics = window.Physics;

    /**
     * Physics.noConflict() -> Physics
     * 
     * Restore the original reference to the global window.Physics variable.
     * 
     * Does nothing if PhysicsJS doesn't have a reference in global scope
     **/
    Physics.noConflict = function(){

        if ( window.Physics === Physics ) {
            window.Physics = _Physics;
        }
        
        return Physics;
    };

})( this );