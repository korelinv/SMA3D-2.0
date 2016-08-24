using UnityEngine;
using System.Collections;
using SMA.system;

// подумать ка логировать ошибки в сообщениях об ошибках и системных интерфейсах

public class errorHandlerController : Interactor {

    
    public override void PostAwake() {
        SetCustomID("ERROR_HANDLER");
    }
    
    // вынести отправку сообщений в хэндлер в отдельные мктоды
    public override void ProcessMessage(Message message) {
        if ((message._code == MessageCode.ERROR) || (message._code == MessageCode.ALERT)) {
            Message popUpMessage = new Message(instanceID, "WEB_COUPLING", MessageCode.CREATE_WEBFORM);
            if (message._code == MessageCode.ERROR) {
                popUpMessage.InsertField("caption","Ошибка");
                popUpMessage.InsertField("text",(string)message.ExtractField("error_text"));
                popUpMessage.InsertField("id","popUp");
            };
            if (message._code == MessageCode.ALERT) {
                popUpMessage.InsertField("caption", "Предупреждение");
                popUpMessage.InsertField("text", (string)message.ExtractField("alert_text"));
                popUpMessage.InsertField("id", "popUp");
            };
            EmitMessage(popUpMessage);
        };
    }
	
}
