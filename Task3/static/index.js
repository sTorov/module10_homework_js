const url = 'wss://echo-ws-service.herokuapp.com';

const output = document.querySelector('.output');
const btnSend = document.querySelector('.btn-send');
const btnGeo = document.querySelector('.btn-geo');


function writeMessage(message, option){
    const defaultOption = { 
        isRight: false, 
        color: '#111'
    }

    if(option){
        defaultOption.isRight = option.isRight ? option.isRight : false;
        defaultOption.color = option.color ? option.color : '#111'; 
    }

    const messageBox = document.createElement('div');
    messageBox.setAttribute('class', 'message-box');
    messageBox.innerHTML = `<p class="message"> ${message}</p>`;
    messageBox.style.color = defaultOption.color;
    if(defaultOption.isRight){
        messageBox.style.justifyContent = 'end';
    }
    output.appendChild(messageBox);
    output.scrollTop = output.scrollHeight;
};

let websocket;

function setupWebSocket(){
    websocket = new WebSocket(url);

    websocket.onmessage = function(e){
        if(e.data == 'Гео-локация'){
            navigator.geolocation.getCurrentPosition(geopositionSuccess, geopositionError);
        } else {
            writeMessage(e.data, { color: 'green' });
        }
    };
    websocket.onerror = function(e){
        writeMessage(`ОШИБКА! ${e.data}`, { color: 'red' });
    };
    websocket.onclose = function(e){
        setTimeout(() => { setupWebSocket() }, 1000);
    };
};


window.onload = () => {
    setupWebSocket();    
};


btnSend.onclick = e => {
    const message = document.querySelector('.input-message').value;

    if(message && message.trim().length > 0){
        writeMessage(message, { isRight: true });
        websocket.send(message);
    }
};


function geopositionSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const link = `<a class="link" href="https://www.openstreetmap.org/#map=18/${latitude}/${longitude}" target="_blank">Ваше местоположение</a>`
    writeMessage(link);
};

function geopositionError() {
    writeMessage('Ошибка при получении вашего местоположения!', {color: 'red'} );
};

btnGeo.onclick = () => {
    if(!navigator.geolocation){
        writeMessage('Ваш браузер не поддерживает данную функцию!');
    } else {
        const geoMessage = 'Гео-локация';
        writeMessage(geoMessage, { color: 'blue', isRight: true });
        websocket.send(geoMessage);
    }
}


window.onbeforeunload = () => {
    websocket.close();
};