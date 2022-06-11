const socketHelperFunctions = require("./socketHelperFunctions.js");

module.exports = (io, socket, games_list) => {

    console.log("LOAD FILE: games-connectionHandler.js");
    require("./socketHelperFunctions.js");

    /* Define classes & prototypes */
    // const allplayers = {};
    // socket.on('login',(userID)=>{
    //     allSockets[userID] = socket; 
    // })

    // io.of("/games_io").adapter.on("create-room", (room) => {
    //     console.log(`[SOCKET EVENT] room ${room} was created`);
    //   });
      
    //   io.of("/games_io").adapter.on("join-room", (room, id) => {
    //     console.log(`[SOCKET EVENT] socket ${id} has joined room ${room}`);
    //   });

    const minsUntilExpiry = 10;

    class Game {

        id;
        room_id;
        app;
        // names = ['Player 1','Player 2'];
        server_names = [];
        server_sockets = [];
        // created_at = Date.now();
        // expires_at = Date.now() + (minsUntilExpiry * 60000);

        constructor(app, submitted_names = [], submitted_sockets = []) {
            // this.id = Math.floor(Math.random() * (99999 - 17353 + 1) + 17353);
            this.id = generateUUID();
            this.server_max_players = 2;
            this.server_starting_player = randomInt(1,2);

            var default_names_array = this.server_names;
            var submitted_names_array = (typeof submitted_names == "string") ? submitted_names.split(',') : submitted_names; 
            for(var i = 0; i < submitted_names_array.length; i++) {
               default_names_array[i] = submitted_names_array[i];
            }
            this.server_names = default_names_array;

            var submitted_sockets_array = (typeof submitted_sockets == "string") ? submitted_sockets.split(',') : submitted_sockets;
            this.server_sockets = submitted_sockets_array || this.server_sockets;

            this.room_id = this.id;
            this.app = app || "Unknown";
            this.created_at = Date.now();
            this.expires_at = Date.now() + (minsUntilExpiry * 60000);
            games_list[this.id] = this;
            console.log("--------------------------");
            console.log("Created new game! ID:", this.id);
            console.log(games_list[this.id]);
            console.log(games_list);
            console.log("Current waiting games:",Object.keys(games_list).length)
            console.log("--------------------------");
            // console.log(io.of("/games").adapter.rooms);
            // console.log(io.in("games-lobby").allSockets());
            console.log(io.of("/games_io").in("games-lobby").adapter.sids);
            console.log("--------------------------");
            console.log("\n\n\n\n");
            console.log(">>> this.server_starting_player:", this.server_starting_player);
            console.log("\n\n\n\n");
        }

        introduceSelf() {
            console.log(`Hi! This games's ID is: ${this.id}`);
        }

    }

    /* Only admit players with usernames */
    if ( socket.data.thisPlayerName || 
        socket.handshake.query.thisPlayerName && 
        socket.data.thisPlayerName != 'null' &&
        socket.handshake.query.thisPlayerName != 'null'
    ) {

        console.log("\n\nNEW *GAMES* CONNECTION DETECTED!!!!\nAPP:  ", socket.handshake.query.app ,"   \n\n\n");
        
        /* Standardize for all apps */
        socket.data = Object.assign(socket.data, socket.handshake.query);
        console.log(">> User connection detected for app:", socket.data.app);

        // if ( socket.data.app == "connect" ){
            console.log("[Connect] user detected:", socket.data);
            console.log("[Connect] Adding user '" + socket.data.thisPlayerName + "' on socket '" + socket.id + "' to room 'games-lobby'");
            // socket.set('nickname', "Earl");
            socket.join("games-lobby");
            // allplayers[socket.id] = socket.data;
            io.to(socket.id).emit("joined_games_lobby");
            // io.to(socket.id).emit("update_games_lobby",lobby_user_count());

            console.log("***********");
            console.log("GAME LOBBY USERS:", io.of("/games_io").in("games-lobby").adapter.sids);
                io.of("/games_io").in("games-lobby").adapter.sids.forEach(function(value, key) {
                    console.log(key, ">", io.of("/games_io").sockets.get(key).handshake.query.thisPlayerName );
                });
            console.log("***********");
            console.log("ALL GAME USERS:", io.of("/games_io").adapter.sids);
                io.of("/games_io").adapter.sids.forEach(function(value, key) {
                    console.log(key, ">", io.of("/games_io").sockets.get(key).handshake.query.thisPlayerName );
                });
            console.log("***********");
            console.log("ALL ROOMS:", io.of("/games_io").adapter.rooms);
                // io.of("/games_io").adapter.sids.forEach(function(value, key) {
                //     console.log(key, ">", io.of("/games_io").sockets.get(key).handshake.query.thisPlayerName );
                // });
            console.log("***********");

            // logGamesStatus("/games_io");
        // }

    } else {

        console.log("\n\n\n~~~~~~~~~~~");
        console.log("CONNECTION REJECTED - NO USERNAME FOUND!", socket.id);
        console.log("socket.handshake.query:\n", socket.handshake.query);
        console.log("~~~~~~~~~~~\n\n\n");

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

        update_lobby_stats();

        // delete allplayers[socket.id];

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

    const update_lobby_stats = (event_playload) => {

        // console.log(">>>>>> update_lobby_stats()");
        // console.log(io.of("/games_io").adapter.rooms.get("games-lobby"));

        /* Need to declare this in two steps - to provide an empty array - in case the map() is empty */
        const users_map = io.of("/games_io").adapter.rooms.get("games-lobby") || new Map();
        // const count_array = Array.from( users_map );
        // const lobby_count = count_array.length;
        const lobby_count = Array.from( users_map ).length;

        const sids_obj = io.of("/games_io").in("games-lobby").adapter.sids;
        // const sids_obj = io.in("games-lobby").adapter.sids;
        console.log("sids_obj",sids_obj);
        const lobby_usernames = [];
        const lobby_users = {};
        sids_obj.forEach(function(value, key) {
            let thisSocket = io.of("/games_io").sockets.get(key);
            // console.log(key);
            // console.log( io.of("/games_io").sockets.get(key).handshake.query.thisPlayerName );
            lobby_usernames.push(thisSocket.handshake.query.thisPlayerName);
            lobby_users[key] = thisSocket.handshake.query;
        });

        const return_object = {
            "lobby_count": lobby_count,
            "lobby_usernames": lobby_usernames,
            "lobby_users": lobby_users
        };

        console.log("lobby_users - no nulls!\n",lobby_usernames,"\n",lobby_users);

        io.of("/games_io").to("games-lobby").emit("lobby_update",return_object);
        // console.log(return_object);
        // return callback(return_object);
        return return_object;
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
        console.log("[INCOMING EVENT] generate_game_url", msg_obj, callback);

        /* Log this Game ID as we'll check for it later when users load it in the page URL */
        const new_game_obj = new Game("connect", msg_obj.thisPlayerName, socket.id);
        console.log("---->> Socket:",socket.id," to join room:", new_game_obj.room_id);
        console.log("---->>", games_list);
        socket.join(new_game_obj.room_id);

        let response_url = "";
        response_url += "app="+new_game_obj.app;
        response_url += "&game_id="+new_game_obj.id;
        response_url += "&expiry="+new_game_obj.expires_at;

        return callback(response_url);
    });

    socket.on("request_lobby_update", function(event_playload, callback){
        console.log("[INCOMING EVENT] lobby_update", event_playload);

        // const lobby_count = Array.from( io.of("/games_io").adapter.rooms.get("games-lobby") ).length;

        // const sids_obj = io.of("/games_io").in("games-lobby").adapter.sids;
        // const lobby_usernames = [];
        // const lobby_users = {};
        // sids_obj.forEach(function(value, key) {
        //     let thisSocket = io.of("/games_io").sockets.get(key);
        //     // console.log(key);
        //     // console.log( io.of("/games_io").sockets.get(key).handshake.query.thisPlayerName );
        //     lobby_usernames.push(thisSocket.handshake.query.thisPlayerName);
        //     lobby_users[key] = thisSocket.handshake.query;
        // });

        // const return_object = {
        //     "lobby_count": lobby_count,
        //     "lobby_usernames": lobby_usernames,
        //     "lobby_users": lobby_users
        // };
        // console.log(return_object);

        const return_object = update_lobby_stats(event_playload);

        io.of("/games_io").to("games-lobby").emit("lobby_update",return_object);
        return callback(return_object);
    });

    socket.on("request_to_join_game", function(room_id, callback){
        console.log("Request from socket:",socket.id," to join room:", room_id);

        /* Before joining room - check that the request is valid */
        /* Check if valid game_id */
        console.log(">> Game/Room ID found in gameslist{}?", !!games_list[room_id]);
        if ( !!games_list[room_id] ){
            /* Check if game entry has expired */
            console.log(">> Game entry in gameslist{} not yet expired?", Date.now() > !!games_list[room_id].expires_at);
            /* Check if other player(s) are still connected */
            /* Check if game has already started */
            console.log(">> Game has already started?", !!games_list[room_id].started_at, games_list[room_id].started_at );
            /* Check if we have exceeded maxplayers */
            console.log(">> Players already joined game:", games_list[room_id].server_names.count, games_list[room_id].server_names  );

                
            socket.join(room_id);
            socket.leave("games-lobby");
            console.log("Joined room!",socket.data, "-->", room_id);
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~");
            console.log(games_list);
            if (games_list[room_id] && games_list[room_id].server_names.indexOf(socket.data.thisPlayerName) == -1 ){
                games_list[room_id].server_names.push(socket.data.thisPlayerName);
            }
            if (games_list[room_id] && games_list[room_id].server_sockets.indexOf(socket.id) == -1 ){
                games_list[room_id].server_sockets.push(socket.id);
            }
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~");
            // const room_users_1 = io.of("/games_io").in(room_id).adapter.sids || new Map();
            // const count_array = Array.from( users_map );
            // const lobby_count = count_array.length;
            // const room_users_1_count = Array.from( room_users_1 ).length;
            const room_users_2 = io.of("/games_io").adapter.rooms.get(room_id) || new Map();
            const room_users_2_count = Array.from( room_users_2 ).length;

            const return_object = { 
                "status":"joined",
                "room_id": room_id,
                "room_users_2": room_users_2,
                "room_users_2_count": room_users_2_count,
                // "room_users_1": room_users_1,
                // "room_users_1_count": room_users_1_count,
            };

            console.log("return_object:\n",return_object);

            if (room_users_2_count == 2){
                console.log("We have required # of players for this game of '"+socket.data.app+"' (2) - starting now!");
                serverStartGame(room_id, socket.data.app);
            } else {
                console.log("Waiting as we only have "+room_users_2_count+" player(s) for this game of '"+socket.data.app+"'. We need 2.");
            } 

            return callback(return_object);
        
        } else {

            const return_object = { 
                "status":"rejected",
                "reason":"invalid_game_id",
                "message":"Your Game ID was not found. Please request or generate a new link.",
                "room_id": room_id
            };
            console.log("return_object:\n",return_object);
            return callback(return_object);

        }
         

    });

    socket.on("player_click", function(click_obj){
        console.log("[EVENT] player_click - from player:",click_obj.player_name, "(socket:",socket.id,") click:\n",click_obj);

        io.of("/games_io").to(click_obj.room_id).except(socket.id).emit("opponent_click",click_obj);

        const return_msg = "OK! Got click: "+click_obj.clicked_cell_id
        return return_msg
    });

    socket.onAny((event, ...args) => {
        console.log(`[GAME EVENT] got event: ${event}`, args);
    });


    function serverStartGame(room_id, appType) {
        console.log("serverStartGame()",room_id, appType);
        games_list[room_id].started_at = Date.now();
        const return_object = games_list[room_id];

        /* Since we might be restarting/replaying an existing game - we need to re-randomize the starting player  */
        return_object.server_starting_player = randomInt(1,2);

        console.log("Sending this game entry",games_list[room_id]);
        io.of("/games_io").to(room_id).emit("server_start_game",return_object);
        // socket.data = Object.assign(socket.data, socket.handshake.query);
    }

    // socket.on("client_registration", chat_clientRegistrationEvent);
    // socket.on("client_registration_request", chat_clientRegistrationRequestEvent);
    // socket.on("chat_message", chat_chatMessageEvent);
    // socket.on("request_userlist", chat_requestUserListEvent);
    // socket.on("join", joinEvent);
    // socket.on("order:read", readOrder);
};
