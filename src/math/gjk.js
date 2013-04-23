// Gilbert–Johnson–Keerthi object collison algorithm
// For general information about GJK see: 
// * http://www.codezealot.org/archives/88
// * http://mollyrocket.com/849
(function(){

    /**
     * Implementation agnostic GJK function.
     * @param  {Function} support The support function. 
     *                            Signature: function(<Physics.vector> axis, <Physics.vector> result ).
     *                            axis: The axis to use
     *                            result: The result vector to modify in place.
     *                            
     * @return {Object} The algorithm information containing properties: .overlap (bool), and .simplex (Simplex)
     */
    var gjk = function gjk( support ){

        var overlap = false
            ,simplex
            ;

        return {
            overlap: overlap,
            simplex: simplex
        }
    };
    
    Physics.gjk = gjk;
})();