$('document').ready(function () {
    $('#addNewBtn').on('click', SBN.showAddNewModal);
    $('#createBtn').on('click', SBN.addStickyNote);
    $('#currentTime').on('click', SBN.toggleTimeFormat);
    SBN.fetchSBNData();
    SBN.renderNotes();
    SBN.updateTime();
    setInterval(SBN.intervalJobs, 1000);
});

SBN = {};

SBN.data = new Array();

SBN.__config = {
    intervalCount: 0,
    requireSave: false
};

SBN.config = {
    timeFormat: '24h'
};

SBN.intervalJobs = function () {
    SBN.__config.intervalCount++;
    if (SBN.__config.intervalCount > 3600) {
        SBN.__config.intervalCount = 0; //Resets every hour
    }
    SBN.updateTime();
    if (SBN.__config.requireSave) {
        SBN.saveSBNData();
    }
};

SBN.updateTime = function () {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var meridies = '';
    if (SBN.config.timeFormat == '12h') {
        if (hours >= 12) {
            meridies = ' PM';
        } else {
            meridies = ' AM';
        }
        if (hours>12) {
            hours -= 12;
        }
        if (hours == 0) {
            hours = 12;
        }
    }
    hours = hours<10?"0"+hours:hours;
    minutes = minutes<10?"0"+minutes:minutes;
    seconds = seconds<10?"0"+seconds:seconds;
    var timeString = hours + ":" + minutes + ":" + seconds + meridies;
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
        SBN.__config.requireSave = true;
        $('#addNoteModal').modal('hide');
        SBN.renderNotes();
    }
};

SBN.__stickyNote = function (note) {
    var sWrapper = $('<div>');
    var sTitle = $('<div>');
    var sDescription = $('<div>');
    var sControls = $('<div>');
    sTitle.html(note.title).addClass('sTitle');
    sDescription.html(note.description).addClass('sDescription');
    sControls.addClass('sControls');
    sWrapper.append(sTitle).append(sDescription).append(sControls).addClass('stickynote');
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
    SBN.__config.requireSave = true;
};

SBN.saveSBNData = function () {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('SBNData', JSON.stringify(SBN.data));
        localStorage.setItem('SBNConfig', JSON.stringify(SBN.config));
    }
};

SBN.fetchSBNData = function () {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem('SBNData')) {
            SBN.data = JSON.parse(localStorage.getItem('SBNData'));
        }
        if (localStorage.getItem('SBNConfig')) {
            SBN.config = JSON.parse(localStorage.getItem('SBNConfig'));
        }
    }
};

SBN.toggleTimeFormat = function () {
    if (SBN.config.timeFormat == '24h') {
        SBN.config.timeFormat = '12h';
    } else {
        SBN.config.timeFormat = '24h';
    }
    SBN.__config.requireSave = true;
    SBN.updateTime();
};
