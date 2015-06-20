var zIndexLevel = {
    level: 0,
    topWindow: ''
}

var windowSpawn = {
    x: 0,
    y: 0
}

var popupID = {
    ID: 0
}

$('document').ready(function() {

    taskbar.setTaskMenu(true);

    $(window).on('resize', function() {
        windowResized();
    });

    $(this).bind('keydown', 'ctrl+shift+e', function() {
        windowManager.runProgram('Commander');
    });
    $(this).bind('keydown', 'ctrl+shift+a', function() {
        windowManager.runProgram('Code Editor');
    });

    document.oncontextmenu = function() {
        return false;
    }

    $('#desktop').on('contextmenu', function(e) {
        var options = [{
            option: 'Set Window Spawn',
            code: function(e) {
                windowSpawn.x = e.pageX;
                windowSpawn.y = e.pageY;
                var buttons = [{
                    text: 'Ok',
                    code: function() {
                        OSCore.newPopup('Test');
                    }
                }];
                OSCore.newPopup('The spawn point for new windows has been set to: ' + windowSpawn.x.toString() + ',' + windowSpawn.y.toString());
            }
        }];
        OSCore.newContextMenu(options, e);
    });
});



var taskbar = {
    setTaskMenu: function(resetTaskButton) {
        $('#mainmenu ul').empty();
        var programs = storageManager.loadPrograms();
        var defaulPrograms = this.loadDefaultPrograms();
        programs = programs.concat(defaulPrograms);
        this.setProgramList(programs);
        this.addEvents(resetTaskButton);
    },
    loadDefaultPrograms: function() {
        var defaulPrograms = ['Code Editor', 'Desktop Settings', 'Commander'];
        return defaulPrograms;
    },
    addProgram: function(programName) {
        programName = replaceChar(programName, '_', ' ');

        var defaultPrograms = this.loadDefaultPrograms();
        if (defaultPrograms.indexOf(programName) == -1) {
            $('#mainmenu ul').append('<li><span class="program">' + programName + '</span><span class="icon">&#xe60f;</span></li>');
        } else {
            $('#mainmenu ul').append('<li><span class="program">' + programName + '</span></li>');
        }
    },
    setProgramList: function(programs) {
        for (var i = 0; i < programs.length; i++) {
            this.addProgram(programs[i]);
        }
        windowResized();
    },
    addEvents: function(resetTaskButton) {
        function hideMenu() {
            $('#taskmenu #desc').fadeOut(200, function() {
                $('#taskmenu').width(50);
            });
            $('#mainmenu').hide();
        }
        if (resetTaskButton) {
            $('#taskmenu').on('mouseover', function() {
                if ($(this).width() == 50) {
                    $(this).width(110);
                    $('#taskmenu #desc').fadeIn(200);
                    $('#mainmenu').show();
                    zIndexLevel.level++;
                    zIndexLevel.topWindow = 'Taskbar';
                    console.log(zIndexLevel.level);
                    console.log(zIndexLevel.topWindow);
                    $('#taskbar').css('z-index', zIndexLevel.level.toString());
                    windowResized();
                }
            });
            $('#mainmenu').on('mouseleave', function() {
                hideMenu();
            });
        }
        $('#mainmenu ul li').on('click', function() {
            hideMenu();
            windowManager.runProgram($(this).children('span.program').text());
        });
        $('#mainmenu ul li span.icon').on('click', function(e) {
            e.stopPropagation();
            var programName = $(this).parent().children('span.program').text();
            var buttons = [{
                text: 'Delete',
                code: function() {
                    storageManager.deleteProgram(programName);
                    OSCore.newPopup('Program "' + programName + '" deleted');
                }
            }, {
                text: 'Cancel',
                code: function() {

                }
            }];
            windowManager.newDialog('Alert', 'Are you sure you want to permanently delete this program?', buttons);
        });
        $('#program-space .program-item').off('click');
        $('#program-space .program-item').on('click', function() {
            var windowName = $(this).attr('id');
            var programName = windowName.substring(5, windowName.length);
            if (!$('#pgrm-' + programName + '.minimized').length < 1) {
                if (programName == zIndexLevel.windowName) {
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
                option: 'Close',
                code: function() {
                    windowManager.stopProgram(programItem.text());
                }
            }, {
                option: 'Min/Max-imize',
                code: function() {
                    windowManager.minimizeWindow(programItem.text());
                }
            }];
            OSCore.newContextMenu(options, e);
        });
    },
    addTask: function(programName) {
        $('#program-space').append('<div id="icon-' + replaceChar(replaceChar(programName, '#', ''), ' ', '_') + '" class="program-item"><span>' + replaceChar(programName, '_', ' ') + '</span></div>');
        this.setTaskMenu(false);
    },
    removeTask: function(programName) {
        $('#program-space #icon-' + replaceChar(replaceChar(programName, '#', ''), ' ', '_')).remove();
    }
}

