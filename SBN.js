$('document').ready(function () {
    SBN.populateSelect('.noteTimeYear', SBN.__yearList());
    SBN.populateSelect('.noteTimeMonth', SBN.__monthList());
    SBN.populateSelect('.noteTimeDay', SBN.__dayList(SBN.__yearList()[0].value, SBN.__monthList()[0].value));
    SBN.populateSelect('.noteTimeHours', SBN.__hourList());
    SBN.populateSelect('.noteTimeMinutes', SBN.__60List());
    SBN.populateSelect('.noteTimeSeconds', SBN.__60List());
    $('#addNoteModal .noteTimeYear').on('change', function () {
        var year = this.value;
        var month = $('#addNoteModal .noteTimeMonth').val();
        var day = $('#addNoteModal .noteTimeDay').val();
        SBN.populateSelect('#addNoteModal .noteTimeDay', SBN.__dayList(year, month));
        $('#addNoteModal .noteTimeDay').val(day); //Try to keep last selected Day value
    });
    $('#addNoteModal .noteTimeMonth').on('change', function () {
        var month = this.value;
        var year = $('#addNoteModal .noteTimeYear').val();
        var day = $('#addNoteModal .noteTimeDay').val();
        SBN.populateSelect('#addNoteModal .noteTimeDay', SBN.__dayList(year, month));
        $('#addNoteModal .noteTimeDay').val(day); //Try to keep last selected Day value
    });
    $('#editNoteModal .noteTimeYear').on('change', function () {
        var year = this.value;
        var month = $('#editNoteModal .noteTimeMonth').val();
        var day = $('#editNoteModal .noteTimeDay').val();
        SBN.populateSelect('#editNoteModal .noteTimeDay', SBN.__dayList(year, month));
        $('#editNoteModal .noteTimeDay').val(day); //Try to keep last selected Day value
    });
    $('#editNoteModal .noteTimeMonth').on('change', function () {
        var month = this.value;
        var year = $('#editNoteModal .noteTimeYear').val();
        var day = $('#editNoteModal .noteTimeDay').val();
        SBN.populateSelect('#editNoteModal .noteTimeDay', SBN.__dayList(year, month));
        $('#editNoteModal .noteTimeDay').val(day); //Try to keep last selected Day value
    });
    $('#addNewBtn').on('click', SBN.showAddNewModal);
    $('#addNoteModal').on('show.bs.modal', function() {
        SBN.__config.addNoteModalState = 1;
    });
    $('#addNoteModal').on('shown.bs.modal', function() {
        $('#addNoteModal .noteTitle').focus();
    });
    $('#addNoteModal').on('hidden.bs.modal', function() {
        SBN.__config.addNoteModalState = 0;
    });
    $('#addNoteModal .createBtn').on('click', SBN.addStickyNote);
    $('#editNoteModal').on('show.bs.modal', function() {
        SBN.__config.editNoteModalState = 1;
    });
    $('#editNoteModal').on('shown.bs.modal', function() {
        $('#editNoteModal .noteTitle').focus();
    });
    $('#editNoteModal').on('hidden.bs.modal', function() {
        SBN.__config.editNoteModalState = 0;
    });
    $('#editNoteModal .updateBtn').on('click', SBN.updateStickyNote);
    $('#currentTime').on('click', SBN.toggleTimeFormat);
    $('body').on('keyup', function(e) {
        if (e.which===78 && SBN.__config.addNoteModalState===0 && SBN.__config.editNoteModalState===0) {
            SBN.showAddNewModal();
        }
    });
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            SBN.__config.notificationsEnabled = true;
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === 'granted') {
                    SBN.__config.notificationsEnabled = true;
                }
            });
        }
    }
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
    deleteStage: {indexId: false, stage: false, lastUpdate: false},
    addNoteModalState: 0,
    editNoteModalState: 0,
    notificationsEnabled: false
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
    SBN.updateCountdownDisplays();
    if (SBN.__config.requireSave) {
        SBN.saveSBNData();
        SBN.__config.requireSave = false;
    }
    var now = new Date();
    var newLiveReminder = false;
    for (i in SBN.data) {
        if (SBN.data[i].reminderStatus === 'active') {
            var reminderTime = new Date(SBN.data[i].reminderTime);
            if (now >= reminderTime) {
                SBN.data[i].reminderStatus = 'live';
                newLiveReminder = true;
                if (SBN.__config.notificationsEnabled) {
                    new Notification(SBN.data[i].title, {
                        body: SBN.data[i].description
                    });
                }
            }
        }
    }
    if (newLiveReminder) {
        SBN.__config.requireSave = true;
        SBN.renderNotes();
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
    if (SBN.config.timeFormat === '12h') {
        if (hours >= 12) {
            meridies = ' PM';
        } else {
            meridies = ' AM';
        }
        if (hours>12) {
            hours -= 12;
        }
        if (hours === 0) {
            hours = 12;
        }
    }
    hours = hours<10?"0"+hours:hours;
    minutes = minutes<10?"0"+minutes:minutes;
    seconds = seconds<10?"0"+seconds:seconds;
    var timeString = hours + ":" + minutes + ":" + seconds + meridies;
    $('#currentTime').html(timeString);
};

