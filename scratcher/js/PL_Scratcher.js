$(document).ready(function () {

    var React = require('React');
    var Scratcher = require('Scratcher');

    React.renderComponent(

        Scratcher({
            //Image to be scratched off
            foregroundSrc: 'assets/images/foreground.png',
            //Show erase percetage spots or not
            drawHotspots: true,
            //Spots to determine if user has enough of the image scratched off
            hotspots: [
                [0, 0, 120, 120],
                [140, 0, 120, 120],
                [280, 0, 120, 120],
                [420, 0, 120, 120]
            ],
            //Percentage that needs to be scratched off
            hotspotThreshold: 50,
            //When threshold is meant
            onComplete: function(a) {
                TweenMax.to($('#scratcherGame'), 1, { autoAlpha: 0, delay: 0.5 });
                TweenMax.to($('#revealContent'), 1, { autoAlpha: 1, display: 'block', delay: 1 });
            }
        }),
	
        document.getElementById('scratcherGame')
    )
});