
loginkey = "jyRYx3FJAF";

if (page != "login") var websocket = new WebSocket("wss://server.rbxbattle.com:7868?key=" + "rocklockstar40" + "." + loginkey + "&page=" + page);
else var websocket = new WebSocket("wss://server.rbxbattle.com:7868?page=" + page);
var userinventory = null;
var thisusername = "";
var notificationselement = document.createElement("div");
var globalVariable = null;
let yap = true;
let skinsdatabase = [];
notificationselement.classList.add("notifications");
document.body.appendChild(notificationselement);
if (document.querySelector(".entermessage") && !document.querySelector(".entermessage").disabled)
{
    document.querySelector(".entermessage").addEventListener("keydown", function (event)
    {
        if (event.keyCode == 13)
        {
            event.preventDefault();
            websocket.send(JSON.stringify({type: "chatmessage", message: this.value}));
            this.value = "";
        }
    });
}

function OpenLoginPanel()
{
    if (document.querySelector(".loginpanel")) return;
    var loginPanel = document.createElement("panel");
    loginPanel.className = "loginpanel";

    var topText = document.createElement("div");
    topText.innerHTML = "Login";
    topText.style.marginTop = "-15px";
    loginPanel.appendChild(topText);

    var closeButton = document.createElement("button");
    closeButton.innerHTML = "x";
    closeButton.className = "close-button";

    closeButton.addEventListener("click", () =>
    {
        loginPanel.remove();
        document.querySelector(".panelbackground").remove();
    });
    loginPanel.appendChild(closeButton);
   
    
    var inputButtonContainer = document.createElement("div");
    inputButtonContainer.className = "input-button-container";
    loginPanel.appendChild(inputButtonContainer);
    
    var usernameInput = document.createElement("input");
    usernameInput.placeholder = "Enter username";
    inputButtonContainer.appendChild(usernameInput);

    
    
    var loginButton = document.createElement("button");
    loginButton.innerHTML = "Login";
    loginButton.addEventListener("click", () => Login(usernameInput.value));
    inputButtonContainer.appendChild(loginButton);
    
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    document.querySelector("panel").appendChild(loginPanel);
 
        //MakeLoginKey(10);
   // loginKeyDiv.innerHTML = "Put it to your profile description first to login: <b style='color: var(--orange);'>" + loginkey + "</b><br>(This is temporary login key, and it will change on page reload)";
}

function Login(username)
{
    if (username.length == 0) return;
    websocket.send(JSON.stringify({type: "login", username: username, loginkey: loginkey}));
}

