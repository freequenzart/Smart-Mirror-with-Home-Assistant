# Smart Mirror with Home Assistant
Step by Step Creation of a Smart Mirror with Home Assistant. This is not ready yet.

## Intro
I had the idea to get rid of my old smart mirror, which is made with Magic Mirror. Do not get me wrong: Magic Mirror is es really greate solution but for me it was hard to maintain both software stacks.

I have tried alot of ways to create a simple and efficient Kiosk mode with a Raspberry Pi zero 2. The following instructions sums up all my issues and solutions.

Do not be afraid off the `long` text. the most stuff is copy and paste and some configs :-)

## Hardware

- Rasperry Pi Zero 2
- Power Supply
- Cables
- PIR Sensor OR RCWL-0516 _(for movement detection to turn on/off the monitor)_
- Monitor
- SD Card
- Mouse / Keyboard for the start

You know, stuff to build a smart mirror or an kiosk system :-)


## Installations for the Kiosk Mode

My basic source for this was here: https://blog.r0b.io/post/minimal-rpi-kiosk/ 

### OS
The most efficient way I found starts with installing **Raspberry Pi OS (Legacy) Lite** from here: https://www.raspberrypi.com/software/operating-systems/ or with the **PI Imager** .

### Setup the OS
After you start the PI the first time and the installation is complete go to the PI Config:
```bash
sudo raspi-config
```

There you have to activate ssh:

1. (3) Interface Options
2. (I2) SSH
3. Yes and ENTER
4. Finish

And now we setup the Boot Options to autologin with console:

1. (1) System Options
2. (S5) Boot / Auto Login
3. (B2) Console Autologin
4. Yes and ENTER
5. Finish

### Additional Software packages and settings
Now you can go on locally or by ssh.

#### 1.: update packages list (I think^^)
```bash
sudo apt-get update -qq
```

#### 2.: install the packages
```bash
sudo apt-get install --no-install-recommends xserver-xorg-video-all \
  xserver-xorg-input-all xserver-xorg-core xinit x11-xserver-utils \
  chromium-browser unclutter
```

#### 3.: create the .bash_profile
```bash
nano /home/pi/.bash_profile
```
Content:
```sh
if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]
then
  startx
fi
```
save `ctrl + s` and close `ctrl + x`
> to automatically start the gui. There's a check for the bash context first, so you don't accidentally start chromium whenever you ssh in.

#### 4.: create the .xinitrc
```bash
nano /home/pi/.xinitrc
```
Content:
```sh
#!/usr/bin/env sh
xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser http://IP.TO.YOUR.HA:8123 \
  --window-size=1920,1080 \
  --window-position=0,0 \
  --start-fullscreen \
  --kiosk \
  --noerrdialogs \
  --disable-translate \
  --no-first-run \
  --fast \
  --fast-start \
  --disable-infobars \
  --disable-features=TranslateUI \
  --overscroll-history-navigation=0 \
  --disable-pinch \
  --accept-lang=de-DE
```
save `ctrl + s` and close `ctrl + x`
**<u>Important things:</u>**
1. if you later in the process <u>rotate</u> your display, you have to change the <u>window-size</u> or if you have not a Full HD Display!
2. <u>accept-lang=de-DE</u> should represent the language you need in the kiosk system because if you not set this, javascript stuff like dates will be handled in english: e.g.: http://www.lingoes.net/en/translator/langcode.htm

#### 5.: the grafic settings
To get some "old" code running we have to deactivate the "new" graphics driver. This may harm the hardware support, but in my case every thing works fine.

```bash
sudo nano /boot/config.txt
```

1. command out the following line with #
```bash
dtoverlay=vc4-kms-v3d
```

2. add `gpu_mem=128`
3. add `display_hdmi_rotate=3` if you want to rotate your display.
1 = 90°, 2 = 180° and 3 = 270°
4. save `ctrl + s` and close `ctrl + x`

```bash
sudo reboot
```

## Auto On/Off Monitor on Movement
If you want to power off you monitor with an script and turn it back on movement, follow the next steps.
The Scripts based on the scripts from here: https://forum.magicmirror.builders/topic/6291/howto-turn-on-off-your-monitor-time-based-pir-button-app I have added some time based stuff.

