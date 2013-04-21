// scratchpad
// thread-safe management of temporary (voletile)
// objects for use in calculations
(function(){

    // constants
    var SCRATCH_MAX_SCRATCHES = 100; // maximum number of scratches
    var SCRATCH_MAX_INDEX = 10; // maximum number of any type of temp objects
    var SCRATCH_USAGE_ERROR = 'Error: Scratchpad used after .done() called. (Could it be unintentionally scoped?)';
    var SCRATCH_INDEX_OUT_OF_BOUNDS = 'Error: Scratchpad usage space out of bounds. (Did you forget to call .done()?)';
    var SCRATCH_MAX_REACHED = 'Error: Too many scratchpads created. (Did you forget to call .done()?)';

    // cache previously created scratches
    var scratches = [];
    var numScratches = 0;

    var ScratchFactory = function ScratchFactory(){

        // private variables
        var objIndex = 0
            ,arrayIndex = 0
            ,vectorIndex = 0
            ,objectStack = []
            ,arrayStack = []
            ,vectorStack = []
            ;

        if (++numScratches >= SCRATCH_MAX_SCRATCHES){
            throw SCRATCH_MAX_REACHED;
        }

        return {

            // declare that your work is finished
            done: function(){

                this._active = false;
                objIndex = arrayIndex = vectorIndex = 0;
                // add it back to the scratch stack for future use
                scratches.push(this);
            },

            object: function(){

                if (!this._active){
                    throw SCRATCH_USAGE_ERROR;
                }

                if (objIndex >= SCRATCH_MAX_INDEX){
                    throw SCRATCH_INDEX_OUT_OF_BOUNDS;
                }

                return objectStack[ objIndex++ ] || objectStack[ objectStack.push({}) - 1 ];
            },

            array: function(){

                if (!this._active){
                    throw SCRATCH_USAGE_ERROR;
                }

                if (arrIndex >= SCRATCH_MAX_INDEX){
                    throw SCRATCH_INDEX_OUT_OF_BOUNDS;
                }

                return arrayStack[ arrIndex++ ] || arrayStack[ arrayStack.push([]) - 1 ];
            },

            vector: function(){

                if (!this._active){
                    throw SCRATCH_USAGE_ERROR;
                }

                if (vectorIndex >= SCRATCH_MAX_INDEX){
                    throw SCRATCH_INDEX_OUT_OF_BOUNDS;
                }

                return vectorStack[ vectorIndex++ ] || vectorStack[ vectorStack.push(Physics.vector()) - 1 ];
            }
        };
    };
    
    Physics.scratchpad = function(){

        var scratch = scratches.pop() || ScratchFactory();
        scratch._active = true;
        return scratch;
    };

})();