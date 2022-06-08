/* 
[X] Check for player-name on page load
[X]     Prompt if missing
[ ] Check if page loaded with game_id
[ ]     If game_id in URL - check if valid
[ ] If game_id and player is waiting and connected - start game
[O] If no game_id, check who else is in the lobby
[ ] 


*/





// Scripts for connect

const connect = {
    thisPlayerName: null,
    gameOver: null,
    currentPlayer: 1,
    maxPlayers: 2,
    clicksAfterGameOver: 0,
    names: {
        1: "PLAYER 1",
        2: "PLAYER 2",
    }
};

/* Websockets Setup */

function establishSocket(queryParamsToSend = {}) {
    queryParamsToSend.app = "connect";
    queryString = Object.keys(queryParamsToSend).map(key => key + '=' + queryParamsToSend[key]).join('&');
    console.log(queryString);
    // const socket = io.connect("",{
    //     query: queryString
    // });
    
    /* See: https://socket.io/docs/v4/namespaces/ */ 
    // const socket = io();
    const games_io = io("/games_io",{
            query: queryString
        });
    return games_io;
}

/* Websockets Handlers */
function declareSocketHanders(socket) {
    socket.onAny((event, ...args) => {
        console.log(`[EVENT] got event: ${event}`, args);
    });

    return socket;
}

function generateGameId(functionCallback) {
    console.log("generateGameId()");
    const request_obj = {
        "app": "connect",
        "thisPlayerName": localStorage.getItem("thisPlayerName")

    };
    socket.emit("generate_game_url", request_obj, (response) => {
        console.log("generateGameId() - response:",response);
        functionCallback(response);
        return response;
        // if (err){
        //     $("#share_url").val("Something went v'err'y wrong!");
        //     console.log(err);
        // } else {
            // $("#share_url").val("Response:" + response);
            // console.log("Response:",response);
        // }
    });
}

/* ONREADY */
document.addEventListener("DOMContentLoaded", function (event) {

    /* Initialize new game */
    // pageLoad("onready");
    updateFromLocalStorage(connect);
    updateStats();
    
    /* Handlers for buttons */
    document.getElementById("new_game_button").addEventListener("click", function handleClick(event){
        start_game();
    });
    
    document.getElementById("name_players_button").addEventListener("click", function handleClick(event){

        // Handle key presses - specifically return to save!
        // $('#playerSettingsModal').on("keypress", function (e) {
        //     if (e.which == 13) {
        //         console.log("Keypress",e.which);
        //         saveSettings();
        //         // $(this).submit();
        //         // $("#playerSettingsModal").modal('hide');
        //     }
        // });

        $('#playerSettingsModal').on('keypress', 'input, select, checkbox, radio, button', function (e) {
            return focusNextOnEnter(e, this);
        });
        
        // Handle auto-focus on open
        $('#playerSettingsModal').on('shown.bs.modal', function () {
            // TODO: Make dynamic to select first input field
            // $('#player1_name').focus();
            const firstInput = document.getElementById('player1_name');
            
            firstInput.setSelectionRange(0, firstInput.value.length);
            firstInput.focus();
        });

        // After declaring all the handlers - don't forget to actually show the modal! 
        openSettings();
    });
    
    document.getElementById("modal_settings_save").addEventListener("click", function handleClick(event){
        if (document.getElementById("settingsModalForm").checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        } else {
            saveSettings();
        }
    });

    document.getElementById("game_play_button").addEventListener("click", function handleClick(event){

        // $('#gamePlayModal').on('keypress', 'input, select, checkbox, radio, button', function (e) {
        //     return focusNextOnEnter(e, this);
        // });
        
        // Handle auto-focus on open
        // $('#gamePlayModal').on('shown.bs.modal', function () {
        //     const firstInput = document.getElementById('player1_name');
            
        //     firstInput.setSelectionRange(0, firstInput.value.length);
        //     firstInput.focus();
        // });

        // After declaring all the handlers - don't forget to actually show the modal! 
        openGamePlayModal();
    });



    /* Click handlers for all cells */
    const cells = document.querySelectorAll(".divTableCell");

    cells.forEach((cell) => {
        cell.addEventListener("click", function handleClick(event) {
            // alert("click");
            // event.stopPropagation();
            // console.log(event.currentTarget);
            // cellClick(event.target);
            cellClick(event.currentTarget);
        });

        // cell.addEventListener("mouseenter", function handleHover(event) {
        //     // alert("mouseover");
        //     const mouseOverColumn = event.currentTarget.id.split("_")[0];
        //     const selector = ".column_"+mouseOverColumn;
        //     const thisColCells = document.querySelectorAll(selector);
        //     thisColCells.forEach((colCell) => {
        //         colCell.classList.add("highlightedColumn");
        //         setTimeout(function(){
        //             colCell.classList.remove("highlightedColumn");
        //         }, 500);
        //     });
        // });

        // cell.addEventListener("mouseleave", function handleHover(event) {
        //     const mouseOverColumn = event.currentTarget.id.split("_")[0];
        //     const selector = ".column_"+mouseOverColumn;
        //     const thisColCells = document.querySelectorAll(selector);
        //     thisColCells.forEach((colCell) => {
        //         colCell.classList.remove("highlightedColumn");
        //     });
        // });

    });


    /* Once everything is ready client-side, let's get connected! */
    socket = establishSocket({
        "thisPlayerName":connect.thisPlayerName
    });
        
    declareSocketHanders(socket);


    pageLoad("onready");


    // document.getElementById("settingsModalForm").addEventListener('submit', function(event) {
    //     console.log("Form submitted!");
    //     if (document.getElementById("settingsModalForm").checkValidity() === false) {
    //       event.preventDefault();
    //       event.stopPropagation();
    //     }
    //     // form.classList.add('was-validated');
    // }, false);

    // $('#settingsModalForm').on('submit', function(e) {
    //     alert("Form submitted!");
    // });    
});

