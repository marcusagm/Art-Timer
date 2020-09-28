/**
 * https://github.com/sindresorhus/active-win
 * https://tableless.com.br/introducao-ao-electron/
 * https://coolors.co/111517-1a1f23-20262b-2b343b-343e46
 */

const {ipcRenderer} = require('electron');
const activeWin = require('active-win');

var timerViewer = document.getElementById("app-timer");
var timerListenerViewer = document.getElementById("app-listener-name");

var secondsViewer = document.getElementById("timer-seconds");
var minutesViewer = document.getElementById("timer-minutes");
var hoursViewer = document.getElementById("timer-hours");

var btnReset = document.getElementById("btn-timer-reset");
var btnRun = document.getElementById("btn-timer-run");
var btnConfig = document.getElementById("btn-timer-config");
var btnClose = document.getElementById("btn-timer-close");

var btnRunIconPlay = '<img src="../assets/images/play-solid.svg" alt="Play">';
var btnRunIconPause = '<img src="../assets/images/pause-solid.svg" alt="Pause">';

storage = window.localStorage;
// storage.setItem('applicationToListen', null);

var states = {
    running: 0,
    paused: 1
}

var interval = null;
var timer = storage.getItem('timer') ? storage.getItem('timer') : 0;
updateTimer();

var timerStatus = states.paused;
var activeSoftware = null;
var activeWindow = false;
var activeCountdown = 15;
var defaultCountdown = 15;

var AppListener = null;
updateConfig();

btnRun.addEventListener("click", onRun);
btnReset.addEventListener("click", onReset);
btnConfig.addEventListener("click", onConfig);
btnClose.addEventListener("click", onClose);

const ioHook = require('iohook');

ioHook.on('mouseclick', event => {
    if (activeWindow === true ) {
        activeCountdown = defaultCountdown;
    }
});

ioHook.on('keydown', event => {
    if (activeWindow === true ) {
        activeCountdown = defaultCountdown;
    }
});

// Register and start hook
// ioHook.start();

ipcRenderer.on('update-config', function (event, arg) {
    updateConfig();
});

function onClose() {
    storage.setItem('timer', timer);
    ipcRenderer.send('close-me');
}

function onConfig() {
    ipcRenderer.send('open-config');
}

function onRun() {
    if (interval) {
        changeState(states.paused);
    } else {
        changeState(states.running);
    }
}

function onReset() {
    stopTimer();
    timer = 0;
    storage.setItem('timer', timer);
    setTime( 0, 0, 0);
}

function changeState (state) {
    timerStatus = state;
    switch (timerStatus) {
        case states.running:
            startTimer();
            break;
        case states.paused:
            stopTimer();
            break;
    }
}

function setTime(h, m, s) {
    hoursViewer.innerText = getString(h);
    minutesViewer.innerText = getString(m);
    secondsViewer.innerText = getString(s);
}

function getString(n) {
    if (n < 10) {
        return "0" + String(n);
    } else {
        return String(n);
    }
}

function startTimer() {
    interval = setInterval(checkTimer, 1000);
    btnRun.innerHTML = btnRunIconPause;
}

function stopTimer() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    storage.setItem('timer', timer);
    btnRun.innerHTML = btnRunIconPlay;
}

function checkTimer() {
    if (activeWindow === true && activeCountdown >= 0) {
        timer++;
        activeCountdown--;
        updateTimer();
    }
    checkActiveSoftware();
}

function updateTimer() {
    seconds = Math.floor(timer % 60);
    minutes = Math.floor(timer % 3600 / 60);
    hour = Math.floor(timer % (3600 *24) / 3600);
    setTime(hour, minutes, seconds);
}

function checkActiveSoftware() {
    if (AppListener) {
        timerListenerViewer.innerHTML = AppListener.owner.name;
        activeSoftware = activeWin.sync();

        if (activeSoftware.owner.name !== AppListener.owner.name) {
            activeWindow = false;
            ioHook.stop();
        } else {
            activeWindow = true;
            ioHook.start();
        }

        if (activeWindow === true ) {
            if (activeCountdown > 0) {
                if (timerViewer.classList.contains('paused') === true) {
                    timerViewer.classList.remove('paused');
                }
            } else {
                if (timerViewer.classList.contains('paused') === false) {
                    timerViewer.classList.add('paused');
                }
            }
        } else {
            if (timerViewer.classList.contains('paused') === false) {
                timerViewer.classList.add('paused');
            }
        }
    }
}

function updateConfig() {
    activeCountdown = storage.getItem('activeCountdown') ? storage.getItem('activeCountdown') : 15;
    defaultCountdown = activeCountdown;

    AppListener = JSON.parse(storage.getItem('applicationToListen'));
    if (AppListener) {
        timerListenerViewer.innerHTML = AppListener.owner.name;
    } else {
        timerListenerViewer.innerHTML = "Nenhum app selecionado."
    }
}