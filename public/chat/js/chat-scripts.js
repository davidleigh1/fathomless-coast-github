window.chat_user = localStorage.getItem("chat_user") ? JSON.parse( localStorage.getItem("chat_user") ) : {};
window.chat_user.user_id = window.chat_user.user_id || generateUUID();

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
    // chat_user.connected = null;
    if ( !socket.connected ) {
        connection_lost(socket);
    } else if ( chat_user.local_socket_connected == false ) {
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
        msg_obj.dest_id = getStoredSettings("current_room");
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

    /* Occurs as 'socket.connected == true'  */
    /* Per documentation: 'Please note that you shouldn't register event handlers in the 
       connect handler itself, as a new handler will be registered every time the Socket reconnects' */

    if (chat_user.local_socket_connected == false){
        console.log("[LOCAL] - We've just *RE*connected after disconnection!", "socket:", socket.connected, "chat_user.local_socket:", chat_user.local_socket_connected);
        connection_restored(socket);
    } else if (chat_user.local_socket_connected == true) {
        console.log("[LOCAL] - We've just *RE*connected *WITHOUT* disconnection!", "socket:", socket.connected, "chat_user.local_socket:", chat_user.local_socket_connected);
        connection_restored(socket);
    } else {
        console.log("[LOCAL] - We've just connected for the first time!", "socket:", socket.connected, "chat_user.local_socket:", chat_user.local_socket_connected);
        chat_user.local_socket_connected = socket.connected;
        updateStoredSettings("local_socket_connected", socket.connected);
    }

    /* Check if we have a UUID in localStorage that we can use */
    console.log("[LOCAL] - Ensuring that we have a UUID stored locally. Found:", getStoredSettings("user_id") );
    if ( !getStoredSettings("user_id") ){
        updateStoredSettings("user_id", generateUUID());
        console.log("[LOCAL] Generated new UUID:", getStoredSettings("user_id"));
        localNotify("[LOCAL] Successful NEW connection!","success");
    } else {
        /* If we have a UUID, we know we are REconnecting */
        localNotify("[LOCAL] Successfully (re)connected!","success");
    }   

    console.log("[LOCAL] - Checking for change in socket_id. Old:", getStoredSettings("socket_id")," New:", socket.id );
    if ( getStoredSettings("socket_id") !== socket.id ){
        console.log("[LOCAL] - Socket has changed - updating!");
        updateStoredSettings("socket_id", socket.id);
        updateStoredSettings("last_connected_at", new Date() );
    }

    console.log("[LOCAL] - Requesting server-side approval via 'client_registration_request' event...", getStoredSettings() );

    // socket.emit("client_registration", getStoredSettings() );
    // TODO: Handle client_registration_approved response
    // TODO: Handle client_registration_rejected response
    // NOTE: Can we use a callback???? - not here as we also call this in socket.on("client_registration_rejected") and we need the same response handler for both!
    socket.emit("client_registration_request", getStoredSettings(), (response) => {
        if (response) {
            console.log("ACK <<<", response);
        } else {
            console.log("Something else!");
        }
    });
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

    const is_direct_msg = (msg_obj.dest_id == getStoredSettings("user_id")) ? true : false;
    const direct_class = (is_direct_msg) ? "direct" : "broadcast"

    var item = document.createElement('li');
    item.innerHTML = ("<span id='"+msg_obj.msg_id+"' class='message-line "+direct_class+"' title='"+ JSON.stringify(msg_obj) +"'><span class='message-sender'>" + msg_obj.sender_name + "</span><span class='message-content'>" + msg_obj.content + "</span></span><span class='message-timestamp'>"+msg_obj.happened_at+"</span>");
    item.classList.add("chat");
    item.classList.add(direct_class);
    if (msg_obj.sender_id == 'system'){
        item.classList.add("system");
    } else {
        item.classList.add("sender-"+msg_obj.sender_id);
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

    logChatHistory(msg_obj);

});

