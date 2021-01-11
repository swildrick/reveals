$(document).ready(function () {

    var _scaleNum = 1;
    var _endReached = false;
    var _newY = 0;
    var _ballScale = 0.006;
    var _rotateXScale = " ";
    var _ballDrag = " ";

    dragBall();

    //HANDLED WHEN USER CLICK SPIN BUTTON
    $('#btnSpin').click(
        function () {
            $('#btnSpin').unbind('click');
            dragComplete();
            _endReached = true;
            startGame();
        }
);

    //SETS ARM AND BALL TO BE DRAGGABLE
    function dragBall() {
            _ballDrag = Draggable.create("#leverRedBall", {
            type: "y",
            edgeResistance: 0.4,
            bounds: "#holderLever",
            throwProps: true,
            dragResistance: 0.002,
            cursor: "pointer",
            onDrag: checkDrag,
            force3D: true,
            onDragEnd: dragComplete
        });
    }

    //WHEN DRAG IS DONE WILL ADJUST LEVER BACK TO LOCKED POSITION
    function dragComplete() {
        if (!_endReached) {
            _scaleNum = 1;
            TweenMax.to($('#leverRedBall'), 1.5, { y: 0, scaleX: _scaleNum, scaleY: _scaleNum, ease: Expo.easeOut });
            TweenMax.to($('#leverPole'), 1.5, { rotationX: 0, transformPerspective: 1000, transformOrigin: "50% 100%" });
        }
    }

    //CHECKS BALL POSITION
    function checkDrag() {

        //BEFORE DRAGGING THIS IS CHECKING TO SEE IF THE USER HAS CLICKED THE SPIN BUTTON. wILL KILL DRAG IF USER CLICKED
        if (_endReached) {
            this.kill();
        }

        //TURNING DRAG OFF IF USERS PULLS LEVER UP ABOVE GAME
        if (this.y <= 0) {
            this.kill();
            TweenMax.to($('#leverRedBall'), 0.5, { delay: 0.5, onComplete: dragBall });
        }

        //TURNING DRAG OFF IF USERS PULLS LEVER PAST THE BOTTOM LIMIT
        if (this.y >= 160) {
            _endReached = true;
            this.kill();
            startGame();
            TweenMax.to($('#leverRedBall'), 1, { y: 0, scaleX: 1, scaleY: 1, ease: Expo.easeOut, delay: 0.1 });
            TweenMax.to($('#leverPole'), 1, { rotationX: 0, transformPerspective: 1000, transformOrigin: "50% 100%" });
        }

        //SCALES BALL AND CHECKS Y POSITION
        var _currentY = this.y;
        _rotateXScale = (_currentY * -1) / 2;

        //CHECKING TO SEE IF USER IS MOVING LEVER DOWN
        if (_currentY >= _newY) {

            //MAKING SURE LEVER BALL DOES NOT EXCEED 1.4%
            if (_scaleNum >= 1.4) {
                _scaleNum = 1.4;
            } else {
                _scaleNum = _scaleNum + _ballScale;
            }
        } else {
            //CHECKING THE SCALE OF THE BALL AND MAKING SURE IT DOES NOT GET TOO SMALL
            if (_scaleNum <= 1) {
                _scaleNum = 1;
            } else {
                _scaleNum = _scaleNum - _ballScale;
            }
        }

        _newY = _currentY;
        _currentY = _currentY + 20;
        
        TweenMax.to($('#leverRedBall'), 0, { scaleX: _scaleNum, scaleY: _scaleNum });
        TweenMax.to($('#leverPole'), 0, { rotationX: _rotateXScale, transformPerspective: 1000, transformOrigin: "50% 100%" });
    }




    //RUN SLOTS
    function startGame() {


        var _slot1Y = " ";
        var _slot2Y = " ";
        var _slot3Y = " ";

        //ADJUST SLOT VALUES AS NEEDED. LEVER IS SET TO DISPLAY NONE ON MOBILE
        if ($('#holderLever').css('display') == 'none') {
            _slot1Y = 5167;
            _slot2Y = 5167;
            _slot3Y = 5167;
        } else {
            _slot1Y = 4791;
            _slot2Y = 5006;
            _slot3Y = 4682;
        }
        TweenMax.to($('#slot1'), 2.5, { y: _slot1Y, ease: Expo.easeInOut, delay: 0.3 });
        TweenMax.to($('#slot2'), 2.8, { y: _slot2Y, ease: Expo.easeInOut, delay: 0.4 });
        TweenMax.to($('#slot3'), 3, { y: _slot3Y, ease: Expo.easeInOut, delay: 0.5, onComplete: gameComplete });
    }

    function gameComplete() {
        TweenMax.to($('#slotGame'), 1, { autoAlpha: 0, delay: 1 });
        TweenMax.to($('#revealContent'), 1, { autoAlpha: 1, display: 'block', delay: 2 });
    }

});