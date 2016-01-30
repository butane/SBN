$('document').ready(function () {
    $('#addNewBtn').on('click', SBN.showAddNewModal);
    $('#createBtn').on('click', SBN.addStickyNote);
    setInterval(SBN.refreshDOM, 1000);
});

SBN = {};

SBN.data = new Array();

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

SBN.showAddNewModal = function () {
    $('#noteTitle').val('');
    $('#noteDescription').val('');
    $('#addNoteModal').modal('show');
};

SBN.addStickyNote = function () {
    var title = $('#noteTitle').val();
    var description = $('#noteDescription').val();
    if (title.length>0 || description.length>0) {
        var sNote = {
            title: title,
            description: description
        };
        SBN.data.push(sNote);
        $('#addNoteModal').modal('hide');
        SBN.renderNotes();
    }
};

SBN.__stickyNote = function (note) {
    var sWrapper = $('<div>');
    var sTitle = $('<center><h4>'+note.title+'</h4></center>');
    var sDescription = $('<center>'+note.description+'</center>');
    sWrapper.append(sTitle);
    sWrapper.append($('<br>'));
    sWrapper.append(sDescription);
    sWrapper.addClass('stickynote');
    if (note.top && note.left) {
        sWrapper.css({position: 'relative', top: note.top, left: note.left});
    }
    return sWrapper;
};

SBN.renderNotes = function () {
    $('#notesContainer').html('');
    if (SBN.data.length > 0) {
        var notes = SBN.data;
        for (i in notes) {
            $('#notesContainer').append(SBN.__stickyNote(notes[i]));
        }
    }
    $(".stickynote").draggable({ containment: "parent", stack: ".stickynote", stop: SBN.updateNotePositions });
};

SBN.updateNotePositions = function () {
    var notes = $('.stickynote');
    for (var i=0; i<notes.length; i++) {
        SBN.data[i].left = notes[i].style.left;
        SBN.data[i].top = notes[i].style.top;
    }
};
