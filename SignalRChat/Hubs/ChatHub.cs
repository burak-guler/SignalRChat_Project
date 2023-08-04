using Microsoft.AspNetCore.SignalR;
using System.Security.Cryptography.X509Certificates;

namespace SignalRChat.Hubs
{
    public class ChatHub : Hub
    {
        public static Dictionary<string, string> Users = new Dictionary<string, string>();
        public static Dictionary<string, List<string>> UserGroups = new Dictionary<string, List<string>>();


        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (var group in UserGroups)
            {
                if (group.Value.Contains(Context.ConnectionId))
                {
                    group.Value.Remove(Context.ConnectionId);
                    await Clients.Group(group.Key).SendAsync("GroupReceiveMessage", $"{Users[Context.ConnectionId]} left {group.Key}");
                    await SendGroupList();
                    break;
                }
            }

            Users.Remove(Context.ConnectionId);
            await Clients.All.SendAsync("UserAddList", Users.Values);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SetUserName(string user)
        {
            Users.Add(Context.ConnectionId, user);
            await Clients.All.SendAsync("UserAddList", Users.Values);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message, Context.ConnectionId);
        }

        public async Task SendPrivateMessage(string user, string message, string PrivatesendName)
        {
            var userConnectionId = Users.Where(w => w.Value.Equals(PrivatesendName)).FirstOrDefault().Key;

            if(!string.IsNullOrEmpty(userConnectionId))
                await Clients.Client(userConnectionId).SendAsync("PrivateReceiveMessage", user, message, Context.ConnectionId);            
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            if (!UserGroups.ContainsKey(groupName))
            {
                UserGroups[groupName] = new List<string>();
            }
            UserGroups[groupName].Add(Context.ConnectionId);

            await Clients.Group(groupName).SendAsync("GroupReceiveMessage", $"{Users[Context.ConnectionId]} joined {groupName}");
            await SendGroupList();
        }

        public async Task LeaveGroup(string groupName)
        {
            if (UserGroups.ContainsKey(groupName) && UserGroups[groupName].Contains(Context.ConnectionId))
            {
                UserGroups[groupName].Remove(Context.ConnectionId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                await Clients.Group(groupName).SendAsync("GroupReceiveMessage", $"{Users[Context.ConnectionId]} left {groupName}");
                await SendGroupList();
            }
        }

        public async Task SendMessageToGroup(string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("GroupReceiveMessage", $"{Users[Context.ConnectionId]}: {message}");
        }

        public async Task SendGroupList()
        {
            var groupInfo = UserGroups.Select(g => new { GroupName = g.Key, UserCount = g.Value.Count }).ToList();
            await Clients.All.SendAsync("ReceiveGroupList", groupInfo);
        }


    }
}