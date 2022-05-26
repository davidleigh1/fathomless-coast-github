window.chat = localStorage.getItem("chat") ? JSON.parse( localStorage.getItem("chat") ) : {};
window.chat.user_id = window.chat.user_id || generateUUID();

/* Source: https://stackoverflow.com/questions/25896225/how-do-i-get-socket-io-running-for-a-subdirectory */
// var socket = io();
// const socket = io("https://tlv.works/live");
var socket = io.connect({
    /* path: "/live/socket.io/" */
});
// var socket = io.connect('https://tlv.works', {
//     path: "/live/socket.io/"
// });

var messages = document.getElementById('messages');
var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("keydown", function (key) {
    // e.preventDefault();
    // chat.connected = null;
    if ( !socket.connected ) {
        connection_lost(socket);
    } else if ( chat.local_socket_connected == false ) {
        connection_restored(socket);
    } 
});

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value) {

        /* Prepare chat_message object to send... */

        const msg_obj = {};
        msg_obj.msg_id = generateUUID();
        msg_obj.sender_id = getStoredSettings("user_id");
        msg_obj.sender_name = getStoredSettings("user_name");
        msg_obj.dest_id = null;
        msg_obj.msg_type = 'chat_message';
        msg_obj.content = input.value;
        msg_obj.happened_at = new Date().toISOString();
        msg_obj.is_history = false;

        console.log("SEND >>>","chat_message", msg_obj);

        /* Adding acknowledgements with timeout */
        // socket.timeout(5000).emit("hello", "world", (err, response) => {
        //     if (err) {
        //       // the other side did not acknowledge the event in the given delay
        //     } else {
        //       console.log(response); // "got it"
        //     }
        //   });


        socket.timeout(3000).emit("chat_message", msg_obj, (err, response) => {
            if (err) {
                // the other side did not acknowledge the event in the given delay
                console.error("Server did not respond within 3 seconds",err);
                localNotify("[LOCAL] The server did not respond to your last message. <strong>Please check your connection!</strong>","error");
                console.log(msg_obj.msg_id);
                connection_lost(socket);
              } else {
                console.log("ACK <<<", response);
                if (document.getElementById("input").placeholder !== ""){
                    // connection_restored(socket);
                    /* Remove the placeholder we add after reconnection */
                    document.getElementById("input").placeholder = "";
                }
              }
        });
        // console.log(">>>","chat_message", input.value, getStoredSettings("user_id"));
        // socket.emit("chat_message", input.value, getStoredSettings("user_id") );
        input.value = "";
    }
});

socket.on("connect", () => {
    console.log("LOCAL - We've just connected!", socket);
    if (chat.local_socket_connected == false){
        connection_restored(socket);
    }

    /* Check if we have a UUID in localStorage that we can use */
    console.log("LOCAL - Checking that we have a UUID:", getStoredSettings("user_id") );
    if ( !getStoredSettings("user_id") ){
        updateStoredSettings("user_id", generateUUID());
        localNotify("[LOCAL] Successfull NEW connection!","success");
    } else {
        /* If we have a UUID, we know we are REconnecting */
        localNotify("[LOCAL] Successfully (re)connected!","success");
    }   

    console.log("LOCAL - Checking for change in socket_id. Old:", getStoredSettings("socket_id")," New:", socket.id );
    if ( getStoredSettings("socket_id") !== socket.id ){
        console.log("LOCAL - Socket has changed - updating!");
        updateStoredSettings("socket_id", socket.id);
        updateStoredSettings("last_connected_at", new Date() );
    }

    console.log("LOCAL - Emitting 'client_connection' event...", getStoredSettings() );

    socket.emit("client_connection", getStoredSettings() );
});

socket.on("notify", function(eventObj) {
    console.log("event", eventObj);
    // event {"type":"notify","level":"info","dest":"all","content":"User connected"}

    if (eventObj.type == "notify"){
        localNotify(eventObj.content, eventObj.level);
    }

});

// socket.on('chat_message', function(msg, origin_user_name) {
//     var item = document.createElement('li');
//     item.textContent = (origin_user_name + ": "+ msg);
//     item.classList.add("chat");
//     messages.appendChild(item);
//     window.scrollTo(0, document.body.scrollHeight);
// });

