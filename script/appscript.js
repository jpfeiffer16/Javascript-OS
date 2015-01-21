var zIndexLevel = {
	level : 0,
	topWindow : ''
}
$('document').ready(function() {

    taskbar.setTaskMenu(true);
    
    $(window).on('resize', function() {
        windowResized();
    });

    $(this).bind('keydown', 'ctrl+shift+e', function() {
    	windowManager.runProgram('Commander');
    });

    document.oncontextmenu = function() {return false;}

    $('#desktop').on('contextmenu', function(e) {
    	var options = [{
    		option : 'Desktop Settings',
    		code : function(){
    			alert('desktop settings');
    		}
    	}];
    	var result = OSCore.newContextMenu(options, e);
    });
});



var taskbar = {
	setTaskMenu : function (resetTaskButton) {
        $('#mainmenu ul').empty();
		var programs = storageManager.loadPrograms();
		var defaulPrograms = this.loadDefaultPrograms();
		programs = programs.concat(defaulPrograms);
    	this.setProgramList(programs);
        this.addEvents(resetTaskButton);
	},
	loadDefaultPrograms : function () {
		var defaulPrograms = ['Code Editor', 'Desktop Settings', 'Commander']; 
		return defaulPrograms;
	},
	addProgram : function(programName) {
		$('#mainmenu ul').append('<li>' + replaceChar(programName, '_', ' ') + '</li>');
	},
    setProgramList : function(programs) {
        for(var i = 0; i < programs.length; i++) {
            this.addProgram(programs[i]);
        }
        windowResized();    },
    addEvents : function(resetTaskButton) {
        if(resetTaskButton) {
            $('#taskmenu').on('mouseover', function() {
                if($(this).width() == 50) {
                    $(this).width(110);
                    $('#taskmenu #desc').fadeIn(200);
                    $('#mainmenu').show();
                    windowResized();
                }
            });
            $('#mainmenu').on('mouseleave', function() {
            	$('#taskmenu #desc').fadeOut(200, function() {$('#taskmenu').width(50);});
                $('#mainmenu').hide();
            });
        }
        $('#mainmenu ul li').on('click', function() {
            windowManager.runProgram($(this).text());
        });
        $('#program-space .program-item').off('click');
        $('#program-space .program-item').on('click', function() {
            var windowName = $(this).attr('id');
            var programName = windowName.substring(5, windowName.length);
            if(!$('#pgrm-' + programName + '.minimized').length < 1){
                if(programName == zIndexLevel.windowName) {
                    windowManager.minimizeWindow(programName);
                } else {
                    windowManager.bringToFront(programName);
                }
            } else {
                windowManager.minimizeWindow(programName);
            }
        });
        $('#program-space .program-item').on('contextmenu', function(e) {
        	var programItem = $(this);
        	var options = [{
        		option : 'Close',
        		code : function() {windowManager.stopProgram(programItem.text())}
        	},
        	{
        		option : 'Min/Max-imize',
        		code : function() {windowManager.minimizeWindow(programItem.text())}
        	}];
        	OSCore.newContextMenu(options, e);
        	// program = $(this).attr('id');
        	// programName = program.substring(5, program.length);
        	// windowManager.stopProgram(programName);
        });
    },
    addTask : function(programName) {
        $('#program-space').append('<div id="icon-' + replaceChar(replaceChar(programName, '#', ''), ' ', '_') + '" class="program-item"><span>' + replaceChar(programName, '_', ' ') + '</span></div>');
        this.setTaskMenu(false);
    },
    removeTask : function(programName) {
        $('#program-space #icon-' + replaceChar(replaceChar(programName, '#', ''), ' ', '_')).remove();
    }
}

