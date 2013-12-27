describe('Node.js loading test', function(){
	
	var Physics;

	it('should load properly', function(){

		Physics = require('../../');

		expect( Physics ).toBeDefined();
	});

	it('should be able to run a simple simulation', function(){

		Physics(function( world ){

			var ball = Physics.body('circle', {
				x: 0,
				y: 0,
				radius: 5
			});

			var g = Physics.behavior('constant-acceleration');

			world.add([
				ball,
				g
			]);

			expect(ball.state.pos.get(1)).toEqual( 0 );

			world.step(1);
			world.step(1000);

			expect(ball.state.pos.get(1)).not.toEqual( 0 );
		});
	});
});
