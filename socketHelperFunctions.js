module.exports = (io, socket, socketChatObj) => {
    console.log("socketHelperFunctions.js");
    // console.log("socketHelperFunctions.js:", "socketChatObj:",socketChatObj);

    // const countObject = require('countObject');
    // const users = require("./socketHelperFunctions.js");
    const { v4: uuidv4 } = require('uuid');

    logNewUser = function (userObj){
        console.log("LOGGING NEW USER!");
        const user = {};
        user.user_id = userObj.user_id;
        user.user_name = userObj.user_name;
        user.socket_id = userObj.socket_id;
        user.first_connected_at = new Date().toISOString();
        user.last_connected_at = new Date().toISOString();
        socketChatObj.activeUsers[user.user_id] = user;
        return socketChatObj.activeUsers[user.user_id];
    }
    generateUUID = function () {
        return uuidv4();
    }

    joinRoom = function (socket, room, notify = true) {

        console.log("joinRoom()",socket.data.user_name, "-->", room);

        socket.join(room);

        if (!!notify){

            /* Prepare chat_message */
            const msg_obj = {};
            msg_obj.msg_id = generateUUID();
            msg_obj.sender_id = 'system';
            msg_obj.sender_name = 'System';
            msg_obj.msg_type = 'chat_message';
            msg_obj.happened_at = new Date().toISOString();
            msg_obj.is_history = false;

            /* Add list of users in this chat */
            // const arrayOfUsernames = findUsers("user_name",null,"user_name").sort();
            const arrayOfUsernames = sortArray( findMatchingSockets("user_name", null, "user_name") );
            const usersListContent = "<br>Now in chat ("+arrayOfUsernames.length+"): <span class=\"inline-username\">" + arrayOfUsernames.join("</span>, <span class=\"inline-username\">") + "</span>"; 
            
            
            /* Send message to user who joined room */
            msg_obj.dest_id = socket.data.user_id;
            msg_obj.dest_socket_id = socket.id;
            msg_obj.content = "You have successfully joined room <span class=\"joined inline-username\">#" + room +"</span>";
            msg_obj.content += usersListContent;
            io.to(socket.id).emit("chat_message", msg_obj);
            // TODO: Perhaps the following should be sent regardless of the notify setting!
            // const user_rooms = io.sockets.sockets.get(socket.id).adapter.sids;
            io.to(socket.id).emit("joined_room", {"new_room": room, "all_rooms": Array.from(socket.rooms)});

            
            /* Send message to everyone else in the room */
            msg_obj.dest_id = room;
            msg_obj.dest_socket_id = room;
            msg_obj.content = "<span class=\"joined inline-username\">" + socket.data.user_name + "</span> has joined room <span class=\"joined inline-username\">#" + room +"</span>";
            msg_obj.content += usersListContent;
            io.in(room).except(socket.id).emit("chat_message", msg_obj);



        }
        
    }

    findMatchingSockets = function (matchKey, matchValue, returnKey) {
        console.log("findMatchingSockets() - if ", matchKey , " = ", matchValue , " then return:", returnKey);
        matchingUsers = [];

        io.of("/").adapter.sids.forEach(function(value, key) {
            console.log(key , " => " , io.sockets.sockets.get(key).data);
            console.log("checking:", io.sockets.sockets.get(key).data[matchKey]);
            if (!!io.sockets.sockets.get(key).data[matchKey] && matchValue == undefined){
                console.log("Case 1 - Match!");
                /* KEY EXISTS ONLY */
                returnOnlyRequestedElem(io.sockets.sockets.get(key).data);
                // matchingUsers.push(io.sockets.sockets.get(key).data);
            }
            if (!!matchValue && io.sockets.sockets.get(key).data[matchKey] == matchValue){
                /* MATCHING KEY VALUE */
                console.log("Case 2 - Match!");
                // DONE: Return only the returnKey!
                returnOnlyRequestedElem(io.sockets.sockets.get(key).data);
                // matchingUsers.push(io.sockets.sockets.get(key).data);
            }
        })

            function returnOnlyRequestedElem(userObjectToReturn){
                // console.log("Found this user:",userObjectToReturn);
                if (!returnKey){
                    matchingUsers.push(userObjectToReturn);
                } else {
                    matchingUsers.push(userObjectToReturn[returnKey]);
                }
            }

        console.log("returning:",matchingUsers.length,matchingUsers);
        return matchingUsers;

    };

    // findUsers = function (matchKey, matchValue, returnKey) {
    //     console.log("findUsers()",matchKey, matchValue, returnKey);
    //     matchingUsers = [];

    //     for (let userKey in socketChatObj.activeUsers) {
    //     // console.log("Checking userKey:",userKey);
    //     // console.log(`users.${prop} = ${users[prop]}`);
        
    //         for (let [key, value] of Object.entries(socketChatObj.activeUsers[userKey])) {
    //         // console.log(userKey, "key:", key, "value:" , value);
            
    //             if (key == matchKey){
    //                 // console.log("key == matchKey", userKey, "---->", key, ":" , value);
    //                 if (value == matchValue){
    //                     // Exact non-case-specific match
    //                     // If matchvalue = "", we will match users without a value
    //                     console.log("Match!");
    //                     matchingUsers.push(socketChatObj.activeUsers[userKey]);
    //                 }
    //                 if (key == matchKey && matchValue == undefined){
    //                     // console.log("return all with this key existing");
    //                     // matchingUsers.push(users[userKey]);
    //                     returnOnlyRequestedElem(socketChatObj.activeUsers[userKey])
    //                 }
    //             }
    //         }
            
    //         // console.log(users[prop]);
    //     }

    //     function returnOnlyRequestedElem(userObjectToReturn){
    //         console.log("Found this user:",userObjectToReturn);
    //         if (!returnKey){
    //             matchingUsers.push(userObjectToReturn);
    //         } else {
    //             matchingUsers.push(userObjectToReturn[returnKey]);
    //         }
    //     }
    //     console.log("Found " + matchingUsers.length + " users:", matchingUsers);
    //     return matchingUsers;
    // }
    getUserRooms = function (userId) {
    }

    logStatus = function() {
        console.log("\n\n---- logStatus() ------------------");
        console.log("Users Array:", Object.keys(socketChatObj.activeUsers).length);
        console.log("~~~~~ socketChatObj.activeUsers ~~~~~~~~~~~~~~~~~~~~~~~");
        console.log(socketChatObj.activeUsers);
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("io.engine.clientsCount:", io.engine.clientsCount);
        console.log("socket instances in namespace:", io.of("/").sockets.size);
        // console.log("Sockets:",socketChatObj.fetchSockets.length,Object.keys(socketChatObj.fetchSockets).length)
        // console.log("io.sockets.adapter.rooms:\n",io.sockets.adapter.rooms);

        console.log("---------------");
        // main namespace
        console.log('const rooms = io.of("/").adapter.rooms;');
        console.log(io.of("/").adapter.rooms);
        console.log("---------------");
        console.log('const sids = io.of("/").adapter.sids;');
        console.log(io.of("/").adapter.sids);
        console.log("---------------");
        console.log("-- adapter.sids.forEach() -------------");

            io.of("/").adapter.sids.forEach(function(value, key) {
                // console.log(key , " = " , value);
                console.log("Socket:",key, io.sockets.sockets.get(key).connected, io.sockets.sockets.get(key).data);
            })


        console.log("-----------------------------------\n\n");
        console.log("--- Usernames in 'main' -----------");
        findMatchingSockets("user_name", null, "user_name");
        console.log("-----------------------------------\n\n");
    }

    sortArray = function(arrayToSort){
        return arrayToSort.sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }

};