var OSCore = {
    newContextMenu: function(options, e) {
        if ($('#context-menu').length == 0) {
            var originalEvent = Object.create(e);
            $('#desktop').append('<div id="cover"></div>');
            var cover = $('#desktop #cover');
            $('#desktop').append('<div id="context-menu"><ul></ul></div>');
            var menuContainer = $('#desktop #context-menu');
            menuContainer.css('position', 'relative');
            var menu = $('#desktop #context-menu ul');
            for (var i = 0; i < options.length; i++) {
                menu.append('<li>' + options[i].option + '</li>');
            }
            if (e.pageY + menuContainer.height() < $('#desktop').height()) {
                menuContainer.offset({
                    left: e.pageX,
                    top: e.pageY
                });
            } else {
                menuContainer.offset({
                    left: e.pageX,
                    top: e.pageY - menuContainer.height()
                });
            }
            $('#desktop #context-menu ul li').on('click', function(e) {
                var clickedValue = $(this).text();
                var i = 0;
                while (options[i].option != clickedValue) {
                    i++;
                }
                cover.remove();
                menuContainer.remove();
                options[i].code(originalEvent);
            });
            cover.on('click', function(e) {
                cover.remove();
                menuContainer.remove();
            });
        }
    },
    newPopup: function(text, delay) {
        var id = this.addPopup(text);
        setTimeout(function() {
            OSCore.removePopup(id);
        }, delay ? delay : 4000);
    },
    addPopup: function(text) {
        var popupPane = $('#popup-pane');
        popupID.ID++;
        var popup = popupPane.append('<div id="popup-' + popupID.ID + '"class="jos-popup"><p>' + text + '</p></div>');
        popup.css('opacity', '0');
        this.formatPopups();
        popup.fadeTo(400, .9);
        return popupID.ID;
    },
    removePopup: function(id) {
        var thisPopup = $('#popup-pane #popup-' + id);
        thisPopup.fadeOut(4000, function() {
            thisPopup.remove();
            OSCore.formatPopups();
        });
    },
    formatPopups: function() {
        var popups = $('#popup-pane .jos-popup');
        var desktop = $('#desktop');
        var taskbar = $('#taskbar');
        var i = 0;
        var j = 0;
        popupArray = document.getElementsByClassName('jos-popup');
        while (i < popupArray.length) {
            popupArray[i].style.bottom = j;
            var temp = popupArray[i].style;
            temp.bottom = j.toString() + 'px';
            j += popupArray[i].offsetHeight + 5;
            i++;
        }
    }
}

