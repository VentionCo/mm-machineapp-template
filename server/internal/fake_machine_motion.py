from time import sleep
import logging

class MachineMotion:
    def __init__(self, *args):
        self.args = args
        self.current_position = {
            1: 0,
            2: 0,
            3: 0
        }
        self.steps_mm = {
            1: 1,
            2: 1,
            3: 1
        }

        self._is_stopped = False
        self._complete_batching = False
        self.logger = logging.getLogger(__name__)

    def stopMqtt(self):
        pass

    def configAxis(self, axis, uStep, mechGain):
        pass

    def triggerEstop(self):
        self._is_stopped = True
        pass

    def releaseEstop(self):
        self._is_stopped = False
        pass

    def resetSystem(self):
        pass

    def emitSpeed(self, speed):
        pass

    def emitAcceleration(self, accel):
        pass

    def waitForMotionCompletion(self):
        sleep(0.1)
        
    def emitStop(self):
        self.logger.debug("Please Stop...")
        self._complete_batching = True

    def configMachineMotionIp(self, mode, ip, gateway, mask):
        pass

    def emitAbsoluteMove(self, axis, position):
        self.logger.debug("Move: {} to {}".format(axis, position))
        pass

    def emitCombinedAxesAbsoluteMove(self, axes, positions):
        self.logger.debug("Move: {} to {}".format(axes, positions))
        pass

    def emitRelativeMove(self, axis, direction, distance):
        self.logger.debug("Move: {} Axis in {} direction by {}".format(axis, direction, distance))
        sign = None
        if (direction == "positive"):
            sign = 1
        else:
            sign = -1
        self.current_position[axis] = self.current_position[axis] + (distance * sign)
        
    def digitalWrite(self, deviceNetworkId, pin, value):
        self.logger.debug("Writing (pin={}, networkId={}, value={})".format(pin, deviceNetworkId, value))
        pass

    def digitalRead(self, deviceNetworkId, pin):
        return 0

    def configAxisDirection(self, axes, directions):
        pass

    def emitHome(self, accel):
        pass

    def emitHomeAll(self):
        pass

    def detectIOModules(self):
        pass

    def emitgCode(self, gCode):
        self.logger.debug("Emitting gcode, Line: {}".format(gCode))
        pass

    def emitgCodeBatch(self, gCodeList, onDataReceived, onKillFuncReceived):
        self._complete_batching = False
        for idx, gcode in enumerate(gCodeList):
            if self._is_stopped:
                return

            if self._complete_batching:
                self._complete_batching = False
                return

            self.emitgCode(gcode)
            onDataReceived([ { "index": idx, "line": gcode } ])
            sleep(0.5)

    def getCurrentPositions(self):
        return self.current_position

    def getCurrentSteps(self):
        return self.current_position

    def getEndStopState(self):
        return {
            "x_min": "TRIGGERED",
            "y_min": "TRIGGERED",
            "z_min": "TRIGGERED",
            "x_max": "TRIGGERED",
            "y_max": "TRIGGERED",
            "z_max": "TRIGGERED"
        }

    def setPosition(self, axis, value):
        pass

    def setBatchNotificationState(self, toggleOn):
        if (toggleOn):
            return self.emitgCode("V6 P1")
        else:
            return self.emitgCode("V6 P0")

    def bindeStopEvent(self, callback):
        pass