define(
    [
        'physicsjs',
        'physicsjs/renderers/canvas'
    ],
    function(
        Physics
    ){

        Physics.renderer('metaball', 'canvas', function( parent ){
            return {
                tprColor: function( T ){
                    T = T || 0;
                    var mid = 5;
                    var scale = 10;
                    var rgb = [];
                    rgb[0] = (((T - mid) / scale) + 0.5) * 255 | 0;
                    rgb[1] = 0;
                    rgb[2] = 0; //255 - rgb[0];
                    return rgb;
                },
                beforeRender: function(){
                    this.el.width = this.el.width;
                    this.hiddenCanvas.width = this.el.width;
                    this.hiddenCanvas.height = this.el.height;
                },
                drawBody: function( body, view ){
        
                    var ctx = this.hiddenCtx
                        ,pos = body.state.pos
                        ,offset = this.options.offset
                        ,aabb = body.aabb()
                        ,color
                        ;
            
                    ctx.save();
                    ctx.translate(pos.get(0) + offset.get(0), pos.get(1) + offset.get(1));
                    ctx.rotate(body.state.angular.pos);
                    ctx.beginPath();
                    var grad = ctx.createRadialGradient(0, 0, 1, 0, 0, body.geometry.radius * 10);
                    color = this.tprColor( body.temperature );
                    grad.addColorStop(0, 'rgba('+color.join(',')+',1)');
                    grad.addColorStop(1, 'rgba('+color.join(',')+',0)');
                    ctx.fillStyle = grad;
                    ctx.arc(0, 0, body.geometry.radius * 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                },
                metabalize: function(){
                    
                    var width = this.hiddenCanvas.width
                        ,height = this.hiddenCanvas.height
                        ,imageData = this.hiddenCtx.getImageData(0,0, width, height)
                        ,threshold = 200
                        ,pix = imageData.data
                        ,a
                        ,w
                        ,f2 = 0.5
                        ,f3 = 1/6
                        ;
                    
                    for (var i = 0, n = pix.length; i <n; i += 4) {
                        a = pix[i+3];
                        if(a<threshold){
                            w = (a-threshold)/3;
                            // this is just an exponential loss filter
                            pix[i+3] *= 1 + w * (1 + w*f2 + w*w*f3);
                        }
                    }
                    
                    this.ctx.putImageData(imageData, 0, 0);    
                },
                render: function( bodies, meta ){
                    parent.render.call(this, bodies, meta);
                    this.metabalize();
                }
            };
        });
    }
);