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

    var ScratchCls = function ScratchCls(){

        // private variables
        this.objIndex = 0;
        this.arrayIndex = 0;
        this.vectorIndex = 0;
        this.transformIndex = 0;
        this.objectStack = [];
        this.arrayStack = [];
        this.vectorStack = [];
        this.transformStack = [];

        if (++numScratches >= SCRATCH_MAX_SCRATCHES){
            throw SCRATCH_MAX_REACHED;
        }
    };

    ScratchCls.prototype = {

        // declare that your work is finished
        done: function(){

            this._active = false;
            this.objIndex = this.arrayIndex = this.vectorIndex = this.transformIndex = 0;
            // add it back to the scratch stack for future use
            scratches.push(this);
        },

        object: function(){

            var stack = this.objectStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.objIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.objIndex++ ] || stack[ stack.push({}) - 1 ];
        },

        array: function(){

            var stack = this.arrayStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.arrIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.arrIndex++ ] || stack[ stack.push([]) - 1 ];
        },

        vector: function(){

            var stack = this.vectorStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.vectorIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.vectorIndex++ ] || stack[ stack.push(Physics.vector()) - 1 ];
        },

        transform: function(){

            var stack = this.transformStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.transformIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.transformIndex++ ] || stack[ stack.push(Physics.transform()) - 1 ];
        }
    };
    
    Physics.scratchpad = function(){

        var scratch = scratches.pop() || new ScratchCls();
        scratch._active = true;
        return scratch;
    };

})();