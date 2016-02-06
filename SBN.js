$('document').ready(function () {
    $('#addNewBtn').on('click', SBN.showAddNewModal);
    $('#addNoteModal .createBtn').on('click', SBN.addStickyNote);
    $('#editNoteModal .updateBtn').on('click', SBN.updateStickyNote);
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
    requireSave: false,
    deleteStage: {indexId: false, stage: false, lastUpdate: false}
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
    if (SBN.__config.intervalCount%10===0) { //Every 10 seconds
        if (SBN.__config.deleteStage.lastUpdate && (Date.now() - SBN.__config.deleteStage.lastUpdate > 10000)) {
            SBN.__config.deleteStage.indexId = false;
            SBN.__config.deleteStage.stage = false;
            SBN.__config.deleteStage.lastUpdate = false;
            SBN.renderNotes();
        }
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
    $('#addNoteModal .noteTitle').val('');
    $('#addNoteModal .noteDescription').val('');
    $('#addNoteModal').modal('show');
};

SBN.addStickyNote = function () {
    var title = $('#addNoteModal .noteTitle').val();
    var description = $('#addNoteModal .noteDescription').val();
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

SBN.pinStickyNote = function () {
    var indexId = $(this).attr('data-indexId');
    var data = SBN.data[indexId];
    if (data) {
        if (SBN.data[indexId].pinned && SBN.data[indexId].pinned==true) {
            SBN.data[indexId].pinned = false;
        } else {
            SBN.data[indexId].pinned = true;
        }
        SBN.__config.requireSave = true;
        SBN.renderNotes();
    }
};

SBN.deleteStickyNote = function () {
    var indexId = $(this).attr('data-indexId');
    if (SBN.__config.deleteStage.indexId === indexId) {
        if (SBN.__config.deleteStage.stage === false) {
            SBN.__config.deleteStage.stage = 0;
            SBN.__config.deleteStage.lastUpdate = Date.now();
        } else {
            SBN.__config.deleteStage.stage++;
            SBN.__config.deleteStage.lastUpdate = Date.now();
        }
        if (SBN.__config.deleteStage.stage > 1) {
            //var sNote = $(this).parent().parent();
            SBN.data.splice(indexId, 1);
            SBN.__config.requireSave = true;
            SBN.__config.deleteStage.indexId = false;
            SBN.__config.deleteStage.stage = false;
            SBN.__config.deleteStage.lastUpdate = false;
        }
    } else {
        SBN.__config.deleteStage.indexId = indexId;
        SBN.__config.deleteStage.stage = 0;
        SBN.__config.deleteStage.lastUpdate = Date.now();
    }
    SBN.renderNotes();
};

SBN.showEditModal = function () {
    var indexId = $(this).attr('data-indexId');
    var data = SBN.data[indexId];
    if (data) {
        $('#editNoteModal .noteIndexId').val(indexId);
        $('#editNoteModal .noteTitle').val(data.title);
        $('#editNoteModal .noteDescription').val(data.description);
        $('#editNoteModal').modal('show');
    }
};

SBN.updateStickyNote = function () {
    var indexId = $('#editNoteModal .noteIndexId').val();
    var title = $('#editNoteModal .noteTitle').val();
    var description = $('#editNoteModal .noteDescription').val();
    if (SBN.data[indexId] && (title.length>0 || description.length>0)) {
        SBN.data[indexId].title = title;
        SBN.data[indexId].description = description;
        SBN.__config.requireSave = true;
        $('#editNoteModal').modal('hide');
        SBN.renderNotes();
    }
};

SBN.__stickyNoteControls = function (indexId) {
    var sControls = $('<div>').addClass('sControls');
    var leftControls = $('<div>').addClass('leftControls');
    var rightControls = $('<div>').addClass('rightControls');
    var pinNote = $('<span>').addClass('glyphicon glyphicon-pushpin text-muted pinNote').attr('data-indexId', indexId);
    var editNote = $('<span>').addClass('glyphicon glyphicon-edit text-muted editNote').attr('data-indexId', indexId);
    var deleteNote = $('<span>').addClass('glyphicon glyphicon-remove text-muted deleteNote').attr('data-indexId', indexId);
    if (SBN.data[indexId] && SBN.data[indexId].pinned && SBN.data[indexId].pinned==true) {
        pinNote.removeClass('text-muted').addClass('text-success');
    }
    if (SBN.__config.deleteStage.indexId===indexId) {
        if (SBN.__config.deleteStage.stage===0) {
            deleteNote.removeClass('text-muted').addClass('text-warning');
        } else if (SBN.__config.deleteStage.stage===1) {
            deleteNote.removeClass('text-muted').addClass('text-danger');
        }
    }
    leftControls.append(pinNote);
    rightControls.append(editNote).append(deleteNote);
    sControls.append(leftControls).append(rightControls);
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
    var sWrapper = $('<div>').addClass('stickynote');
    var sTitle = $('<div>').addClass('sTitle');
    var sDescription = $('<div>').addClass('sDescription');
    sTitle.html(SBN.__escapeHTML(note.title));
    sDescription.html(SBN.__processText(SBN.__escapeHTML(note.description)));
    sWrapper.append(sTitle).append(sDescription).append(SBN.__stickyNoteControls(indexId));
    if (!note.pinned || note.pinned==false) {
        sWrapper.addClass('draggableStickyNote');
    }
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
    $(".draggableStickyNote").draggable({ containment: "parent", stack: ".stickynote", stop: SBN.saveNotePositions, cancel: ".sControls" });
    $('.sControls').on('click', '.pinNote', SBN.pinStickyNote);
    $('.sControls').on('click', '.deleteNote', SBN.deleteStickyNote);
    $('.sControls').on('click', '.editNote', SBN.showEditModal);
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
