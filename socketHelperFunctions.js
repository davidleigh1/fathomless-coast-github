module.exports = (io, socket, socketChatObj) => {

    console.log("socketHelperFunctions:", "socketChatObj:",socketChatObj);

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
        /* Fallback... */
        // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            // (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        // );
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
    getUsersArray = function() {
        const count = io.engine.clientsCount;
        // may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
        const count2 = io.of("/").sockets.size;

        // const socketsArray = io.fetchSockets();
        // const socketsArray = io.of("/").sockets;

        console.log("---- getUsersArray() ------------------");
        console.log("Users Array:", Object.keys(socketChatObj.activeUsers).length);
        console.log("io.engine.clientsCount:", count);
        console.log("socket instances in namespace:", count2);
        console.log("Sockets:",socketChatObj.fetchSockets.length,Object.keys(socketChatObj.fetchSockets).length)
        console.log("io.sockets.adapter.rooms:\n",io.sockets.adapter.rooms);
        console.log("---------------------------------------");
    }

    // exports.getUsersArray = getUsersArray;

};