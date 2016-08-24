using MiniJSON;
using SMA.system;
using System;
using UnityEngine;

public class webCouplingController : Interactor {

    public override void PostAwake() {
        SetCustomID("WEB_COUPLING");
    }

    public override void ProcessMessage(Message message) {
        base.ProcessMessage(message);
        if (message._code != MessageCode.ERROR) PassToWeb(message);
    }

    private void PassToWeb(Message message) {
        Application.ExternalCall("ToAngular", Json.Serialize(message));
    }

    public void PassToEngine(string argument) {
        try {
            Message message = (Message)Json.Deserialize(argument);
            EmitMessage(message);
        }
        catch (ArgumentException) {
            SendErrorMessage("Invalid message format");
        };
    }

    public void KickstartFromPoint(string id) {
        Message kickstart = new Message(instanceID, "SUPER_ELEMENT", MessageCode.OPEN_SNAPSHOT);
        kickstart.fields["id"] = id;
        EmitMessage(kickstart);
    }

    /*
    // dev
    void Start() {
        Invoke("test", 1);
    }
    void test() {
        Message test3 = new Message(instanceID, "SUPER_ELEMENT", MessageCode.OPEN_SNAPSHOT);
        test3.fields["id"] = "bf9554ade50b84055729cdf0351a25d4";
        EmitMessage(test3);
    }
    */

}