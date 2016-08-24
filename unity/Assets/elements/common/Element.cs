using SMA.elements;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace SMA.system {

    public class ElementChild {
        public string id;
        public string localId;
        public bool isArray;

        public ElementChild() {
            isArray = false;
        }
        public ElementChild(string Id, string LocalId, bool IsCollection) {
            id = Id;
            localId = LocalId;
            isArray = IsCollection;
        }
    }

    public class Element : Interactor {
        private GameObject elementPrefab;
        public Element parent;
        public List<Element> children = new List<Element>();
        public List<Element> fabricatedChildren = new List<Element>();
        public bool fabricated = false; 
        public bool determened = false;
        public string callback = "";
        private Snapshot snapshot;
        private GameObject prefab;
        private GameObject view;
        private View viewUnit;
        private Dictionary<string, bool> ReadyFactories = new Dictionary<string, bool>();
        private Dictionary<string,Variable> Legacy = new Dictionary<string, Variable>();
        private Dictionary<string, Variable> Dynamics = new Dictionary<string, Variable>();
        private Dictionary<string, Variable> Inheritances = new Dictionary<string, Variable>();

        public override void ProcessMessage(Message message) {
            base.ProcessMessage(message);        
            switch (message._code) {
                case MessageCode.OPEN_SNAPSHOT:
                    RequestSnapshot(message);
                    break;
                case MessageCode.RECEIVE_SNAPSHOT:
                    StartCoroutine(Set(message));
                    break;
                case MessageCode.RECEIVE_POOL:
                    Fabricate(message);
                    break;
                case MessageCode.SWAP_SNAPSHOT:
                    StartCoroutine(SwapSnapshot(message));
                    break;
                case MessageCode.RECEIVE_VARIABLES:
                    StartCoroutine(InjectVariablesValues(message));
                    break;
                case MessageCode.INVOKE_METHOD:
                    StartCoroutine(InvokeMethod(message));
                    break;
                case MessageCode.REFRESH:
                    StartCoroutine(RefreshSnapshot(message));
                    break;
                case MessageCode.REQUEST_FOOTPRINT:
                    CreateFootprint(message);
                    break;
                case MessageCode.REQUEST_MUTATED:
                    ShowMutations(message);
                    break;
                default:
                    if (message._code != MessageCode.ERROR)
                        SendErrorMessage("Client Error (Incorrect communication message): " + message._code.ToString());
                    break;
            };
        }
        public void TryResolve() {
            if (children.Count == 0)
                Resolve();
            else {
                bool result = true;
                foreach (Element element in children) {
                    result = result && element.determened;
                };
                foreach (Element element in fabricatedChildren) {
                    result = result && element.determened;
                };
                if (result)
                    Resolve();
            };
        }
        public void SetUndetermened() {
            if (determened)
                determened = false;
            if (parent != null)
                parent.SetUndetermened();
        }
        public void CascadeUpdate() {
            FormLegacy();  
            foreach (Element element in children) {
                element.SetLegacy(Inheritances);
                element.ApplyLegacy();
                element.viewUnit.SetSettings(element.snapshot.settings,true);
            };
            if (snapshot.factories.Count > 0) {
                RequestFactorySupply();
            };
            
        }
        public void SetLegacy(Dictionary<string, Variable> legacy) {
            Legacy = legacy;
        }
        public void SetDynamics(Dictionary<string, Variable> dymanics) {
            Dynamics = dymanics;
        }
        public void ApplyLegacy() {
            foreach (KeyValuePair<string, Variable> legacyItem in Legacy) {
                if (snapshot.settings._variables.ContainsKey(legacyItem.Key)) {
                    if ((!snapshot.settings._variables[legacyItem.Key].protect) && (snapshot.settings._variables[legacyItem.Key]._type == legacyItem.Value._type)) {
                        SetVariableValue(legacyItem.Key,legacyItem.Value.value);
                    };
                };
            };
        }
        public void ApplyDynamics() {
            foreach (KeyValuePair<string, Variable> dynamicItem in Dynamics) {
                snapshot.settings._variables[dynamicItem.Key] = dynamicItem.Value;
            };
        } 
        private void FormLegacy() {
            Inheritances.Clear();
            foreach (KeyValuePair<string, Variable> legacyItem in Legacy) {
                Inheritances[legacyItem.Key] = legacyItem.Value;
            };
            foreach (Variable variable in snapshot.settings.variables) {
                if (variable.pass) Inheritances[variable.id] = variable;
            };
        }
        private void SetVariableValue(string id, object value) {
            if (snapshot.settings._variables.ContainsKey(id)) {
                snapshot.settings._variables[id].value = value;
            };
        }
        // запрос снепшота с сервера
        private void RequestSnapshot(Message message) {
            Message request = new Message(instanceID,"STORAGE",MessageCode.REQUEST_SNAPSHOT);
            request.fields["id"] = message.fields["id"];
            if (message.fields.ContainsKey("override")) {
                Dictionary<string, object> incomingInheritances = (Dictionary<string, object>)request.fields["inheritances"];
            };
            EmitMessage(request);
        }
        // конфигурирует поля
        private IEnumerator Set(Message message) {
            SetUndetermened();
            DropChildren();
            ClearProperties();
            snapshot = (Snapshot)message.ExtractField("data");
            gameObject.name = "Controller::"+snapshot.name+"("+snapshot.id+")";

            if (parent != null) SetLegacy(parent.Inheritances);
            ApplyLegacy();
            ApplyDynamics();
            FormLegacy();

            prefab = Resources.Load(snapshot.prefabId) as GameObject;
            view = Instantiate(prefab) as GameObject;
            view.gameObject.name = "View::"+snapshot.name+"("+snapshot.id +")";
            if (parent != null)
                view.transform.SetParent(parent.view.transform);
            viewUnit = view.GetComponent<View>();
            viewUnit.SetParent(this);

            viewUnit.SetSettings(snapshot.settings,false);
 
            if (elementPrefab == null) {
                elementPrefab = Resources.Load("system/Element") as GameObject;
            };

            //foreach (ElementChild element in snapshot.children) {
            for (int i = 0; i < snapshot.children.Count; i++) {

                ElementChild element = snapshot.children[i];

                if (element.id != snapshot.id) {
                    GameObject newElement = Instantiate(elementPrefab, transform.position, transform.rotation) as GameObject;
                    newElement.transform.SetParent(transform,false);
                    Element newElementController = newElement.GetComponent<Element>();
                    children.Add(newElementController);
                    newElementController.parent = this;

                    Message snapshotRequest = new Message(instanceID, newElementController.instanceID, MessageCode.OPEN_SNAPSHOT);
                    snapshotRequest.fields["id"] = element.id;
                    EmitMessage(snapshotRequest);
                    yield return null;
                };
            };

            if (snapshot.factories.Count > 0) RequestFactorySupply();
            else TryResolve();
        }
        private void RequestFactorySupply() {
            for (int i = 0; i < snapshot.factories.Count; i++) {
                Factory factory = snapshot.factories[i];
                if (!string.IsNullOrEmpty(factory.dataset)) {
                    Message request = new Message(instanceID, "STORAGE", MessageCode.REQUEST_DATA);
                    request.fields["id"] = factory.dataset;
                    request.fields["factory"] = factory.id;
                    request.fields["target"] = factory.target;
                    request.fields["parameters"] = factory.CompileModificators(snapshot.settings._variables);
                    request.fields["request"] = factory.CompileRequest();
                    EmitMessage(request);
                    ReadyFactories[factory.id] = false;
                }
                else
                    ReadyFactories[factory.id] = true;
            };
            if (AllFactoriesReady()) TryResolve();
        }
        private void Fabricate(Message message) {
            ClearFabricatedChildren();
            List<PoolElement> pool = (List<PoolElement>)message.fields["data"];
            string id = (string)message.fields["factory"];
            SnapshotMini target = (SnapshotMini)message.fields["target"];

            if ((target.id != snapshot.id) && (pool != null)) {
                int index = 0;
                foreach (PoolElement item in pool) {
                    Dictionary<string, Variable> dynamicValues = item.ToVariables();
                    Variable indexVariable = new Variable();
                    indexVariable.id = "$index";
                    indexVariable.name = "индекс";
                    indexVariable.native = true;
                    indexVariable.pass = true;
                    indexVariable.protect = true;
                    indexVariable._type = primitiveDataType.@int;
                    indexVariable.value = index;
                    dynamicValues[indexVariable.id] = indexVariable;

                    GameObject newElement = Instantiate(elementPrefab, transform.position, transform.rotation) as GameObject;
                    newElement.transform.SetParent(transform, false);
                    Element newElementController = newElement.GetComponent<Element>();
                    //children.Add(newElementController);
                    newElementController.parent = this;
                    newElementController.fabricated = true;
                    newElementController.SetDynamics(dynamicValues);

                    fabricatedChildren.Add(newElementController);

                    Message snapshotRequest = new Message(instanceID, newElementController.instanceID, MessageCode.OPEN_SNAPSHOT);
                    snapshotRequest.fields["id"] = target.id;
                    EmitMessage(snapshotRequest);

                    index++;
                };
            };

            ReadyFactories[id] = true;
            if (AllFactoriesReady()) TryResolve();
        }
        private bool AllFactoriesReady() {
            bool result = true;
            foreach (KeyValuePair<string,bool> factoryStatus in ReadyFactories) {
                result = result && factoryStatus.Value;
            };
            return result;
        }
        private void Resolve() {
            determened = true;
            if (parent != null) {
                parent.TryResolve();
            }
            else {
                Message response = new Message(instanceID, "WEB_COUPLING", MessageCode.RECEIVE_FOOTPRINT);
                response.fields["data"] = Footprint();
                if (!string.IsNullOrEmpty(callback))
                    response.fields["__callback"] = callback;
                callback = "";
                EmitMessage(response);
            };
        }
        private void ShowMutations(Message message) {
            Message response = new Message(instanceID, "WEB_COUPLING", MessageCode.NULL);
            response.fields["data"] = snapshot;
            if (message.fields.ContainsKey("__callback")) response.fields["__callback"] = message.fields["__callback"];
            EmitMessage(response);
        }
        private IEnumerator SwapSnapshot(Message message) {
            if (message.ContainsField("target") && message.ContainsField("substitute") && (snapshot != null)) {
                string target = (string)message.ExtractField("target");
                string substitute = (string)message.ExtractField("substitute");

                if (target == snapshot.id) {
                    Message newSnapshotRequest = new Message(instanceID,"STORAGE", MessageCode.REQUEST_SNAPSHOT);
                    newSnapshotRequest.InsertField("id", substitute);
                    EmitMessage(newSnapshotRequest);
                }
                else {
                    for (int i = 0; i < children.Count; i++) {
                        Element child = children[i];
                        Message swapRequest = new Message(instanceID,child.instanceID, MessageCode.SWAP_SNAPSHOT);
                        swapRequest.InsertField("target",target);
                        swapRequest.InsertField("substitute", substitute);
                        EmitMessage(swapRequest);
                        yield return null;
                    };
                    for (int i = 0; i < fabricatedChildren.Count; i++) {
                        Element child = fabricatedChildren[i];
                        Message swapRequest = new Message(instanceID, child.instanceID, MessageCode.SWAP_SNAPSHOT);
                        swapRequest.InsertField("target", target);
                        swapRequest.InsertField("substitute", substitute);
                        EmitMessage(swapRequest);
                        yield return null;
                    };
                };
            };
        }
        private IEnumerator InjectVariablesValues(Message message) {
            if (message.ContainsField("target") && (snapshot != null)) {
                if (message.fields["target"] is string) {
                    if ((string)message.fields["target"] == snapshot.id) {
                        Message injectRequest = new Message(instanceID, viewUnit.instanceID, MessageCode.RECEIVE_VARIABLES);
                        if (message.fields.ContainsKey("values")) {
                            injectRequest.InsertField("data", message.fields["values"]);
                        };
                        EmitMessage(injectRequest);
                    }
                    else {
                        for (int i = 0; i < children.Count; i++) {
                            Element child = children[i];
                            Message injectRequest = new Message(instanceID, child.instanceID, MessageCode.RECEIVE_VARIABLES);
                            injectRequest.InsertField("target", message.fields["target"]);
                            if (message.fields.ContainsKey("values")) {
                                injectRequest.InsertField("values", message.fields["values"]);
                            };
                            EmitMessage(injectRequest);
                            yield return null;
                        };
                        for (int i = 0; i < fabricatedChildren.Count; i++) {
                            Element child = fabricatedChildren[i];
                            Message injectRequest = new Message(instanceID, child.instanceID, MessageCode.RECEIVE_VARIABLES);
                            injectRequest.InsertField("target", message.fields["target"]);
                            if (message.fields.ContainsKey("values")) {
                                injectRequest.InsertField("values", message.fields["values"]);
                            };
                            EmitMessage(injectRequest);
                            yield return null;

                        };
                    };
                }
                else
                    SendErrorMessage("var2");
            };
            //else
            //    SendErrorMessage("var1");
        }

        private IEnumerator InvokeMethod(Message message) {
            if (message.ContainsField("target") && (snapshot != null)) {
                if (message.fields["target"] is string) {
                    if ((string)message.fields["target"] == snapshot.id) {
                        Message injectRequest = new Message(instanceID, viewUnit.instanceID, MessageCode.INVOKE_METHOD);
                        injectRequest.InsertField("method", message.fields["method"]);
                        injectRequest.InsertField("parameters", message.fields["parameters"]);
                        EmitMessage(injectRequest);
                    }
                    else {
                        for (int i = 0; i < children.Count; i++) {
                            Element child = children[i];
                            Message injectRequest = new Message(instanceID, child.instanceID, MessageCode.INVOKE_METHOD);
                            injectRequest.InsertField("target", message.fields["target"]);
                            injectRequest.InsertField("method", message.fields["method"]);
                            injectRequest.InsertField("parameters", message.fields["parameters"]);
                            EmitMessage(injectRequest);
                            yield return null;
                        };
                        for (int i = 0; i < fabricatedChildren.Count; i++) {
                            Element child = fabricatedChildren[i];
                            Message injectRequest = new Message(instanceID, child.instanceID, MessageCode.INVOKE_METHOD);
                            injectRequest.InsertField("target", message.fields["target"]);
                            injectRequest.InsertField("method", message.fields["method"]);
                            injectRequest.InsertField("parameters", message.fields["parameters"]);
                            EmitMessage(injectRequest);
                            yield return null;

                        };
                    };
                }
                else
                    SendErrorMessage("var2");
            };
        }

        private void CreateFootprint(Message message) {           
            // веб
            Message response = new Message(instanceID, "WEB_COUPLING", MessageCode.RECEIVE_FOOTPRINT);
            response.fields["data"] = Footprint();
            if (message.fields.ContainsKey("__callback")) response.fields["__callback"] = message.fields["__callback"];
            EmitMessage(response);
        }
        public Dictionary<string,object> Footprint () {
            Dictionary<string, object> result = new Dictionary<string, object>();
            result.Add("name", snapshot.name);
            result.Add("id", snapshot.id);
            result.Add("instanceID", instanceID);
            if (parent != null) result.Add("parent", parent.snapshot.id);
            else result.Add("parent", null);
            result.Add("fabricated", fabricated);

            if (!fabricated) {
                List<Dictionary<string, object>> list = new List<Dictionary<string, object>>();
                foreach (Element child in children) {
                    list.Add(child.Footprint());
                };
                result.Add("children", list);

                if (list.Count > 0) {
                    Dictionary<string, object> dElements = new Dictionary<string, object>();
                    for (int i = 0; i < list.Count; i++) {
                        if ((bool)list[i]["fabricated"]) dElements[(string)list[i]["id"]] = list[i];
                    };

                    foreach (string key in dElements.Keys) {
                        Dictionary<string, object> collective = new Dictionary<string, object>(dElements[key] as Dictionary<string,object>);
                        collective["instanceID"] = null;
                        collective["fabricated"] = false;
                        collective["name"] = collective["name"];
                        collective["collective"] = true;
                        list.Insert(0,collective);
                    };
                };

            };

            return result;
        }
        private IEnumerator RefreshSnapshot(Message message) {
            if (message.fields.ContainsKey("id")) {
                if (message.fields.ContainsKey("__callback") && (parent == null)) {
                    callback = (string)message.fields["__callback"];
                };
                string id = (string)message.fields["id"];
                if (id == snapshot.id) {
                    Message refreshSnapshot = new Message();
                    refreshSnapshot._code = MessageCode.REQUEST_SNAPSHOT;
                    refreshSnapshot.sender = instanceID;
                    refreshSnapshot.receiver = "STORAGE";
                    refreshSnapshot.fields["id"] = id;
                    EmitMessage(refreshSnapshot);
                }
                else {
                    for (int i = 0; i < children.Count; i++) {
                        Element child = children[i];
                        Message childRefresh = new Message();
                        childRefresh._code = message._code;
                        childRefresh.sender = instanceID;
                        childRefresh.receiver = child.instanceID;
                        childRefresh.fields["id"] = id;
                        EmitMessage(childRefresh);
                        yield return null;
                    };
                    for (int i = 0; i < fabricatedChildren.Count; i++) {
                        Element child = fabricatedChildren[i];
                        Message childRefresh = new Message();
                        childRefresh._code = message._code;
                        childRefresh.sender = instanceID;
                        childRefresh.receiver = child.instanceID;
                        childRefresh.fields["id"] = id;
                        EmitMessage(childRefresh);
                        yield return null;
                    };
                };
            }
            else
                SendErrorMessage("refr err");
        }
        // сброс элемента (только для головы, для потомков обычный дестрой)
        private void EmergencyDrop() {
            if (parent == null) {
                snapshot = null;
                prefab = null;
                children.Clear();
                Destroy(view);
            }
            else
                Destroy(gameObject);
        }
        private void DropChildren() {
            foreach (Element child in children) {
                Destroy(child.gameObject);
            };
            foreach (Element fabChild in fabricatedChildren) {
                Destroy(fabChild.gameObject);
            };
        }
        private void ClearProperties() {
            snapshot = null;
            prefab = null;
            children.Clear();
            Destroy(view);
        }
        private void ClearFabricatedChildren() {
            foreach (Element fabChildren in fabricatedChildren) {
                //fabChildren.Drop();
                // проверка нужна на тот случай если элемент был свапнут и контроллеры вьюх уже не существуют
                if (fabChildren.view) Destroy(fabChildren.view);
                if (fabChildren) Destroy(fabChildren.gameObject);
            };
            fabricatedChildren.Clear();
        }
        /*
        public void Drop() {
            Destroy(view);
            Destroy(gameObject);
        }
        */
        private void DropHead() {
            if (parent == null) {
                DropChildren();
                ClearProperties();

                Message informerSelectorMessage = new Message(instanceID, "WEB_COUPLING", MessageCode.CREATE_WEBFORM);;
                informerSelectorMessage.InsertField("id", "snapshotSelector");
                EmitMessage(informerSelectorMessage);
            };
        }
    }

}