socket.on('info_message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    item.classList.add("info");
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on("disconnect", (reason) => {
    console.log("\n\nDISCONNECT!\nReason:",reason,"\n\n");
});

socket.on('connect_error', function() {
    console.error("\n\nCONNECTION ERROR!\n\n");
});

socket.io.on("reconnect_attempt", () => {
    console.log("\n\nRECONNECTION ATTEMPT!\n\n");
});

socket.io.on("reconnect", () => {
    console.log("\n\nRECONNECTED!\n\n");
});

socket.on("client_registration_rejected", function (rejection_reason){

    /* We must block new username being same as old username ONLY in the case of a rejected registration */
    /* meaning, if the new is the same as the old, we simply must not send it to the server */
    
    const old_username = getStoredSettings("user_name");
    let prompt_text = rejection_reason;

    if (rejection_reason == "user_already_active_in_another_tab"){
        /* No-way back from here! We cannot allow the chat to happen in more than one tab */
        alert("Chat is already open in another computer or browser tab. Hopefully soon, I'll be able to take you to that tab!");
        return document.location.href = "/no-chat/";
    }


    if (rejection_reason == "username_in_use"){
        prompt_text = "Username '"+old_username+"' is already in use. Please enter a new username."
    }

    let new_username = updateUsername(prompt_text);
    while (old_username.toLowerCase() == new_username.toLowerCase() ){
        new_username = updateUsername("New username must be different from old username");
    }
    console.log("Try to reconnect...");
    socket.emit("client_registration_request", getStoredSettings() );
});

// io.to(socket.id).emit("joined_room", {"new_room": room, "all_rooms": socket.rooms});
socket.on("joined_room", function (rooms_obj){
    updateStoredSettings("current_room",rooms_obj.new_room);
    
    /* List of rooms includes OWN socket.id intended for direct messaging - removing it here */
    const rooms_without_self = rooms_obj.all_rooms.filter(function(room) {
        return room !== socket.id;
    });
    updateStoredSettings("all_rooms",rooms_without_self);
});


socket.onAny((event, ...args) => {
    console.log(`[EVENT] got event: ${event}`, args);
});

/* OnReady Handlers */

document.addEventListener("DOMContentLoaded", function (event) {

    /* Let's check if we know this user */
    if ( !getStoredSettings("user_name") ){
        // chat_user.user_name = updateUsername('What is your name?');
        // updateStoredSettings();
        updateUsername('What is your name?');
    } else {
        localNotify("[LOCAL] Welcome back <strong>"+chat_user.user_name+"</strong>!","success");
    }

    document.getElementById("username").innerHTML = "@" + getStoredSettings("user_name");
    document.getElementById("username").addEventListener("click", function(){
        updateUsername("Update Username",getStoredSettings("user_name"));
        alert("TODO: Update on server side!");
    });

    /* Focus cursor on the input field */
    const firstInput = document.getElementById('input');
    // firstInput.setSelectionRange(0, firstInput.value.length);
    firstInput.focus();

    /* Disable relevant link */
    const linkToDisable = window.location.hostname.endsWith("herokuapp.com") ? "heroku" : "localhost";
    document.getElementById(linkToDisable).removeAttribute("href");
    document.getElementById(linkToDisable).classList.add("disabled-link");

    /* Restore chat history */
    console.log("CHECKING FOR CHAT HISTORY!!", localStorage.getItem("chat_history"));
    restoreChatHistory(getStoredSettings("current_room"));

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
    chat_user.local_socket_connected = false;
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
    chat_user.local_socket_connected = true; 
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

function updateUsername(promptMessage = "default message", defaultUsername = "") {

    while( !answer ){
        var answer = prompt(promptMessage, defaultUsername);
    };
    chat_user.user_name = answer;
    updateStoredSettings();
    document.getElementById("username").innerHTML = "#" + chat_user.user_name;
    return chat_user.user_name;
}

// console.log(uuidv4());

/* Storage */

function updateStoredSettings(settingKey, settingValue, storageKey = "chat_user") {
    let chatObject = localStorage.getItem(storageKey) ? JSON.parse( localStorage.getItem(storageKey) ) : {};

    if ( !!settingKey && !!settingValue ){
        // If we get a single key to save...
        chatObject[settingKey] = settingValue; 
        localStorage.setItem(storageKey,JSON.stringify(chatObject));
    } else {
        // Otherwise we assume it's already been updated and just save the whole object
        localStorage.setItem(storageKey,JSON.stringify(window.chat_user));
    }

    return getStoredSettings(null, storageKey);
}

function getStoredSettings(settingKey, storageKey = "chat_user") {
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

function logChatHistory(msg_obj) {
    console.log("logChatHistory()",msg_obj);

        /* Locate and initiate chat_history{} from storage */
        const local_chat_history = localStorage.getItem("chat_history") || "{}";
        const chat_history = JSON.parse(local_chat_history);
    
        /* Make sure we correctly log this as history */
        msg_obj.is_history = true;
    
        /* Check if the relevant room exists, if not, create it... */
        const relevant_room = msg_obj.dest_id;
        if (!chat_history[relevant_room]){
            chat_history[relevant_room] = [];
        }
    
        /* If we have reached max-capacity, remove oldest log */
    
        /* Add the newest log */
        chat_history[relevant_room].push(msg_obj);
    
        /* Stringify chat_history{} and send it back to localStorage */
        localStorage.setItem('chat_history', JSON.stringify(chat_history));

}

function restoreChatHistory(room) {
    const ls_chat_history = localStorage.getItem("chat_history");
    const chat_history = JSON.parse(ls_chat_history);
    if (!ls_chat_history){
        return localNotify("No chat history found.","warning");
    }
    if (!!ls_chat_history && !!chat_history && (!chat_history[room] || chat_history[room].length == 0) ){
        return localNotify("No chat history found for this room (#"+room+").","warning");
    }
    console.log("Logs to restore!",chat_history[room]);
    /* Need to load backwards (from oldest to newest to maintain chronological order!) */
    // for (let msg = chat_history[room].length; msg < 0 ; msg--) {
    // for (var i = chat_history[room].length - 1; i >= 0; i--){
    for (var i = 0; i < chat_history[room].length; i++){
        if (chat_history[room][i].sender_id == "system") continue;
        postMessage( chat_history[room][i] );
    }
    
}

function postMessage(msg_obj) {
    console.log("postMessage()", msg_obj.happened_at);
    const is_direct_msg = (msg_obj.dest_id == getStoredSettings("user_id")) ? true : false;
    const direct_class = (is_direct_msg) ? "direct" : "broadcast";

    const is_history_msg = msg_obj.is_history || false;
    const history_class = (is_history_msg) ? "history" : "live";

    var item = document.createElement('li');
    item.innerHTML = ("<span id='"+msg_obj.msg_id+"' class='message-line "+direct_class+"' title='"+ JSON.stringify(msg_obj) +"'><span class='message-sender'>" + msg_obj.sender_name + "</span><span class='message-content'>" + msg_obj.content + "</span></span><span class='message-timestamp'>"+msg_obj.happened_at+"</span>");
    item.classList.add("chat");
    item.classList.add(direct_class);
    item.classList.add(history_class);
    if (msg_obj.sender_id == 'system'){
        item.classList.add("system");
    } else {
        item.classList.add("sender-"+msg_obj.sender_id);
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}