var OSCore = {
	newContextMenu : function(options, e) {
		// cover.css('position', 'absolute');
		// cover.css('width', '100%');
		// cover.css('height', '100%');
		//cover.css('background-color', 'red');
		if($('#context-menu').length == 0) {
			$('#desktop').append('<div id="cover"></div>');
			var cover = $('#desktop #cover');
			$('#desktop').append('<div id="context-menu"><ul></ul></div>');
			var menuContainer = $('#desktop #context-menu');
			menuContainer.css('position', 'relative');
			var menu = $('#desktop #context-menu ul');
			for(var i = 0; i < options.length; i++) {
				menu.append('<li>' + options[i].option + '</li>');
			}
			if(e.pageY + menuContainer.height() < $('#desktop').height()) {
				menuContainer.offset({left: e.pageX, top: e.pageY});
			} else {
				menuContainer.offset({left: e.pageX, top: e.pageY - menuContainer.height()});
			}
			$('#desktop #context-menu ul li').on('click', function(e) {
				var clickedValue = $(this).text();
				var i = 0;
				while(options[i].option != clickedValue) {
					i++
				}
				cover.remove();
				menuContainer.remove();
				options[i].code();
			});
			cover.on('click', function(e) {
				cover.remove();
				menuContainer.remove();
			});
		}
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
		handle.on('mousedown', function() {
            windowManager.bringToFront(thisWindow);
		});
		closeButton.on('click', function() {
            var program = $(this).parent().parent().attr('id');
            var programName = program.substring(5, program.length);
			windowManager.stopProgram(programName);
		});
		closeButton.offset({left : container.offset().left + container.width() - 20});

	},
    minimizeWindow : function(programName) {
        //todo: code to minimize windows goes here.\
        $('#pgrm-' + programName).toggleClass('minimized');
    },
    stopProgram : function(programName) {
        if(this.checkIfOpen(programName)) {
            windowManager.closeWindow($('#pgrm-' + programName).attr('id').substring(5, this.length));
            DOMManager.removeScript(programName);
            taskbar.removeTask(programName);
        }
    },
    bringToFront : function(thisWindow) {
        zIndexLevel.level++;
        zIndexLevel.windowName = thisWindow;
        $('#pgrm-' + thisWindow).css('z-index', zIndexLevel.level.toString());
        console.log(zIndexLevel.level.toString());
        console.log(zIndexLevel.windowName);
    },
	runProgram : function(programName) {
		var programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
	   	var isOpen = windowManager.checkIfOpen(programName);
	   	if(!isOpen) {
		    $('#desktop').append(
		        '<div id="pgrm-' + programName + '"class="window loaded"><div id="hndl-' + programName + '" class="window-handle"><span id="ttle-' + programName + '" class="window-title">' + replaceChar(programName, '_', ' ') + '</span><span id="clos-' + programName + '" class="window-close">&#xe60e;</span></div><div id="cont-' + programName + '" class="window-content"></div></div>'
		    );
		    windowManager.initWindow(programName, true);
            taskbar.addTask(programName);
            windowManager.bringToFront(programName);
		} else {
			windowManager.newDialog('Alert', 'The program is already running!');
		}
		var code = storageManager.getText('pgrm-' + programName);
		DOMManager.insertScript(code, programName);
		var result = DOMManager.runScript(programName, programName);
		return result;
	},
	checkIfOpen : function(thisWindow) {
		if($('#pgrm-' + thisWindow).length < 1) {
			return false;
		} else {
			return true;
		}
	},
	closeWindow : function(thisWindow) {
        var window = $('#pgrm-' + thisWindow);
        if(this.checkIfOpen(thisWindow)) {
            window.remove();
        }
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
	},
	addEvent : function(windowName, element, listenTo, code) {
		element.on(listenTo, function(e) {
			if('pgrm-' + windowName == zIndexLevel.topWindow) {
				code(e);
			}
		});
	}

}

var DOMManager = {
	insertScript : function(script, programName) {
		programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
		$('body').append('<script id="scrp-' + programName + '">function ' + programName + '(thisWindow) {var thisWindow = $("#" + thisWindow.attr("id"));var contentArea = thisWindow.children(".window-content");' + script + '}</script>')
	},
	removeScript : function(programName) {
		programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
		$('body #scrp-' + programName).remove();
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
        	case 'pgrm-Commander':
        		return 'commander(thisWindow, contentArea);';
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
        	if(localStorage.key(i).substr(0,4) == 'pgrm') {
            	programs.push(localStorage.key(i).substr(5));
        	}
        }
        return programs;
    },
    getSetting : function(programName, settingName) {
    	var settingString = localStorage.getItem('sting-' + programName);
    	var location = settingString.indexOf(settingName);
    	if(location != -1) {
    		var i = 1;
    		var end = settingString.substr(location + i, 1);
    		while(end != '}') {
    			i++;
    			end = settingString.substr(location + i, 1);
    		}
    		return setting = settingString.substring(location + settingName.length + 1, end - 1);
    	} else {
    		return '';
    	}
    },
    setSetting : function(programName, settingName, settingValue) {
    	// if (settingValue.type != String){
    	// 	throw 'value passed to "setSetting" should be a string';
    	// }
    	if (localStorage.getItem('stng-' + programName) == null) {
    		localStorage.setItem('stng-' + programName, '');
    	}
    	var settingString = localStorage.getItem('stng-' + programName);
    	var location = settingString.indexOf(settingName);
    	if(location != -1) {
    		var i = 1;
    		var end = settingString.substr(location + i, 1);
    		while(end != '}') {
   				i++;
    			end = settingString.substr(location + i, 1);
    		}
    		var before = settingString.substring(0, location - 1);
    		var after = settingString.substring(end + 1, settingString.length);
    		var newSettingString = before + settingValue + after;
    		localStorage.setItem('stng-' + programName, newSettingString);
    		return settingValue;
    	} else {
    		var newSettingString = settingString + settingName + '{' + settingValue + '}';
    		localStorage.setItem('stng-' + programName, newSettingString);
    		return settingValue;
    	}
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
    $('#program-space').height($('#taskbar').height());
    $('#program-space').width($('#taskbar').width() - 150);
    $('#program-space').offset({top: $('#taskbar').offset().top, left: $('#taskbar').offset().left + 150});
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
        taskbar.setTaskMenu(false);
    });
    var loadButton = windowManager.newControl("button", thisWindow, "loadBtn", "Load", 5, contentArea.height() -28, 70, 20)
    .on('click', function() {
        textArea.setValue(storageManager.getText('pgrm-' + programName.val()));
    });
}

