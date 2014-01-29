describe("Decorator helper function", function() {

    var mod = Physics.util.decorator('moduleType', {

        moduleProp: 'no',
        moduleMethod: function(){

            return 'original';
        }
    });

    mod('basic', function( parent ){

        expect( parent ).toBeDefined();

        return {

            basicProp: 'no',
            basicMethod: function(){

                return 'original';
            }
        };
    });

    it("should define and retrieve basic module definitions", function() {

        var instance = mod('basic');

        expect( instance ).toBeDefined();
        expect( instance.moduleMethod ).toBeDefined();
        expect( instance.moduleProp ).toBeUndefined();
        expect( instance.basicMethod ).toBeDefined();
        expect( instance.basicProp ).toBeUndefined();
    });

    it("should set the module type and name properties correctly", function() {

        mod('correct', function( parent ){

            parent.type = 'incorrect';

            return {
                type: 'incorrect again',
                name: 'incorrect'
            };
        });

        var immediate = mod('correctImmediate', function( parent ){

            parent.type = 'incorrect';

            return {
                type: 'incorrect again',
                name: 'incorrect'
            };
        }, {});

        var instance = mod('correct');

        expect( instance.type ).toEqual( 'moduleType' );
        expect( instance.name ).toEqual( 'correct' );

        expect( immediate.type ).toEqual( 'moduleType' );
        expect( immediate.name ).toEqual( 'correctImmediate' );
    });

    it("should allow for new module definitions to extend old ones", function() {

        mod('extension', 'basic', function( parent ){

            expect( parent.type ).toEqual( 'moduleType' );
            expect( parent.name ).toEqual( 'basic' );
            expect( parent.moduleMethod ).toBeDefined();
            expect( parent.moduleProp ).toBeUndefined();
            expect( parent.basicMethod ).toBeDefined();
            expect( parent.basicProp ).toBeUndefined();
            
            return {
                
                basicMethod: function(){

                    return 'extended';
                }
            };
        });

        var immediate = mod('extensionImmediate', 'basic', function( parent ){

            expect( parent.type ).toEqual( 'moduleType' );
            expect( parent.name ).toEqual( 'basic' );
            expect( parent.moduleMethod ).toBeDefined();
            expect( parent.moduleProp ).toBeUndefined();
            expect( parent.basicMethod ).toBeDefined();
            expect( parent.basicProp ).toBeUndefined();
            
            return {
                
                basicMethod: function(){

                    return 'extendedImmediate';
                }
            };
        }, {});

        var basicInst = mod('basic');
        var extendedInst = mod('extension');
        var val;

        expect( basicInst.type ).toEqual( 'moduleType' );
        expect( basicInst.name ).toEqual( 'basic' );

        expect( extendedInst.type ).toEqual( 'moduleType' );
        expect( extendedInst.name ).toEqual( 'extension' );
        expect( extendedInst.basicMethod ).toBeDefined();
        expect( extendedInst.moduleMethod ).toBeDefined();

        val = extendedInst.basicMethod();
        expect( val ).toEqual( 'extended' );

        val = extendedInst.moduleMethod();
        expect( val ).toEqual( 'original' );

        expect( immediate.type ).toEqual( 'moduleType' );
        expect( immediate.name ).toEqual( 'extensionImmediate' );
        expect( immediate.basicMethod ).toBeDefined();
        expect( immediate.moduleMethod ).toBeDefined();

        val = immediate.basicMethod();
        expect( val ).toEqual( 'extendedImmediate' );

        val = immediate.moduleMethod();
        expect( val ).toEqual( 'original' );

        val = basicInst.basicMethod();
        expect( val ).toEqual( 'original' );
    });


    it("should allow new mixin methods to be added after instantiation", function() {

        var basicInst = mod('basic');
        var extendedInst = mod('extension');
        var val;
        mod.mixin('newMixin', function(){
            return 'mixin';
        });

        expect( basicInst.newMixin ).toBeDefined();
        val = basicInst.newMixin();
        expect( val ).toEqual( 'mixin' );

        mod('extension', function( parent ){

            expect( parent.type ).toEqual( 'moduleType' );
            expect( parent.name ).toEqual( 'basic' );
            expect( parent.moduleMethod ).toBeDefined();
            expect( parent.moduleProp ).toBeUndefined();
            expect( parent.basicMethod ).toBeDefined();
            expect( parent.basicProp ).toBeUndefined();

            return {

                extMixin: function(){
                    return 'extMixin';
                }
            };
        });

        expect( extendedInst.extMixin ).toBeDefined();
        val = extendedInst.extMixin();
        expect( val ).toEqual( 'extMixin' );        
    });


    it("should allow for new module definitions to define getters/setters", function() {

        mod('getset', function( parent, child ){

            Object.defineProperty( child, 'someProp', {
                get: function(){
                    return 'got';
                },
                set: function( val ){
                    this._otherProp = val;
                }
            });
        });

        mod('childgetset', 'getset', function( parent, child ){

            return {
                get newProp(){
                    return 'gotit';
                },
                set newProp( val ){
                    this._newOtherProp = val;
                }
            };
        });

        var inst = mod('getset', {});
        inst.someProp = 5;

        expect( inst.someProp ).toEqual( 'got' );
        expect( inst._otherProp ).toEqual( 5 );

        var child = mod('childgetset', {});
        child.someProp = 5;
        child.newProp = 4;

        expect( child.someProp ).toEqual( 'got' );
        expect( child._otherProp ).toEqual( 5 );
        expect( child.newProp ).toEqual( 'gotit' );
        expect( child._newOtherProp ).toEqual( 4 );

    });
});