$(function () {
    $(".stickynote").draggable({ containment: "parent", stack: ".stickynote" });
});

SBN = {};

SBN.refreshDOM = function () {
    SBN.updateTime();
};

SBN.updateTime = function () {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    hours = hours<10?"0"+hours:hours;
    minutes = minutes<10?"0"+minutes:minutes;
    seconds = seconds<10?"0"+seconds:seconds;
    var timeString = hours + ":" + minutes + ":" + seconds;
    $('#currentTime').html(timeString);
};

setInterval(SBN.refreshDOM, 1000);
