module.exports = (io, socket, socketChatObj) => {
    console.log("socketHelperFunctions.js:", "socketChatObj:",socketChatObj);

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
    findUsers = function (matchKey, matchValue, returnKey) {
        console.log("findUsers()",matchKey, matchValue, returnKey);
        matchingUsers = [];

        for (let userKey in socketChatObj.activeUsers) {
        // console.log("Checking userKey:",userKey);
        // console.log(`users.${prop} = ${users[prop]}`);
        
            for (let [key, value] of Object.entries(socketChatObj.activeUsers[userKey])) {
            // console.log(userKey, "key:", key, "value:" , value);
            
                if (key == matchKey){
                    // console.log("key == matchKey", userKey, "---->", key, ":" , value);
                    if (value == matchValue){
                        // Exact non-case-specific match
                        // If matchvalue = "", we will match users without a value
                        console.log("Match!");
                        matchingUsers.push(socketChatObj.activeUsers[userKey]);
                    }
                    if (key == matchKey && matchValue == undefined){
                        // console.log("return all with this key existing");
                        // matchingUsers.push(users[userKey]);
                        returnOnlyRequestedElem(socketChatObj.activeUsers[userKey])
                    }
                }
            }
            
            // console.log(users[prop]);
        }

        function returnOnlyRequestedElem(userObjectToReturn){
            console.log("Found this user:",userObjectToReturn);
            if (!returnKey){
                matchingUsers.push(userObjectToReturn);
            } else {
                matchingUsers.push(userObjectToReturn[returnKey]);
            }
        }
        console.log("Found " + matchingUsers.length + " users:", matchingUsers);
        return matchingUsers;
    }
    getUserRooms = function (userId) {
    }

    logStatus = function() {
        console.log("\n\n---- logStatus() ------------------");
        console.log("Users Array:", Object.keys(socketChatObj.activeUsers).length);
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
    }

};