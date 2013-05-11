Physics.renderer('canvas', function( proto ){

    var Pi2 = Math.PI * 2
        ,newEl = function( node, content ){
            var el = document.createElement(node || 'div');
            if (content){
                el.innerHTML = content;
            }
            return el;
        }
        ;

    var defaults = {

        debug: false,
        statsEl: null,
        styles: {

            'point' : 'rgba(80, 50, 100, 0.7)',

            'circle' : {
                strokeStyle: 'rgba(80, 50, 100, 0.7)',
                fillStyle: 'rgba(114, 105, 124, 0.7)',
                angleIndicator: 'rgba(69, 51, 78, 0.7)'
            },

            'convex-polygon' : {
                strokeStyle: 'rgba(80, 50, 100, 0.7)',
                fillStyle: 'rgba(114, 105, 124, 0.7)',
                angleIndicator: 'rgba(69, 51, 78, 0.7)'
            }
        },
        offset: Physics.vector()
    };

    var deep = function( a, b ){

        if ( Physics.util.isPlainObject( b ) ){

            return Physics.util.extend({}, a, b, deep );
        }

        return b ? b : a;
    };

    return {

        init: function( options ){

            // call proto init
            proto.init.call(this, options);

            // further options
            this.options = Physics.util.extend({}, defaults, this.options, deep);

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

            this.els = {};

            var stats = this.options.statsEl || newEl();
            stats.className = 'pjs-meta';
            this.els.fps = newEl('span');
            this.els.steps = newEl('span');
            stats.appendChild(newEl('span', 'fps: '));
            stats.appendChild(this.els.fps);
            stats.appendChild(newEl('br'));
            stats.appendChild(newEl('span', 'steps: '));
            stats.appendChild(this.els.steps);

            viewport.parentNode.insertBefore(stats, viewport);
        },

        setStyle: function( styles, ctx ){

            ctx = ctx || this.ctx;

            if ( Physics.util.isObject(styles) ){

                ctx.strokeStyle = styles.strokeStyle;
                ctx.fillStyle = styles.fillStyle;

            } else {

                ctx.fillStyle = ctx.strokeStyle = styles;
            }
        },

        drawCircle: function(x, y, r, styles, ctx){

            ctx = ctx || this.ctx;

            ctx.beginPath();
            this.setStyle( styles, ctx );
            ctx.arc(x, y, r, 0, Pi2, false);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        },

        drawPolygon: function(verts, styles, ctx){

            var vert = verts[0]
                ,x = vert.x === undefined ? vert.get(0) : vert.x
                ,y = vert.y === undefined ? vert.get(1) : vert.y
                ,l = verts.length
                ;

            ctx = ctx || this.ctx;
            ctx.beginPath();
            this.setStyle( styles, ctx );

            ctx.moveTo(x, y);

            for ( var i = 1; i < l; ++i ){
                
                vert = verts[ i ];
                x = vert.x === undefined ? vert.get(0) : vert.x;
                y = vert.y === undefined ? vert.get(1) : vert.y;
                ctx.lineTo(x, y);
            }

            if (l > 2){
                ctx.closePath();
            }

            ctx.stroke();
            ctx.fill();
        },

        createView: function( geometry ){

            var view = new Image()
                ,aabb = geometry.aabb()
                ,hw = aabb.halfWidth + Math.abs(aabb.pos.x)
                ,hh = aabb.halfHeight + Math.abs(aabb.pos.y)
                ,x = hw + 1
                ,y = hh + 1
                ,hiddenCtx = this.hiddenCtx
                ,hiddenCanvas = this.hiddenCanvas
                ,name = geometry.name
                ,styles = this.options.styles[ name ]
                ;
            
            // clear
            hiddenCanvas.width = 2 * hw + 2;
            hiddenCanvas.height = 2 * hh + 2;

            hiddenCtx.save();
            hiddenCtx.translate(x, y);

            if (name === 'circle'){

                this.drawCircle(0, 0, geometry.radius, styles, hiddenCtx);

            } else if (name === 'convex-polygon'){

                this.drawPolygon(geometry.vertices, styles, hiddenCtx);
            }

            if (styles.angleIndicator){

                hiddenCtx.beginPath();
                this.setStyle( styles.angleIndicator, hiddenCtx );
                hiddenCtx.moveTo(0, 0);
                hiddenCtx.lineTo(hw, 0);
                hiddenCtx.closePath();
                hiddenCtx.stroke();
            }

            hiddenCtx.restore();

            view.src = hiddenCanvas.toDataURL("image/png");
            return view;
        },

        drawMeta: function( stats ){

            this.els.fps.innerHTML = stats.fps.toFixed(2);
            this.els.steps.innerHTML = stats.steps;
        },

        beforeRender: function(){

            // clear canvas
            this.el.width = this.el.width;
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
            ctx.drawImage(view, -view.width/2, -view.height/2);
            ctx.restore();

            if ( this.options.debug ){
                // draw bounding boxes
                ctx.save();
                ctx.translate(offset.get(0), offset.get(1));
                this.drawPolygon([
                        { x: aabb.pos.x - aabb.x, y: aabb.pos.y - aabb.y },
                        { x: aabb.pos.x + aabb.x, y: aabb.pos.y - aabb.y },
                        { x: aabb.pos.x + aabb.x, y: aabb.pos.y + aabb.y },
                        { x: aabb.pos.x - aabb.x, y: aabb.pos.y + aabb.y }
                    ], 'rgba(100, 255, 100, 0.3)');
                ctx.restore();
            }
        }
    };
});