if (page == "login") 
{
    websocket.onopen = () => {
    
    }
    websocket.onmessage = message =>
    {
        var data = JSON.parse(message.data);
        console.log(data)
        switch (data.type)
        {
            
            case "database":
                skinsdatabase = data.skindatabase;
                    
                // Log or use the skinsdatabase as needed
                //console.log('Skins Database:', skinsdatabase);
                break;
            case "alert":
                alert(data.content);
                break;
            case "userinfo":
                
                console.log(data.userinfo)
                if (data.userinfo.description.includes(loginkey))
                {
                    var xhttp = new XMLHttpRequest();
                    xhttp.open("POST", "session.php", true);
                    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhttp.onreadystatechange = function()
                    {
                        if (this.readyState === XMLHttpRequest.DONE && this.status === 200)
                        {
                            window.location.href = "main.php?page=coinflip";
                        }
                    };
                    console.log(`key=${data.userinfo.name}.${loginkey}`)
                    xhttp.send(`key=${data.userinfo.name}.${loginkey}`);
                }
                break;
            case "loadchat":
                for (var message of data.messages)
                {
                    CreateMessageDiv(message);
                }
                break;
            case "newmessage":
                CreateMessageDiv(data.message);
                break;
            case "coinflipgames":
                for (coinflipgame of data.games)
                {
                    var newgamepanel = NewActiveCoinflipGame(coinflipgame);
                    if (coinflipgame.winner == null) continue;
                    setTimeout(() =>
                    {
                        newgamepanel.style.transition = "transform 0.5s ease-in";
                        newgamepanel.style.transform = "translateX(300%)";
                        setTimeout(() =>
                        {
                            newgamepanel.remove();
                        }, 500);
                    }, 20000);
                }
                break;
            case "newcoinflip":
                NewActiveCoinflipGame(data.game);
                break;
            case "coinflipstart":
                StartCoinflipGame(data.game, document.querySelector(".coinflipgame[gameid='" + data.game.id + "']"));
                break;
            case "coinflipcancel":
                document.querySelector(".coinflipgame[gameid='" + data.gameid + "']").remove();
                break;
        }
    };
}
else
{
    websocket.onmessage = message =>
    {
        var data = JSON.parse(message.data);
        console.log("data"+ JSON.stringify(data))

        switch (data.type)
        {

            case "database":
                skinsdatabase = data.skindatabase;
                    
                // Log or use the skinsdatabase as needed
                //console.log('Skins Database:', skinsdatabase);
                break;

            case "alert":
                alert(data.content);
                break;
            case "userinfo":
                if (data.userinfo.avatar != null) document.querySelector(".avatar").style.backgroundImage = "url('" + data.userinfo.avatar + "')";
                if (page == "profile")
                {
                    data.account.inventory.map(item => skinsdatabase.find((skinitem, index) => index == Number(item))).sort((a, b) => b[2] - a[2]).map(item => skinsdatabase.indexOf(item)).forEach(item =>
                    {
                        var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
                        CreateItemDiv(databaseitem, document.querySelector(".inventory"));
                        totalCost += Number(databaseitem[2]);
                    });
                    document.title = "RBXBattle - " + data.userinfo.name;
                }
                else document.title = "RBXBattle - " + (page.charAt(0).toUpperCase() + page.slice(1));
                var totalCost = 0;
                data.account.inventory.forEach(item =>
                {
                    var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
                    totalCost += Number(databaseitem[2]);
                });
                userinventory = data.account.inventory;
                thisusername = data.userinfo.name;
                break;
            case "logout":
                
                var xhttp = new XMLHttpRequest();
                xhttp.open("GET", "session.php", true);
                xhttp.onreadystatechange = function()
                {
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200)
                    {
                        window.location.href = "main.php?page=login";
                    }
              };
                xhttp.send();
                break;
            case "coinflipgames":
                for (coinflipgame of data.games)
                {
                    var newgamepanel = NewActiveCoinflipGame(coinflipgame);
                    if (coinflipgame.winner == null) continue;
                    setTimeout(() =>
                    {
                        newgamepanel.style.transition = "transform 0.5s ease-in";
                        newgamepanel.style.transform = "translateX(300%)";
                        setTimeout(() =>
                        {
                            newgamepanel.remove();
                        }, 500);
                    }, 20000);
                }
                break;
            case "newcoinflip":
                NewActiveCoinflipGame(data.game);
                break;
            case "coinflipstart":
                StartCoinflipGame(data.game, document.querySelector(".coinflipgame[gameid='" + data.game.id + "']"));
                break;
            case "coinflipcancel":
                document.querySelector(".coinflipgame[gameid='" + data.gameid + "']").remove();
                break;
            case "updateinventory":
                if (data.inventory.length > userinventory.length && data.notification === true) {
                    

                    // Helper function to count occurrences of each item
                    function countItems(inventory) {
                        return inventory.reduce((counts, item) => {
                            counts[item] = (counts[item] || 0) + 1;
                            return counts;
                        }, {});
                    }

                    let userItemCounts = countItems(userinventory);
                    let dataItemCounts = countItems(data.inventory);

                    let newItems = [];
                    for (let item in dataItemCounts) {
                        let dataCount = dataItemCounts[item];
                        let userCount = userItemCounts[item] || 0;

                        if (dataCount > userCount) {
                            // Add the item as many times as the difference in counts
                            newItems.push(...Array(dataCount - userCount).fill(item));
                        }
                    }
                    for (var newitem of newItems)
                        {
                            var skindatabaseitem = skinsdatabase.find((skinitem, index) => index == newitem);
                            var notificationpanel = document.createElement("div");
                            notificationpanel.className = "newitemnotification";
                            notificationpanel.innerHTML = "<p>New Item! " + skindatabaseitem[1] + "</p><center><img src='" + skindatabaseitem[3] + "' width='50' height='50'/></center>";
                            notificationselement.appendChild(notificationpanel);
                            setTimeout(() => {
                                notificationpanel.remove();
                            }, 6000);
                        }
                }
                
                    
                // Update user inventory
                userinventory = [...data.inventory];
             
                var totalCost = userinventory.reduce((total, item) => {
                    const databaseitem = skinsdatabase.find((skinitem, index) => index === item);
                    return total + (databaseitem ? Number(databaseitem[2]) : 0);
                }, 0);
                if (page == "profile")
                {
                    document.querySelectorAll(".inventory > div").forEach(div => div.remove());
                    userinventory.map(item => skinsdatabase.find((skinitem, index) => index == Number(item))).sort((a, b) => b[2] - a[2]).map(item => skinsdatabase.indexOf(item)).forEach(item =>
                    {
                        var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
                        CreateItemDiv(databaseitem, document.querySelector(".inventory"));
                        totalCost += Number(databaseitem[2]);
                    });
                }
                break;
                
            case "loadchat":
                for (var message of data.messages)
                {
                    CreateMessageDiv(message);
                }
                break;
            case "newmessage":
                CreateMessageDiv(data.message);
                break;


            case "isbotonline":
                globalVariable = data.online
                if (!document.querySelector(".depositdepositpanel")) break;
                document.querySelector(".depositdepositpanel .abcdefg").innerHTML = (data.online === true
                    ? `<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
                      <div class="warning-message">
                         Always verify that the username of your trading partner matches exactly.
                      </div>
                      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                         <div style="display: flex; align-items: center; gap: 10px;">
                           <div style="position: relative; width: 50px; height: 50px; border-radius: 50%; background-image: url('gfx/pfp.png'); background-size: cover; background-position: center;">
                             <div style="position: absolute; bottom: 5px; right: 5px; width: 10px; height: 10px; border-radius: 50%; background-color: lightgreen; animation: pulse 1s infinite;"></div>
                           </div>
                           <span class="username-text">RBXBattlegg</span>
                         </div>
                         <a href="https://www.roblox.com/users/218562792/profile" target="_blank" class="join-button">
                            Join
                         </a>
                      </div>
                      <div style="margin-top: 20px; color: #fff; font-size: 14px; font-weight: bold; text-align: center;">
                         To initiate a trade with the bot, visit the bank and send a trade with the bot.
                      </div>
                      <style>
                        .join-button {
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          padding: 8px 16px;
                          border-radius: 8px;
                          background-color: var(--darkblue);
                          color: white;
                          font-weight: 600;
                          text-decoration: none;
                          transition: background-color 0.3s ease, box-shadow 0.3s ease, text-shadow 0.3s ease;
                          box-shadow: 0 0 10px var(--blue);
                          border: 1px solid var(--orange);
                          font-size: 16px;
                          text-shadow: 0 0 20px #5c6294;
                        }
                        .join-button:hover {
                          box-shadow: 0 0 20px var(--orange);
                          text-shadow: 0 0 3px white;
                        }
                        .warning-message {
                          --tw-text-opacity: 1;
                          color: rgb(254 243 199/var(--tw-text-opacity));
                          margin: 10px 10px;
                          padding: 10px;
                          border: 2px solid #ffcc00;
                          border-radius: 8px;
                          background-color: #73632f;
                          font-weight: bold;
                          animation: fadeInOut 4s infinite;
                          text-align: center;
                        }
                        .username-text {
                          font-family: 'Roboto', sans-serif;
                          color: lightgreen;
                          font-weight: bold;
                          font-size: 18px; /* Adjust size as needed */
                        }
                        @keyframes pulse {
                          0% { transform: scale(1); opacity: 1; }
                          50% { transform: scale(1.5); opacity: 0.5; }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        @keyframes fadeInOut {
                          0% { opacity: 1; }
                          50% { opacity: 0.7; }
                          100% { opacity: 1; }
                        }
                      </style>`
                    : `<span style="color: tomato;">Bot is offline, try later</span>`
                );
                
                if (!document.querySelector(".itemscontainer")) break;
                
                
                break;
        }
    };
}

function MakeLoginKey(length)
{
    var result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    var counter = 0;
    while (counter < length)
    {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter++;
    }
    return result;
}


function CreateMessageDiv(message)
{
    if (message[1] != ""){

    var messagediv = document.createElement("div");
    document.querySelector(".chatpanel > div.messages").appendChild(messagediv);
    var messagesender = document.createElement("div");
    messagesender.className = "messagesender";
    messagesender.innerHTML = message[0].name;
    messagediv.appendChild(messagesender);
    var messagesenderavatar = document.createElement("button");
    messagesenderavatar.className = "messagesenderavatar";
    if (message[0].name == thisusername) messagesenderavatar.style.pointerEvents = "none";
    else
    {
        messagesenderavatar.addEventListener("click", function ()
        {
            OpenTipMenu(message[0].name);
        });
    }
    messagesenderavatar.style.backgroundImage = "url(" + message[0].avatar + ")";
    messagediv.appendChild(messagesenderavatar);
    var messageitself = document.createElement("div");
    messageitself.className = "messageitself";
    messageitself.innerHTML = message[1];
    messagediv.appendChild(messageitself);
    if (message[0].name === "rocklockstar40") {
        var ownerLabel = document.createElement("div");
        ownerLabel.className = "owner-label";
        ownerLabel.innerHTML = "Owner";
        messagediv.appendChild(ownerLabel);
    }
    }
}