function pageLoad(pageLoadTrigger) {
    console.log("TODO: Check if URL has game_id param");

    console.log("TODO: game_id param found in URL!");

    console.log("TODO: Check if we have an active game at the moment (reload!)");



    console.log("DONE: Check for playername in localStorage");
    setUsername();

    console.log("DONE: Setting player 1");
    connect.names[1] = localStorage.getItem("thisPlayerName");


    // localStorage.setItem(key,value); 
    // localStorage.getItem(key);
    
    
    console.log("TODO: No game_id param found in URL");
    openGamePlayModal();
}

function setUsername(setThisUsername) {
    const promptMessage = "Hi, what is your name?";
    const defaultUsername = "Player "+Math.floor(Math.random() * (9999 - 2022 + 1) + 2022);

    if ( setThisUsername ){
        connect.thisPlayerName = prompt(promptMessage, defaultUsername);
        localStorage.setItem("thisPlayerName",connect.thisPlayerName);
        return localStorage.getItem("thisPlayerName");
    }

    if (!connect.thisPlayerName && !localStorage.getItem("thisPlayerName") ) {
        while( !connect.thisPlayerName ){
            connect.thisPlayerName = prompt(promptMessage, defaultUsername);
            localStorage.setItem("thisPlayerName",connect.thisPlayerName);
        };
        return localStorage.getItem("thisPlayerName");
    }

    if (!connect.thisPlayerName && localStorage.getItem("thisPlayerName") ) {
        connect.thisPlayerName = localStorage.getItem("thisPlayerName");
        return localStorage.getItem("thisPlayerName");
    }

    console.error("Should never get here!");
    return localStorage.getItem("thisPlayerName");
}

function start_game() {
    //TODO: Detect who clicked to start a new game
    //TODO: Confirm with BOTH players if playing separately

    if ( confirm("Are you sure you want to start a new game") ){
        console.log("starting new game");
    } else {
        console.log("cancelled");
        return false;
    }
    // else {
    //     console.log("No winner object so this is the first game");
    // }

    // Clear all cells
    const cells = document.querySelectorAll(".divTableCell");

    cells.forEach((cell) => {
        // console.log( cell.classList );
        cell.classList.remove("player1","player2","winningCell","highlightedColumn");
        cell.classList.add("emptyCell");
    });

    // Reset current player
    connect.currentPlayer = 1;

    // Clear click counter
    connect.clicksAfterGameOver = 0;

    // Delete connect.winner
    delete connect.winner

    // Reset stats
    updateStats();

    
}

