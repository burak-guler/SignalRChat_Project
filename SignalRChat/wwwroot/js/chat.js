var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("globalsendButton").disabled = true;
//document.getElementById("privatesendButton").disabled = true;
//document.getElementById("joinGroupButton").disabled = true;
//document.getElementById("leaveGroupButton").disabled = true;
//document.getElementById("groupMessage").disabled = true;

connection.on("PrivateReceiveMessage", function (user, message, id) {

    console.log("Received ConnectionID: " + id);

    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `[Private]Gönderen(${user}) -- ${message}`;

});

connection.on("ReceiveMessage", function (user, message) {
       

    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `[Global]Gönderen(${user}) -- ${message}`;

});

//connection.on("UserAddList", function (users) {

//    console.log(users);

//    document.getElementById("userList").innerHTML = "";

//    for (let i = 0; i < users.length; i++) {
//        var li = document.createElement("li");
//        document.getElementById("userList").appendChild(li);
//        li.id = "item" + i;
//        li.textContent = `${users[i]}`;
//    }
//});

connection.on("UserAddList", function (users) {
    console.log(users);

    var userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        var li = document.createElement("li");
        li.id = "item" + i;
        li.textContent = users[i];

        li.addEventListener("click", function () {
            var outputInput = document.getElementById("sendName");
            outputInput.value = users[i];
        });

        userListContainer.appendChild(li);
    }
});

connection.on("GroupReceiveMessage", function (message) {
    $("#messagesList").append(`<p>${message}</p>`);
});

connection.on("ReceiveGroupList", function (groupList) {
    $("#groupList").empty();

    groupList.forEach(function (group) {
        $("#groupList").append(`<p>${group.groupName} (${group.userCount} users)</p>`);
    });
});


connection.start().then(function () {

    console.log("Connected: " + connection.connectionId);
    document.getElementById("globalsendButton").disabled = false;
    //document.getElementById("privatesendButton").disabled = false;
    //document.getElementById("joinGroupButton").disabled = false;
    //document.getElementById("leaveGroupButton").disabled = false;
    //document.getElementById("groupMessage").disabled = false;

}).catch(function (err) { return console.error(err.toString()); });


document.getElementById("privatesendButton").addEventListener("click", function (event) {

    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    var sendName = document.getElementById("sendName").value;
    

    //connection.invoke("SendMessage", user, message).catch(function (err) {
    //    return console.error(err.toString());
    //});

    /*var connectionId = connection.connectionId;*/
    connection.invoke("SendPrivateMessage", user, message, sendName).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});

document.getElementById("globalsendButton").addEventListener("click", function (event) {

    //var user = document.getElementById("userInput").value;
    //var message = document.getElementById("messageInput").value;
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    


    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});

///

document.getElementById("toggleButton").addEventListener("click", function (event) {

    console.log("selam");
    var div1 = document.getElementById("div1");
    var div2 = document.getElementById("div2");
    var username = document.getElementById("userName").value;
    document.getElementById("userInput").value = username;
    document.getElementById("userInput").disabled = true;

    div1.style.display = "none";
    div2.style.display = "block";

    connection.invoke("SetUserName", username).catch(function (err) {
        return console.error(err.toString());
    });      
          

    event.preventDefault();
});



//$("#joinGroupButton").click(function () {
//    var groupName = $("#sendName").val();
//    connection.invoke("JoinGroup", groupName);
//});
//$("#leaveGroupButton").click(function () {
//    var groupName = $("#sendName").val();
//    connection.invoke("LeaveGroup", groupName);
//});

//$("#sendMessageButton").click(function () {
//    var groupName = $("#sendName").val();
//    var message = $("#messageInput").val();
//    connection.invoke("SendMessageToGroup", groupName, message);
//});

document.getElementById("joinGroupButton").addEventListener("click", function (event) {
      
    
    var groupName = document.getElementById("sendName").value;

    connection.invoke("JoinGroup", groupName).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("leaveGroupButton").addEventListener("click", function (event) {


    var groupName = document.getElementById("sendName").value;

    connection.invoke("LeaveGroup", groupName).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("groupMessage").addEventListener("click", function (event) {


    var groupName = document.getElementById("sendName").value;
    var message = document.getElementById("messageInput").value;

    connection.invoke("SendMessageToGroup", groupName, message).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});







