using SMA.system;
using UnityEngine;
using UnityEngine.Events;

public class Interactor : MonoBehaviour {

    virtual public void ProcessMessage(Message message) {
        // похоже что такое не должно случаться но на всякий случай
        if (message._code == MessageCode.ERROR) {
            SendErrorMessage((string)message.ExtractField("error_text") + "[" + name + "]");
        };
    }

    public void SendErrorMessage(string errorText) {
        Message message = new Message(instanceID, "ERROR_HANDLER", MessageCode.ERROR);
        message.fields["error_text"] = errorText;
        EmitMessage(message);
    }

    public void SendAlert(string alertText) {
        Message message = new Message(instanceID,"ERROR_HANDLER", MessageCode.ALERT);
        message.fields["alert_text"] = alertText;
        // алерт можно послать только в хендлер напрямую
        EmitMessage(message);
    }

    public string instanceID;
    public void SetCustomID(string newID) {
        instanceID = newID;
    }

    void Awake() {
        instanceID = GetInstanceID().ToString();
        Broadcaster.MessageBroadcast.AddListener(ReceiveMessage);
        PostAwake();
    }

    virtual public void PostAwake() {
    }

    private void ReceiveMessage(Message message) {
        if ((message.receiver == instanceID) && !message.processed) {
            ProcessMessage(message);
            message.processed = true;
        };
    }

    public void EmitMessage(Message message) {
        //Application.ExternalCall("console.log",Time.realtimeSinceStartup.ToString()+": "+message.code+" ("+message.sender + "=>" + message.receiver+")");
        Broadcaster.MessageBroadcast.Invoke(message);       
    }

}

public class Broadcaster {
    public class GlobalMessage : UnityEvent<Message> {}
    public static GlobalMessage MessageBroadcast = new GlobalMessage();
}