function OpenTipMenu(username)
{
    if (document.querySelector(".tipmenu") || userinventory == null) return;
    var tipmenu = document.createElement("div");
    tipmenu.className = "tipmenu";
    document.querySelector("panel").appendChild(tipmenu);
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    var topcontainer = document.createElement("div");
    topcontainer.className = "topcontainer";
    tipmenu.appendChild(topcontainer);
    var toptext = document.createElement("div");
    toptext.className = "toptext";
    toptext.innerHTML = "Tip:<span style = 'font-style: italic; margin-left: 5px;'>" + username + "</span>";
    topcontainer.appendChild(toptext);
    var closebutton = document.createElement("button");
    closebutton.className = "closebutton";
    closebutton.innerHTML = "x";
    closebutton.addEventListener("click", function ()
    {
        document.querySelector(".panelbackground").remove();
        document.querySelector(".tipmenu").remove();
    });
    topcontainer.appendChild(closebutton);
    var bottomcontainer = document.createElement("div");
    bottomcontainer.className = "bottomcontainer";
    tipmenu.appendChild(bottomcontainer);
    var tipbutton = document.createElement("button");
    tipbutton.className = "tipbutton";
    tipbutton.innerHTML = "Tip";
    tipbutton.addEventListener("click", function ()
    {
        if (!document.querySelector(".itempreview[selected='true']")) return;
        websocket.send(JSON.stringify({type: "tip", username: username, skins: Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(item => item.getAttribute("itemindex"))}));
        document.querySelector(".panelbackground").remove();
        document.querySelector(".tipmenu").remove();
    });
    bottomcontainer.appendChild(tipbutton);
    var itemscontainer = document.createElement("div");
    itemscontainer.className = "itemscontainer";
    tipmenu.appendChild(itemscontainer);
    [...userinventory].map(item => skinsdatabase.find((skinitem, index) => index == Number(item))).sort((a, b) => b[2] - a[2]).map(item => skinsdatabase.indexOf(item)).forEach(item =>
    {
        var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
        var itemelement = CreateItemPreviewButton(databaseitem, itemscontainer);
        itemelement.setAttribute("itemindex", skinsdatabase.indexOf(databaseitem));
        itemelement.setAttribute("itemvalue", databaseitem[2]);
        itemelement.setAttribute("selected", "false");
        itemelement.addEventListener("click", function ()
        {
            if (this.getAttribute("selected") == "false") this.setAttribute("selected", "true");
            else this.setAttribute("selected", "false");
        });
    });
}

function Navigate(page)
{
    window.location.href = "main.php?page=" + page;
}

function CreateCoinflipGame()
{
    if (document.querySelector(".gamesettingspanel") || userinventory == null) return;
    var gamesettingspanel = document.createElement("div");
    gamesettingspanel.className = "gamesettingspanel";
    document.querySelector("panel").appendChild(gamesettingspanel);
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    var topcontainer = document.createElement("div");
    topcontainer.className = "topcontainer";
    gamesettingspanel.appendChild(topcontainer);
    var toptext = document.createElement("div");
    toptext.className = "toptext";
    toptext.innerHTML = "Select skins to play with";
    topcontainer.appendChild(toptext);
    var closebutton = document.createElement("button");
    closebutton.className = "closebutton";
    closebutton.innerHTML = "x";
    closebutton.addEventListener("click", function ()
    {
        document.querySelector(".panelbackground").remove();
        document.querySelector(".gamesettingspanel").remove();
    });
    topcontainer.appendChild(closebutton);
    var bottomcontainer = document.createElement("div");
    bottomcontainer.className = "bottomcontainer";
    gamesettingspanel.appendChild(bottomcontainer);
    var totalprice = document.createElement("div");
    totalprice.className = "totalprice";
    totalprice.innerHTML = "Total: 0";
    bottomcontainer.appendChild(totalprice);
    bottomcontainer.innerHTML += '<div class = "sliderimgcontainer"><img src = "gfx/bluecoin.png" width = "51" height = "51"/><div class="choosecolorcontainer"><input type="checkbox" class="choosecolor" id="choosecolor"><label class="switch" for="choosecolor"><span class="slider"></span></label></div><img src = "gfx/redcoin.png" width = "51" height = "51"/></div>';
    var playbutton = document.createElement("button");
    playbutton.className = "playbutton";
    playbutton.innerHTML = "Play";
    bottomcontainer.appendChild(playbutton);
    playbutton.addEventListener("click", function ()
    {
        if (!document.querySelector(".itempreview[selected='true']")) return;
        websocket.send(JSON.stringify({type: "coinflip", action: "create", skins: Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(item => item.getAttribute("itemindex")), color: (document.querySelector(".choosecolor#choosecolor").checked == true ? "red" : "blue")}));
        document.querySelector(".panelbackground").remove();
        document.querySelector(".gamesettingspanel").remove();
    });
    var itemscontainer = document.createElement("div");
    itemscontainer.className = "itemscontainer";
    gamesettingspanel.appendChild(itemscontainer);
    LoadInventorySkins([...userinventory].map(item => skinsdatabase.find((skinitem, index) => index == Number(item))).sort((a, b) => b[2] - a[2]).map(item => skinsdatabase.indexOf(item)));
    function LoadInventorySkins(inventory)
    {
        inventory.forEach(item =>
        {
            var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
            var itemelement = CreateItemPreviewButton(databaseitem, itemscontainer);
            itemelement.setAttribute("itemindex", skinsdatabase.indexOf(databaseitem));
            itemelement.setAttribute("itemvalue", databaseitem[2]);
            itemelement.setAttribute("selected", "false");
            itemelement.addEventListener("click", function ()
            {
                if (this.getAttribute("selected") == "false")
                {
                    if (document.querySelectorAll(".itempreview[selected='true']").length > 19) return;
                    else this.setAttribute("selected", "true");
                }
                else this.setAttribute("selected", "false");
                bottomcontainer.querySelector(".totalprice").innerHTML = ("Total: " + (document.querySelector(".itempreview[selected='true']") ? SpaceNumber(Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(obj => Number(obj.getAttribute("itemvalue"))).reduce((accumulator, currentValue) => { return accumulator + currentValue; },0)) : "0"));
            });
        });
    }
}

