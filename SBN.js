$(function () {
    $(".stickynote").draggable({ containment: "parent", stack: ".stickynote" });
});

SBN = {};

SBN.refreshDOM = function () {
    SBN.updateTime();
};

SBN.updateTime = function () {
    var d = new Date();
    var timeString = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    $('#currentTime').html(timeString);
};

setInterval(SBN.refreshDOM, 1000);
