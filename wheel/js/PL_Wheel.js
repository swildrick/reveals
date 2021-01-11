$(function () {

  //setting variable here to set for win/lose repectively.
  var prizeResult = "win",
      spinLocation, stopPoints; 

  switch (prizeResult) {
    case "win":
      stopPoints = [60, 120, 210, 270, 330];
      break;
    default:
      stopPoints = [0, 30, 90, 150, 180, 240, 300];
      break;
  }

  //grabbing a random number from the array
  spinLocation = stopPoints[Math.floor(Math.random() * stopPoints.length)];

  //hiding the wheel instruction graphic
  TweenMax.to($('#wheelInstructions'), 1, { css: { opacity: "1" }, delay: 1 });

  //click action to spin wheel
  $('#arrow').click(
      function () {
        $('#arrow').unbind('click');
        TweenMax.to($('#wheel'), 4, { css: { rotation: spinLocation + (360 * 2) }, ease: Expo.easeOut, onComplete: showConf, onCompleteScope: this });
      }
  );

  //animation onComplete callback
  function showConf() {
      TweenMax.to($('#spinnerGame'), 1, { autoAlpha: 0, delay: 1 });
      TweenMax.to($('#revealContent'), 1, { opacity: 1, display: 'block', zIndex:'0', delay: 2 });
  }

});