function JoinCoinflipGame(coinflipgame)
{
    if (document.querySelector(".gamesettingspanel") || userinventory == null || page == "login") return;
    var gamesettingspanel = document.createElement("div");
    gamesettingspanel.className = "gamesettingspanel";
    document.querySelector("panel").appendChild(gamesettingspanel);
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    var topcontainer = document.createElement("div");
    topcontainer.className = "topcontainer";
    gamesettingspanel.appendChild(topcontainer);
    var toptext = document.createElement("div");
    toptext.className = "toptext";
    toptext.innerHTML = "Select skins to play with";
    topcontainer.appendChild(toptext);
    var closebutton = document.createElement("button");
    closebutton.className = "closebutton";
    closebutton.innerHTML = "x";
    closebutton.addEventListener("click", function ()
    {
        document.querySelector(".panelbackground").remove();
        document.querySelector(".gamesettingspanel").remove();
    });
    topcontainer.appendChild(closebutton);
    var bottomcontainer = document.createElement("div");
    bottomcontainer.className = "bottomcontainer";
    gamesettingspanel.appendChild(bottomcontainer);
    var playbutton = document.createElement("button");
    playbutton.className = "playbutton";
    playbutton.innerHTML = "Join";
    playbutton.addEventListener("click", function ()
    {
        if (!document.querySelector(".itempreview[selected='true']")) return;
        var selectedtotalprice = Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(obj => Number(obj.getAttribute("itemvalue"))).reduce((accumulator, currentValue) => { return accumulator + currentValue; },0);
        if (selectedtotalprice < coinflipgame.value * 0.80 || selectedtotalprice > coinflipgame.value * 1.20) return;
        websocket.send(JSON.stringify({type: "coinflip", action: "join", skins: Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(item => item.getAttribute("itemindex")), gameid: coinflipgame.id}));
        document.querySelector(".panelbackground").remove();
        document.querySelector(".gamesettingspanel").remove();
    });
    bottomcontainer.appendChild(playbutton);
    var totalprice = document.createElement("div");
    totalprice.className = "totalprice";
    totalprice.innerHTML = "Total: <span style = 'color: tomato;'>0</span> <span style = 'color: darkgray;'>(" + SpaceNumber(coinflipgame.value * 0.80) + " - " + SpaceNumber(coinflipgame.value * 1.20) + ")</span>";
    bottomcontainer.appendChild(totalprice);
    var itemscontainer = document.createElement("div");
    itemscontainer.className = "itemscontainer";
    gamesettingspanel.appendChild(itemscontainer);
    LoadInventorySkins([...userinventory].map(item => skinsdatabase.find((skinitem, index) => index == Number(item))).sort((a, b) => b[2] - a[2]).map(item => skinsdatabase.indexOf(item)));
    function LoadInventorySkins(inventory)
    {
        inventory.forEach(item =>
        {
            var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
            var itemelement = CreateItemPreviewButton(databaseitem, itemscontainer);
            itemelement.setAttribute("itemindex", skinsdatabase.indexOf(databaseitem));
            itemelement.setAttribute("itemvalue", databaseitem[2]);
            itemelement.setAttribute("selected", "false");
            itemelement.addEventListener("click", function ()
            {
                if (this.getAttribute("selected") == "false")
                {
                    if (document.querySelectorAll(".itempreview[selected='true']").length > 19) return;
                    else this.setAttribute("selected", "true");
                }
                else this.setAttribute("selected", "false");
                var selectedtotalprice = (document.querySelector(".itempreview[selected='true']") ? Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(obj => Number(obj.getAttribute("itemvalue"))).reduce((accumulator, currentValue) => { return accumulator + currentValue; },0) : 0);
                var lowestprice = coinflipgame.value * 0.80;
                var highestprice = coinflipgame.value * 1.20;
                totalprice.innerHTML = "Total: <span style = 'color: " + (selectedtotalprice >= lowestprice && selectedtotalprice <= highestprice ? "lightgreen" : "tomato") + ";'>" + SpaceNumber(selectedtotalprice) + "</span> <span style = 'color: darkgray;'>(" + SpaceNumber(lowestprice) + " - " + SpaceNumber(highestprice) + ")</span>";
            });
        });
    }
}

function OpenDepositPanel()
{
    if (document.querySelector(".depositdepositpanel") || page == "login") return;
    websocket.send(JSON.stringify({type: "isbotonline"}));
    var depositpanel = document.createElement("div");
    depositpanel.className = "depositdepositpanel";
    document.querySelector("panel").appendChild(depositpanel);
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    var topcontainer = document.createElement("div");
    topcontainer.className = "topcontainer";
    depositpanel.appendChild(topcontainer);
    var toptext = document.createElement("div");
    toptext.className = "toptext";
    toptext.innerHTML = "Open roblox to deposit skins";
    topcontainer.appendChild(toptext);
    var closebutton = document.createElement("button");
    closebutton.className = "closebutton";
    closebutton.innerHTML = "x";
    closebutton.addEventListener("click", function ()
    {
        document.querySelector(".panelbackground").remove();
        document.querySelector(".depositdepositpanel").remove();
    });
    topcontainer.appendChild(closebutton);
    var abcdefg = document.createElement("div");
    abcdefg.className = "abcdefg";
    depositpanel.appendChild(abcdefg);
}

