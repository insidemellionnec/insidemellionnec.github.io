function initParallaxElements() {
    if (!isMobile()) {
        $('.parallax').parallax();
    }
}

function isMobile() {
    return screen.width < 600;
}

function init() {
    $('body').on("click", "[toggle]", function() {
        var klass = this.getAttribute('toggle');
        var target = this.getAttribute('target') || 'body';

        $(target).toggleClass(klass);
    });

    $('body').on("click", "[lazy-iframe]", function() {
        var iframe = $('<iframe  width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
        iframe.attr('src', this.getAttribute('lazy-iframe'));
        this.removeAttribute('lazy-iframe');
        $(this).html(iframe);
    });

    w3.includeHTML(function() {
        // load lazy loaded elements
        checkLazyElements();

        initPlayer();

        $('#fullpage').fullpage({
            //settings
            anchors: ['section0', 'section1', 'section2', 'section3', 'section4', 'section5'],
            menu: '#menu',


            // callbacks
            onLeave: function onSectionLeave(index, nextIndex, direction) {
                eval($('.section')[index - 1].getAttribute('onleave'));
            },
            afterLoad: function(anchorLink, index) {
                eval($('.section')[index - 1].getAttribute('onenter'));
            },
        });
    });
}

init();