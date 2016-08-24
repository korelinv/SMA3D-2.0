using MiniJSON;
using System.Collections.Generic;

namespace SMA.system {

    public class Snapshot {
        public string id;
        public string name;
        public bool appInpoint;
        public string appName;
        public bool editable;
        public string prefabId;
        public string imgPath;

        public ViewSettings settings;
        public List<ElementChild> children;
        public List<Factory> factories;

        public Snapshot() {
            children = new List<ElementChild>();
            factories = new List<Factory>();
        }

    }

    public class SnapshotMini {
        public string id;
        public string name;
        public string imgPath;

        public SnapshotMini() {}
    }

    public class Factory {
        public string id;
        public string name;
        public SnapshotMini target;
        public List<Modificator> modificators {
            get { return new List<Modificator>(_parameters.Values); }
            set {
                if (value != null) {
                    if (value.Count > 0) {
                        for (int item = value.Count; item != 0; item--) {
                            _parameters.Add(value[item - 1].id, value[item - 1]);
                        };
                    };
                };
            }
        }
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
        public string dataset;
        [JsonSerilizable(ignore = true)]
        public Dictionary<string, Modificator> _parameters;
        [JsonSerilizable(ignore = true)]
        public Dictionary<string, Field> _fields;

        public Factory() {
            _parameters = new Dictionary<string, Modificator>();
            _fields = new Dictionary<string, Field>();
        }

        public Dictionary<string, string> CompileModificators(Dictionary<string, Variable> variables) {
            Dictionary<string, string> result = new Dictionary<string, string>();
            foreach (Modificator parameter in _parameters.Values) {
                if ((parameter.dependency) && (variables.ContainsKey(parameter.affectorId))) {
                    if (variables[parameter.affectorId]._type == parameter._type)
                        result[parameter.id] = variables[parameter.affectorId].value.ToString();
                    else
                        result[parameter.id] = parameter.value.ToString();
                }
                else
                    result[parameter.id] = parameter.value.ToString();
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
