/// <reference path="./widgets.js" />

/**
 * Populates the configuration editor in the 'Execute' panel with this default data
 */
 function getDefaultConfiguration() {
    return {
        beltSpeed: 100,
        beltAcceleration: 100,
        sawToZero: 100,
        instructions: [200, 100, 300],
        instructionIndex: 0,
    }
}

/**
 * Constructs the editor that you see above the play/stop buttons in the 'Execute' panel
 * @param {Object} pConfiguration editable configuration 
 */
 function buildEditor(pConfiguration) {
    const lEditorWrapper = $('<div>').addClass('configuration-editor');
        beltSpeedEditor = numericInput('Belt Speed', pConfiguration.beltSpeed, function(pValue) {
            pConfiguration.beltSpeed = pValue;
        }).appendTo(lEditorWrapper);
        beltAccelerationEditor = numericInput('Belt Acceleration', pConfiguration.beltAcceleration, function(pValue) {
            pConfiguration.beltAcceleration = pValue;
        }).appendTo(lEditorWrapper);
        sawToZeroEditor = numericInput('Saw to 0 Length', pConfiguration.sawToZero, function(pValue) {
            pConfiguration.sawToZero = pValue;
        }).appendTo(lEditorWrapper);

    return lEditorWrapper;
}

/**
 * Helper function that publishes a message to the python server while the application
 * is executing.
 *  
 * @param {String} pTopic Topic to publish to 
 * @param {String} pMessage Message to publish to that topic 
 */
function sendSoftwareMessage(pTopic, pMessage) {
    var lMessage = { topic: pTopic, message: pMessage };
    fetch('/run/message', { 
        method: 'POST', 
        body: JSON.stringify(lMessage),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(function(pResponse) {
        if (pResponse.status === 200) {
            return true;
        } else {
            return false;
        }
    }).catch(function(pReason) {
        console.exception('Failed to process request', pReason);
        return false;
    });
}

/**
 * Message received from the Notifier on the backend
 * @param {NotificationLevel} pLevel
 * @param {string} pMessageStr 
 * @param {Object | None} pMessagePayload 
 */
function onNotificationReceived(pLevel, pMessageStr, pMessagePayload) {
    const lCustomContainer = $('#custom-container');
    if (pLevel === 'app_pause') {
        lCustomContainer.css('filter', 'blur(5px)')
    } else if (pLevel === 'app_resume') {
        lCustomContainer.css('filter', 'none');
    } else if (pLevel === 'app_complete') {
        lCustomContainer.empty();
    } else if (pLevel === 'app_start') { // Refresh the custom container when we start the app
        lCustomContainer.empty();
        console.log("WE ARE HERE");
        const instructionCounter = textbox('Instruction Counter', `${getDefaultConfiguration().instructionIndex + 1} / ${getDefaultConfiguration().instructions.length}`).addClass('instruction-counter').appendTo(lCustomContainer);
        const textContent = $('<div>').addClass('instruction-text').appendTo(lCustomContainer);
        const buttonsContainer = $('<div>').addClass('buttons-container').appendTo(lCustomContainer);
        const prevStepButton = button('Prev Step', function() { sendSoftwareMessage('software_button', 'prevStep'); }).addClass('left-button').appendTo(buttonsContainer);
        const nextStepButton = button('Next Step', function() { sendSoftwareMessage('software_button', 'nextStep'); }).appendTo(buttonsContainer);
        
    }
    
    if (pMessagePayload == undefined) {
        return;
    }

    if (pMessageStr === 'InstructionIndexChange'){
        if (pMessagePayload.index >= pMessagePayload.instructionsLength) {
            return;
        }
        const counterInput = lCustomContainer.find('.instruction-counter').children().last();
        counterInput.val(`${pMessagePayload.index + 1} / ${pMessagePayload.instructionsLength}`);
    }
    else if (pMessageStr === 'textUpdate') {
        const textDiv = lCustomContainer.find('.instruction-text')
        textDiv.empty()
        textDiv.text(pMessagePayload.text);
    }
    
}