function desktopSettings(thisWindow, contentArea) {
	windowManager.addEvent(thisWindow, $(document), 'keydown', function(e) {
    	alert(e.key);
    });
	windowManager.newControl('h4', thisWindow, 'lbl', 'Background Image Name:', 5, 10, 200, 20);

	//var imageName = windowManager.newControl('input type="text"', thisWindow, 'imgName', '', 5, 30, 200, 20);

	var btnSave = windowManager.newControl('button', thisWindow, 'btnSave', 'Save', thisWindow.width() - 60, thisWindow.height() - 30, 40, 20);

	var currentImage = $('#desktop').css('background-image');

	var char = currentImage.substring(currentImage.length - 1, currentImage.length);
	var i = 0;
	while(char != '/') {
	  i = i + 1;
	  char = currentImage.substr(currentImage.length - i, 1);
	}
	currentImage = currentImage.substring(currentImage.length - i, currentImage.length - 1);

	//imageName.val(currentImage);
}

function settingTest(thisWindow, contentArea) {
	alert('getting here!');
	storageManager.setSetting('settingTest', 'Test1', 'test');
}

function commander(thisWindow, contentArea) {
	var content = '<div id="prompt"><div id="prompt-output" style="text-align:left;"></div><input type="text" style="position:absolute;"></input></div>';
	contentArea.append(content);
	contentArea.css('background-color', 'black');
	var enteredString = '';
	var prompt = $('#prompt');
	var promptInput = $('#prompt input');
	promptInput.focus();
	// promptIput.offset({top: contentArea.offset().top + contentArea.height() - 15});
	promptInput.on('keypress', function(e) {
		if(e.keyCode == 13) {
			var input = IO.input();
			try {
				commands[input.command.toLowerCase()](input.argument);
			} catch(error) {
				IO.print('Uhho.. Something is wrong with your command. I suggest you fix it..');
			}
			promptInput.val('');
		}
	});
	var commands = {
		echo : function(text) {
			if(text != '' || text != undefined) {
				IO.print(text);
			}
		},
		debug : function(text) {
			if(text == 'true') {
				document.oncontextmenu = function() {}
				IO.print('Debuging is enabled, default context menu will show.');
			} else if(text == 'false') {
				document.oncontextmenu = function() {return false;}
				IO.print('Debuging is disabled, default context menu will not show.');
			} else {
				IO.print('Boolean value required!');
			}
		},
		clear : function() {
			$('#prompt #prompt-output span').remove();
		},
		exit : function() {
			windowManager.stopProgram('Commander');
		},
		background : function(backgroundImage) {
			$('#desktop').css('background-image', 'url(file:///C:/Users/Joe%20Pfeiffer%20LC/Dropbox/J-OS/img/' + backgroundImage + ')');
			IO.print('Background set to ' + backgroundImage);
		}
	}
	var IO = {
		print : function(text) {
			$('#prompt-output').append('<span>' + text + '</span>');
		},
		input : function() {
			var inputValue = $('#prompt input').val();
			var space = inputValue.indexOf(' ');
			var inputCommand = {};
			if(space != -1) {
				inputCommand.command = inputValue.substring(0, space);
				inputCommand.argument = inputValue.substring(space + 1, inputValue.length);
			} else {
				inputCommand.command = inputValue;
				inputCommand.argument = '';
			}
			//alert(inputCommand.command +  inputCommand.argument);
			return inputCommand;
		}
	}
}