var windowManager = {
    initWindow: function(thisWindow, prefix, draggable) {
        if (draggable) {
            $('#' + prefix + '-' + thisWindow).draggable({
                handle: '#hndl-' + thisWindow
            });
        }
        var container = $('#' + prefix + '-' + thisWindow);
        var desktop = $('#desktop');
        var handle = container.children('#hndl-' + thisWindow);
        var title = container.children('#ttle-' + thisWindow);
        var content = container.children('#cont-' + thisWindow);
        var closeButton = handle.children('#clos-' + thisWindow);
        if ((windowSpawn.x == 0 || windowSpawn.y == 0) || prefix == 'wndw') {
            container.offset({
                left: desktop.width() / 2 - container.width() / 2,
                top: desktop.height() / 2 - container.height() / 2
            });
        } else {
            container.offset({
                left: windowSpawn.x,
                top: windowSpawn.y
            });
        }
        handle.height(30);
        content.width(container.width() - 10);
        content.height(container.height() - 35);
        content.offset({
            left: container.offset().left + 5,
            top: container.offset().top + 30
        });
        handle.on('mousedown', function() {
            windowManager.bringToFront(thisWindow);
        });
        closeButton.on('click', function() {
            var program = $(this).parent().parent().attr('id');
            var programName = program.substring(5, program.length);
            windowManager.stopProgram(programName);
        });
        closeButton.offset({
            left: container.offset().left + container.width() - 20
        });

    },
    newWindow: function(windowName, isProgram, draggable) {
        windowName = replaceChar(windowName, ' ', '_');
        var prefix;
        if (isProgram) {
            prefix = 'pgrm';
        } else if (!isProgram) {
            prefix = 'wndw';
        }
        $('#desktop').append('<div id="' + prefix + '-' + windowName + '"class="window loaded"><div id="hndl-' + windowName + '" class="window-handle"><span id="ttle-' + windowName + '" class="window-title">' + replaceChar(windowName, '_', ' ') + '</span><span id="clos-' + windowName + '" class="window-close">&#xe60e;</span></div><div id="cont-' + windowName + '" class="window-content"></div></div>');
        windowManager.initWindow(windowName, prefix, draggable);
        windowManager.bringToFront(windowName);
        var newWindow = $('#' + prefix + '-' + windowName);
        $('#clos-' + windowName).on('click', function() {
            $(this).parent().parent().remove();
        });
        return newWindow;
    },
    minimizeWindow: function(programName) {
        //todo: code to minimize windows goes here.\
        programName = replaceChar(programName, ' ', '_');
        $('#pgrm-' + programName).toggleClass('minimized');
    },
    stopProgram: function(programName) {
        programName = replaceChar(programName, ' ', '_');
        if (this.checkIfOpen(programName)) {
            windowManager.closeWindow($('#pgrm-' + programName).attr('id').substring(5, this.length));
            DOMManager.removeScript(programName);
            taskbar.removeTask(programName);
        }
    },
    bringToFront: function(thisWindow) {
        zIndexLevel.level++;
        zIndexLevel.windowName = thisWindow;
        $('#pgrm-' + thisWindow).css('z-index', zIndexLevel.level.toString());
        $('#wndw-' + thisWindow).css('z-index', zIndexLevel.level.toString());
        console.log(zIndexLevel.level.toString());
        console.log(zIndexLevel.windowName);
    },
    runProgram: function(programName) {
        var programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
        var isOpen = windowManager.checkIfOpen(programName);
        if (!isOpen) {
            $('#desktop').append(
                '<div id="pgrm-' + programName + '"class="window loaded"><div id="hndl-' + programName + '" class="window-handle"><span id="ttle-' + programName + '" class="window-title">' + replaceChar(programName, '_', ' ') + '</span><span id="clos-' + programName + '" class="window-close">&#xe60e;</span></div><div id="cont-' + programName + '" class="window-content"></div></div>'
            );
            windowManager.initWindow(programName, 'pgrm', true);
            windowManager.bringToFront(programName);
            taskbar.addTask(programName);
            var code = storageManager.getText('pgrm-' + programName);
            DOMManager.insertScript(code, programName);
            DOMManager.runScript(programName, programName);
        } else {
            var buttons = [{
                text: 'Ok',
                code: function(e) {}
            }];
            windowManager.newDialog('Alert', 'The program is already running!', buttons);
        }
    },
    checkIfOpen: function(thisWindow) {
        if ($('#pgrm-' + thisWindow).length < 1) {
            return false;
        } else {
            return true;
        }
    },
    closeWindow: function(thisWindow) {
        thisWindow = replaceChar(thisWindow, ' ', '_');
        var windowToRemove = $('#pgrm-' + thisWindow);
        if (windowToRemove.length == 0) {
            windowToRemove = $('#wndw-' + thisWindow);
        }
        //if(this.checkIfOpen(thisWindow)) {
        windowToRemove.remove();
        //}
    },
    newDialog: function(title, text, buttons, cover) {
        var dialogName = new Date().getTime().toString() + replaceChar(title, ' ', '-');
        var dialog = this.newWindow(dialogName, false, true);
        thisDialog = $('#wndw-' + dialogName + ' .window-handle .window-title');
        thisDialog.text(title);
        this.initWindow(dialogName, 'wndw', true);
        var contentArea = $('#wndw-' + dialogName + ' .window-content');
        contentArea.append('<h3>' + text + '</h3>');
        for (var i = 0; i < buttons.length; i++) {
            var thisButton = contentArea.append('<button class="dialog-button">' + buttons[i].text + '</button>');
            var buttonAtI = buttons[i];
            var codeToExecute = buttonAtI.code;

        }
        var dialogButtons = $('#wndw-' + dialogName + ' .dialog-button');
        dialogButtons.on('click', function(e) {
            console.log(e);
            // codeToExecute();
            var lookFor = e.toElement.innerText;
            for (var j = 0; j < buttons.length; j++) {
                if (buttons[j].text == lookFor) {
                    $('#wndw-' + dialogName).remove();
                    buttons[j].code(e);
                    break;
                }
            }
        });
    },
    newControl: function(controlType, thisWindow, controlName, controlText, x, y, width, height) {
        thisWindow.children('.window-content').append('<' + controlType + ' id="' + controlName + '">' + controlText + '</' + controlType + '>');
        var element = $('#' + thisWindow.attr('id') + ' #' + controlName);
        var contentArea = thisWindow.children('.window-content');
        element.css('position', 'relative');
        element.width(width);
        element.height(height);
        element.offset({
            top: contentArea.offset().top + y,
            left: contentArea.offset().left + x
        });
        switch (controlType) {
            case 'textarea':
                element.css('resize', 'none');
                break;
        }
        return element;
    },
    addEvent: function(windowName, element, listenTo, code) {
        element.on(listenTo, function(e) {
            if ('pgrm-' + windowName == zIndexLevel.topWindow) {
                code(e);
            }
        });
    }

}

