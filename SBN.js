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
        SBN.__config.requireSave = false;
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

SBN.deleteStickyNote = function () {
    var indexId = $(this).attr('data-indexId');
    //var sNote = $(this).parent().parent();
    SBN.data.splice(indexId, 1);
    SBN.__config.requireSave = true;
    SBN.renderNotes();
};

SBN.__stickyNoteControls = function (indexId) {
    var sControls = $('<div>');
    sControls.addClass('sControls');
    sControls.append($('<span>').addClass('glyphicon glyphicon-edit editNote').attr('data-indexId', indexId));
    sControls.append($('<span>').addClass('glyphicon glyphicon-remove deleteNote').attr('data-indexId', indexId));
    return sControls;
};

SBN.__escapeHTML = function (data) {
    if (typeof(data) == "string") {
        var result = "";
        if (data.length>0) {
            for (i in data) {
                if (data[i] == '&') {
                    result += '&amp;';
                } else if (data[i] == '<') {
                    result += '&lt;';
                } else if (data[i] == '>') {
                    result += '&gt;';
                } else {
                    result += data[i];
                }
            }
        }
        return result;
    }
    return false;
};

SBN.__processText = function (data) {
    if (typeof(data) == "string") {
        data = data.replace(new RegExp("\n", 'g'), "<br>");
    }
    return data;
};

SBN.__stickyNote = function (note, indexId) {
    var sWrapper = $('<div>');
    var sTitle = $('<div>');
    var sDescription = $('<div>');
    
    sTitle.html(SBN.__escapeHTML(note.title)).addClass('sTitle');
    sDescription.html(SBN.__processText(SBN.__escapeHTML(note.description))).addClass('sDescription');
    
    sWrapper.append(sTitle).append(sDescription).append(SBN.__stickyNoteControls(indexId)).addClass('stickynote');
    
    return sWrapper;
};

SBN.__renderNotePositions = function () {
    $('.stickynote').each(function (i, e) {
        var currentPos = $(e).position();
        if (!SBN.data[i].left) {
            SBN.data[i].left = currentPos.left;
        }
        if (!SBN.data[i].top) {
            SBN.data[i].top = currentPos.top;
        }
        var destinationPos = {
            left: SBN.data[i].left,
            top: SBN.data[i].top,
            zIndex: SBN.data[i].zIndex?SBN.data[i].zIndex:0
        };
        var relativePos = {
            left: destinationPos.left - currentPos.left,
            top: destinationPos.top - currentPos.top,
            zIndex: destinationPos.zIndex
        };
        $(e).css({
            position: 'relative',
            top: relativePos.top+"px",
            left: relativePos.left+"px",
            "z-index": relativePos.zIndex
        });
    });
};

SBN.renderNotes = function () {
    $('#notesContainer').html('');
    if (SBN.data.length > 0) {
        var notes = SBN.data;
        for (i in notes) {
            $('#notesContainer').append(SBN.__stickyNote(notes[i], i));
        }
    }
    SBN.__renderNotePositions();
    $(".stickynote").draggable({ containment: "parent", stack: ".stickynote", stop: SBN.saveNotePositions });
    $('.sControls').on('click', '.deleteNote', SBN.deleteStickyNote);
};

SBN.saveNotePositions = function () {
    $('.stickynote').each(function (i, e) {
        SBN.data[i].left = $(e).position().left;
        SBN.data[i].top = $(e).position().top;
        SBN.data[i].zIndex = $(e).css('z-index');
    });
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
