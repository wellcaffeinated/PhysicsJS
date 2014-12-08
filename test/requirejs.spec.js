describe("AMD Loading", function() {
    describe("The core library", function() {

        var Phys;

        it("should load as an AMD module correctly", function() {

            runs(function(){

                require(['physicsjs'], function( pjs ){

                    Phys = pjs;
                });
            });

            waitsFor(function(){

                return !!Phys;

            }, "The require call should succeed", 8000);

            runs(function(){

                expect(Phys).toBeDefined();
                expect(window.Physics).toBeUndefined();
            });
        });

        it("should initialize world and integrate correctly", function() {

            var world = Phys({
                    timestep: .1
                    ,maxIPF: 20
                })
                ,body = Phys.body('point', {
                    x: 0,
                    y: 0,
                    vx: 2
                })
                ;

            expect( world._dt ).toEqual( 0.1 );

            world.add( body );
            world.step( 1 ); // sets the initial time
            expect( world._animTime ).toEqual( 1 );

            expect( body.state.pos.get(0) ).toBeCloseTo( 0, 2 );

            world.step( 2 ); // actually steps once

            expect( body.state.pos.get(0) ).toBeCloseTo( 2, 2 );

            body.accelerate( Phys.vector( 0, 1 ) );

            world.step();

            expect( body.state.pos.get(1) ).toBeCloseTo( .01, 2 );
        });
    });

    describe("The modules", function(){

        it("should correctly load via AMD", function(){

            var loaded, args, modules;

            modules = window.cfg.modules;

            runs(function(){

                require(modules, function(){

                    loaded = true;
                    args = Array.prototype.slice.call(arguments);
                });
            });

            waitsFor(function(){

                return loaded;

            }, "The require call should succeed", 8000);

            runs(function(){

                expect( args.length ).toBe( modules.length );

                for ( var i = 0, l = args.length; i < l; ++i ){

                    expect( args[ i ] ).toBeDefined();
                }

                expect(window.Physics).toBeUndefined();
            });
        });
    });

});