function OpenWithdrawPanel()
{
    if (document.querySelector(".withdrawpanel") || userinventory == null || page == "login") return;
    websocket.send(JSON.stringify({type: "isbotonline"}));
    var withdrawpanel = document.createElement("div");
    withdrawpanel.className = "withdrawpanel";
    document.querySelector("panel").appendChild(withdrawpanel);
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    var topcontainer = document.createElement("div");
    topcontainer.className = "topcontainer";
    withdrawpanel.appendChild(topcontainer);
    var toptext = document.createElement("div");
    toptext.className = "toptext";
    toptext.innerHTML = "Select skins to withdraw";
    topcontainer.appendChild(toptext);
    var closebutton = document.createElement("button");
    closebutton.className = "closebutton";
    closebutton.innerHTML = "x";
    closebutton.addEventListener("click", function ()
    {
        document.querySelector(".panelbackground").remove();
        document.querySelector(".withdrawpanel").remove();
    });
    topcontainer.appendChild(closebutton);
    if (globalVariable != true) {

    
        var abcdefghi = document.createElement("div");
        abcdefghi.className = "abcdefghi";
        withdrawpanel.appendChild(abcdefghi);   
        var message = '<span style="color: tomato;">Bot is offline, try later</span>';
        abcdefghi.innerHTML = message;
        return;
    }
    var bottomcontainer = document.createElement("div");
    bottomcontainer.className = "bottomcontainer";
    withdrawpanel.appendChild(bottomcontainer);
    var withdrawbutton = document.createElement("button");
    withdrawbutton.className = "withdrawbutton";
    withdrawbutton.innerHTML = "Withdraw";
    withdrawbutton.addEventListener("click", function ()
    {
        websocket.send(JSON.stringify({type: "withdraw", skins: Array.from(document.querySelectorAll(".itempreview[selected='true']")).map(item => item.getAttribute("itemindex"))}));
        //document.querySelector(".panelbackground").remove();
        //document.querySelector(".withdrawpanel").remove();
        document.querySelector(".bottomcontainer").remove();
        document.querySelector(".withdrawpanel .abcitemscontainer").innerHTML = (1 === 1
            ? `<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
              <div class="warning-message">
                 Always verify that the username of your trading partner matches exactly.
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                 <div style="display: flex; align-items: center; gap: 10px;">
                   <div style="position: relative; width: 50px; height: 50px; border-radius: 50%; background-image: url('gfx/pfp.png'); background-size: cover; background-position: center;">
                     <div style="position: absolute; bottom: 5px; right: 5px; width: 10px; height: 10px; border-radius: 50%; background-color: lightgreen; animation: pulse 1s infinite;"></div>
                   </div>
                   <span class="username-text">RBXBattlegg</span>
                 </div>
                 <a href="https://www.roblox.com/users/218562792/profile" target="_blank" class="join-button">
                    Join
                 </a>
              </div>
              <div style="margin-top: 20px; color: #fff; font-size: 14px; font-weight: bold; text-align: center;">
                 To Withdraw your skins, vist the bank and send a trade with the bot.
              </div>
              <style>
                .join-button {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 8px 16px;
                  border-radius: 8px;
                  background-color: var(--darkblue);
                  color: white;
                  font-weight: 600;
                  text-decoration: none;
                  transition: background-color 0.3s ease, box-shadow 0.3s ease, text-shadow 0.3s ease;
                  box-shadow: 0 0 10px var(--blue);
                  border: 1px solid var(--orange);
                  font-size: 16px;
                  text-shadow: 0 0 20px #5c6294;
                }
                .join-button:hover {
                  box-shadow: 0 0 20px var(--orange);
                  text-shadow: 0 0 3px white;
                }
                .abcitemscontainer {
                 height: 60%;
                }
                .warning-message {
                  --tw-text-opacity: 1;
                  color: rgb(254 243 199/var(--tw-text-opacity));
                  margin: 10px 10px;
                  padding: 10px;
                  border: 2px solid #ffcc00;
                  border-radius: 8px;
                  background-color: #73632f;
                  font-weight: bold;
                  animation: fadeInOut 4s infinite;
                  text-align: center;
                }
                .username-text {
                  font-family: 'Roboto', sans-serif;
                  color: lightgreen;
                  font-weight: bold;
                  font-size: 18px; /* Adjust size as needed */
                }
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.5); opacity: 0.5; }
                  100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeInOut {
                  0% { opacity: 1; }
                  50% { opacity: 0.7; }
                  100% { opacity: 1; }
                }
              </style>`
            : `<span style="color: tomato;">Bot is offline, try later</span>`
        );
    });
    bottomcontainer.appendChild(withdrawbutton);
    var abcitemscontainer = document.createElement("div");
    abcitemscontainer.className = "abcitemscontainer";
    withdrawpanel.appendChild(abcitemscontainer);
    LoadInventorySkins([...userinventory].map(item => skinsdatabase.find((skinitem, index) => index == Number(item))).sort((a, b) => b[2] - a[2]).map(item => skinsdatabase.indexOf(item)));
    function LoadInventorySkins(inventory)
    {
        inventory.forEach(item =>
        {
            var databaseitem = skinsdatabase.find((skinitem, index) => index == item);
            var itemelement = CreateItemPreviewButton(databaseitem, abcitemscontainer);
            itemelement.setAttribute("itemindex", skinsdatabase.indexOf(databaseitem));
            itemelement.setAttribute("selected", "false");
            itemelement.addEventListener("click", function ()
            {
                if (this.getAttribute("selected") == "false")
                {
                    if (document.querySelectorAll(".itempreview[selected='true']").length > 19) return;
                    else this.setAttribute("selected", "true");
                }
                else this.setAttribute("selected", "false");
            });
        });
    }
}

function LoadSkins()
{
    let chunkSize = 20;
    let currentChunk = 0;
    var listofskins = skinsdatabase;
    function loadChunk() {
        let start = currentChunk * chunkSize;
        let end = start + chunkSize;
        if (listofskins.length > end) var chunk = listofskins.slice(start, end);
        else var chunk = listofskins.slice(start);
        chunk.forEach(item => {
            CreateItemButton(item, document.querySelector(".marketlist"));
        });
        if (end < skinsdatabase.length) {
            currentChunk++;
        } else {
            clearInterval(chunkInterval);
        }
    }

    var chunkInterval = setInterval(loadChunk, 100);
    function populateFilters() {
        for (var itemtype of [...new Set(skinsdatabase.map(item => item[0]))]) {
            var typeoption = document.createElement("option");
            typeoption.value = itemtype;
            typeoption.innerHTML = itemtype;
            document.querySelector(".filteritemtype").appendChild(typeoption);
        }
        document.querySelector(".filteritemtype").addEventListener("change", function () {
            ApplyModifiers(skinsdatabase);
        });
        document.querySelector(".sortitems").addEventListener("change", function () {
            ApplyModifiers(skinsdatabase);
        });
        document.querySelector(".resetmodifiers").addEventListener("click", function () {
            if (document.querySelector(".sortitems").value == 0 && document.querySelector(".filteritemtype").value == "All") return;
            document.querySelector(".sortitems").value = "0";
            document.querySelector(".filteritemtype").value = "All";
            ApplyModifiers(skinsdatabase);
        });
    }
    function ApplyModifiers(list)
    {
        clearInterval(chunkInterval);
        document.querySelector(".marketlist").innerHTML = "";
        switch (Number(document.querySelector(".sortitems").value))
        {
            case 0:
                var sortedlist = list.filter(item => (document.querySelector(".filteritemtype").value != "All" ? item[0] == document.querySelector(".filteritemtype").value : true));
                break;
            case 1:
                var sortedlist = list.filter(item => (document.querySelector(".filteritemtype").value != "All" ? item[0] == document.querySelector(".filteritemtype").value : true)).sort((a, b) => b[2] - a[2]);
                break;
            case 2:
                var sortedlist = list.filter(item => (document.querySelector(".filteritemtype").value != "All" ? item[0] == document.querySelector(".filteritemtype").value : true)).sort((a, b) => a[2] - b[2]);
                break;
        }
        listofskins = sortedlist;
        chunkInterval = setInterval(loadChunk, 100);
    }
    populateFilters();
    loadChunk();
}


