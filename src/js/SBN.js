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
    $('#addMarkdownHelper').on('click', SBN.addMarkdownHelperNote);
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

SBN.data = [];

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
    for (var i in SBN.data) {
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
        var position = SBN.findFreeSpace();
        var sNote = {
            title: title,
            description: description,
            reminderTime: reminderTime,
            reminderStatus: reminderStatus,
            left: position.left,
            top: position.top,
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

SBN.__sanitizeHTML = function (data) {
    if (typeof(data) === "string") {
        return DOMPurify.sanitize(data);
    }
    return false;
};

SBN.__processText = function (data) {
    if (typeof(data) === "string") {
        data = marked(data, {
            breaks: true
        });
    }
    return data;
};

SBN.__stickyNote = function (note, indexId) {
    var sWrapper = $('<div>').addClass('stickynote');
    var sTitle = $('<div>').addClass('sTitle');
    var sDescription = $('<div>').addClass('sDescription');
    sTitle.html(SBN.__sanitizeHTML(SBN.__processText(note.title)));
    sDescription.html(SBN.__sanitizeHTML(SBN.__processText(note.description)));
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
        for (var i in notes) {
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
    var list = [];
    for (var i=start; i<start+count; i++) {
        list.push({value: i, display: i});
    }
    return list;
};

SBN.__monthList = function () {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var list = [];
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
    var list = [];
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
    var list = [];
    for (var i=0; i<24; i++) {
        var display = i<10?"0"+i:i.toString();
        list.push({value: i, display: display});
    }
    return list;
};

SBN.__60List = function () {
    var list = [];
    for (var i=0; i<60; i++) {
        var display = i<10?"0"+i:i.toString();
        list.push({value: i, display: display});
    }
    return list;
};

SBN.populateSelect = function (selectSelector, list) {
    $(selectSelector).html('');
    for (var i in list) {
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

SBN.__findRenderedNotesPosition = function () {
  var notes = [];
  $('.stickynote').each(function (i, e) {
      notes.push({
        x1: $(e).position().left,
        y1: $(e).position().top,
        x2: $(e).position().left + $(e).width() + 5,
        y2: $(e).position().top + $(e).height() + 5
      });
  });
  return notes;
};

SBN.__isEmpty = function (cell, notes) {
  var note;
  var isEmpty = true;
  for (var i in notes) {
    note = notes[i];
    if (cell.x2 < note.x1) {
      continue;
    } else if (cell.x1 > note.x2) {
      continue;
    } else if (cell.y2 < note.y1) {
      continue;
    } else if (cell.y1 > note.y2) {
      continue;
    } else {
      isEmpty = false;
      break;
    }
  }
  return isEmpty;
};

SBN.__createGrid = function (notesArea) {
    var rows = 40;
    var cols = 60;
    var grid = [];
    grid.data = [];
    grid.row_height = (notesArea.y2-notesArea.y1)/rows;
    grid.col_width = (notesArea.x2-notesArea.x1)/cols;
    var grid_pos;
    var notes = SBN.__findRenderedNotesPosition();
    for (var i=0; i<rows; i++) {
      grid.data[i] = [];
      for (var j=0; j<cols; j++) {
        grid_pos = {
          x1: Math.floor((j*grid.col_width)+notesArea.x1),
          y1: Math.floor((i*grid.row_height)+notesArea.y1),
          x2: Math.floor((j*grid.col_width)+notesArea.x1+grid.col_width),
          y2: Math.floor((i*grid.row_height)+notesArea.y1+grid.row_height)
        };
        if (SBN.__isEmpty(grid_pos, notes)) {
          grid.data[i][j] = 0;
        } else {
          grid.data[i][j] = 1;
        }
      }
    }
    return grid;
};

SBN.__maximalRectangle = function (grid) {
  var area = function (x1, y1, x2, y2) {
    if (x2<=x1 || y2<=y1) {
      return 0;
    }
    return ((x2-x1)*(y2-y1));
  };
  var all_zeros = function (x1, y1, x2, y2) {
    for (var i=x1; i <=x2; i++) {
      for (var j=y1; j<=y2; j++) {
        if (grid.data[i][j] === 1) {
          return false;
        }
      }
    }
    return true;
  };
  var m_x1 = 0;
  var m_y1 = 0;
  var m_x2 = 0;
  var m_y2 = 0;
  for (var x1=0; x1<grid.data.length; x1++) {
    for (var y1=0; y1<=grid.data[x1].length; y1++) {
      for (var x2=x1; x2<grid.data.length; x2++) {
        for (var y2=y1; y2<grid.data[x2].length; y2++) {
          if (area(x1, y1, x2, y2) > area(m_x1, m_y1, m_x2, m_y2)) {
            if (all_zeros(x1, y1, x2, y2)) {
              m_x1 = x1;
              m_y1 = y1;
              m_x2 = x2;
              m_y2 = y2;
            }
          }
        }
      }
    }
  }
  return {x1: m_x1, y1: m_y1, x2: m_x2, y2: m_y2};
};

SBN.findFreeSpace = function () {
    var notesArea = {
        x1: 15,
        y1: 60,
        x2: $('#notesContainer').width()+15,
        y2: $('#notesContainer').height()+60
    };
    var grid = SBN.__createGrid(notesArea);
    var maxRect = SBN.__maximalRectangle(grid);
    var maxRectPos = {
      x1: Math.floor((maxRect.y1*grid.col_width)+notesArea.x1),
      y1: Math.floor((maxRect.x1*grid.row_height)+notesArea.y1),
      x2: Math.floor((maxRect.y2*grid.col_width)+notesArea.x1),
      y2: Math.floor((maxRect.x2*grid.row_height)+notesArea.y1)
    };
    var position = {};
    position.left = maxRectPos.x1;
    position.top = maxRectPos.y1;
    return position;
};

SBN.__markdownQuickReference = function () {
    // Text from https://marked.js.org/ demo page
    return "Markdown Quick Reference\n========================\n\nThis guide is a very brief overview, with examples, of the syntax that [Markdown] supports. It is itself written in Markdown and you can copy the samples over to the left-hand pane for experimentation. It's shown as *text* and not *rendered HTML*.\n\n[Markdown]: http://daringfireball.net/projects/markdown/\n\n\nSimple Text Formatting\n======================\n\nFirst thing is first. You can use *stars* or _underscores_ for italics. **Double stars** and __double underscores__ for bold. ***Three together*** for ___both___.\n\nParagraphs are pretty easy too. Just have a blank line between chunks of text.\n\n> This chunk of text is in a block quote. Its multiple lines will all be\n> indented a bit from the rest of the text.\n>\n> > Multiple levels of block quotes also work.\n\nSometimes you want to include code, such as when you are explaining how `<h1>` HTML tags work, or maybe you are a programmer and you are discussing `someMethod()`.\n\nIf you want to include code and have new\nlines preserved, indent the line with a tab\nor at least four spaces:\n\n    Extra spaces work here too.\n    This is also called preformatted text and it is useful for showing examples.\n    The text will stay as text, so any *markdown* or <u>HTML</u> you add will\n    not show up formatted. This way you can show markdown examples in a\n    markdown document.\n\n>     You can also use preformatted text with your blockquotes\n>     as long as you add at least five spaces.\n\n\nHeadings\n========\n\nThere are a couple of ways to make headings. Using three or more equals signs on a line under a heading makes it into an \"h1\" style. Three or more hyphens under a line makes it \"h2\" (slightly smaller). You can also use multiple pound symbols (`#`) before and after a heading. Pounds after the title are ignored. Here are some examples:\n\nThis is H1\n==========\n\nThis is H2\n----------\n\n# This is H1\n## This is H2\n### This is H3 with some extra pounds ###\n#### You get the idea ####\n##### I don't need extra pounds at the end\n###### H6 is the max\n\n\nLinks\n=====\n\nLet's link to a few sites. First, let's use the bare URL, like <https://www.github.com>. Great for text, but ugly for HTML.\nNext is an inline link to [Google](https://www.google.com). A little nicer.\nThis is a reference-style link to [Wikipedia] [1].\nLastly, here's a pretty link to [Yahoo]. The reference-style and pretty links both automatically use the links defined below, but they could be defined *anywhere* in the markdown and are removed from the HTML. The names are also case insensitive, so you can use [YaHoO] and have it link properly.\n\n[1]: https://www.wikipedia.org\n[Yahoo]: https://www.yahoo.com\n\nTitle attributes may be added to links by adding text after a link.\nThis is the [inline link](https://www.bing.com \"Bing\") with a \"Bing\" title.\nYou can also go to [W3C] [2] and maybe visit a [friend].\n\n[2]: https://w3c.org (The W3C puts out specs for web-based things)\n[Friend]: https://facebook.com \"Facebook!\"\n\nEmail addresses in plain text are not linked: test@example.com.\nEmail addresses wrapped in angle brackets are linked: <test@example.com>.\nThey are also obfuscated so that email harvesting spam robots hopefully won't get them.\n\n\nLists\n=====\n\n* This is a bulleted list\n* Great for shopping lists\n- You can also use hyphens\n+ Or plus symbols\n\nThe above is an \"unordered\" list. Now, on for a bit of order.\n\n1. Numbered lists are also easy\n2. Just start with a number\n3738762. However, the actual number doesn't matter when converted to HTML.\n1. This will still show up as 4.\n\nYou might want a few advanced lists:\n\n- This top-level list is wrapped in paragraph tags\n- This generates an extra space between each top-level item.\n\n- You do it by adding a blank line\n\n- This nested list also has blank lines between the list items.\n\n- How to create nested lists\n    1. Start your regular list\n    2. Indent nested lists with two spaces\n    3. Further nesting means you should indent with two more spaces\n    * This line is indented with four spaces.\n\n- List items can be quite lengthy. You can keep typing and either continue\nthem on the next line with no indentation.\n\n- Alternately, if that looks ugly, you can also\n    indent the next line a bit for a prettier look.\n\n- You can put large blocks of text in your list by just indenting with two spaces.\n\n    This is formatted the same as code, but you can inspect the HTML\n    and find that it's just wrapped in a `<p>` tag and *won't* be shown\n    as preformatted text.\n\n    You can keep adding more and more paragraphs to a single\n    list item by adding the traditional blank line and then keep\n    on indenting the paragraphs with two spaces.\n\n    You really only need to indent the first line,\nbut that looks ugly.\n\n- Lists support blockquotes\n\n    > Just like this example here. By the way, you can\n    > nest lists inside blockquotes!\n    > - Fantastic!\n\n- Lists support preformatted text\n\n        You just need to indent an additional four spaces.\n\n\nEven More\n=========\n\nHorizontal Rule\n---------------\n\nIf you need a horizontal rule you just need to put at least three hyphens, asterisks, or underscores on a line by themselves. You can also even put spaces between the characters.\n\n---\n****************************\n_ _ _ _ _ _ _\n\nThose three all produced horizontal lines. Keep in mind that three hyphens under any text turns that text into a heading, so add a blank like if you use hyphens.\n\nImages\n------\n\nImages work exactly like links, but they have exclamation points in front. They work with references and titles too.\n\n![Google Logo](https://www.google.com/images/errors/logo_sm.gif) and ![Happy].\n\n[Happy]: https://wpclipart.com/smiley/happy/simple_colors/smiley_face_simple_green_small.png (\"Smiley face\")\n\n\nInline HTML\n-----------\n\nIf markdown is too limiting, you can just insert your own <strike>crazy</strike> HTML. Span-level HTML <u>can *still* use markdown</u>. Block level elements must be separated from text by a blank line and must not have any spaces before the opening and closing HTML.\n\n<div style='font-family: \"Comic Sans MS\", \"Comic Sans\", cursive;'>\nIt is a pity, but markdown does **not** work in here for most markdown parsers.\n[Marked] handles it pretty well.\n</div>\n";
};

SBN.addMarkdownHelperNote = function () {
    var position = SBN.findFreeSpace();
    var sNote = {
        title: '',
        description: SBN.__markdownQuickReference(),
        reminderTime: new Date(),
        reminderStatus: 'done',
        left: position.left,
        top: position.top,
        zIndex: 999
    };
    SBN.data.push(sNote);
    SBN.__config.requireSave = true;
    SBN.renderNotes();
};
