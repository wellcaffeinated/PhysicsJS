define(
    [
        'physicsjs',
        'physicsjs/renderers/canvas'
    ],
    function(
        Physics
    ){

        Physics.renderer('temperature', 'canvas', function( parent ){
            return {
                tprColor: function( T ){
                    T = T || 0;
                    var mid = 5;
                    var scale = 10;
                    var rgb = [];
                    rgb[0] = (((T - mid) / scale) + 0.5) * 255 | 0;
                    rgb[1] = 0;
                    rgb[2] = 0; //255 - rgb[0];
                    return 'rgb('+rgb.join(',')+')';
                },
                drawBody: function( body, view ){
        
                    var ctx = this.ctx
                        ,pos = body.state.pos
                        ,offset = this.options.offset
                        ,aabb = body.aabb()
                        ;
        
                    ctx.save();
                    ctx.translate(pos.get(0) + offset.get(0), pos.get(1) + offset.get(1));
                    ctx.rotate(body.state.angular.pos);
                    this.drawCircle(0, 0, body.geometry.radius, {
                        strokeStyle: this.tprColor( body.temperature ),
                        fillStyle: this.tprColor( body.temperature )
                    }, this.ctx);
                    ctx.restore();
                }
            };
        });
    }
);