function cellClick(cell_id_or_element) {
    // Generate the ID and/or Object (depending on what we get) so that we end up with both
    let clickedCellElem = cell_id_or_element;
    if (typeof cell_id_or_element == "string"){
        clickedCellElem = document.getElementById(cell_id_or_element);
    }
    // We now that regardless to what we received, cellElem is now the element and not the ID string
    const clickedCellId = clickedCellElem.id;

    const cellElemId = gravityAfterClick(clickedCellId);
    const cellElem = document.getElementById(cellElemId);
    
    if ( isClickValid(cellElem.id, connect.currentPlayer) ){
        // Confirmed this was a valid click!
        // console.log("Valid Click Detected by currentPlayer:", connect.currentPlayer, " on cell:", cellElem.id);
        // Update the UI (only)
        updateCellOnValidClick(cellElem.id, connect.currentPlayer);   
        // Analyze for implications
        checkCellStatus(cellElem.id);
    } else {
        // console.log("CLICK IS NOT VALID!", cellElem.id);
    }
}

function getCellColumnRow(cellId) {
    const column = cellId.split("_")[0];
    const row = cellId.split("_")[1];
    const selector = "column_"+column;
    const dotSelector = "."+selector;
    return {
        column: column,
        row: row,
        selector: selector,
        dotSelector: dotSelector
    }
}

function gravityAfterClick(clickedCellId) {
    // console.log("gravityAfterClick() - clicked cell:", clickedCellId);

    // By default, the gravityElemId will be equal to ClickedId in case we don't have an alternative to move to...
    let gravityElemId = clickedCellId;
    let gravityElem = document.getElementById(gravityElemId);

    // Iterate through all cells in this column (from top to bottom) 
    // and check which is the LAST (smallest row) which is still emptyCell

    const clickedColumn = getCellColumnRow(clickedCellId).column;
    const clickedColumnDotSelector = getCellColumnRow(clickedCellId).dotSelector;
    // console.log("Checking column: ", clickedColumn);
    // Removed as getElementsByClassName returns an HTML collection not an array so can't be iterated with forEach
    // see: https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach
    // const emptyColumnCellsArray = document.getElementsByClassName("emptyCell "+clickedColumnSelector);
    const emptyColumnCellsArray = document.querySelectorAll(".emptyCell"+clickedColumnDotSelector);

    // console.log("Found "+emptyColumnCellsArray.length+" empty cells in this column");
    // console.log(emptyColumnCellsArray);

    // Check to make sure that gravity result is valid i.e. that we have somewhere to move 
    if ( emptyColumnCellsArray.length > 0 ){

        //TODO: Sort the elements to make sure we get only the smallest one! For now, we'll assume we get them in order (from largest to smallest)
        // emptyColumnCellsArray.forEach((c) => {
        //     console.log("Empty cell:",c.id);
        // });

        gravityElem = emptyColumnCellsArray[emptyColumnCellsArray.length-1];
        gravityElemId = gravityElem.id;

    } else {

        // console.log("Gravity has nowhere to move down to so we're staying here!");

    }

    // console.log("Gravity brings us to:", gravityElemId);

    // const landedCellId = clickedCellId;
    return gravityElemId;
}

function isClickValid(cellId, currentPlayer) {
    // console.log("isClickValid()", cellId, currentPlayer );
    const cellElem = document.getElementById(cellId);
    
    // Is cell empty?
    if ( !cellElem.classList.contains('emptyCell') ){
        // console.log("Cell does not have 'emptyCell' class - click rejected!");
        return false;
    }
    // Is game over?
    if ( !!connect.winner && !!connect.winner.player ){
        console.log("We already have a winner - game over - click rejected");
        connect.clicksAfterGameOver += 1;
        if (connect.clicksAfterGameOver >= 5){
            start_game();
        } 
        return false;
    }

    return true;
}

function updateCellOnValidClick(cellId, currentPlayerId){
    const cellElem = document.getElementById(cellId);
    // Remove the 'emptyCell'
    cellElem.classList.remove("emptyCell");
    // Add appropriate class for the currentPlayer
    cellElem.classList.add("player"+currentPlayerId);
    // TODO: Remove this temporary note:
}

function checkCellStatus(cellId) {
    // console.log("checkCellStatus()",cellId);
    
    // Update Stats
    updateStats();

    // Check for a winner - or that another move is possible!
    if (connect.emptyCells == 0 || connect.emptyCells < 0){
        gameFailed();
        // return false;
    }

    if ( checkForAWinner() ) {
        gameWinner();
    } else {
        // Assuming all is ok - and no winner - increment the player id
        nextPlayer();
    }
}

function gameFailed() {
    // const msg = "Game over! No more empty spaces."
    // alert(msg);
    // return false;

    $("#modal_div").removeClass();
    $("#modal_div").addClass("center-text bold-text");
    $("#modal_text").html("Game over! No more empty spaces.");
    $("#modal_close").hide();
    // Footer buttons
    // TODO: Required as we have a hard-coded 'hide' class rather than relying on hiding the button onload 
    $("#modal_new_game").removeClass("hide");
    $("#modal_new_game").show();
    $("#myModal1").modal();


}

