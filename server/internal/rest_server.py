import logging
from bottle import Bottle, request, response, abort, static_file
import os
import time
from threading import Thread
from pathlib import Path
import json
from machine_app import MachineAppEngine
from internal.notifier import getNotifier, NotificationLevel
import signal

class RestServer(Bottle):
    '''
    RESTful server that handles control of the MachineApp and configuration IO
    '''
    def __init__(self, machineApp: 'BaseMachineAppEngine'):
        super(RestServer, self).__init__()
    
        self.__clientDirectory = os.path.join('..', 'client')
        self.__serverDirectory = os.path.join('.')
        self.__logger = logging.getLogger(__name__)
        self.__machineApp = machineApp                   # MachineApp that is currently being run
        self.__isAppRunning = False

        # Set up callbacks
        self.route('/', callback=self.index)
        self.route('/ping', callback=self.ping)
        self.route('/<filepath:path>', callback=self.serveStatic)
        self.route('/run/start', method='POST', callback=self.start)
        self.route('/run/stop', method='POST', callback=self.stop)
        self.route('/run/pause', method='POST', callback=self.pause)
        self.route('/run/resume', method='POST', callback=self.resume)
        self.route('/run/estop', method='POST', callback=self.estop)
        self.route('/run/estop', method='GET', callback=self.getEstop)
        self.route('/run/releaseEstop', method='POST', callback=self.releaseEstop)
        self.route('/run/resetSystem', method='POST', callback=self.resetSystem)
        self.route('/run/state', method='GET', callback=self.getState)

        self.route('/kill', method='GET', callback=self.kill)
        self.route('/logs', method='GET', callback=self.getLog)

        
    def __startMachineApp(self):
        if self.__isAppRunning:
            return
        
        self.__isAppRunning = True
        self.__machineAppThread = Thread(target=self.__primaryThreadLoop, name="MachineAppUpdate", daemon=True)
        self.__machineAppThread.start()
        
    def __primaryThreadLoop(self):
        '''
        Internal loop running on it's own thread. When a user requests for a MachineApp to
        start running, the loop handles all control to the MachineAppEngine for the duration
        of the program. Once that program finishes, it returns control to the loop below until
        another 'run' request arrives.
        '''
        self.__machineApp.loop()

    def ping(self):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
        return 'pong'

    def index(self):
        # When someone first requests the Index file, we start the thread. This ensures that the machine is actually online
        # so that we can do machine specific configuration in MachineAppEngine::initialize
        self.__logger.info('Handling index file request')
        self.__startMachineApp()
        return static_file('index.html', root=self.__clientDirectory)
        
    def serveStatic(self, filepath):
        self.__logger.info('Serving static file: {}'.format(filepath))
        return static_file(filepath, root=self.__clientDirectory)

    def getLog(self):
        return static_file('machine_app.log', root=self.__serverDirectory)

    def start(self):
        inStateStepperMode = (request.params['stateStepperMode'] == 'true') if 'stateStepperMode' in request.params else False
        configuration = request.json
        if self.__machineApp == None:
            self.__logger.error('MachineApp not initialized properly')
            abort(400, 'MachineApp uninitialize')
            return

        if self.__machineApp.isRunning:
            abort(400, 'MachineApp is already running')
            return False

        self.__machineApp.start(inStateStepperMode, configuration)
        return 'OK'

    def stop(self):
        if self.__machineApp != None:
            self.__machineApp.stop()
            return 'OK'
        else:
            abort(400, 'Failed to stop the MachineApp')

    def pause(self):
        if self.__machineApp != None:
            self.__machineApp.pause()
            return 'OK'
        else:
            abort(400, 'Failed to pause the MachineApp')

    def resume(self):
        if self.__machineApp != None:
            self.__machineApp.resume()
            return 'OK'
        else:
            abort(400, 'Failed to resume the MachineApp')

    def estop(self):
        if self.__machineApp != None:
            self.__machineApp.estop()
            return 'OK'
        else:
            abort(400, 'Failed to estop the MachineApp')

    def getEstop(self):
        if self.__machineApp.getEstop():
            return 'true'
        else:
            return 'false'

    def releaseEstop(self):
        if self.__machineApp.releaseEstop():
            return 'OK'
        else:
            abort(400, 'Failed to release estop')

    def resetSystem(self):
        if self.__machineApp.resetSystem():
            return 'OK'
        else:
            abort(400, 'Failed to reset the system')

    def getState(self):
        return {
            "isRunning": self.__machineApp.isRunning,
            "isPaused": self.__machineApp.isPaused
        }

    def kill(self):
        getNotifier().setDead()
        self.__machineApp.kill()
        os.kill(os.getpid(), signal.SIGTERM)
        return 'OK'

def runServer(machineApp: 'BaseMachineAppEngine'):
    restServer = RestServer(machineApp)
    restServer.run(host='0.0.0.0', port=3011, server='paste')