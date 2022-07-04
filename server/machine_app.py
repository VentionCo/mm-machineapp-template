#/usr/bin/python3

from env import env
import logging
import time
from internal.base_machine_app import MachineAppState, BaseMachineAppEngine
from internal.notifier import NotificationLevel, sendNotification
from internal.io_monitor import IOMonitor

'''
If we are in development mode (i.e. running locally), we initialize a mocked instance of machine motion.
This fake MachineMotion interface is used ONLY when developing locally on your own machine motion, so
that you have a good idea of whether or not your application properly builds.
''' 
from internal.machine_motion import MACHINEMOTION_HW_VERSIONS
if env.IS_DEVELOPMENT:
    from internal.fake_machine_motion import MachineMotion
else:
    from internal.machine_motion import MachineMotion

class MachineAppEngine(BaseMachineAppEngine):
    ''' Manages and orchestrates your MachineAppStates '''

    def buildStateDictionary(self):
        '''
        Builds and returns a dictionary that maps state names to MachineAppState.
        The MachineAppState class wraps callbacks for stateful transitions in your MachineApp.

        Note that this dictionary is built when your application starts, not when you click the
        'Play' button.

        returns:
            dict<str, MachineAppState>
        '''
        stateDictionary = {
            'start': StartState(self),
            'move': MoveState(self),
            'cut': CutState(self),
            'end': EndState(self)
        }

        return stateDictionary

    def getDefaultState(self):
        '''
        Returns the state that your Application begins in when a run begins. This string MUST
        map to a key in your state dictionary.

        returns:
            str
        '''
        return 'start'
 
    def initialize(self):
        ''' 
        Called when you press play in the UI.
        
        In this method, you will initialize your machine motion instances 
        and configure them. You may also define variables that you'd like to access 
        and manipulate over the course of your MachineApp here.
        '''
        self.logger.info('Running initialization')
        self.primaryMachineMotion = MachineMotion('127.0.0.1', machineMotionHwVersion=MACHINEMOTION_HW_VERSIONS.MMv2)
        self.primaryMachineMotion.configAxis_v2(1, 208, 'positive', 10, 'closed', 4, 'default')


        

    def onStop(self):
        '''
        Called when a stop is requested from the REST API. 99% of the time, you will
        simply call 'emitStop' on all of your machine motions in this methiod.
        '''
        self.primaryMachineMotion.emitStop()

    def onPause(self):
        '''
        Called when a pause is requested from the REST API. 99% of the time, you will
        simply call 'emitStop' on all of your machine motions in this methiod.
        '''
        self.primaryMachineMotion.emitStop()

    def onEstop(self):
        '''
        Called AFTER the MachineMotion has been estopped. Please note that any state
        that you were using will no longer be available at this point. You should
        most likely reset all IOs to the OFF position in this method.
        '''
        pass

    def onResume(self):
        pass

    def afterRun(self):
        '''
        Executed when execution of your MachineApp ends (i.e., when self.isRunning goes from True to False).
        This could be due to an estop, stop event, or something else.

        In this method, you can clean up any resources that you'd like to clean up, or do nothing at all.
        '''
        pass

def _sendTextUpdate(text):
        sendNotification(NotificationLevel.INFO, 'textUpdate', {'text': text})

class StartState(MachineAppState):
    def __init__(self, engine):
        super().__init__(engine)

    def _setStartIndex(self, index):
        self.configuration['instructionIndex'] = index
        sendNotification(NotificationLevel.INFO, 'InstructionIndexChange', {'index': self.configuration['instructionIndex'], 'instructionsLength': len(self.configuration['instructions'])})

    def onEnter(self):
        self.logger.info("Entered start state")
        newText = "Ready to start cutting extrustions! Press the \"Next Step\" button to begin"
        _sendTextUpdate(newText)
        def onSoftwareClick(topic, message):
            if (message == 'nextStep'):
                self._setStartIndex(0)
                self.gotoState('move')

        self.registerCallbackOnTopic(self.engine.primaryMachineMotion, 'software_button', onSoftwareClick)

class MoveState(MachineAppState):

    

    def __init__(self, engine):
        super().__init__(engine)
        self.__machineMotion = self.engine.primaryMachineMotion
        self.__axis = 1

    def onEnter(self):
        newPos = self.configuration['instructions'][self.configuration['instructionIndex']]
        newText = "Moving to cut length: %d" % newPos
        _sendTextUpdate(newText)
        self.logger.info("Move to %d" % newPos)
        self.__machineMotion.emitHomeAll()
        self.__machineMotion.setPosition(self.__axis, newPos)
        self.gotoState('cut')
         

class CutState(MachineAppState):

    def __init__(self, engine):
        super().__init__(engine)
    
    def _updateIndex(self, increment):
        self.configuration['instructionIndex'] += increment
        sendNotification(NotificationLevel.INFO, 'InstructionIndexChange', {'index': self.configuration['instructionIndex'], 'instructionsLength': len(self.configuration['instructions'])})

    def onEnter(self):
        sideToTake = 'right' if self.configuration['instructionIndex'] % 2 == 0 else 'left'
        newText = "Perform the cut and take the %s piece" % sideToTake
        _sendTextUpdate(newText)
        def onSoftwareClick(topic, message):
            if (message == 'nextStep'):
                self._updateIndex(1)
                if self.configuration['instructionIndex'] >= len(self.configuration['instructions']):
                    self.gotoState('end')
                    return
                self.gotoState('move')
            elif (message == 'prevStep'):
                if self.configuration['instructionIndex'] > 0:
                    self._updateIndex(-1)
                self.gotoState('move')


        self.registerCallbackOnTopic(self.engine.primaryMachineMotion, 'software_button', onSoftwareClick)
        self.logger.info("Entered cut and take %s state" % sideToTake)

class EndState(MachineAppState):
    def __init__(self, engine):
        super().__init__(engine)

    def _decrementIndex(self):
        self.configuration['instructionIndex'] -= 1
        sendNotification(NotificationLevel.INFO, 'InstructionIndexChange', {'index': self.configuration['instructionIndex'], 'instructionsLength': len(self.configuration['instructions'])})

    def onEnter(self):
        newText = "Cutting complete! Thank you!"
        _sendTextUpdate(newText)
        def onSoftwareClick(topic, message):
            if (message == 'prevStep'):
                self._decrementIndex()
                self.gotoState('move')
                
        self.registerCallbackOnTopic(self.engine.primaryMachineMotion, 'software_button', onSoftwareClick)
        self.logger.info("Entered end state")



