using SMA.system;

public class storageController : Interactor {

    public override void PostAwake() {
        SetCustomID("STORAGE");
    }

    public override void ProcessMessage(Message message) {
        base.ProcessMessage(message);
        switch (message._code) {
            case MessageCode.REQUEST_SNAPSHOT:
                ProcessSnapshotRequest(message);
                break;
            case MessageCode.REQUEST_DATA:
                ProcessDataRequest(message);
                break;
            default:
                if (message._code != MessageCode.ERROR) 
                    SendErrorMessage("Client Error (Incorrect communication message): " + message._code.ToString());
                break;
        };
    }

    private void ProcessDataRequest(Message message) {
        // if
        // проверка клиентского кеша

        // else
        // запрос с сервера
        Message dataRequest = new Message(message.sender, "LOADER", MessageCode.LOAD_DATA);
        dataRequest.fields["id"] = message.fields["id"];
        if (message.fields.ContainsKey("factory")) {
            dataRequest.fields["factory"] = message.fields["factory"];
            dataRequest.fields["target"] = message.fields["target"];
        };
        dataRequest.fields["request"] = message.fields["request"];
        dataRequest.fields["parameters"] = message.fields["parameters"];
        EmitMessage(dataRequest);
    }

    private void ProcessSnapshotRequest(Message message) {
        Message snapshotRequest = new Message(message.sender, "LOADER", MessageCode.LOAD_SNAPSHOT);
        snapshotRequest.fields["id"] = message.fields["id"];
        EmitMessage(snapshotRequest);
    }

}
