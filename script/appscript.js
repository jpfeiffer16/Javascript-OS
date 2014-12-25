$('document').ready(function() {
//	for(var i = 0; i < 7; i++) {
//		$('#mainmenu ul').append('<li>Program #' + i + '</li>');
//	}
    

    desktop.setTaskMenu();

	$(window).on('resize', function() {
		windowResized();
	});

	$('#taskmenu').click(function() {
		if($(this).width() == 50) {
			$(this).width(110);
			$('#taskmenu #desc').fadeIn(200);
			$('#mainmenu').show();
			windowResized();
		} else {
			$('#taskmenu #desc').fadeOut(200, function() {$('#taskmenu').width(50);});
			$('#mainmenu').hide();
		}
	});
    
    $('#mainmenu ul li').on('click', function() {
        windowManager.runProgram($(this).text());
    });
});



var desktop = {
	setTaskMenu : function () {
		var programs = storageManager.loadPrograms();
		var defaulPrograms = this.loadDefaultPrograms();
		programs = programs.concat(defaulPrograms);
    	this.setProgramList(programs);
	},
	loadDefaultPrograms : function () {
		// alert('Test');
		var defaulPrograms = ['Code Editor', 'Desktop Settings']; 
		return defaulPrograms;
	},
	addProgram : function(programName) {
		$('#mainmenu ul').append('<li>' + replaceChar(programName, '_', ' ') + '</li>');
	},
    setProgramList : function(programs) {
        for(var i = 0; i < programs.length; i++) {
            this.addProgram(programs[i]);
        }
        windowResized();
    }
}


var windowManager = {
	initWindow : function(thisWindow, draggable) {
		if(draggable) {
			$('#pgrm-' + thisWindow).draggable({handle: '#hndl-' + thisWindow});
		}
		var container = $('#pgrm-' + thisWindow);
		var desktop = $('#desktop');
		var handle = container.children('#hndl-' + thisWindow);
		var title = container.children('#ttle-' + thisWindow);
		var content = container.children('#cont-' + thisWindow);
		var closeButton = handle.children('#clos-' + thisWindow);
		container.offset({left : desktop.width() / 2 - container.width()/2 , top : desktop.height() / 2 - container.height()/2})
		handle.height(30);
		content.width(container.width() - 10);
		content.height(container.height() - 35);
		content.offset({left : container.offset().left + 5, top : container.offset().top + 30});
		closeButton.on('click', function() {
			windowManager.closeWindow($(this).parent().parent().attr('id').substring(5, this.length));
			DOMManager.removeScript(thisWindow);
		});
		closeButton.offset({left : container.offset().left + container.width() - 20});

	},
	runProgram : function(programName) {
		var programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
	   	var isOpen = windowManager.checkIfOpen(programName);
	   	if(!isOpen) {
		    $('#desktop').append(
		        '<div id="pgrm-' + programName + '"class="window"><div id="hndl-' + programName + '" class="window-handle"><span id="ttle-' + programName + '" class="window-title">' + replaceChar(programName, '_', ' ') + '</span><span id="clos-' + programName + '" class="window-close">&#xe60e;</span></div><div id="cont-' + programName + '" class="window-content"></div></div>'
		    );
		    windowManager.initWindow(programName, true);
		} else {
			windowManager.newDialog('Alert', 'The program is already running!');
		}
		var code = storageManager.getText('pgrm-' + programName);
		DOMManager.insertScript(code, programName);
		DOMManager.runScript(programName, programName);
	},
	checkIfOpen : function(thisWindow) {
		if($('#pgrm-' + thisWindow).length < 1) {
			return false;
		} else {
			return true;
		}
	},
	closeWindow : function(thisWindow) {
		$('#pgrm-' + thisWindow).remove();
		//TODO: Remove dynamicaly loaded javascript asociated with the program
	},
	newDialog : function(title, text) {
		var temp = new Date();
		var programName = temp.getTime().toString();
		//var programName = replaceChar(replaceChar(id.toString(), ' ', '_'), '#', '');
	    
	    $('#desktop').append(
	        '<div id="pgrm-' + programName + '"class="window"><div id="hndl-' + programName + '" class="window-handle"><span id="ttle-' + programName + '" class="window-title">' + title + '</span><span id="clos-' + programName + '" class="window-close">&#xe60e;</span></div><div id="cont-' + programName + '" class="window-content"><span style="position: relative;top : 50px;">' + text + '</span><button class="button" id="ok-button" style="position:relative">Ok</button></div></div>'
	    );
	    windowManager.initWindow(programName, false);
        var code = storageManager.getText('dialog');
        DOMManager.insertScript(code, 'f' + programName);
        DOMManager.runScript('f' + programName, programName);
	},
	newControl : function(controlType, thisWindow, controlName, controlText, x, y ,width, height) {
		thisWindow.children('.window-content').append('<' + controlType + ' id="' + controlName + '">' + controlText + '</' + controlType + '>');
		var element = $('#' + thisWindow.attr('id') + ' #' + controlName);
		var contentArea = thisWindow.children('.window-content');
		element.css('position','relative');
		element.width(width);
		element.height(height);
		element.offset({top : contentArea.offset().top + y, left : contentArea.offset().left + x});
		switch(controlType) {
			case 'textarea':
				element.css('resize', 'none');
				break;
		}
		return element;
	}

}