socket.on('chat_message', function(msg_obj) {
    var item = document.createElement('li');
    item.innerHTML = ("<span id='"+msg_obj.msg_id+"' class='message-line' title='"+ JSON.stringify(msg_obj) +"'><span class='message-sender'>" + msg_obj.sender_name + "</span><span class='message-content'>" + msg_obj.content + "</span></span><span class='message-timestamp'>"+msg_obj.happened_at+"</span>");
    item.classList.add("chat");
    if (msg_obj.sender_id == 'system'){
        item.classList.add("system");
    } else {
        item.classList.add("sender-"+msg_obj.sender_id);
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('info_message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    item.classList.add("info");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

document.addEventListener("DOMContentLoaded", function (event) {

    /* Let's check if we know this user */
    if ( !getStoredSettings("user_name") ){
        chat.user_name = prompt('What is your name?');
        updateStoredSettings();
    } else {
        localNotify("[LOCAL] Welcome back <strong>"+chat.user_name+"</strong>!","success");
    }

    document.getElementById("username").innerHTML = "#" + getStoredSettings("user_name");

    /* Focus cursor on the input field */
    const firstInput = document.getElementById('input');
    // firstInput.setSelectionRange(0, firstInput.value.length);
    firstInput.focus();

});

/* Toast Notifications */

function localNotify(message = "default_message", messageType = "info", messageOptions) {
    // console.log("notify()", message, messageType);
    
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "16000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    
    if (!!messageOptions){
        Object.keys(messageOptions).forEach((key, index) => {
            console.log("Updating 'toastr.options': ",toastr.options[key],"==>",messageOptions[key]);
            toastr.options[key] = messageOptions[key];
        });
    }

    toastr[messageType](message);
}

/* Notifications */

function userAlert(message = "default_message", alertType = "info", dismissAfterSecs = 3) {

    /* 
    alertType => Bootstrap Classes 
    alert-primary
    alert-secondary
    alert-success
    alert-danger
    alert-warning
    alert-info
    alert-light
    alert-dark
    */

    $("#alert").addClass('alert-'+alertType);
    $("#alert-content").html(message);
    $("#alert").addClass('show');

    $('#alert').on('closed.bs.alert', function () {
        // do something…
    });

}


function showalert(message,alerttype) {

    $('#alertAnchor').after(''
    +'<div id="alertdiv" class="alert alert-dismissible fade show ' +  alerttype + '" role="alert">'
    +'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
    +'<span>'+message+'</span></div>');

    setTimeout(function() { 
        // this will automatically close the alert and remove this if the users doesnt close it in 5 secs
        $("#alertdiv").remove();
    }, 10000);
}

function connection_lost(socket){
    chat.local_socket_connected = false;
    console.log("Connection lost! socket.connection:",socket.connected)
    localNotify("[LOCAL] Not currently connected... <strong>Please wait a moment!</strong>","warning",{"preventDuplicates":true});
    // TODO: Add a pause or disable sending in this state! 
    document.getElementById("input").classList.add("connection_lost","disabled");
    document.getElementById("input").disabled = true;
    document.getElementById("input").placeholder = "Connection lost. Trying to reconnect...";
    document.getElementById("submitbutton").classList.add("connection_lost","disabled");
    document.getElementById("submitbutton").disabled = true;
}

function connection_restored(socket){
    chat.local_socket_connected = true; 
    console.log("Connection restored! socket.connection:",socket.connected);
    localNotify("[LOCAL] CONNECTION RESTORED!","success",{"preventDuplicates":true});
    document.getElementById("input").classList.remove("connection_lost","disabled");
    document.getElementById("input").disabled = false;
    document.getElementById("input").placeholder = "Reconnected. Please try again!";
    document.getElementById("submitbutton").classList.remove("connection_lost","disabled");
    document.getElementById("submitbutton").disabled = false;
}

/* Helper Functions */

function generateUUID() {

    if (!!crypto.randomUUID) {
        /* Not supported in all browers */
        return crypto.randomUUID();
    } else {
        /* Fallback... */
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}

// console.log(uuidv4());

/* Storage */

function updateStoredSettings(settingKey, settingValue, storageKey = "chat") {
    let chatObject = localStorage.getItem(storageKey) ? JSON.parse( localStorage.getItem(storageKey) ) : {};

    if ( !!settingKey && !!settingValue ){
        // If we get a single key to save...
        chatObject[settingKey] = settingValue; 
        localStorage.setItem(storageKey,JSON.stringify(chatObject));
    } else {
        // Otherwise we assume it's already been updated and just save the whole object
        localStorage.setItem(storageKey,JSON.stringify(window.chat));
    }

    return getStoredSettings(null, storageKey);
}

function getStoredSettings(settingKey, storageKey = "chat") {
    if (!localStorage.getItem(storageKey)){
        return false;
    }

    let chatObject = JSON.parse(localStorage.getItem(storageKey));
    if (!!settingKey){
        return chatObject[settingKey];
    } else {
        return chatObject;
    }
}

// console.log(socket.id);