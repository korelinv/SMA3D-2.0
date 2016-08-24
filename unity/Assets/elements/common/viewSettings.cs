using MiniJSON;
using System.Collections.Generic;
using UnityEngine.Events;

namespace SMA.system {

    public class Variable {
        public string id;
        public string name;
        public string type { get { return _type.ToString(); } set { _type = TypedData.ParseType(value); } }
        [JsonSerilizable(ignore = true)]
        public primitiveDataType _type;
        public object value;
        public bool protect;
        public bool pass;

        public bool native;

        public Variable() {
            _type = primitiveDataType.@undefined;
        }

        public void SetValue(object Value) {
            value = Value;
        }

    }
    public class Field {
        public string id;
        public string name;
        public string type { get { return _type.ToString(); } set { _type = TypedData.ParseType(value); } }
        [JsonSerilizable(ignore = true)]
        public primitiveDataType _type;
        public string path;

        public Field() {
            _type = primitiveDataType.@undefined;
        }

    }
    public class ActionStep {
        public string actionType;
        public List<SnapshotMini> target;
        public SnapshotMini substitute;
        public Dictionary<string, object> passingValues;
        public string methodName;
        public Dictionary<string, object> methodParameters;
    }
    public class Action {
        [JsonSerilizable(ignore = true)]
        public UnityAction action { get { return Execute; } }
        public string id;
        public string name;
        public List<ActionStep> steps;
        [JsonSerilizable(ignore = true)]
        public string senderInstanceID = null;

        public Action() {
            steps = new List<ActionStep>();
        }           
        public static void DoNothing() {}
        private void Execute() {
            foreach (ActionStep step in steps) {
                if (step.actionType == "swap") {
                    foreach (SnapshotMini _target in step.target) {
                        Message swapMessage = new Message(senderInstanceID, "SUPER_ELEMENT", MessageCode.SWAP_SNAPSHOT);
                        swapMessage.InsertField("target", _target.id);
                        swapMessage.InsertField("substitute", step.substitute.id);
                        Broadcaster.MessageBroadcast.Invoke(swapMessage);
                    };
                }
                else if (step.actionType == "send") {
                    foreach (SnapshotMini _target in step.target) {
                        Message sendMessage = new Message(senderInstanceID, senderInstanceID, MessageCode.SEND_VARIABLES);
                        sendMessage.InsertField("target", _target.id);
                        sendMessage.InsertField("values", step.passingValues);
                        Broadcaster.MessageBroadcast.Invoke(sendMessage);
                    };
                }
                else if (step.actionType == "invoke") {
                    foreach (SnapshotMini _target in step.target) {
                        Message invokeMessage = new Message(senderInstanceID, senderInstanceID, MessageCode.SEND_INVOCATION);
                        invokeMessage.InsertField("target", _target.id);
                        invokeMessage.InsertField("method",step.methodName);
                        invokeMessage.InsertField("parameters", step.methodParameters);
                        Broadcaster.MessageBroadcast.Invoke(invokeMessage);
                    };
                };
            };



        }

    }
    public class Modificator {
        public string id;
        public string name;
        public string type { get { return _type.ToString(); } set { _type = TypedData.ParseType(value); } }
        [JsonSerilizable(ignore = true)]
        public primitiveDataType _type;
        public bool dependency;
        public string affectorId;
        public string affectorName;
        public string value;

        public Modificator() {
            _type = primitiveDataType.@undefined;
            dependency = false;
            value = null;
        }

    }

    public class ViewSettings {
        public List<Field> fields {
            get { return new List<Field>(_fields.Values); }
            set {
                if (value != null) {
                    if (value.Count > 0) {
                        for (int item = value.Count; item != 0; item--) {
                            _fields.Add(value[item - 1].id, value[item - 1]);
                        };
                    };
                };
            }
        }
        public List<Variable> variables {
            get { return new List<Variable>(_variables.Values); }
            set {
                if (value != null) {
                    if (value.Count > 0) {
                        for (int item = value.Count; item != 0; item--) {
                            _variables.Add(value[item - 1].id, value[item - 1]);
                        };
                    };
                };
            }
        }
        public List<Action> actions {
            get { return new List<Action>(_actions.Values); }
            set {
                if (value != null) {
                    if (value.Count > 0) {
                        for (int item = value.Count; item != 0; item--) {
                            _actions.Add(value[item - 1].id, value[item - 1]);
                        };
                    };
                };
            }
        }
        public List<Modificator> modificators {
            get { return new List<Modificator>(_modificators.Values); }
            set {
                if (value != null) {
                    if (value.Count > 0) {
                        for (int item = value.Count; item != 0; item--) {
                            _modificators.Add(value[item - 1].id, value[item - 1]);
                        };
                    };
                };
            }
        }
        public string dataset;
        [JsonSerilizable(ignore = true)]
        public Dictionary<string, Field> _fields;
        [JsonSerilizable(ignore = true)]
        public Dictionary<string, Variable> _variables;
        [JsonSerilizable(ignore = true)]
        public Dictionary<string, Action> _actions;
        [JsonSerilizable(ignore = true)]
        public Dictionary<string, Modificator> _modificators;

        public ViewSettings() {
            _fields = new Dictionary<string, Field>();
            _variables = new Dictionary<string, Variable>();
            _actions = new Dictionary<string, Action>();
            _modificators = new Dictionary<string, Modificator>();
        }
        public Variable GetVariable(string ID) {
            if (_variables.ContainsKey(ID))
                return _variables[ID];
            else
                return null;
        }
        public Action GetAction(string ID) {
            if (_actions.ContainsKey(ID))
                return _actions[ID];
            else
                return null;
        }
        public Dictionary<string, string> CompileModificators() {
            Dictionary<string, string> result = new Dictionary<string, string>();
            foreach (Modificator modificator in _modificators.Values) {
                if ((modificator.dependency) && (_variables.ContainsKey(modificator.affectorId))) {
                    if (_variables[modificator.affectorId]._type == modificator._type) {
                        if (_variables[modificator.affectorId].value == null)
                            result[modificator.id] = "";
                        else
                            result[modificator.id] = _variables[modificator.affectorId].value.ToString();
                    }
                    else
                        result[modificator.id] = modificator.value.ToString();
                }
                else
                    result[modificator.id] = modificator.value.ToString();
            };
            return result;
        }
        public Dictionary<string, string> CompileRequest() {
            Dictionary<string, string> result = new Dictionary<string, string>();
            foreach (Field field in _fields.Values) {
                result[field.id] = field.path;
            };
            return result;
        }

    }

}