### Hardware
You can use a simple PIR Sensor or a RCWL-0516 e.g. Both have the same wiring.
- 5V
- Ground
- Out goes to the Pin we use in the script `monitor.py`. E.g. PIN GPIO17 => 11 on the board

### Needed files
The files you need are in the `monitor_on_off` directory. Copy them to the home directory of your pi user. By default: `/home/pi/`. If you renamed the user, please change the pathes in the `monitor.py` for the sh files.

Now the files should be made execute able:
```bash
chmod +x monitor_on.sh
chmod +x monitor_off.sh
chmod +x monitor.py
```

### Autostart
```bash
sudo nano /etc/rc.local
```
Write the following line in the file (above the “exit 0”):
```bash
python3 /home/pi/monitor.py &
```
save `ctrl + s` and close `ctrl + x`

```bash
sudo reboot
```

### Changing the hostname with raspi-config / XServer crashes after
Inf yopur are changing the hostname of you PI _after_ installation, you have to change / add the xauth config for Xserver.

Source: https://stackoverflow.com/questions/20611783/after-changing-hostname-gedit-and-other-x-clients-dont-open

```bash
xauth list
```

Here you see the data you need. Copy the /unix:0 line and ass next add it:

```bash
xauth add "$(hostname)/unix:0" MIT-MAGIC-COOKIE-1 bd988401cbf8xxxxxxxxxxxxxxxxxxxx
```

after `add` can insert the copied line but add the quotes and change the hostname to you new hostname.

## Installations for the Smart Mirror Dashbaord

### Basics

Now we have to create a nice Dashbaord, which will be shown in the kisok mode. For the basics I had started like this:
1. Create a new User / Person for the mirror
2. Create a Dashbaord for the mirror
3. login in the kiosk with the user and set the dashbaord to default
4. choose the dark mode for themes

The rest basically can be done in the Home Assistant with another browser.

I have created a basic black and with theme, based on the google theme: https://github.com/JuanMTech/google-theme .
If you have new them installed yet, you have to edit the `configuration.yaml ` by adding the following:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

After that you can upload the `/themes/smart_mirror/smart_mirror.yaml` in the `/themes/` directory. Reload the yaml config in you Home Assistant.

Now you can set this Theme as default for the new Dashbaord.

This could be the last step, if you do not want go deeper into the rabbit hole and simply use the cards you already have. If so: Have fun :-) Else: see you in the next step!
<br>
<br>

---

### Advanced setup
For the most following stuff you may need to install HACS: https://hacs.xyz/docs/setup/download/
<br><br><br>
<u>The following HACS Addon I have used:</u>
<br>
1. Kiosk Mode: https://github.com/maykar/kiosk-mode It hides the headerbar and menu.

This is the config in my dashbaord `raw` file:
```yaml
kiosk_mode:
  non_admin_settings:
    hide_header: true
    hide_sidebar: true
```
<br>

