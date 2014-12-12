(function( window, document, undefined ){

    var Runner = function( el ){

        var self = this;
        this.el = el;
        this.log('Initializing...');

        this.suiteStack = [];

        var identity = new Benchmark(function(){ var a; });
        identity.on('complete', function(){
            self.identity = identity;
            self._isReady = true;
            if ( self.started ){
                self.start();
            }
        });
        identity.run({ async: true });

    };

    Runner.prototype = {
        log: function( str, noNL ){
            this.el.innerHTML += str + (noNL ? '' : '\n');
        }

        ,runNext: function( suite ){
            var self = this;
            var suiteStack = this.suiteStack;
            suite.on('complete', function(){
                suiteStack.shift();
                var next = suiteStack[0];
                if ( next ){
                    next.run({ 'async': true });
                } else {
                    self.log('\ndone');
                }
            });

            suiteStack.push( suite );
        }

        ,suite: function( name, cfg ){

            var self = this;
            var suite = new Benchmark.Suite( name );
            for ( var key in cfg ){
                suite.add( key, cfg[key] );
            }

            // add listeners
            suite
                .on('start', function( e ){
                    self.log('\nStarting suite "'+this.name+'"...');
                })
                .on('cycle', function(event) {
                    var speed = ( 100 * (event.target.hz / self.identity.hz) ).toPrecision( 5 );
                    self.log('  => ' + String(event.target));
                    self.log('\trel: ' + speed);
                })
                ;

            this.runNext( suite );
            return suite;
        }

        ,start: function(){

            this.started = true;
            if ( !this._isReady ){
                return this;
            }

            this.suiteStack[0].run({ 'async': true });
        }
    };

    window.Runner = Runner;

})(this, this.document);
