describe("Optimized AMD Loading", function() {
    describe("The bundle", function() {

        var Phys;

        it("should load properly", function() {

            runs(function(){

                require(['bundle'], function(){

                    require(['physicsjs'], function( pjs ){
                        Phys = pjs;
                    });
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

    });

});