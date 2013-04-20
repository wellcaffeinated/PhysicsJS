Physics.renderer('canvas', function( proto ){

    var Pi2 = Math.PI * 2;

    var defaults = {

        bodyColor: '#fff',
        orientationLineColor: '#cc0000'
    };

    return {

        init: function( options ){

            // call proto init
            proto.init.call(this, options);

            // further options
            Physics.util.extend(this.options, defaults, this.options);

            // hidden canvas
            this.hiddenCanvas = document.createElement('canvas');
            this.hiddenCanvas.width = this.hiddenCanvas.height = 100;
            
            if (!this.hiddenCanvas.getContext){
                throw "Canvas not supported";
            }

            this.hiddenCtx = this.hiddenCanvas.getContext('2d');

            // actual viewport
            var viewport = this.el;
            if (viewport.nodeName.toUpperCase() !== "CANVAS"){

                viewport = document.createElement('canvas');
                this.el.appendChild( viewport );
                this.el = viewport;
            }

            viewport.width = this.options.width;
            viewport.height = this.options.height;

            this.ctx = viewport.getContext("2d");
        },

        circleProperties: function( el, geometry ){

            var aabb = geometry.aabb();

            el.style.width = (aabb.halfWidth * 2) + px;
            el.style.height = (aabb.halfHeight * 2) + px;
            el.style.marginLeft = (-aabb.halfWidth) + px;
            el.style.marginTop = (-aabb.halfHeight) + px;
        },

        createView: function( geometry ){

            var view = new Image()
                ,aabb = geometry.aabb()
                ,hw = aabb.halfWidth
                ,hh = aabb.halfHeight
                ,x = hw + 1
                ,y = hh + 1
                ,hiddenCtx = this.hiddenCtx
                ,hiddenCanvas = this.hiddenCanvas
                ;
            
            // clear
            hiddenCanvas.width = 2 * hw + 2;
            hiddenCanvas.height = 2 * hh + 2;

            if (geometry.name === 'circle'){

                hiddenCtx.beginPath();
                hiddenCtx.fillStyle = hiddenCtx.strokeStyle = this.options.bodyColor;
                hiddenCtx.arc(x, y, hw, 0, Pi2, false);
                hiddenCtx.closePath();
                hiddenCtx.stroke();
                hiddenCtx.fill();
            }

            if (this.options.orientationLineColor){

                hiddenCtx.beginPath();
                hiddenCtx.strokeStyle = this.options.orientationLineColor;
                hiddenCtx.moveTo(x, y);
                hiddenCtx.lineTo(x + hw, y);
                hiddenCtx.closePath();
                hiddenCtx.stroke();
            }

            view.src = hiddenCanvas.toDataURL("image/png");
            return view;
        },

        drawMeta: function( stats ){

            // this.els.fps.innerHTML = stats.fps.toFixed(2);
            // this.els.steps.innerHTML = stats.steps;
        },

        beforeRender: function(){

            // clear canvas
            this.el.width = this.el.width;
        },

        drawBody: function( body, view ){

            var ctx = this.ctx
                ,pos = body.state.pos
                ;

            ctx.save();
            ctx.translate(pos.get(0), pos.get(1));
            ctx.rotate(body.state.angular.pos);
            ctx.drawImage(view, -view.width/2, -view.height/2);
            ctx.restore();
        }
    };
});