var DOMManager = {
    insertScript: function(script, programName) {
        programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
        $('body').append('<script id="scrp-' + programName + '">function ' + programName + '(thisWindow) {var thisWindow = $("#" + thisWindow.attr("id"));var contentArea = thisWindow.children(".window-content");' + script + '}</script>')
    },
    removeScript: function(programName) {
        programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
        $('body #scrp-' + programName).remove();
    },
    runScript: function(programName, windowAccess) {
        programName = replaceChar(replaceChar(programName, ' ', '_'), '#', '');
        window[programName]($('#pgrm-' + windowAccess));
        console.log($('#pgrm-' + windowAccess));
        console.log('this is it ^');
    },
    insertCssFromFile: function(programName) {
        var fileName = 'styl-' + programName;
        var styles = storageManager.getText(fileName);
        $('head').append('<style>' + styles + '</style>');
    },
    insertCss: function(css) {
        $('head').append('<style>' + css + '</style>');
    },
    insertHtmlFromFile: function(programName) {
        var fileName = 'html-' + programName;
        var html = storageManager.getText(fileName);
        $('#pgrm-' + programName + '.window-content').append(html);
    },
    insertHtml: function(html, insertWere) {
        if (insertWere.type == object) {
            insertWere.append(html);
        } else {
            $(insertWere).append(html);
        }
    }
}