2. For special purposes i have installed 3 Integrations:

    **A garbage collection time:** https://github.com/mampfes/hacs_waste_collection_schedule `with HACS`

    This will provide a need calendar with the configured garbage collections. You can simply use the calendar card in the 7 days list mode or use the home feed card from HACS: https://github.com/gadgetchnnel/lovelace-home-feed-card 

    My Config:
    ```yaml
    type: custom:home-feed-card
    calendars:
    - calendar.stadtreinigung_dresden
    calendar_days_forward: 7
    show_empty: false
    compact_mode: true
    show_icons: false
    ```

    ***
    **B gas station prices:** https://www.home-assistant.io/integrations/tankerkoenig/ `official plugin`
    
    This plugin provides a new service with alot of entries for the gas stations near by. The `API Key` option is a little bit hard to find: 
    1. visit: https://creativecommons.tankerkoenig.de/
    2. Click on `API-KEY`
    3. Click on `API-KEY` again. the first time you are routed to the terms.

    After that you can configure the Integration.
    
    In first place, I have used a tile for every station and they are only visible if the station is open:
    ```yaml
    type: tile
    entity: sensor.STATION_STREET_ADRESS_super
    vertical: false
    visibility:
    - condition: state
        entity: binary_sensor.STATION_STREET_ADRESS_status
        state: 'on'
    name: 'MY STREET ADRESS'
    state_content:
    - state
    - fuel_type
    layout_options:
    grid_columns: 4
    grid_rows: 1
    ```

    But for the better looks, I have created my one tile for the `Tankerkoenig` Integration. You will find every Information you need in the other repository: https://github.com/freequenzart/Custom-Lovelance-Card-for-Tankerkoenig-integration


    ***
    **C departure times for public transport:** https://github.com/VDenisyuk/home-assistant-transport `by hand`
    This one is special for some places. Maybe you have to pick another one for your region. The basic integration works fine but the linked lovelance card only worked after some changes so I had build my own:

    you will finde the code here: `custom_cards/dvb-card.js` [TBD]

    > 1. Copy the dvb-card.js card module to the www directory of your Home Assistant. The same way you did for the sensor above. If it doesn't exist — create one.
    
    > 2. Go to your Home Assistant dashboard, click "Edit dashboard" at the right top corner and after that in the same top right corner choose "Manage resources".

    > 3. Add new resource with URL: /local/dvb-card.js and click create. Go back to your dashboard and refresh the page. [as Javascript module]

    > 4. Now you can add the custom card and integrate it with your sensor. Click "Add card -> Manual" or just go to "Raw configuration editor" and use this config.

    example cofig:
     ```yaml
    type: custom:dvb-card
    max_entries: 8
    show_title: true
    entities:
    - sensor.YOUR_SELECTED_STREET
    ```

    Feel free to edit it to english etc :-)

    For the integration config, please follow the linked guide.

<br>
<br>

---


<br>
<br>

3. I have created some template sensors and used them in markdown cards:
`Settings` -> `Devices` -> `Helper` -> `Add` -> `Template` -> `Template for a Sensor`
<br>
---
#### Date and Time
Sensor for Date with day names and month (e.g. in german, in my code I called it, "Deutsches Datum" -> german date)
```python
{% set months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"] %}
{% set days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]  %}
{{ days[now().weekday()] }}, {{ now().day }}. {{ months[now().month-1] }} {{ now().year }}
```

Sensor for time with 24h format (in my code I call it "Uhrzeit 24h" -> time 24h)
```python
{{ now().strftime('%H:%M') }}
```

The markdown for the card looks like this:
```yaml
type: markdown
entities:
  - sensor.uhrzeit_24h
  - sensor.deutsches_datum
content: |
  <center>
    <h1>{{ states(config.entities[0]) }}</h1>
    <h2>{{ states(config.entities[1]) }}</h2>
  </center>
```
<br>

---

#### Welcome Message based on daytime
From the good old Magic Mirrow project you maybe know the greetings in the mirror based on the current time of the day. if you need some thing like this, you can start with this basic example:

Sensor for the text (in my code I call it "Botschaft im Spiegel" -> Message in mirror):
```python
{% if(now().hour < 6) %}
  I hope you sleep well!
{% elif(now().hour < 11) %}  
  Good morning, good morning, good morning sunshine!
{% elif(now().hour < 14) %}  
  Lunchtime. We're sure to be cooking delicious meals again soon!
{% elif(now().hour < 18) %}
  Beer o'clock is the best time at work!
{% elif(now().hour < 21) %}
  I'm looking forward to a delicious dinner!
{% else %}
  You turn night into day! But sleep well soon.
{% endif %}
```
The markdown for the card looks like this:
```yaml
type: markdown
entities:
  - sensor.botschaft_im_spiegel
content: |
  <center>
    <h2>{{ states(config.entities[0]) }}</h2>
  </center>
```
<br>

---

#### Headings
For an better / identical look of the headings, I simply turned of the titles in the cards and used markdown cards like this:

```yaml
type: markdown
content: |-
  ## 
  ## My Markdown Heading
```

## Summary
How you create the basic dashboard, is up on your own. You can used a grid or the new experimental areas. But I recomment to use stacks: horizonal / vertical.
