#!/usr/bin/env python

import sys
import time
from datetime import datetime
import RPi.GPIO as io
import subprocess

io.setmode(io.BCM)
SHUTOFF_DELAY = 10 # seconds
PIR_PIN = 17       # 11 on the board
SHUTDOWN_HOUR = 22 # Time (24h format) to not turn on on movement
SHOWUP_HOUR = 5    # Time (24h format) to turn on on movement again

def main():
    io.setup(PIR_PIN, io.IN)
    turned_off = False
    last_motion_time = time.time()

    while True:
        if io.input(PIR_PIN):
            now = datetime.now()
            hour = now.hour
            last_motion_time = time.time()
            print(".")
            sys.stdout.flush()

            if turned_off and hour < SHUTDOWN_HOUR and hour > SHOWUP_HOUR:
                turned_off = False
                turn_on()
        else:
            if not turned_off and time.time() > (last_motion_time + 
                                                 SHUTOFF_DELAY):
                turned_off = True
                turn_off()
        time.sleep(.2)

def turn_on():
    subprocess.call("sh /home/pi/monitor_on.sh", shell=True)

def turn_off():
    subprocess.call("sh /home/pi/monitor_off.sh", shell=True)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        turn_on()
        io.cleanup()