function gameWinner() {
    // alert("Congratulations player "+connect.winner.player+"!!");
    
    if ( !connect.winner || !connect.winner.winningCells ){
        console.error("Unable to find winner or winning details. Please check 'connect.winner' and try again.");
        return false;
    }

    connect.winner.winningCells.forEach((cellId) => {
        document.getElementById(cellId).classList.add("winningCell");
    });
    

    $("#modal_div").removeClass();
    $("#modal_div").addClass("winner-text");
    $("#modal_text").html("Congratulations "+connect.names[connect.winner.player]+"!! 🎉");
    // Footer Buttons
    $("#modal_close").show();
    // $("#modal_new_game").removeClass("hide");
    $("#modal_new_game").hide();
    // Open Modal
    $("#myModal1").modal();
}

function nextPlayer(){
    if (connect.currentPlayer < connect.maxPlayers) {
        connect.currentPlayer += 1;
    } else {
        connect.currentPlayer = 1;
    }
    updateCurrentPlayerStat();
    return connect.currentPlayer;
}

function updateCurrentPlayerStat(){
    // Update currentplayer stat
    document.getElementById("currentPlayer").innerHTML = "<span class='thisCurrentPlayer player"+connect.currentPlayer+"'>"+connect.names[connect.currentPlayer]+"</span>";
}

function updateStats(){
    connect.totalCells = document.querySelectorAll(".divTableCell").length;
    connect.emptyCells = document.querySelectorAll(".emptyCell").length;
    
    document.getElementById("availableCells").innerHTML = connect.emptyCells;
    document.getElementById("totalCells").innerHTML = connect.totalCells;

    updateCurrentPlayerStat();
}

function checkForAWinner() {
    // console.log("checkForAWinner()");
    for (let col = 1; col <= 7; col++) {
        // console.log("Checking column", col);
        colArray = document.querySelectorAll(".column_"+col+":not(.emptyCell_added_to_include_emptyCells)");
        // console.log("Column:", col, "Selected cells", colArray, colArray.length );
        if ( checkForWinner(colArray, "column", col) ) {
            return true;
        };
    }
    for (let row = 1; row <= 6; row++) {
        // console.log("Checking row", row);
        rowArray = document.querySelectorAll(".row_"+row+":not(.emptyCell_added_to_include_emptyCells)");
        // console.log("Checking Row:", row, "Selected cells", rowArray.length, rowArray );
        if ( checkForWinner(rowArray, "row", row) ){
            return true;
        };
    }
    for (let diagonal = 1; diagonal <= 12; diagonal++) {
        // console.log("Checking diagonal", diagonal);
        diagonalArray = document.querySelectorAll(".diagonal_"+diagonal+":not(.emptyCell_added_to_include_emptyCells)");
        // console.log("Checking Diagonal:", diagonal, "Selected cells", diagonalArray.length, diagonalArray );
        if ( checkForWinner(diagonalArray, "diagonal", diagonal) ){
            return true;
        };
    }
    function checkForWinner(thisArray, orientation, index){

        // console.log("checkForWinner() - checking: " + orientation + " #" + index + " " + thisArray );
    
            maxPlayer1Array = [];
            maxPlayer2Array = [];
    
            for (let i = 0; i < thisArray.length; i++) {
                
                let c = thisArray[i];
                if (c.classList.contains("emptyCell")){
                    // console.log("FOUND AN EMPTY CELL at: "+c.id+" while checking " + orientation + " #" + index + ". Resetting count by clearing arrays." );
                    maxPlayer1Array = [];
                    maxPlayer2Array = [];
                    continue;
                }
                                
                if( c.classList.contains("player1") ){
                    maxPlayer1Array.push(c.id);
                    // console.log("Player 1 FOUND in cell: "+c.id+" while checking " + orientation + " #" + index + ". Total found so far:", maxPlayer1Array.length, maxPlayer1Array);
                    if (maxPlayer1Array.length == 4){
                        console.log("Winner "+connect.player1+"!",orientation,index,maxPlayer1Array,"\n\n");
                        // connect.winner = {
                        //     player: 1,
                        //     winningCells: maxPlayer1Array
                        // }
                        // return connect.winner.player;
                        return weHaveAWinner(1,maxPlayer1Array);
                        break;
                    }
                } else {
                    // console.log("Player 1 NOT found in cell: "+c.id+" while checking " + orientation + " #" + index );
                    maxPlayer1Array = [];
                }
                
                if( c.classList.contains("player2") ){
                    maxPlayer2Array.push(c.id);
                    // console.log("Player 2 FOUND in cell: "+c.id+" while checking " + orientation + " #" + index + ". Total found so far:", maxPlayer2Array.length, maxPlayer2Array);
                    if (maxPlayer2Array.length == 4){
                        console.log("Winner "+connect.player2+"!",orientation,index,maxPlayer2Array,"\n\n");
                        // connect.winner = {
                        //     player: 2,
                        //     winningCells: maxPlayer2Array
                        // }
                        // return connect.winner.player;
                        return weHaveAWinner(2,maxPlayer2Array);
                        break;
                    }
                } else {
                        // console.log("Player 2 NOT found in cell: "+c.id+" while checking " + orientation + " #" + index );
                        maxPlayer2Array = [];
                }
            }   
    }
    
}