var storageManager = {
    getText: function(keyString) {
        keyString = replaceChar(replaceChar(keyString, ' ', '_'), '#', '');
        switch (keyString) {
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
    setText: function(keyString, value) {
        localStorage.setItem(keyString, value);
    },
    checkExists: function(keyString) {

    },
    loadPrograms: function() {
        var programs = [];
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).substr(0, 4) == 'pgrm') {
                programs.push(localStorage.key(i).substr(5));
            }
        }
        return programs;
    },
    deleteProgram: function(programName) {
        localStorage.removeItem('pgrm-' + programName);
        taskbar.setTaskMenu(false);
    },
    getSetting: function(programName, settingName) {
        var settingString = localStorage.getItem('sting-' + programName);
        var location = settingString.indexOf(settingName);
        if (location != -1) {
            var i = 1;
            var end = settingString.substr(location + i, 1);
            while (end != '}') {
                i++;
                end = settingString.substr(location + i, 1);
            }
            return settingString.substring(location + settingName.length + 1, location + i - 1);
        } else {
            return '';
        }
    },
    setSetting: function(programName, settingName, settingValue) {
        // if (settingValue.type != String){
        // 	throw 'value passed to "setSetting" should be a string';
        // }
        var settingsName = 'stng-' + programName;
        if (localStorage.getItem(settingsName) == null) {
            localStorage.setItem(settingsName, '');
        }
        var settingString = localStorage.getItem('stng-' + programName);
        var location = settingString.indexOf(settingName);
        if (location != -1) {
            var i = 1;
            var end = settingString.substr(location + i, 1);
            while (end != '}') {
                i++;
                end = settingString.substr(location + i, 1);
            }
            var before = settingString.substring(0, location - 1);
            var after = settingString.substring(end + 1, settingString.length);
            // alert(before + ', ' + after);
            var newSettingString = before + settingValue + after;
            localStorage.setItem(settingsName, newSettingString);
            return settingValue;
        } else {
            var newSettingString = settingString + settingName + '{' + settingValue + '}';
            localStorage.setItem(settingsName, newSettingString);
            return settingValue;
        }
    }
}

function windowResized() {
    $('#time').offset({
        top: $('#taskbar').offset().top,
        left: $('#desktop').width() - 90
    });
    $('#time').height($('#taskbar').height());
    var desktop = $('#desktop');
    $('#taskbar').offset({
        top: desktop.offset().top + desktop.height() - $('#taskbar').height()
    });
    $('#mainmenu').height($('#mainmenu ul li').length * 38);
    if ($('#mainmenu').height() < 200) {
        $('#mainmenu').height(200);
    }
    $('#mainmenu').offset({
        top: desktop.offset().top + desktop.height() - $('#taskbar').height() - $('#mainmenu').height()
    });
    $('#program-space').height($('#taskbar').height());
    $('#program-space').width($('#taskbar').width() - 150);
    $('#program-space').offset({
        top: $('#taskbar').offset().top,
        left: $('#taskbar').offset().left + 150
    });
}

function startTime() {
    var currentDate = new Date();
    var timestring = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    $('#time').text(timestring);
}