function Logout()
{
    websocket.send(JSON.stringify({type: "logout"}));
}

function SmartText(inner, parent, fontsize)
{
    parent.style.display = "block";
    parent.style.whiteSpace = "nowrap";
    var smarttext = document.createElement("div");
    parent.appendChild(smarttext);
    smarttext.innerHTML = inner;
    smarttext.style.fontSize = fontsize + "px";
}

function RoundBigNumbers(number)
{
    if (number >= 1e6) return (number / 1e6).toFixed(1) + "m";
    else if (number >= 1e3) return (number / 1e3).toFixed(1) + "k";
    else return number.toString();
}

function SpaceNumber(number)
{
    number = Math.round(number);
    number = RoundBigNumbers(number);
    var reversednumber = number.toString().split("").reverse().join("");
    var spacednumber = reversednumber.replace(/(\d{3})(?=\d)/g, "$1 ");
    return spacednumber.split("").reverse().join("");
}

function CreateItemButton(item, parent)
{
    var itemelement = document.createElement("button");
    parent.appendChild(itemelement);
    var itemimage = document.createElement("div");
    if (item.length == 4 && item[3].includes(".png")) itemimage.setAttribute("style", "background-image: url(" + item[3] + ")");
    else itemimage.setAttribute("style", "background-image: url(https://cdn3.iconfinder.com/data/icons/meteocons/512/n-a-512.png)");
    itemelement.appendChild(itemimage);
    var itemname = document.createElement("div");
    itemelement.appendChild(itemname);
    SmartText(item[1], itemname, 16);
    var itemtype = document.createElement("div");
    itemtype.innerHTML = item[0];
    itemelement.appendChild(itemtype);
    var itemcost = document.createElement("div");
    itemcost.innerHTML = SpaceNumber(item[2]);
    itemelement.appendChild(itemcost);
    if (item[2] >= 10000) itemelement.classList.add("purpleitem");
    if (item[2] >= 40000) itemelement.classList.add("golditem");
}

function CreateItemDiv(item, parent)
{
    var itemelement = document.createElement("div");
    parent.appendChild(itemelement);
    var itemimage = document.createElement("div");
    if (item.length == 4 && item[3].includes(".png")) itemimage.setAttribute("style", "background-image: url(" + item[3] + ")");
    else itemimage.setAttribute("style", "background-image: url(https://cdn3.iconfinder.com/data/icons/meteocons/512/n-a-512.png)");
    itemelement.appendChild(itemimage);
    var itemname = document.createElement("div");
    itemelement.appendChild(itemname);
    SmartText(item[1], itemname, 16);
    var itemtype = document.createElement("div");
    itemtype.innerHTML = item[0];
    itemelement.appendChild(itemtype);
    var itemcost = document.createElement("div");
    itemcost.innerHTML = SpaceNumber(item[2]);
    itemelement.appendChild(itemcost);
    if (item[2] >= 10000) itemelement.classList.add("purpleitem");
    if (item[2] >= 40000) itemelement.classList.add("golditem");
    return itemelement;
}

function CreateItemPreviewButton(item, parent)
{
    var itemelement = document.createElement("button");
    itemelement.className = "itempreview";
    itemelement.setAttribute("selected", "false");
    parent.appendChild(itemelement);
    var itemimage = document.createElement("div");
    if (item.length == 4 && item[3].includes(".png")) itemimage.setAttribute("style", "background-image: url(" + item[3] + ")");
    else itemimage.setAttribute("style", "background-image: url(https://cdn3.iconfinder.com/data/icons/meteocons/512/n-a-512.png)");
    itemelement.appendChild(itemimage);
    var itemname = document.createElement("div");
    itemelement.appendChild(itemname);
    SmartText(item[1], itemname, 13);
    var itemcost = document.createElement("div");
    itemcost.innerHTML = SpaceNumber(item[2]);
    itemelement.appendChild(itemcost);
    if (item[2] >= 10000) itemelement.classList.add("purpleitem");
    if (item[2] >= 40000) itemelement.classList.add("golditem");
    return itemelement;
}

function StartCoinflipGame(game, gamepanel)
{
    var newgamepanel = NewActiveCoinflipGame(game, true);
    newgamepanel.parentNode.insertBefore(newgamepanel, gamepanel);
    gamepanel.remove();
    if (document.querySelector(".viewgamepanel"))
    {
        document.querySelector(".viewgamepanel").remove();
        document.querySelector(".panelbackground").remove();
        OpenViewGamePanel(game, false, true);
    }
    setTimeout(() =>
    {
        newgamepanel.style.transition = "transform 0.5s ease-in";
        newgamepanel.style.transform = "translateX(300%)";
        setTimeout(() =>
        {
            newgamepanel.remove();
        }, 500);
    }, 20000);
}

