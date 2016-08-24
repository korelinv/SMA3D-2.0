using SMA.system;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.Events;

namespace SMA.elements {

    public delegate void Method(Dictionary<string, object> parameters); 

    public class View : Interactor {

        private Element parent;
        private ViewSettings settings = new ViewSettings();
        private Dictionary<string, Method> methods = new Dictionary<string, Method>();
        public List<PoolElement> pool = new List<PoolElement>(); 
        public UnityEvent OnReceivedDataset = new UnityEvent();
        public UnityEvent OnReceivedSettings = new UnityEvent();
        public UnityEvent OnUpdateSettings = new UnityEvent();

        sealed override public void ProcessMessage(Message message) {
            base.ProcessMessage(message);
            switch (message._code) {
                case MessageCode.RECEIVE_POOL:
                    SetPool(message);
                    break;
                case MessageCode.SEND_VARIABLES:
                    SendVariables(message);
                    break;
                case MessageCode.RECEIVE_VARIABLES:
                    ReceiveVariables(message);
                    break;
                case MessageCode.SEND_INVOCATION:
                    SendInvocation(message);
                    break;
                case MessageCode.INVOKE_METHOD:
                    InvokeMethod(message);
                    break;                
                default:
                    if (message._code != MessageCode.ERROR)
                        SendErrorMessage("Client Error (Incorrect communication message): " + message._code.ToString());
                    break;
            };
        }

        public override void PostAwake() {
            base.PostAwake();
            RegisterMethods();
        }

        public void SetParent(Element parent) {
            if (parent != null)
                this.parent = parent;
            else
                SendAlert("Failed to bind view to element. (Host==null)");
        }

        public void SetSettings(ViewSettings data, bool update) {
            settings = data;
            RequestData();
            if (update) OnUpdateSettings.Invoke();
            else OnReceivedSettings.Invoke();
        }

        private void SetPool(Message message) {
            pool = (List<PoolElement>)message.fields["data"];
            OnReceivedDataset.Invoke();
        }

        private void SendVariables(Message message) {
            Dictionary<string, Variable> variables = new Dictionary<string, Variable>();
            Dictionary<string,object> reference = (Dictionary<string, object>)message.fields["values"];
            foreach (KeyValuePair<string,object> variable in reference) {       
                if (settings._variables.ContainsKey(variable.Key)) {
                    variables[(string)variable.Value] = settings._variables[variable.Key];
                };
            };
            Message sendMessage = new Message(instanceID, "SUPER_ELEMENT", MessageCode.RECEIVE_VARIABLES);
            sendMessage.fields["target"] = message.fields["target"];
            sendMessage.fields["values"] = variables;

            EmitMessage(sendMessage); 
        }

        private void ReceiveVariables(Message message) {
            Dictionary<string, Variable> variables = (Dictionary<string, Variable>)message.fields["data"];
            foreach (KeyValuePair<string, Variable> variable in variables) {
                if (settings._variables.ContainsKey(variable.Key)) {
                    if (settings._variables[variable.Key]._type == variable.Value._type) {
                        SetVariableValue(settings._variables[variable.Key].id, variable.Value.value);
                    };
                };
            };
            OnUpdateSettings.Invoke();
            parent.CascadeUpdate();
        }

        public void ImplementMethod(string id, Method method) {
            methods[id] = method;
        }

        private void SendInvocation(Message message) {
            Message sendMessage = new Message(instanceID, "SUPER_ELEMENT", MessageCode.INVOKE_METHOD);
            sendMessage.fields["target"] = message.fields["target"];
            sendMessage.fields["method"] = message.fields["method"];
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            Dictionary<string,object> variablesLinks = (Dictionary<string, object>)message.fields["parameters"];
            foreach (KeyValuePair<string, object> reference in variablesLinks) {
                if (settings._variables.ContainsKey((string)reference.Value)) {
                    parameters[reference.Key] = settings._variables[(string)reference.Value].value;
                }
                else {
                    parameters[reference.Key] = null;
                };
            };
            sendMessage.fields["parameters"] = parameters;
            EmitMessage(sendMessage);
        }

        private void InvokeMethod(Message message) {
            string methodName = (string)message.fields["method"];
            if (methods.ContainsKey(methodName)) {
                methods[methodName].Invoke((Dictionary<string, object>)message.fields["parameters"]);
            };
        }

        public virtual void RegisterMethods() {} 

        public object GetVariable(string id) {
            Variable field = settings.GetVariable(id);
            object result = null;
            if (field != null) {
                result = field.value;
                // приведение числового типа
                if (field._type == primitiveDataType.@float) {
                    if (field.value.GetType() == typeof(int)) {
                        result = (float)(int)result;
                    };
                };
            };
            return result;
        }

        public void SetVariableValue(string id, object value) {
            if (settings._variables.ContainsKey(id)) {
                settings._variables[id].value = value;
            };
        }

        public UnityAction GetAction(string id) {
            system.Action action = settings.GetAction(id);
            if (action != null) {
                // при выдаче делагата записываем в экшн инстанс юнита который будет его вызывать
                action.senderInstanceID = instanceID;
                return action.action;
            }
            else
                return system.Action.DoNothing;
        }

        public bool RequiresDataset() {
            return !string.IsNullOrEmpty(settings.dataset);
        }

        public void RequestData() {
            if (RequiresDataset()) {
                Message request = new Message(instanceID, "STORAGE", MessageCode.REQUEST_DATA);
                request.fields["id"] = settings.dataset;
                request.fields["parameters"] = settings.CompileModificators();
                request.fields["request"] = settings.CompileRequest();
                EmitMessage(request);
            };
        }
    }

}