function replaceChar(text, thisChar, replaceWith) {
    var textFound = text.indexOf(thisChar);
    var outputText = '';
    if (textFound == -1) {
        outputText = text;
    }
    while (textFound != -1) {
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
    windowManager.initWindow(thisWindow.attr('id').substring(5, thisWindow.attr('id').length, true, true), 'pgrm', true);
    windowManager.newControl("h4", thisWindow, "programNameLabel", "Program Name:", 5, 8, 120, 20);
    var programName = windowManager.newControl("input type='text'", thisWindow, "programName", "", 125, 5, 120, 20);
    var textArea = CodeMirror(contentArea[0]);
    //textArea = $(textArea);
    var saveButton = windowManager.newControl("button", thisWindow, "saveBtn", "Save", contentArea.width() - 55, contentArea.height() - 28, 70, 20)
        .on('click', function() {
            storageManager.setText('pgrm-' + programName.val(), textArea.getValue());
            taskbar.setTaskMenu(false);
        });
    var loadButton = windowManager.newControl("button", thisWindow, "loadBtn", "Load", 5, contentArea.height() - 28, 70, 20)
        .on('click', function() {
            //textArea.setValue(storageManager.getText('pgrm-' + programName.val()));
            loadProgram();
        });

    function loadProgram() {
        windowManager.newWindow('Select Program', false, true);
        var newWindow = $('#wndw-Select_Program');
        console.log(newWindow.length);
        console.log(newWindow);
        var contentArea = newWindow.children('.window-content');
        contentArea.append('<div id="program-list-container"><ul id="program-list"></ul></div>');
        var list = $('#program-list');
        var programList = storageManager.loadPrograms();
        for (var i = 0; i < programList.length; i++) {
            list.append('<li><span>' + programList[i] + '</span></li>');
        }
        $('#program-list li').on('click', function(e) {
            var program = $(this).text();
            textArea.setValue(storageManager.getText('pgrm-' + program));
            $('#programName').val(program);
            windowManager.closeWindow('Select Program');
        });
    }
}

function desktopSettings(thisWindow, contentArea) {
    var interfaceHtml = '<label for="instance-name">Instance Name:</label><input id="instance-name" type="text"><button id="desktop-settings-submit" style="position:absolute; bottom:0px;right:0px;">Save</button>';
    contentArea.append(interfaceHtml);
    $('#desktop-settings-submit').on('click', function(e) {
        var instanceName = $('instance-name').val();
        storageManager.setSetting('instance-name', 'instance-name', instanceName);
    });
}

function settingTest(thisWindow, contentArea) {
    storageManager.setSetting('settingTest', 'Test1', 'test');
}

function commander(thisWindow, contentArea) {
    var content = '<div id="prompt"><div id="prompt-output" style="text-align:left;"></div><input type="text" style="position:absolute;"></input></div>';
    contentArea.append(content);
    contentArea.css('background-color', 'black');
    contentArea.on('click', function() {
        $('#prompt input[type="text"]').focus();
    });
    var enteredString = '';
    var prompt = $('#prompt');
    var promptInput = $('#prompt input');
    var lastCommand = '';
    promptInput.focus();
    // promptIput.offset({top: contentArea.offset().top + contentArea.height() - 15});
    promptInput.on('keypress', function(e) {
        if (e.keyCode == 13) {
            var input = IO.input();
            try {
                commands[input.command.toLowerCase()](input.argument);
            } catch (error) {
                IO.print('Uhho.. Something is wrong with your command. I suggest you fix it..');
            }
            lastCommand = promptInput.val();
            promptInput.val('');
        } else if (e.keyCode == 92) {
            promptInput.val(lastCommand);
            e.preventDefault();
        }
    });
    var commands = {
        echo: function(text) {
            if (text != '' || text != undefined) {
                IO.print(text);
            }
        },
        debug: function(text) {
            if (text == 'true') {
                document.oncontextmenu = function() {}
                IO.print('Debuging is enabled, default context menu will show.');
            } else if (text == 'false') {
                document.oncontextmenu = function() {
                    return false;
                }
                IO.print('Debuging is disabled, default context menu will not show.');
            } else {
                IO.print('Boolean value required!');
            }
        },
        clear: function() {
            $('#prompt #prompt-output span').remove();
        },
        exit: function() {
            windowManager.stopProgram('Commander');
        },
        background: function(backgroundImage) {
            $('#desktop').css('background-image', 'url(file:///C:/Users/Joe%20Pfeiffer%20LC/Dropbox/J-OS/img/' + backgroundImage + ')');
            IO.print('Background set to ' + backgroundImage);
        },
        run: function(programToRun) {
            windowManager.runProgram(programToRun);
        },
        kill: function(programToKill) {
            windowManager.stopProgram(programToKill);
        },
        programs: function() {
            var programs = storageManager.loadPrograms();
            for (var i = 0; i < programs.length; i++) {
                IO.print(programs[i]);
            }
        }
    }
    var IO = {
        print: function(text) {
            $('#prompt-output').append('<span>' + text + '</span>');
        },
        input: function() {
            var inputValue = $('#prompt input').val();
            var space = inputValue.indexOf(' ');
            var inputCommand = {};
            if (space != -1) {
                inputCommand.command = inputValue.substring(0, space);
                inputCommand.argument = inputValue.substring(space + 1, inputValue.length);
            } else {
                inputCommand.command = inputValue;
                inputCommand.argument = '';
            }
            return inputCommand;
        }
    }
}