function weHaveAWinner(winningPlayer,winningArray){
    console.log("weHaveAWinner()", winningPlayer, winningArray);
    // console.log("Winner Player 2!",orientation,index,maxPlayer2Array,"\n\n");
    connect.winner = {}
    connect.winner.player = winningPlayer;
    connect.winner.winningCells = winningArray;
    connect.gameOver = true;
    return connect.winner.player;
}

function getPlayername(id) {
    
}

function openSettings(requestingUser){
    // TODO: Create a user-specific version of the modal etc for online-version

    // Prepare the modal
    document.getElementById("player1_name").value = connect.names[1];
    document.getElementById("player2_name").value = connect.names[2];

    // Open Modal
    $("#playerSettingsModal").modal({backdrop: 'static', keyboard: false});

    // Handle the input (validation etc)

    // Update the vars to be used elsewhere

}

function openGamePlayModal(requestingUser){

    $("#gamePlayModalTitle").html("Welcome <strong>"+connect.thisPlayerName+"</strong>! Let's play!");

    $("#share_url").val("Generating game ID...");

    /* generateGameId + callback function */
    generateGameId(updateShareUrl);

    // socket.timeout(3000).emit("chat_message", msg_obj, (err, response) => {
    // console.log("REQUEST HERE!");
    // const game_id_url = generateGameId();
    // $("#share_url").val();
    // console.log("Here!");

    // Open Modal
    $("#gamePlayModal").modal({backdrop: 'static', keyboard: false});


}

function updateShareUrl(params) {
    console.log("updateShareUrl",params);
    const shareUrl = document.location.href + "?" + params;
    $("#share_url").val(shareUrl);

    const linkText = "this link"
    const shareUrl_html = "<a href='shareUrl' target='_self' class='share-url-link'>" + linkText + "</a>";
    $("#share_url_href").html(shareUrl_html);
}

function saveSettings() {
    console.log("modal_settings_save clicked! Saving now!");
    connect.names[1] = document.getElementById("player1_name").value;
    connect.names[2] = document.getElementById("player2_name").value;
    let connectObj = localStorage.getItem("connect") ? JSON.parse( localStorage.getItem("connect") ) : {};
    connectObj.names = connect.names; 
    localStorage.setItem("connect",JSON.stringify(connect));
    console.log("Updated localStorage > connect", JSON.parse(localStorage.getItem("connect")));
    // Update UI in case name has changed
    updateStats();
    $("#playerSettingsModal").modal('hide');
}

function updateFromLocalStorage(obj) {
    
    if ( !localStorage.getItem("connect") ) {
        console.log("No 'connect' object found in localStorage!");
        return false;
    } 
    
    const localObj = JSON.parse( localStorage.getItem("connect") );

    if ( !!localObj.names ) {
        connect.names = localObj.names;
        // Update UI in case name has changed
        updateStats();
    }
}

function focusNextOnEnter(e, selector) {
    var longSelector = 'input:visible:enabled:not([readonly="readonly"]), textarea:visible:enabled:not([readonly="readonly"]), select:visible:enabled, button:visible:enabled';
    var keyCode = e.keyCode || e.which;
    if ($(selector).is(':not(textarea)')  // it's not a textarea - enter in text area
            && keyCode === 13 // it's enter key
            && !($(selector).attr('id') === 'modal_settings_save')) // it's not submitButton, save-on-enter here
    {
        e.preventDefault();
        $(longSelector)[$(longSelector).index($(selector)) + 1].focus();
        return true;
    }
}