function NewActiveCoinflipGame(coinflipgame, liveresult)
{
    var gamepanel = document.createElement("div");
    gamepanel.className = "coinflipgame";
    gamepanel.setAttribute("gameid", coinflipgame.id);
    document.querySelector(".activegames").appendChild(gamepanel);
    var leftcontainer = document.createElement("div");
    leftcontainer.className = "leftcontainer";
    gamepanel.appendChild(leftcontainer);
    var rightcontainer = document.createElement("div");
    rightcontainer.className = "rightcontainer";
    gamepanel.appendChild(rightcontainer);
    var playercolors = {"blue": "GhostWhite", "red": "var(--orange)"};
    for (var player in coinflipgame.players)
    {
        var avatar = document.createElement("div");
        avatar.className = "avatar";
        if (coinflipgame.players[player] != null)
        {
            avatar.setAttribute("playercolor", coinflipgame.players[player].color);
            avatar.style.backgroundImage = "url('" + coinflipgame.players[player].avatar + "')";
            avatar.style.boxShadow = "0 0 20px -8px " + playercolors[coinflipgame.players[player].color];
        }
        else
        {
            avatar.style.backgroundImage = "url('https://www.shareicon.net/data/512x512/2015/10/04/651089_question_512x512.png')";
            avatar.style.boxShadow = "0 0 20px -8px gray";
        }
        leftcontainer.appendChild(avatar);
        if (coinflipgame.players[player] != null)
        {
            var colorimage = document.createElement("div");
            colorimage.className = "colorimage";
            colorimage.style.backgroundImage = "url('gfx/" + coinflipgame.players[player].color + "coin.png')";
            avatar.appendChild(colorimage);
        }
        if (player == 1) break;
        var vs = document.createElement("div");
        vs.innerHTML = "VS";
        vs.className = "vs";
        leftcontainer.appendChild(vs);
    }
    for (var skin in coinflipgame.skins)
    {
        if (coinflipgame.skins.length > 4 && skin > 2)
        {
            var skinelement = document.createElement("div");
            skinelement.className = "skinelement";
            skinelement.innerHTML = "+" + (coinflipgame.skins.length - 3);
            leftcontainer.appendChild(skinelement);
            break;
        }
        else
        {
            var skinelement = document.createElement("div");
            skinelement.className = "skinelement";
            skinelement.setAttribute("itemindex", coinflipgame.skins[skin][0]);
            skinelement.setAttribute("itemvalue", skinsdatabase[coinflipgame.skins[skin][0]][2]);
            if (skinsdatabase[coinflipgame.skins[skin][0]].length == 4 && skinsdatabase[coinflipgame.skins[skin][0]][3].includes(".png"))
            {
                skinelement.style.backgroundImage = "url(" + skinsdatabase[coinflipgame.skins[skin][0]][3] + ")";
            }
            else skinelement.style.backgroundImage = "url(https://cdn3.iconfinder.com/data/icons/meteocons/512/n-a-512.png)";
            skinelement.style.border = "1px solid " + playercolors[coinflipgame.players.map(player => (player != null ? player.name : null)).indexOf(coinflipgame.skins[skin][1])];
            skinelement.innerHTML += "<div class = 'itemname'>" + skinsdatabase[coinflipgame.skins[skin][0]][1] + "</div>";
            leftcontainer.appendChild(skinelement);
            if (skinsdatabase[coinflipgame.skins[skin][0]][2] >= 10000) skinelement.classList.add("purpleitem");
            if (skinsdatabase[coinflipgame.skins[skin][0]][2] >= 40000) skinelement.classList.add("golditem");
        }
    }
    var totalprice = document.createElement("div");
    totalprice.className = "totalprice";
    totalprice.innerHTML = SpaceNumber(coinflipgame.value * 0.80) + " - " + SpaceNumber(coinflipgame.value * 1.20);
    rightcontainer.appendChild(totalprice);
    if (coinflipgame.winner != null)
    {
        if (liveresult == true)
        {
            var video = document.createElement("video");
            video.className = "resultcoin";
            video.autoplay = true;
            video.muted = true;
            video.loop = true; // Loop the video indefinitely
            video.src = "animations/loading.mp4";
            rightcontainer.appendChild(video);
            
            // After 6 seconds, remove the video and display the result
            setTimeout(() => {
                // Remove the video element
                rightcontainer.removeChild(video);
        
                var winnercolors = {"blue": "royalblue", "red": "tomato"};
                var resultdiv = document.createElement("div");
                resultdiv.className = "resultdiv";
                resultdiv.innerHTML = coinflipgame.players.find(player => player.color == coinflipgame.winner).name;
                resultdiv.style.backgroundPosition = "right";
                resultdiv.style.backgroundSize = "cover";
                resultdiv.style.backgroundRepeat = "no-repeat";
                resultdiv.style.boxShadow = "inset 0 0 15px -5px " + winnercolors[coinflipgame.winner];
                resultdiv.style.border = "1px solid " + winnercolors[coinflipgame.winner];
                resultdiv.style.backgroundImage = "url('gfx/" + coinflipgame.winner + "coin.png')";
        
                // Insert resultdiv before the viewbutton
                var viewButton = rightcontainer.querySelector(".viewbutton");
                if (viewButton) {
                    viewButton.parentNode.insertBefore(resultdiv, viewButton);
                } else {
                    // If viewButton does not exist, just append the resultdiv to rightcontainer
                    rightcontainer.appendChild(resultdiv);
                }
        
                // Add the winner_border class to the appropriate avatar
                var winnerAvatar = leftcontainer.querySelector(".avatar[playercolor='" + coinflipgame.winner + "']");
                if (coinflipgame.winner == "red") {
                    winnerAvatar.classList.add("winner_border_red");
                }
                else {
                    winnerAvatar.classList.add("winner_border_blue");
                }
            }, 6000);
        }
        else
        {
            var winnercolors = {"blue": "royalblue", "red": "tomato"}
            var resultdiv = document.createElement("div");
            resultdiv.className = "resultdiv";
            resultdiv.innerHTML = coinflipgame.players.find(player => player.color == coinflipgame.winner).name;
            resultdiv.style.backgroundPosition = "right";
            resultdiv.style.backgroundSize = "cover";
            resultdiv.style.backgroundRepeat = "no-repeat";
            resultdiv.style.boxShadow = "inset 0 0 15px -5px " + winnercolors[coinflipgame.winner];
            resultdiv.style.border = "1px solid " + winnercolors[coinflipgame.winner];
            resultdiv.style.backgroundImage = "url('gfx/" + coinflipgame.winner + "coin.png')";
            rightcontainer.appendChild(resultdiv);
            leftcontainer.querySelector(".avatar[playercolor='" + coinflipgame.winner + "']").classList.add("winner_border_" + coinflipgame.winner);
        }
    }
    else if (coinflipgame.players.map(player => (player != null ? player.name : null)).includes(loginkey.split(".")[0]))
    {
        var waiting = document.createElement("div");
        waiting.className = "waiting";
        rightcontainer.appendChild(waiting);
        var cancelbutton = document.createElement("button");
        cancelbutton.className = "cancelbutton";
        cancelbutton.innerHTML = "Cancel Game";
        cancelbutton.addEventListener("click", function ()
        {
            websocket.send(JSON.stringify({type: "coinflip", action: "cancel", gameid: coinflipgame.id}));
        });
        waiting.appendChild(cancelbutton);
    }
    else if (page != "login")
    {
        gamepanel.style.boxShadow = "0 0 50px -20px var(--orange)";
        var joinbutton = document.createElement("button");
        joinbutton.className = "joinbutton";
        joinbutton.innerHTML = "Join Game";
        joinbutton.addEventListener("click", function ()
        {
            JoinCoinflipGame(coinflipgame);
        });
        rightcontainer.appendChild(joinbutton);
    }
    else
    {
        gamepanel.style.boxShadow = "0 0 50px -20px var(--orange)";
        var joinbutton = document.createElement("button");
        joinbutton.className = "joinbutton disabledjoinbutton";
        joinbutton.innerHTML = "🔒 Login to join";
        rightcontainer.appendChild(joinbutton);
    }
    var viewbutton = document.createElement("button");
    viewbutton.className = "viewbutton";
    viewbutton.addEventListener("click", function()
    {
        OpenViewGamePanel(coinflipgame, liveresult);
    });
    rightcontainer.appendChild(viewbutton);
    return gamepanel;
}


