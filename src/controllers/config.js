const {ipcRenderer} = require('electron');
const activeWin = require('active-win');
const psList = require('ps-list');

var processList = document.getElementById("process-list");

storage = window.localStorage;

// var btnUpdate = document.getElementById("btn-config-update");
var form = document.getElementById("config-form");
var btnSelect = document.getElementById("btn-config-select");
var btnApply = document.getElementById("btn-config-apply");
var btnClose = document.getElementById("btn-config-close");

var inputCountsownTimer = document.getElementById("countdownTimer");

var activeCountdown = storage.getItem('activeCountdown') ? storage.getItem('activeCountdown') : 15;
inputCountsownTimer.value = activeCountdown;


// btnUpdate.addEventListener("click", onUpdate);
btnSelect.addEventListener("click", onSelect);
btnApply.addEventListener("click", onApply);
btnClose.addEventListener("click", onCloseConfig);

function onCloseConfig() {
    ipcRenderer.send('close-config');
    return false;
}

// function onUpdate() {
//     psList().then(processes => {
//         console.log(processes);
//         processesListHtml = '<ul>';

//         processes.forEach(function (currentValue, index) {
//             processesListHtml = processesListHtml + '<li>' + currentValue.name + '</li>';
//         });
//         processesListHtml = processesListHtml + '</ul>'
//         processList.innerHTML = processesListHtml;
//     });
// }

var registredApp = [];
var selectInterval = null;
function onSelect () {
    if ( selectInterval === null ) {
        listenApplications();
    } else {
        stopListeningApplications();
    }
    return false;
}

function listenApplications() {
    registredApp = [];
    btnSelect.innerText = 'Parar listagem';
    html = '';
    html += '<div class="info">';
    html += '<p>Clique na janela do software que queira controlar o tempo de uso.</p>';
    html += '<p>Programas identificados: ' + registredApp.length + '</p>';
    html += '</div>';
    processList.innerHTML = html;
    btnApply.disabled = true;

    selectInterval = setInterval( async function () {
        activeSoftware = await activeWin();

        if ( activeSoftware.owner.name !== 'ArtTimer' && registredApp.findIndex(x => x.owner.processId == activeSoftware.owner.processId ) === -1 ) {
            // console.log(activeSoftware.owner.name, activeSoftware.owner.name !== 'ArtTimer');
            registredApp.push(activeSoftware);
        }
        html = '';
        html += '<div class="info">';
        html += '<p>Clique na janela do software que queira controlar o tempo de uso.</p>';
        html += '<p>Programas identificados: ' + registredApp.length + '</p>';
        html += '</div>';
        processList.innerHTML = html;
    }, 1000);
}

function stopListeningApplications() {
    clearInterval(selectInterval);
    selectInterval = null;
    btnSelect.innerText = 'Listar programas';

    html = '';
    if (registredApp.length > 0) {
        registredApp.forEach( function (currentValue, index) {
            html += '<div class="process-list-item">';
            html += '<label>';
            html += '<input type="radio" name="process-select" value="' + index + '">';
            html += '<span>' + currentValue.owner.name + '</span>';
            html += '</label>';
            html += '</div>';
        });
        processList.innerHTML = html;
        btnApply.disabled = false;
    } else {
        processList.innerHTML = '<div class="alert">Nenhum programa listado.</div>';
    }
}


function validate() {
    if ( inputCountsownTimer.validity.valid && document.querySelector('input[name="process-select"]:checked') !== null ) {
        return true;
    }
    return false;
}

function onApply() {
    if (validate() === true) {
        storage.setItem('activeCountdown', inputCountsownTimer.value);

        appIndex = document.querySelector('input[name="process-select"]:checked').value;
        selectedApp = registredApp[appIndex];
        storage.setItem('applicationToListen', JSON.stringify(selectedApp));

        alert('Configurações salvas!');
    }
    return false;
}