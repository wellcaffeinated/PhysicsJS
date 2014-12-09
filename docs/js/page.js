$(function($){

    function throttle( fn, delay ){
        var to;
        return function(){

            var self = this
                ,args = arguments
                ;

            if ( to ){
                return;
            }

            to = setTimeout(function(){
                to = false;
                return fn.apply(self, args);
            }, delay);
        };
    }

    var $nav = $('nav.toc');
    $nav.find('ul ul li').each(function(){
        var $li = $(this);
        if ( $li.find('ul').length ){
            $li.prepend('<a href="#" class="ctrl-expand">+</a>');
        }
    }).find('ul').slideUp();

    $nav.on('click', '.ctrl-expand', function(){
        var $this = $(this);
        $this.toggleClass('on')
            .text($this.hasClass('on') ? '-' : '+')
            .siblings('ul')
            .slideToggle()
            ;
        return false;
    });

    $nav.on('click', '.item', function(){
        var $this = $(this)
            ,pos = $($this.attr('href')).offset()
            ;

        $this.siblings('.ctrl-expand')
            .addClass('on')
            .text('-')
            .siblings('ul')
            .slideDown()
            ;
    });

    var titles = $('.doc .title a[id]');

    $(window).on('scroll', throttle(function(){

        var pos = $('body').scrollTop() + 100
            ,l = titles.length
            ,idx = l - 1
            ,i
            ;

        for ( i = 0; i < l; ++i ){

            if (pos < $(titles[ i ]).offset().top){
                idx = i && i - 1;
                break;
            }
        }

        $nav.find('.inside').removeClass('inside');
        $nav.find('[href="#'+titles[ idx ].id+'"]')
            .addClass('inside')
            .parents('ul').each(function(){
                $(this).slideDown()
                    .siblings('.ctrl-expand')
                    .addClass('on')
                    .text('-')
                    ;
            })
            ;

    }, 100));
});
