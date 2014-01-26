describe("Query functions", function() {

    var tester = {
        foo: 'foo',
        arr: [ 'foo', 'fee' ],
        bar: 'bar'
    };

    it("should default to AND rules", function(){
        var q = Physics.query({
            foo: 'foo',
            bar: 'bar'
        });
        
        expect( q(tester) ).toBe( true );
        expect( q({ bar: 'bar' }) ).toBe( false );
    });

    describe("array matching", function(){
        it("should match array values", function(){
            
            var q = Physics.query({
                arr: 'foo',
                bar: 'bar'
            });
            
            expect( q(tester) ).toBe( true );
        });

        it("should match whole arrays", function(){
            var q = Physics.query({
                arr: ['foo', 'fee'],
                bar: 'bar'
            });
            
            expect( q(tester) ).toBe( true );            
        });

        it("should not match array portions", function(){
            var q = Physics.query({
                arr: ['foo'],
                bar: 'bar'
            });
            
            expect( q(tester) ).toBe( false );            
        });
    });

    describe("with $in operator", function(){

        it("should match values present", function(){
            
            var q = Physics.query({
                arr: 'foo',
                bar: { $in: ['foo', 'bar'] }
            });
            
            expect( q(tester) ).toBe( true );
        });

        it("shouldn't match values not in $in", function(){
            
            var q = Physics.query({
                arr: 'foo',
                bar: { $in: ['booo', 'blah'] }
            });
            
            expect( q(tester) ).toBe( false );
        });

        it("should match values in arrays", function(){
            
            var q = Physics.query({
                arr: { $in: ['foo', 'bar'] }
            });
            
            expect( q(tester) ).toBe( true );
        });

        it("shouldn't match values not in arrays", function(){
            
            var q = Physics.query({
                arr: { $in: ['boo', 'bar'] }
            });
            
            expect( q(tester) ).toBe( false );
        });

        it("shouldn't match empty values", function(){
            
            var q = Physics.query({
                empty: { $in: ['foo', 'bar'] }
            });
            
            expect( q(tester) ).toBe( false );
        });
    });

    describe("with $nin operator", function(){

        it("shouldn't match values present", function(){
            
            var q = Physics.query({
                arr: 'foo',
                bar: { $nin: ['bar', 'that'] }
            });
            
            expect( q(tester) ).toBe( false );
        });

        it("should match values not in $nin", function(){
            
            var q = Physics.query({
                arr: 'foo',
                bar: { $nin: ['booo', 'bah'] }
            });
            
            expect( q(tester) ).toBe( true );
        });

        it("shouldn't match values in arrays", function(){
            
            var q = Physics.query({
                arr: { $nin: ['foo', 'bar'] }
            });
            
            expect( q(tester) ).toBe( false );
        });

        it("should match values not in arrays", function(){
            
            var q = Physics.query({
                arr: { $nin: ['boo', 'blah'] }
            });
            
            expect( q(tester) ).toBe( true );
        });

        it("should match empty values", function(){
            
            var q = Physics.query({
                empty: { $nin: ['foo', 'bar'] }
            });
            
            expect( q(tester) ).toBe( true );
        });
    });
     
});