function OpenViewGamePanel(coinflipgame, liveresult, withoutanimation)
{
    var viewgamepanel = document.createElement("div");
    viewgamepanel.className = "viewgamepanel";
    if (withoutanimation) viewgamepanel.style.animation = "none";
    document.querySelector("panel").appendChild(viewgamepanel);
    var panelbackground = document.createElement("div");
    panelbackground.className = "panelbackground";
    document.querySelector("panel").appendChild(panelbackground);
    var topcontainer = document.createElement("div");
    topcontainer.className = "topcontainer";
    viewgamepanel.appendChild(topcontainer);
    var toptext = document.createElement("div");








    toptext.className = "toptext";
    toptext.innerHTML = "Coinflip game";
    topcontainer.appendChild(toptext);
    var closebutton = document.createElement("button");
    closebutton.className = "closebutton";
    closebutton.innerHTML = "x";
    closebutton.addEventListener("click", function ()
    {
        document.querySelector(".panelbackground").remove();
        document.querySelector(".viewgamepanel").remove();
    });
    topcontainer.appendChild(closebutton);
    var resultcontainer = document.createElement("div");
    resultcontainer.className = "resultcontainer";
    viewgamepanel.appendChild(resultcontainer);
    for (var player of coinflipgame.players) {
        if (player) { // Check if player is not null or undefined
            var avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.setAttribute("playercolor", player.color);
    
            // Set the background image based on player.avatar or a default image if avatar is not available
            avatar.style.backgroundImage = "url(" + (player.avatar ? player.avatar : "https://www.shareicon.net/data/512x512/2015/10/04/651089_question_512x512.png") + ")";
    
            resultcontainer.appendChild(avatar);
        }
    }
    
    var firstplayername = document.createElement("div");
    firstplayername.className = "firstplayername";
    firstplayername.innerHTML = coinflipgame.players[0].name;
    viewgamepanel.appendChild(firstplayername);
    var secondplayername = document.createElement("div");
    secondplayername.className = "secondplayername";
    secondplayername.innerHTML = (coinflipgame.players[1] != null ? coinflipgame.players[1].name : "");
    viewgamepanel.appendChild(secondplayername);
    var leftcontainer = document.createElement("div");
    leftcontainer.className = "leftcontainer";
    viewgamepanel.appendChild(leftcontainer);
    var rightcontainer = document.createElement("div");
    rightcontainer.className = "rightcontainer";
    viewgamepanel.appendChild(rightcontainer);
    for (var skin of coinflipgame.skins)
    {
        var item = CreateItemDiv(skinsdatabase[skin[0]], (skin[1] == coinflipgame.players[0].name ? leftcontainer : rightcontainer));
        item.classList.add("skinelement");
    }
    if (coinflipgame.winner != null)
    {
    
        if (liveresult == true)
        {
            var nowtime = Date.now();
        
            if (nowtime - coinflipgame.time < 6000)
            {
                var resultcoin = document.createElement("video");
                resultcoin.className = "centerresultcoin";
                resultcoin.autoplay = true;
                resultcoin.muted = true;
                resultcoin.currentTime = ((nowtime - coinflipgame.time) / 1000);
                resultcoin.src = "animations/" + coinflipgame.winner + ".mp4";
                resultcoin.style.backgroundPosition = "center";
                resultcoin.style.backgroundSize = "cover";
                resultcoin.style.backgroundRepeat = "no-repeat";
                resultcoin.style.backgroundImage = "url('gfx/" + coinflipgame.winner + "coin.png')";
                setTimeout(() =>
                    {
                        resultcontainer.querySelector(".avatar[playercolor='" + coinflipgame.winner + "']").classList.add("winner_border_" + coinflipgame.winner);
                    }, 6000 - (nowtime - coinflipgame.time));                
            }
            else
            {
                var resultcoin = document.createElement("div");
                resultcoin.className = "centerresultcoin";
                resultcoin.style.backgroundPosition = "center";
                resultcoin.style.backgroundSize = "cover";
                resultcoin.style.backgroundRepeat = "no-repeat";
                resultcoin.style.backgroundImage = "url('gfx/" + coinflipgame.winner + "coin.png')";
                resultcontainer.querySelector(".avatar[playercolor='" + coinflipgame.winner + "']").classList.add("winner_border_" + coinflipgame.winner);
            }
        }
        else
        {
            var resultcoin = document.createElement("video");
            resultcoin.className = "centerresultcoin";
            resultcoin.autoplay = true;
            resultcoin.muted = true;
            resultcoin.src = "animations/" + coinflipgame.winner + ".mp4";
            resultcoin.style.backgroundPosition = "center";
            resultcoin.style.backgroundSize = "cover";
            resultcoin.style.backgroundRepeat = "no-repeat";
            //resultcontainer.querySelector(".avatar[playercolor='" + coinflipgame.winner + "']").classList.add("winner_border_" + coinflipgame.winner);
            setTimeout(() =>
                {
                    resultcontainer.querySelector(".avatar[playercolor='" + coinflipgame.winner + "']").classList.add("winner_border_" + coinflipgame.winner);
                }, 6000);
        }
        resultcontainer.insertBefore(resultcoin, resultcontainer.querySelector(".avatar").nextSibling);
    }
}

function CreateDepositPanel()
{
    if (document.querySelector(".depositpanel"))
    {
        document.querySelector(".depositpanel").remove();
        return;
    }
    var depositpanel = document.createElement("div");
    depositpanel.className = "depositpanel";
    document.querySelector(".deposit").appendChild(depositpanel);
    var depositbutton = document.createElement("button");
    depositbutton.className = "depositbutton";
    depositbutton.innerHTML = "Deposit";
    depositbutton.addEventListener("click", function ()
    {
        OpenDepositPanel();
    });
    depositpanel.appendChild(depositbutton);
    var withdrawbutton = document.createElement("button");
    withdrawbutton.className = "withdrawbutton";
    withdrawbutton.innerHTML = "Withdraw";
    withdrawbutton.addEventListener("click", function ()
    {
        OpenWithdrawPanel();
    });
    depositpanel.appendChild(withdrawbutton);
    return depositpanel;
}