SBN.updateCountdownDisplays = function () {
    var now = new Date();
    $('.countdown').each(function (index, element) {
        var reminderTime = new Date($(element).attr('data-reminderTime'));
        var timeString = "";
        var diff = Math.floor((reminderTime - now)/1000);
        diff = diff<0?0:diff;
        var days = Math.floor(diff/86400);
        if (days<4) {
            var hours = Math.floor(diff/3600);
            diff = diff%3600;
            var minutes = Math.floor(diff/60);
            diff = diff%60;
            var seconds = diff;
            hours = hours<10?"0"+hours:hours;
            minutes = minutes<10?"0"+minutes:minutes;
            seconds = seconds<10?"0"+seconds:seconds;
            timeString = hours + ":" + minutes + ":" + seconds;
        } else {
            var monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            timeString = monthList[reminderTime.getMonth()]+" "+reminderTime.getDate()+", "+reminderTime.getFullYear();
        }
        $(element).html(timeString);
    });
};

SBN.showAddNewModal = function () {
    $('#addNoteModal .noteTitle').val('');
    $('#addNoteModal .noteDescription').val('');
    var date = new Date();
    $('#addNoteModal .noteTimeYear').val(date.getFullYear());
    $('#addNoteModal .noteTimeMonth').val(date.getMonth()+1);
    $('#addNoteModal .noteTimeDay').val(date.getDate());
    $('#addNoteModal .noteTimeHours').val(date.getHours());
    $('#addNoteModal .noteTimeMinutes').val(date.getMinutes());
    $('#addNoteModal .noteTimeSeconds').val(0);
    $('#addNoteModal .noteTimeMonth').trigger('change');
    $('#addNoteModal').modal('show');
};

