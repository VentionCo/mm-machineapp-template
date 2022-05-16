# Machine App Template

## Overview
The purpose of this project is to provide users with a framework upon which they can construct their own Machine Applications. High-level goals include:
- A clean interface to interact with multiple machine motions at a time
- A web-based user interface that is easy to extend
- A mechanism for broadcasting messages to facilitate the real-time updating of the web UI.

## Getting Started
1. Clone the repository to a new directory on your machine
2. Download Python 3.5 (https://www.python.org/downloads/)
3. Download and setup your mosquitto broker. See [these instructions](#mqtt-broker-setup-mosquitto).
4. Run `python --version` or `python3 --version` in the commandline to check that you have installed properly
5. Install server dependencies by running `cd server && pip install -r requirements.txt` (You may need to use `pip3` instead of `pip`, depending on how your paths were set up) (See `requirements.txt` to view the external libraries that the server relies on)
6. Run the server using `cd server && python app.py` (You may need to use `python3` or event `python35` instead of python, depending on how your paths were set up)
7. Start hacking! The project is now all yours to play around with. I recommend reading the [documentation](./docs/getting_started.md) before going any further.


## MQTT Broker Setup (Mosquitto)
### Windows
1. Download the exe from here: https://mosquitto.org/download/
2. Locate your `mosqutto.conf`. This will be `C:\Program Files\mosquitto\mosquitto.conf` or `C:\Program Files (x86)\mosquitto\mosquitto.conf`.
3. Insert the following at the beginning of the "Listeners" section:
```txt
allow_anonymous true
listener 9001
protocol websockets
socket_domain ipv4
listener 1883
```
4. Open your "Services" in Windows. Find "Mosquitto Broker" in the list. Right click it and click "Start".

For more information, please see this guide: https://delightnet.nl/index.php/mqtt/12-mqtt-broker-installation

### Mac
Make sure that you have homebrew installed (https://brew.sh/).
1. Download mosqutto from the terminal via `brew install mosquitto`
2. Locate your `mosqutto.conf`. It will most likely be in `/etc/mosquitto/mosquitto.conf`
3. Insert the following at the beginning of the "Listeners" section:
```txt
allow_anonymous true
listener 9001
protocol websockets
socket_domain ipv4
listener 1883
```
4. Run the service via:
```sh
brew services start mosquitto 
```

### Linux
1. Download mosquitto from your package manager. On Ubuntu, that will be: `sudo apt-get install mosquitto`.
2. Locate your `mosqutto.conf`. It will most likely be in `/etc/mosquitto/mosquitto.conf`
3. Insert the following at the beginning of the "Listeners" section:
```txt
allow_anonymous true
listener 9001
protocol websockets
socket_domain ipv4
listener 1883
```
4. Run the service via:
```sh
sudo systemctl stop mosquitto
sudo systemctl enable mosquitto
sudo systemctl start mosquitto 
```

## Development Environment Recommendation
We recommend building your program in Visual Studio Code with the following extensions:
1. Python by Microsoft - Provides debugging support and a seamless way to manage multiple versions of Python
2. Python for VSCode - Provides autocompletion recommendations for Python

With these extensions installed, you will be able to run the server in `Debug` mode by clicking the debug button in Visual Studio's side bar, selecting `Application` from the dropdown, and clicking the playing button. Running in debug mode will allow you to set breakpoints and inspect the state of your application at run time.

## Deploying your MachineApp
After developing yout application locally, you may want to deploy it to your MachineMotion controller. To do this:
1. Connect your computer to your MachineMotion controler
2. Run `python upload.py` from the project's root directory. This script will prompt you for your password three times.
3. Run `restart_server.py` from the project's root directory.
4. Navigate to `192.168.7.2:3011` to see your MachineApp running
