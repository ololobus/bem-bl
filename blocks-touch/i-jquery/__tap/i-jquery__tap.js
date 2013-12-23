(function($) {

var tap = $.event.special.tap = {

    setup : function() {

        $(this).bind('click', tap.handler);

    },

    teardown : function() {

        $(this).unbind('click', tap.handler);

    },

    handler : function(e) {

        if(!e.button) {
            e.type = 'tap';
            $.event.handle.apply(this, arguments);
            e.type = 'click';
        }

    }

};

})(jQuery);