SBN.addStickyNote = function () {
    var title = $('#addNoteModal .noteTitle').val();
    var description = $('#addNoteModal .noteDescription').val();
    var year = $('#addNoteModal .noteTimeYear').val();
    var month = $('#addNoteModal .noteTimeMonth').val();
    var day = $('#addNoteModal .noteTimeDay').val();
    var hours = $('#addNoteModal .noteTimeHours').val();
    var minutes = $('#addNoteModal .noteTimeMinutes').val();
    var seconds = $('#addNoteModal .noteTimeSeconds').val();
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return false;
    }
    year = parseInt(year);
    month = parseInt(month);
    day = parseInt(day);
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);
    if (title.length>0 || description.length>0) {
        var reminderTime = new Date(year, month-1, day, hours, minutes, seconds, 0);
        var now = new Date();
        var reminderStatus = 'active';
        if (now >= reminderTime) {
            reminderStatus = 'done';
        }
        var sNote = {
            title: title,
            description: description,
            reminderTime: reminderTime,
            reminderStatus: reminderStatus,
            zIndex: 999
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
        if (SBN.data[indexId].pinned && SBN.data[indexId].pinned===true) {
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

SBN.showEditModal = function (indexId) {
    if (isNaN(indexId)) {
        indexId = $(this).attr('data-indexId');
    }
    var data = SBN.data[indexId];
    if (data) {
        $('#editNoteModal .noteIndexId').val(indexId);
        $('#editNoteModal .noteTitle').val(data.title);
        $('#editNoteModal .noteDescription').val(data.description);
        var date = new Date(data.reminderTime);
        $('#editNoteModal .noteTimeYear').val(date.getFullYear());
        $('#editNoteModal .noteTimeMonth').val(date.getMonth() + 1);
        $('#editNoteModal .noteTimeDay').val(date.getDate());
        $('#editNoteModal .noteTimeHours').val(date.getHours());
        $('#editNoteModal .noteTimeMinutes').val(date.getMinutes());
        $('#editNoteModal .noteTimeSeconds').val(date.getSeconds());
        $('#editNoteModal .noteTimeMonth').trigger('change');
        $('#editNoteModal').modal('show');
    }
};

SBN.updateStickyNote = function () {
    var indexId = $('#editNoteModal .noteIndexId').val();
    var title = $('#editNoteModal .noteTitle').val();
    var description = $('#editNoteModal .noteDescription').val();
    var year = $('#editNoteModal .noteTimeYear').val();
    var month = $('#editNoteModal .noteTimeMonth').val();
    var day = $('#editNoteModal .noteTimeDay').val();
    var hours = $('#editNoteModal .noteTimeHours').val();
    var minutes = $('#editNoteModal .noteTimeMinutes').val();
    var seconds = $('#editNoteModal .noteTimeSeconds').val();
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return false;
    }
    year = parseInt(year);
    month = parseInt(month);
    day = parseInt(day);
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);
    if (SBN.data[indexId] && (title.length>0 || description.length>0)) {
        var reminderTime = new Date(year, month-1, day, hours, minutes, seconds, 0);
        var now = new Date();
        var reminderStatus = 'active';
        if (now >= reminderTime) {
            reminderStatus = 'done';
        }
        SBN.data[indexId].title = title;
        SBN.data[indexId].description = description;
        SBN.data[indexId].reminderTime = reminderTime;
        SBN.data[indexId].reminderStatus = reminderStatus;
        SBN.__config.requireSave = true;
        $('#editNoteModal').modal('hide');
        SBN.renderNotes();
    }
};

SBN.__stickyNoteControls = function (indexId) {
    var sControls = $('<div>').addClass('sControls');
    var leftControls = $('<div>').addClass('leftControls');
    var centerControls = $('<div>').addClass('centerControls');
    var rightControls = $('<div>').addClass('rightControls');
    var pinNote = $('<span>').addClass('glyphicon glyphicon-pushpin text-muted pinNote').attr('data-indexId', indexId);
    var countdown = $('<span>');
    var reminderControl = $('<span>').addClass('glyphicon glyphicon-time text-muted reminderControl').attr('data-indexId', indexId);
    var editNote = $('<span>').addClass('glyphicon glyphicon-edit text-muted editNote').attr('data-indexId', indexId);
    var deleteNote = $('<span>').addClass('glyphicon glyphicon-remove text-muted deleteNote').attr('data-indexId', indexId);
    if (SBN.data[indexId] && SBN.data[indexId].pinned && SBN.data[indexId].pinned===true) {
        pinNote.removeClass('text-muted').addClass('text-success');
    }
    if (SBN.data[indexId] && (SBN.data[indexId].reminderStatus==='active' || SBN.data[indexId].reminderStatus==='live')) {
        reminderControl.removeClass('text-muted').addClass('text-success');
        countdown.addClass('text-muted countdown').attr('data-reminderTime', SBN.data[indexId].reminderTime);
    }
    if (SBN.__config.deleteStage.indexId===indexId) {
        if (SBN.__config.deleteStage.stage===0) {
            deleteNote.removeClass('text-muted').addClass('text-warning');
        } else if (SBN.__config.deleteStage.stage===1) {
            deleteNote.removeClass('text-muted').addClass('text-danger');
        }
    }
    leftControls.append(pinNote);
    centerControls.append(countdown);
    rightControls.append(reminderControl).append(editNote).append(deleteNote);
    sControls.append(leftControls).append(centerControls).append(rightControls);
    return sControls;
};

SBN.__escapeHTML = function (data) {
    if (typeof(data) === "string") {
        var result = "";
        if (data.length>0) {
            for (i in data) {
                if (data[i] === '&') {
                    result += '&amp;';
                } else if (data[i] === '<') {
                    result += '&lt;';
                } else if (data[i] === '>') {
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
    if (typeof(data) === "string") {
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
    if (!note.pinned || note.pinned===false) {
        sWrapper.addClass('draggableStickyNote');
    }
    if (note.reminderStatus === 'live') {
        var reminderTime = new Date(note.reminderTime);
        var now = new Date();
        if (now >= reminderTime) {
            sWrapper.addClass('reminderLive');
        }
    }
    return sWrapper;
};

SBN.__renderNotePositions = function () {
    $('.stickynote').each(function (i, e) {
        var currentPos = $(e).position();
        if (!SBN.data[i].left) {
            SBN.data[i].left = currentPos.left;
            SBN.__config.requireSave = true;
        }
        if (!SBN.data[i].top) {
            SBN.data[i].top = currentPos.top;
            SBN.__config.requireSave = true;
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
            height: $(e).height(),
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
    $('.sControls').on('click', '.reminderControl', SBN.reminderControl);
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
    if (SBN.config.timeFormat === '24h') {
        SBN.config.timeFormat = '12h';
    } else {
        SBN.config.timeFormat = '24h';
    }
    SBN.__config.requireSave = true;
    SBN.updateTime();
};

SBN.__yearList = function () {
    var start = 2016;
    var count = 10;
    var list = new Array();
    for (var i=start; i<start+count; i++) {
        list.push({value: i, display: i});
    }
    return list;
};

SBN.__monthList = function () {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var list = new Array();
    for (var i=1; i<=12; i++) {
        list.push({value: i, display: months[i-1]});
    }
    return list;
};

SBN.__dayList = function (year, month) {
    if (isNaN(year) || isNaN(month)) {
        return false;
    }
    year = parseInt(year);
    month = parseInt(month);
    var dayCount = 31;
    var list = new Array();
    if ([4,6,9,11].indexOf(month) > -1) {
        dayCount = 30;
    }
    if (month === 2) {
        dayCount = 28;
        if (year%4 === 0) {
            if (year%100 === 0) {
                if (year%400 === 0) {
                    dayCount = 29;
                }
            } else {
                dayCount = 29;
            }
        }
    }
    for (var i=1; i<=dayCount; i++) {
        var display = i<10?"0"+i:i.toString();
        list.push({value: i, display: display});
    }
    return list;
};

SBN.__hourList = function () {
    var list = new Array();
    for (var i=0; i<24; i++) {
        var display = i<10?"0"+i:i.toString();
        list.push({value: i, display: display});
    }
    return list;
};

SBN.__60List = function () {
    var list = new Array();
    for (var i=0; i<60; i++) {
        var display = i<10?"0"+i:i.toString();
        list.push({value: i, display: display});
    }
    return list;
};

SBN.populateSelect = function (selectSelector, list) {
    $(selectSelector).html('');
    for (i in list) {
        var option = $('<option>');
        option.val(list[i].value);
        option.html(list[i].display);
        $(selectSelector).append(option);
    }
    return true;
};

SBN.reminderControl = function () {
    var indexId = $(this).attr('data-indexId');
    var data = SBN.data[indexId];
    if (data) {
        if (data.reminderStatus === 'done') {
            SBN.showEditModal(indexId);
        } else if (data.reminderStatus === 'active' || data.reminderStatus === 'live') {
            SBN.data[indexId].reminderStatus = 'done';
            SBN.__config.requireSave = true;
            SBN.renderNotes();
        }
    }
};
