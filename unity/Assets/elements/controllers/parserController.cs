using MiniJSON;
using SMA.system;
using System.Collections.Generic;

public class parserController : Interactor {

    public override void PostAwake() {
        SetCustomID("PARSER");
    }

    public override void ProcessMessage(Message message) {
        base.ProcessMessage(message);
        switch (message._code) {
            case MessageCode.PARSE_SNAPSHOT:
                TryParseSnapshot(message);
                break;
            case MessageCode.PARSE_POOL:
                TryParsePoolData(message);
                break;
            default:
                if (message._code != MessageCode.ERROR)
                    SendErrorMessage("Client Error (Incorrect communication message): " + message._code.ToString());
                break;
        };
    }

    private void TryParseSnapshot(Message message) {
        string data = (string)message.fields["data"];
        Snapshot result = (Snapshot)Json.Deserialize(data);

        Message response = new Message();
        response.sender = instanceID;
        response._code = MessageCode.RECEIVE_SNAPSHOT;
        response.receiver = message.sender;
        response.fields["data"] = result;
        EmitMessage(response);
    }

    private void TryParsePoolData(Message message) {

        string data = (string)message.fields["data"];
        List<PoolElement> result = (List<PoolElement>)Json.Deserialize(data);

        Message response = new Message();
        response.sender = instanceID;
        response._code = MessageCode.RECEIVE_POOL;
        response.receiver = message.sender;
        if (result == null) result = new List<PoolElement>();
        response.fields["data"] = result;
        if (message.ContainsField("factory")) {
            response.fields["factory"] = message.fields["factory"];
            response.fields["target"] = message.fields["target"];
        };
        EmitMessage(response);
    }

}