var DOMManager = {
	insertScript : function(script, programName) {
		programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
		$('body').append('<script id="scrp-' + programName + '">function ' + programName + '(thisWindow) {var thisWindow = $("#" + thisWindow.attr("id"));var contentArea = thisWindow.children(".window-content");' + script + '}</script>')
	},
	removeScript : function(programName) {
		programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
		$('body').remove('#scrp-' + programName);
	},
	runScript : function(programName, windowAccess) {
		programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
		window[programName]($('#pgrm-' + windowAccess));
		console.log($('#pgrm-' + windowAccess));
        console.log('this is it ^');
	}
}

var storageManager = {
	getText : function(keyString) {
        keyString = replaceChar(replaceChar(keyString, ' ', '_'),'#', '' );
        switch(keyString) {
        	case 'dialog':
			  	return "console.log(thisWindow.attr('id'));var windowWidth = thisWindow.width();console.log(windowWidth);var windowHeight = thisWindow.height();var button = thisWindow.children('#ok-button');button.height(50);button.width(windowWidth * .5);button.offset({left : thisWindow.offset().left + (windowWidth/2 - button.width()/2), top : thisWindow.offset().top + windowHeight - 60});";
        		break;
        	case 'pgrm-Code_Editor':
        		return 'codeEditor(thisWindow, contentArea);';
        		break;	
        	case 'pgrm-Desktop_Settings':
        		return 'desktopSettings(thisWindow, contentArea);';
        		break;
        	default: 
        		var code = localStorage.getItem(keyString);
		    	return code;
		    	break;
        }
	},
    setText : function(keyString, value) {
        localStorage.setItem(keyString, value);
    },
    checkExists : function(keyString) {
        
    },
    loadPrograms : function() {
        var programs = [];
        for(var i = 0; i < localStorage.length; i++) {
            programs.push(localStorage.key(i).substr(5));   
        }
        return programs;
    }
}

function windowResized() {
    $('#time').offset({top : $('#taskbar').offset().top, left : $('#desktop').width() - 90});
	$('#time').height($('#taskbar').height());
	var desktop = $('#desktop');
	$('#taskbar').offset({top : desktop.offset().top + desktop.height() - $('#taskbar').height()});
	$('#mainmenu').height($('#mainmenu ul li').length * 38);
	if($('#mainmenu').height() < 200) {
		$('#mainmenu').height(200);
	}
	$('#mainmenu').offset({top : desktop.offset().top + desktop.height() - $('#taskbar').height() - $('#mainmenu').height()});
}

function startTime() {
	var currentDate = new Date();
	var timestring = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
	$('#time').text(timestring);
}



function replaceChar(text, thisChar, replaceWith) {
	var textFound = text.indexOf(thisChar);
	var outputText  = '';
    if(textFound == -1) {
        outputText = text;
    }
	while(textFound != -1) {
		var before = text.substring(0, textFound);
		var after = text.substring(textFound + thisChar.length, text.length);
		outputText = before + replaceWith + after;
		textFound = outputText.indexOf(thisChar);
	}
	return outputText;
}



function codeEditor(thisWindow, contentArea) {
    thisWindow.width(800);
    thisWindow.height(500);
    windowManager.initWindow(thisWindow.attr('id').substring(5,thisWindow.attr('id').length));
    windowManager.newControl("h4", thisWindow, "programNameLabel", "Program Name:", 5, 8, 120, 20);
    var programName = windowManager.newControl("input type='text'", thisWindow, "programName", "", 125, 5, 120, 20);
	var textArea = CodeMirror(contentArea[0]);
    //textArea = $(textArea);
	var saveButton = windowManager.newControl("button", thisWindow, "saveBtn", "Save", contentArea.width()-55, contentArea.height() -28, 70, 20)
    .on('click', function() {
        storageManager.setText('pgrm-' + programName.val(), textArea.getValue());
    });
    var loadButton = windowManager.newControl("button", thisWindow, "loadBtn", "Load", 5, contentArea.height() -28, 70, 20)
    .on('click', function() {
        textArea.setValue(storageManager.getText('pgrm-' + programName.val()));
    });
}

function desktopSettings(thisWindow, contentArea) {
	windowManager.newControl('h4', thisWindow, 'lbl', 'Background Image Name:', 5, 10, 200, 20);

	var imageName = windowManager.newControl('input type="text"', thisWindow, 'imgName', '', 5, 30, 200, 20);

	var btnSave = windowManager.newControl('button', thisWindow, 'btnSave', 'Save', thisWindow.width() - 60, thisWindow.height() - 30, 40, 20);

	var currentImage = $('#desktop').css('background-image');

	var char = currentImage.substring(currentImage.length - 1, currentImage.length);
	var i = 0;
	while(char != '/') {
	  i = i + 1;
	  char = currentImage.substr(currentImage.length - i, 1);
	}
	currentImage = currentImage.substring(i, currentImage.length - 1);

	imageName.val(currentImage);
}