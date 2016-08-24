using MiniJSON;
using System;
using System.Collections.Generic;

namespace SMA.system {
    /// <summary>
    /// основные типы данных
    /// </summary>
    public enum primitiveDataType {
        @int,@float,@double,@string,@long,@boolean,@datetime,@null,@undefined
    }

    public class TypedData {
        /// <summary>
        /// Преобразует строку в primitiveDataType
        /// </summary>
        /// <param name="value">входное значение</param>
        /// <returns>тип согласно primitiveDataType (@undefined в случае неудачи)</returns>
        public static primitiveDataType ParseType(string value) {
            primitiveDataType result = primitiveDataType.@undefined;
            switch (value) {
                case "@int":
                    result = primitiveDataType.@int;
                    break;
                case "@float":
                    result = primitiveDataType.@float;
                    break;
                case "@double":
                    result = primitiveDataType.@double;
                    break;
                case "@string":
                    result = primitiveDataType.@string;
                    break;
                case "@long":
                    result = primitiveDataType.@long;
                    break;
                case "@boolean":
                    result = primitiveDataType.@boolean;
                    break;
                case "@datetime":
                    result = primitiveDataType.@datetime;
                    break;
                case "@null":
                    result = primitiveDataType.@null;
                    break;
                default:
                    result = primitiveDataType.@undefined;
                    break;
            };
            return result;
        }

        public string type {
            get { return _type.ToString(); }
            set { _type = ParseType(value); }
        }
        public string value;
        [JsonSerilizable(ignore = true)]
        private primitiveDataType _type;

        public object GetValue() {
            object result = new object();
            switch (_type) {
                case primitiveDataType.@int:
                    result = int.Parse(value);
                    break;
                case primitiveDataType.@float:
                    result = float.Parse(value);
                    break;
                case primitiveDataType.@double:
                    result = double.Parse(value);
                    break;
                case primitiveDataType.@string:
                    result = value;
                    break;
                case primitiveDataType.@long:
                    result = long.Parse(value);
                    break;
                case primitiveDataType.@boolean:
                    result = bool.Parse(value);
                    break;
                case primitiveDataType.@datetime:
                    result = DateTime.Parse(value);
                    break;
                case primitiveDataType.@null:
                    result = null;
                    break;
            };
            return result;
        }
        public primitiveDataType GetDataType() {
            return _type;
        }
    }

    public class PoolElement {
        public Dictionary<string, object> data;

        public PoolElement() {
            data = new Dictionary<string, object>();
        }

        public object GetProperty(string id, object @default) {
            object result;
            if (data.ContainsKey(id)) {         
                result = (data[id] as TypedData).GetValue();
            }
            else {
                //result = null;
                result = @default;
            };
            return result;
        }

        public Dictionary<string, Variable> ToVariables() {
            Dictionary<string, Variable> result = new Dictionary<string, Variable>();
            foreach (KeyValuePair<string, object> item in data) {
                Variable newVariable = new Variable();
                TypedData typedData = (TypedData)item.Value;
                newVariable.id = item.Key;
                newVariable.name = item.Key;
                newVariable.native = true;
                newVariable.pass = true;
                newVariable.protect = true;
                newVariable.value = typedData.GetValue();
                newVariable._type = typedData.GetDataType();
                result[item.Key] = newVariable;
            };
            return result;
        }
    }

}