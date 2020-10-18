/*! sbn - v0.0.1 - 2020-10-18 */

$("document").ready(function(){SBN.populateSelect(".noteTimeYear",SBN.__yearList()),SBN.populateSelect(".noteTimeMonth",SBN.__monthList()),SBN.populateSelect(".noteTimeDay",SBN.__dayList(SBN.__yearList()[0].value,SBN.__monthList()[0].value)),SBN.populateSelect(".noteTimeHours",SBN.__hourList()),SBN.populateSelect(".noteTimeMinutes",SBN.__60List()),SBN.populateSelect(".noteTimeSeconds",SBN.__60List()),$("#addNoteModal .noteTimeYear").on("change",function(){var e=this.value,t=$("#addNoteModal .noteTimeMonth").val(),a=$("#addNoteModal .noteTimeDay").val();SBN.populateSelect("#addNoteModal .noteTimeDay",SBN.__dayList(e,t)),$("#addNoteModal .noteTimeDay").val(a)}),$("#addNoteModal .noteTimeMonth").on("change",function(){var e=this.value,t=$("#addNoteModal .noteTimeYear").val(),a=$("#addNoteModal .noteTimeDay").val();SBN.populateSelect("#addNoteModal .noteTimeDay",SBN.__dayList(t,e)),$("#addNoteModal .noteTimeDay").val(a)}),$("#editNoteModal .noteTimeYear").on("change",function(){var e=this.value,t=$("#editNoteModal .noteTimeMonth").val(),a=$("#editNoteModal .noteTimeDay").val();SBN.populateSelect("#editNoteModal .noteTimeDay",SBN.__dayList(e,t)),$("#editNoteModal .noteTimeDay").val(a)}),$("#editNoteModal .noteTimeMonth").on("change",function(){var e=this.value,t=$("#editNoteModal .noteTimeYear").val(),a=$("#editNoteModal .noteTimeDay").val();SBN.populateSelect("#editNoteModal .noteTimeDay",SBN.__dayList(t,e)),$("#editNoteModal .noteTimeDay").val(a)}),$("#addNewBtn").on("click",SBN.showAddNewModal),$("#addNoteModal").on("show.bs.modal",function(){SBN.__config.addNoteModalState=1}),$("#addNoteModal").on("shown.bs.modal",function(){$("#addNoteModal .noteTitle").focus()}),$("#addNoteModal").on("hidden.bs.modal",function(){SBN.__config.addNoteModalState=0}),$("#addNoteModal .createBtn").on("click",SBN.addStickyNote),$("#editNoteModal").on("show.bs.modal",function(){SBN.__config.editNoteModalState=1}),$("#editNoteModal").on("shown.bs.modal",function(){$("#editNoteModal .noteTitle").focus()}),$("#editNoteModal").on("hidden.bs.modal",function(){SBN.__config.editNoteModalState=0}),$("#editNoteModal .updateBtn").on("click",SBN.updateStickyNote),$("#currentTime").on("click",SBN.toggleTimeFormat),$("body").on("keyup",function(e){78===e.which&&0===SBN.__config.addNoteModalState&&0===SBN.__config.editNoteModalState&&SBN.showAddNewModal()}),"Notification"in window&&("granted"===Notification.permission?SBN.__config.notificationsEnabled=!0:"denied"!==Notification.permission&&Notification.requestPermission(function(e){"granted"===e&&(SBN.__config.notificationsEnabled=!0)})),SBN.fetchSBNData(),SBN.renderNotes(),SBN.updateTime(),setInterval(SBN.intervalJobs,1e3)}),SBN={data:[],__config:{intervalCount:0,requireSave:!1,deleteStage:{indexId:!1,stage:!1,lastUpdate:!1},addNoteModalState:0,editNoteModalState:0,notificationsEnabled:!1},config:{timeFormat:"24h"},intervalJobs:function(){SBN.__config.intervalCount++,3600<SBN.__config.intervalCount&&(SBN.__config.intervalCount=0),SBN.updateTime(),SBN.updateCountdownDisplays(),SBN.__config.requireSave&&(SBN.saveSBNData(),SBN.__config.requireSave=!1);var e,t=new Date,a=!1;for(e in SBN.data){"active"===SBN.data[e].reminderStatus&&new Date(SBN.data[e].reminderTime)<=t&&(SBN.data[e].reminderStatus="live",a=!0,SBN.__config.notificationsEnabled&&new Notification(SBN.data[e].title,{body:SBN.data[e].description}))}a&&(SBN.__config.requireSave=!0,SBN.renderNotes()),SBN.__config.intervalCount%10==0&&SBN.__config.deleteStage.lastUpdate&&1e4<Date.now()-SBN.__config.deleteStage.lastUpdate&&(SBN.__config.deleteStage.indexId=!1,SBN.__config.deleteStage.stage=!1,SBN.__config.deleteStage.lastUpdate=!1,SBN.renderNotes())},updateTime:function(){var e=new Date,t=e.getHours(),a=e.getMinutes(),o=e.getSeconds(),e="";"12h"===SBN.config.timeFormat&&(e=12<=t?" PM":" AM",12<t&&(t-=12),0===t&&(t=12));e=(t=t<10?"0"+t:t)+":"+(a=a<10?"0"+a:a)+":"+(o=o<10?"0"+o:o)+e;$("#currentTime").html(e)},updateCountdownDisplays:function(){var l=new Date;$(".countdown").each(function(e,t){var a,o,n=new Date($(t).attr("data-reminderTime")),i="",d=(d=Math.floor((n-l)/1e3))<0?0:d;i=Math.floor(d/86400)<4?(a=Math.floor(d/3600),d%=3600,o=Math.floor(d/60),d%=60,(a=a<10?"0"+a:a)+":"+(o=o<10?"0"+o:o)+":"+(d<10?"0"+d:d)):["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][n.getMonth()]+" "+n.getDate()+", "+n.getFullYear(),$(t).html(i)})},showAddNewModal:function(){$("#addNoteModal .noteTitle").val(""),$("#addNoteModal .noteDescription").val("");var e=new Date;$("#addNoteModal .noteTimeYear").val(e.getFullYear()),$("#addNoteModal .noteTimeMonth").val(e.getMonth()+1),$("#addNoteModal .noteTimeDay").val(e.getDate()),$("#addNoteModal .noteTimeHours").val(e.getHours()),$("#addNoteModal .noteTimeMinutes").val(e.getMinutes()),$("#addNoteModal .noteTimeSeconds").val(0),$("#addNoteModal .noteTimeMonth").trigger("change"),$("#addNoteModal").modal("show")},addStickyNote:function(){var e,t=$("#addNoteModal .noteTitle").val(),a=$("#addNoteModal .noteDescription").val(),o=$("#addNoteModal .noteTimeYear").val(),n=$("#addNoteModal .noteTimeMonth").val(),i=$("#addNoteModal .noteTimeDay").val(),d=$("#addNoteModal .noteTimeHours").val(),l=$("#addNoteModal .noteTimeMinutes").val(),r=$("#addNoteModal .noteTimeSeconds").val();if(isNaN(o)||isNaN(n)||isNaN(i)||isNaN(d)||isNaN(l)||isNaN(r))return!1;o=parseInt(o),n=parseInt(n),i=parseInt(i),d=parseInt(d),l=parseInt(l),r=parseInt(r),(0<t.length||0<a.length)&&(e="active",(r=new Date(o,n-1,i,d,l,r,0))<=new Date&&(e="done"),e={title:t,description:a,reminderTime:r,reminderStatus:e,left:(e=SBN.findFreeSpace()).left,top:e.top,zIndex:999},SBN.data.push(e),SBN.__config.requireSave=!0,$("#addNoteModal").modal("hide"),SBN.renderNotes())},pinStickyNote:function(){var e=$(this).attr("data-indexId");SBN.data[e]&&(SBN.data[e].pinned&&!0===SBN.data[e].pinned?SBN.data[e].pinned=!1:SBN.data[e].pinned=!0,SBN.__config.requireSave=!0,SBN.renderNotes())},deleteStickyNote:function(){var e=$(this).attr("data-indexId");SBN.__config.deleteStage.indexId===e?(!1===SBN.__config.deleteStage.stage?SBN.__config.deleteStage.stage=0:SBN.__config.deleteStage.stage++,SBN.__config.deleteStage.lastUpdate=Date.now(),1<SBN.__config.deleteStage.stage&&(SBN.data.splice(e,1),SBN.__config.requireSave=!0,SBN.__config.deleteStage.indexId=!1,SBN.__config.deleteStage.stage=!1,SBN.__config.deleteStage.lastUpdate=!1)):(SBN.__config.deleteStage.indexId=e,SBN.__config.deleteStage.stage=0,SBN.__config.deleteStage.lastUpdate=Date.now()),SBN.renderNotes()},showEditModal:function(e){isNaN(e)&&(e=$(this).attr("data-indexId"));var t=SBN.data[e];t&&($("#editNoteModal .noteIndexId").val(e),$("#editNoteModal .noteTitle").val(t.title),$("#editNoteModal .noteDescription").val(t.description),t=new Date(t.reminderTime),$("#editNoteModal .noteTimeYear").val(t.getFullYear()),$("#editNoteModal .noteTimeMonth").val(t.getMonth()+1),$("#editNoteModal .noteTimeDay").val(t.getDate()),$("#editNoteModal .noteTimeHours").val(t.getHours()),$("#editNoteModal .noteTimeMinutes").val(t.getMinutes()),$("#editNoteModal .noteTimeSeconds").val(t.getSeconds()),$("#editNoteModal .noteTimeMonth").trigger("change"),$("#editNoteModal").modal("show"))},updateStickyNote:function(){var e=$("#editNoteModal .noteIndexId").val(),t=$("#editNoteModal .noteTitle").val(),a=$("#editNoteModal .noteDescription").val(),o=$("#editNoteModal .noteTimeYear").val(),n=$("#editNoteModal .noteTimeMonth").val(),i=$("#editNoteModal .noteTimeDay").val(),d=$("#editNoteModal .noteTimeHours").val(),l=$("#editNoteModal .noteTimeMinutes").val(),r=$("#editNoteModal .noteTimeSeconds").val();if(isNaN(o)||isNaN(n)||isNaN(i)||isNaN(d)||isNaN(l)||isNaN(r))return!1;o=parseInt(o),n=parseInt(n),i=parseInt(i),d=parseInt(d),l=parseInt(l),r=parseInt(r),SBN.data[e]&&(0<t.length||0<a.length)&&(r=(l=new Date(o,n-1,i,d,l,r,0))<=new Date?"done":"active",SBN.data[e].title=t,SBN.data[e].description=a,SBN.data[e].reminderTime=l,SBN.data[e].reminderStatus=r,SBN.__config.requireSave=!0,$("#editNoteModal").modal("hide"),SBN.renderNotes())},__stickyNoteControls:function(e){var t=$("<div>").addClass("sControls"),a=$("<div>").addClass("leftControls"),o=$("<div>").addClass("centerControls"),n=$("<div>").addClass("rightControls"),i=$("<span>").addClass("glyphicon glyphicon-pushpin text-muted pinNote").attr("data-indexId",e),d=$("<span>"),l=$("<span>").addClass("glyphicon glyphicon-time text-muted reminderControl").attr("data-indexId",e),r=$("<span>").addClass("glyphicon glyphicon-edit text-muted editNote").attr("data-indexId",e),N=$("<span>").addClass("glyphicon glyphicon-remove text-muted deleteNote").attr("data-indexId",e);return SBN.data[e]&&SBN.data[e].pinned&&!0===SBN.data[e].pinned&&i.removeClass("text-muted").addClass("text-success"),!SBN.data[e]||"active"!==SBN.data[e].reminderStatus&&"live"!==SBN.data[e].reminderStatus||(l.removeClass("text-muted").addClass("text-success"),d.addClass("text-muted countdown").attr("data-reminderTime",SBN.data[e].reminderTime)),SBN.__config.deleteStage.indexId===e&&(0===SBN.__config.deleteStage.stage?N.removeClass("text-muted").addClass("text-warning"):1===SBN.__config.deleteStage.stage&&N.removeClass("text-muted").addClass("text-danger")),a.append(i),o.append(d),n.append(l).append(r).append(N),t.append(a).append(o).append(n),t},__sanitizeHTML:function(e){return"string"==typeof e&&DOMPurify.sanitize(e)},__processText:function(e){return"string"==typeof e&&(e=marked(e,{breaks:!0})),e},__stickyNote:function(e,t){var a=$("<div>").addClass("stickynote"),o=$("<div>").addClass("sTitle"),n=$("<div>").addClass("sDescription");return o.html(SBN.__sanitizeHTML(SBN.__processText(e.title))),n.html(SBN.__sanitizeHTML(SBN.__processText(e.description))),a.append(o).append(n).append(SBN.__stickyNoteControls(t)),e.pinned&&!1!==e.pinned||a.addClass("draggableStickyNote"),"live"===e.reminderStatus&&new Date(e.reminderTime)<=new Date&&a.addClass("reminderLive"),a},__renderNotePositions:function(){$(".stickynote").each(function(e,t){var a=$(t).position();SBN.data[e].left||(SBN.data[e].left=a.left,SBN.__config.requireSave=!0),SBN.data[e].top||(SBN.data[e].top=a.top,SBN.__config.requireSave=!0);e={left:SBN.data[e].left,top:SBN.data[e].top,zIndex:SBN.data[e].zIndex||0},e={left:e.left-a.left,top:e.top-a.top,zIndex:e.zIndex};$(t).css({position:"relative",height:$(t).height(),top:e.top+"px",left:e.left+"px","z-index":e.zIndex})})},renderNotes:function(){if($("#notesContainer").html(""),0<SBN.data.length){var e,t=SBN.data;for(e in t)$("#notesContainer").append(SBN.__stickyNote(t[e],e))}SBN.__renderNotePositions(),$(".draggableStickyNote").draggable({containment:"parent",stack:".stickynote",stop:SBN.saveNotePositions,cancel:".sControls"}),$(".sControls").on("click",".pinNote",SBN.pinStickyNote),$(".sControls").on("click",".reminderControl",SBN.reminderControl),$(".sControls").on("click",".deleteNote",SBN.deleteStickyNote),$(".sControls").on("click",".editNote",SBN.showEditModal)},saveNotePositions:function(){$(".stickynote").each(function(e,t){SBN.data[e].left=$(t).position().left,SBN.data[e].top=$(t).position().top,SBN.data[e].zIndex=$(t).css("z-index")}),SBN.__config.requireSave=!0},saveSBNData:function(){"undefined"!=typeof Storage&&(localStorage.setItem("SBNData",JSON.stringify(SBN.data)),localStorage.setItem("SBNConfig",JSON.stringify(SBN.config)))},fetchSBNData:function(){"undefined"!=typeof Storage&&(localStorage.getItem("SBNData")&&(SBN.data=JSON.parse(localStorage.getItem("SBNData"))),localStorage.getItem("SBNConfig")&&(SBN.config=JSON.parse(localStorage.getItem("SBNConfig"))))},toggleTimeFormat:function(){"24h"===SBN.config.timeFormat?SBN.config.timeFormat="12h":SBN.config.timeFormat="24h",SBN.__config.requireSave=!0,SBN.updateTime()},__yearList:function(){for(var e=[],t=2016;t<2026;t++)e.push({value:t,display:t});return e},__monthList:function(){for(var e=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],t=[],a=1;a<=12;a++)t.push({value:a,display:e[a-1]});return t},__dayList:function(e,t){if(isNaN(e)||isNaN(t))return!1;e=parseInt(e),t=parseInt(t);var a=31,o=[];-1<[4,6,9,11].indexOf(t)&&(a=30),2===t&&(a=e%4!=0||e%100==0&&e%400!=0?28:29);for(var n=1;n<=a;n++){var i=n<10?"0"+n:n.toString();o.push({value:n,display:i})}return o},__hourList:function(){for(var e=[],t=0;t<24;t++){var a=t<10?"0"+t:t.toString();e.push({value:t,display:a})}return e},__60List:function(){for(var e=[],t=0;t<60;t++){var a=t<10?"0"+t:t.toString();e.push({value:t,display:a})}return e},populateSelect:function(e,t){for(var a in $(e).html(""),t){var o=$("<option>");o.val(t[a].value),o.html(t[a].display),$(e).append(o)}return!0},reminderControl:function(){var e=$(this).attr("data-indexId"),t=SBN.data[e];t&&("done"===t.reminderStatus?SBN.showEditModal(e):"active"!==t.reminderStatus&&"live"!==t.reminderStatus||(SBN.data[e].reminderStatus="done",SBN.__config.requireSave=!0,SBN.renderNotes()))},__findRenderedNotesPosition:function(){var a=[];return $(".stickynote").each(function(e,t){a.push({x1:$(t).position().left,y1:$(t).position().top,x2:$(t).position().left+$(t).width()+5,y2:$(t).position().top+$(t).height()+5})}),a},__isEmpty:function(e,t){var a,o,n=!0;for(o in t)if(a=t[o],!(e.x2<a.x1||e.x1>a.x2||e.y2<a.y1||e.y1>a.y2)){n=!1;break}return n},__createGrid:function(e){var t,a=[];a.data=[],a.row_height=(e.y2-e.y1)/40,a.col_width=(e.x2-e.x1)/60;for(var o=SBN.__findRenderedNotesPosition(),n=0;n<40;n++){a.data[n]=[];for(var i=0;i<60;i++)t={x1:Math.floor(i*a.col_width+e.x1),y1:Math.floor(n*a.row_height+e.y1),x2:Math.floor(i*a.col_width+e.x1+a.col_width),y2:Math.floor(n*a.row_height+e.y1+a.row_height)},SBN.__isEmpty(t,o)?a.data[n][i]=0:a.data[n][i]=1}return a}},SBN.__maximalRectangle=function(d){function e(e,t,a,o){return a<=e||o<=t?0:(a-e)*(o-t)}for(var t=0,a=0,o=0,n=0,i=0;i<d.data.length;i++)for(var l=0;l<=d.data[i].length;l++)for(var r=i;r<d.data.length;r++)for(var N=l;N<d.data[r].length;N++)e(i,l,r,N)>e(t,a,o,n)&&(!function(e,t,a,o){for(var n=e;n<=a;n++)for(var i=t;i<=o;i++)if(1===d.data[n][i])return!1;return!0}(i,l,r,N)||(t=i,a=l,o=r,n=N));return{x1:t,y1:a,x2:o,y2:n}},SBN.findFreeSpace=function(){var e={x1:15,y1:60,x2:$("#notesContainer").width()+15,y2:$("#notesContainer").height()+60},t=SBN.__createGrid(e),a=SBN.__maximalRectangle(t),t={x1:Math.floor(a.y1*t.col_width+e.x1),y1:Math.floor(a.x1*t.row_height+e.y1),x2:Math.floor(a.y2*t.col_width+e.x1),y2:Math.floor(a.x2*t.row_height+e.y1)},e={};return e.left=t.x1,e.top=t.y1,e};