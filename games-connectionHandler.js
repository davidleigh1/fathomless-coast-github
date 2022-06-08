module.exports = (io, socket, socketChatObj) => {

    console.log("LOAD FILE: games-connectionHandler.js");

    require("./socketHelperFunctions.js");

    console.log("\n\nNEW *GAMES* CONNECTION DETECTED!!!!\nAPP:  ", socket.handshake.query.app ,"   \n\n\n");
    
    /* Standardize for all apps */
    socket.data = Object.assign(socket.data, socket.handshake.query);
    console.log(">> User connection detected for app:", socket.data.app);

    if ( socket.data.app == "connect" ){
        console.log("[Connect] user detected:", socket.data);
        console.log("[Connect] Adding user '" + socket.data.thisPlayerName + "' on socket '" + socket.id + "' to room 'games-lobby'");
        socket.join("games-lobby");
        io.to(socket.id).emit("joined_games_lobby");
        // io.to(socket.id).emit("update_games_lobby",lobby_user_count());
        // logGamesStatus("/games_io");
    }





    // const chat_clientRegistrationEvent = function (settingsObj) {
    //     console.log('\n\n==> client_registration:\n', settingsObj);

    //     console.log("Assiging user_name: '",settingsObj.user_name,"' to socket.data.user_name for socket:", socket.id);
    //     socket.data.user_name = settingsObj.user_name;
    //     /* NOTE: This will override the .user_name line above! */
    //     socket.data = Object.assign(socket.data, settingsObj);

    //     // logConnection(settingsObj);

    //     /* Confirm if we recognize this user */
    //     if ( !socketChatObj.activeUsers[settingsObj.user_id] ){
    //         console.log("User not found in users{} with UUID:",settingsObj.user_id);
    //         const newUser = logNewUser(settingsObj);

    //         /* Prepare chat_message */
    //         const msg_obj = {};
    //         msg_obj.msg_id = generateUUID();
    //         msg_obj.sender_id = 'system';
    //         msg_obj.sender_name = 'System';
    //         msg_obj.dest_id = null;
    //         msg_obj.msg_type = 'chat_message';
    //         msg_obj.content = "<span class=\"joined inline-username\">" + newUser.user_name + "</span> has joined! ("+newUser.socket_id+")";
    //         msg_obj.happened_at = new Date().toISOString();
    //         msg_obj.is_history = false;

    //         /* Add list of users in this chat */
    //         // const arrayOfUsernames = findUsers("user_name",null,"user_name").sort();
    //         const arrayOfUsernames = sortArray( findMatchingSockets("user_name", null, "user_name") );
    //         msg_obj.content += "<br>Now in chat ("+arrayOfUsernames.length+"): <span class=\"inline-username\">" + arrayOfUsernames.join("</span>, <span class=\"inline-username\">") + "</span>";


    //         io.emit("chat_message", msg_obj);

    //     } else {
    //         console.log("User found!",settingsObj.user_id);
    //         // users[settingsObj.user_id].last_connected_at = new Date();

    //     // if ( !users[settingsObj.socket_id] ){
    //     //     console.error("USER NOT FOUND!", settingsObj);
    //     // } else {
    //         socketChatObj.activeUsers[settingsObj.user_id].user_name = settingsObj.user_name;
    //         socketChatObj.activeUsers[settingsObj.user_id].socket_id = settingsObj.socket_id;
    //         socketChatObj.activeUsers[settingsObj.user_id].last_connected_at = new Date().toISOString();

    //         const reconnection_msg = "User '"+ socketChatObj.activeUsers[settingsObj.user_id].user_name +"' is back! ("+socketChatObj.activeUsers[settingsObj.user_id].socket_id+")";
    //         io.emit("notify", {'type':'notify', level: 'success', 'dest':'all', 'content': reconnection_msg} );



    //     }
    //     // console.log("\n-------------\nUsers",socketChatObj.activeUsers,"Total users:",Object.keys(socketChatObj.activeUsers).length,"\n-------------\n");
    //     console.log("\n -- End of client_registration --");
    //     // logStatus();
    // };

    // const chat_clientRegistrationRequestEvent = function (settingsObj, callback) {
    //     console.log('\n\n==> client_registration_request received from ',socket.id,':\n', settingsObj);

    //     /* Check for known UUID - this is akin to a session ID */
    //     console.log("Checking if we already have a user with ID: '"+settingsObj.user_id+"'");
    //     const matchedUserIds = findMatchingSockets("user_id", settingsObj.user_id);
    //     if ( matchedUserIds.length > 0 ){
    //         console.log("REJECT! FOUND MATCHING USER_ID:", matchedUserIds.length, matchedUserIds);
    //         /* REJECT - We already have a user with this user_ID */
    //         const rejection_reason = "user_already_active_in_another_tab";
    //         return io.to(socket.id).emit("client_registration_rejected", rejection_reason);
    //     }


    //     /* Check for unique username */
    //     console.log("Checking if requested user_name '"+settingsObj.user_name+"' has already been taken...");
    //     const matchedUsers = findMatchingSockets("user_name", settingsObj.user_name);
    //     if ( matchedUsers.length > 0 ){
    //         console.log("REJECT! FOUND MATCHING USERS:", matchedUsers.length, matchedUsers);
    //         /* REJECT - We already have a user with this user_name */
    //         const rejection_reason = "username_in_use";
    //         // TODO: Or do emit or callback() - no need for both!
    //         // We also call this in socket.on("client_registration_rejected") and we need the same response handler for both!
    //         // callback("client_registration_rejected", rejection_reason);
    //         return io.to(socket.id).emit("client_registration_rejected", rejection_reason);
    //     } else {
    //         /* APPROVE */
    //         console.log("USER '"+ settingsObj.user_name +"' APPROVED!");
    //         socket.data = Object.assign(socket.data, settingsObj);
    //         console.log("Adding user '"+socket.data.user_name+"' (on socket '"+socket.id+"') to main room 'main'");
    //         socket.leave("lobby");
            
    //         io.to(socket.id).emit("client_registration_approved");

    //         // socket.join("main");
    //         joinRoom(socket,"main");

    //             // /* Prepare chat_message */
    //             // const msg_obj = {};
    //             // msg_obj.msg_id = generateUUID();
    //             // msg_obj.sender_id = 'system';
    //             // msg_obj.sender_name = 'System';
    //             // msg_obj.dest_id = null;
    //             // msg_obj.msg_type = 'chat_message';
    //             // msg_obj.content = "<span class=\"joined inline-username\">" + socket.data.user_name + "</span> has joined! ("+socket.id+")";
    //             // msg_obj.happened_at = new Date().toISOString();
    //             // msg_obj.is_history = false;
    
    //             // /* Add list of users in this chat */
    //             // // const arrayOfUsernames = findUsers("user_name",null,"user_name").sort();
    //             // const arrayOfUsernames = sortArray( findMatchingSockets("user_name", null, "user_name") );
    //             // msg_obj.content += "<br>Now in chat ("+arrayOfUsernames.length+"): <span class=\"inline-username\">" + arrayOfUsernames.join("</span>, <span class=\"inline-username\">") + "</span>";
    //             // io.emit("chat_message", msg_obj);
            

    //     }

    //     logStatus();
    // };

    // const chat_chatMessageEvent = function (msg_obj, callback) {
    //     console.log("New Incoming Message from '" + socket.data.user_name + "' on socket: '"+socket.id+"':\n", msg_obj);
    //     callback("Server says 'got it' msg_id:"+msg_obj.msg_id);
    //     // console.log("New Incoming Message from '"+msg_obj.sender_name+"': " + msg_obj.content);
    //     io.emit('chat_message', msg_obj);
    //     // TODO: Add green tick on confirmed receipt from all users 
    // };

    const disconnectEvent = (payload) => {
        console.log("\n\n\n\n-------------");
        console.log("Disconnection detected\nSocket:",socket.id, "\nPayload:" ,payload, "\nsocket.data:" ,socket.data);
        console.log("-------------\n\n\n\n");

        // if (socket.data.app == "chat"){
        //     // TODO: What if returns 0 or >1 ?
        //     // const disconnectedUserObj = findUsers("socket_id", socket.id)[0] || {};
        //     const disconnectedUserObj = findMatchingSockets("socket_id", socket.id)[0] || socket.data;
        //     delete socketChatObj.activeUsers[disconnectedUserObj.user_id];
        //     const disconnection_msg = "User '"+disconnectedUserObj.user_name+"' disconnected";
        //     console.log(disconnection_msg, "on socket: '"+ socket.id + "'. Total remaining connections:",Object.keys(io.of("/").adapter.sids).length,"");
        //     io.emit("user_disconnected", {'socket_id':socket.id, 'data': socket.data } );
        // }
    };

    // const chat_requestUserListEvent = (payload, callback) => {
    //     console.log("userlist request by...", payload);
    //     callback(findMatchingSockets("user_name"));
    // };

    // const readOrder = (orderId, callback) => {
    //     // ...
    // };

    socket.on("disconnect", disconnectEvent);

    socket.on("generate_game_url", function(msg_obj,callback){
        console.log(msg_obj, callback);

        /* For expiry timestamp */
        const minutesToAdd = 10;
        const currentDateTime = Date.now();
        const futureDateTime = Date.now() + (minutesToAdd * 60000);

        /* Random Game ID */
        const share_id = generateUUID();
        
        const response_text = "app="+msg_obj.app+"&game_id="+share_id+"&expiry="+futureDateTime;
        return callback(response_text);
    });



    socket.onAny((event, ...args) => {
        console.log(`[GAME EVENT] got event: ${event}`, args);
    });


    // socket.on("client_registration", chat_clientRegistrationEvent);
    // socket.on("client_registration_request", chat_clientRegistrationRequestEvent);
    // socket.on("chat_message", chat_chatMessageEvent);
    // socket.on("request_userlist", chat_requestUserListEvent);
    // socket.on("join", joinEvent);
    // socket.on("order:read", readOrder);
};
