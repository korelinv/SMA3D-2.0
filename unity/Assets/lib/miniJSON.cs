﻿/*
 * Copyright (c) 2013 Calvin Rien
 *
 * Based on the JSON parser by Patrick van Bergen
 * http://techblog.procurios.nl/k/618/news/view/14605/14863/How-do-I-write-my-own-parser-for-JSON.html
 *
 * Simplified it so that it doesn't throw exceptions
 * and can be used in Unity iPhone with maximum code stripping.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using SMA.system;
using System.Reflection;

using UnityEngine;

namespace MiniJSON {
    // Example usage:
    //
    //  using UnityEngine;
    //  using System.Collections;
    //  using System.Collections.Generic;
    //  using MiniJSON;
    //
    //  public class MiniJSONTest : MonoBehaviour {
    //      void Start () {
    //          var jsonString = "{ \"array\": [1.44,2,3], " +
    //                          "\"object\": {\"key1\":\"value1\", \"key2\":256}, " +
    //                          "\"string\": \"The quick brown fox \\\"jumps\\\" over the lazy dog \", " +
    //                          "\"unicode\": \"\\u3041 Men\u00fa sesi\u00f3n\", " +
    //                          "\"int\": 65536, " +
    //                          "\"float\": 3.1415926, " +
    //                          "\"bool\": true, " +
    //                          "\"null\": null }";
    //
    //          var dict = Json.Deserialize(jsonString) as Dictionary<string,object>;
    //
    //          Debug.Log("deserialized: " + dict.GetType());
    //          Debug.Log("dict['array'][0]: " + ((List<object>) dict["array"])[0]);
    //          Debug.Log("dict['string']: " + (string) dict["string"]);
    //          Debug.Log("dict['float']: " + (double) dict["float"]); // floats come out as doubles
    //          Debug.Log("dict['int']: " + (long) dict["int"]); // ints come out as longs
    //          Debug.Log("dict['unicode']: " + (string) dict["unicode"]);
    //
    //          var str = Json.Serialize(dict);
    //
    //          Debug.Log("serialized: " + str);
    //      }
    //  }

    /// <summary>
    /// ignore - поле игнорируется при сериализации класса;
    /// name - поле сериализуется с произвольным именем (десериализаци классов с 
    /// переопределнными названиями полей не поддерживается на данный момент)
    /// </summary>
    [AttributeUsage(AttributeTargets.All)]
    public class JsonSerilizable : Attribute {
        public string name { get; set; }
        public bool ignore { get; set; }
    }


    /// <summary>
    /// This class encodes and decodes JSON strings.
    /// Spec. details, see http://www.json.org/
    ///
    /// JSON uses Arrays and Objects. These correspond here to the datatypes IList and IDictionary.
    /// All numbers are parsed to doubles.
    /// </summary>
    public static class Json {
        /// <summary>
        /// Parses the string json into a value
        /// </summary>
        /// <param name="json">A JSON string.</param>
        /// <returns>An List&lt;object&gt;, a Dictionary&lt;string, object&gt;, a double, an integer,a string, null, true, or false</returns>
        public static object Deserialize(string json) {
            // save the string for debug information
            if (json == null) {
                return null;
            }

            return Parser.Parse(json);
        }

        sealed class Parser : IDisposable {
            const string WORD_BREAK = "{}[],:\"";

            public static bool IsWordBreak(char c) {
                return Char.IsWhiteSpace(c) || WORD_BREAK.IndexOf(c) != -1;
            }

            enum TOKEN {
                NONE,
                CURLY_OPEN,
                CURLY_CLOSE,
                SQUARED_OPEN,
                SQUARED_CLOSE,
                COLON,
                COMMA,
                STRING,
                NUMBER,
                TRUE,
                FALSE,
                NULL
            };

            StringReader json;

            Parser(string jsonString) {
                json = new StringReader(jsonString);
            }

            public static object Parse(string jsonString) {
                using (var instance = new Parser(jsonString)) {
                    return instance.ParseValue();
                }
            }

            public void Dispose() {
                json.Dispose();
                json = null;
            }

            Dictionary<string, object> ParseObject() {
                Dictionary<string, object> table = new Dictionary<string, object>();

                // ditch opening brace
                json.Read();

                // {
                while (true) {
                    switch (NextToken) {
                        case TOKEN.NONE:
                            return null;
                        case TOKEN.COMMA:
                            continue;
                        case TOKEN.CURLY_CLOSE:
                            return table;
                        default:
                            // name
                            string name = ParseString();
                            if (name == null) {
                                return null;
                            }

                            // :
                            if (NextToken != TOKEN.COLON) {
                                return null;
                            }
                            // ditch the colon
                            json.Read();

                            // value
                            table[name] = ParseValue();
                            break;
                    }
                }
            }

            object TransformToClass(object _value) {
                IDictionary asDict;
                if ((asDict = _value as IDictionary) != null) {
                    if (asDict.Contains("__type")) {
                        string @class = (string)asDict["__type"];
                        asDict.Remove("__type");
                        object newObject = Activator.CreateInstance(Type.GetType(@class));                    
                        foreach (var field in newObject.GetType().GetFields()) {
                            if (asDict.Contains(field.Name)) {
                                IList list = field.GetValue(newObject) as IList;
                                if (list != null) {
                                    if (asDict[field.Name] != null) {
                                        foreach (object item in (IList)asDict[field.Name]) {
                                            list.Add(item);
                                        };
                                    };                                                              
                                }
                                else {
                                    field.SetValue(newObject, asDict[field.Name]);
                                };
                            };
                        };             
                        foreach (var property in newObject.GetType().GetProperties()) {
                            if ((asDict.Contains(property.Name)) && (property.CanWrite)) {
                                property.SetValue(newObject, asDict[property.Name], null);
                            };
                        };                       
                        _value = newObject;
                    };
                };
                return _value;
            }

            // модификаци под возвращение типизированных списков если он однородный

            //List<object> ParseArray() {
            object ParseArray() {

                // отслеживание типов входящих в список
                Type monoType = typeof(object);
                HashSet<Type> types = new HashSet<Type>();


                List<object> array = new List<object>();

                // ditch opening bracket
                json.Read();

                // [
                var parsing = true;
                while (parsing) {
                    TOKEN nextToken = NextToken;

                    switch (nextToken) {
                        case TOKEN.NONE:
                            return null;
                        case TOKEN.COMMA:
                            continue;
                        case TOKEN.SQUARED_CLOSE:
                            parsing = false;
                            break;
                        default:
                            object value = ParseByToken(nextToken);
                            // трансформация в класс
                            value = TransformToClass(value);
                            // запоминаем тип элемента
                            types.Add(value.GetType());
                            monoType = value.GetType();
                            array.Add(value);
                            break;
                    }
                }

                object result;

                // пустой массив по умолчанию считает равным null а не пустому списку
                // иначе получаем проблемы с определением типов
                if (array.Count == 0) {
                    result = null;
                }
                else {
                    result = array;
                    // если лист содержит однородные элементы то преобразуем его в типизированный список
                    if (types.Count == 1) {
                        var listOfType = typeof(List<>).MakeGenericType(monoType);
                        IList monoArray = (IList)Activator.CreateInstance(listOfType);
                        foreach (object item in array) {
                            monoArray.Add(item);
                        };
                        result = monoArray;
                    };

                };

                return result;
                //return array;
            }

            object ParseValue() {
                TOKEN nextToken = NextToken;             
                object value = ParseByToken(nextToken);
                // трансформация в класс
                value = TransformToClass(value);
                return value;
            }

            object ParseByToken(TOKEN token) {
                switch (token) {
                    case TOKEN.STRING:
                        return ParseString();
                    case TOKEN.NUMBER:
                        return ParseNumber();
                    case TOKEN.CURLY_OPEN:
                        return ParseObject();
                    case TOKEN.SQUARED_OPEN:
                        return ParseArray();
                    case TOKEN.TRUE:
                        return true;
                    case TOKEN.FALSE:
                        return false;
                    case TOKEN.NULL:
                        return null;
                    default:
                        return null;
                }
            }

            string ParseString() {
                StringBuilder s = new StringBuilder();
                char c;

                // ditch opening quote
                json.Read();

                bool parsing = true;
                while (parsing) {

                    if (json.Peek() == -1) {
                        parsing = false;
                        break;
                    }

                    c = NextChar;
                    switch (c) {
                        case '"':
                            parsing = false;
                            break;
                        case '\\':
                            if (json.Peek() == -1) {
                                parsing = false;
                                break;
                            }

                            c = NextChar;
                            switch (c) {
                                case '"':
                                case '\\':
                                case '/':
                                    s.Append(c);
                                    break;
                                case 'b':
                                    s.Append('\b');
                                    break;
                                case 'f':
                                    s.Append('\f');
                                    break;
                                case 'n':
                                    s.Append('\n');
                                    break;
                                case 'r':
                                    s.Append('\r');
                                    break;
                                case 't':
                                    s.Append('\t');
                                    break;
                                case 'u':
                                    var hex = new char[4];

                                    for (int i = 0; i < 4; i++) {
                                        hex[i] = NextChar;
                                    }

                                    s.Append((char)Convert.ToInt32(new string(hex), 16));
                                    break;
                            }
                            break;
                        default:
                            s.Append(c);
                            break;
                    }
                }

                return s.ToString();
            }

            object ParseNumber() {
                string number = NextWord;

                // внес изменения которые распознают лонг и инт и выводят соответсвующее значение
                if (number.IndexOf('.') == -1) {
                    long parsedLong;
                    int parsedInt;

                    bool int32 = Int32.TryParse(number, out parsedInt);
                    if (!int32) {
                        Int64.TryParse(number, out parsedLong);
                        return parsedLong;
                    }
                    else
                        return parsedInt;
                }
                // внес изменения которы распознают дабл и сингл(флоат) и выводят соответсвующее значение
                else {
                    double parsedDouble;
                    float parsedFloat;

                    bool single = Single.TryParse(number, out parsedFloat);
                    if (!single) {
                        Double.TryParse(number, out parsedDouble);
                        return parsedDouble;
                    }
                    else
                        return parsedFloat;
                };

            }

            void EatWhitespace() {
                while (Char.IsWhiteSpace(PeekChar)) {
                    json.Read();

                    if (json.Peek() == -1) {
                        break;
                    }
                }
            }

            char PeekChar {
                get {
                    return Convert.ToChar(json.Peek());
                }
            }

            char NextChar {
                get {
                    return Convert.ToChar(json.Read());
                }
            }

            string NextWord {
                get {
                    StringBuilder word = new StringBuilder();

                    while (!IsWordBreak(PeekChar)) {
                        word.Append(NextChar);

                        if (json.Peek() == -1) {
                            break;
                        }
                    }

                    return word.ToString();
                }
            }

            TOKEN NextToken {
                get {
                    EatWhitespace();

                    if (json.Peek() == -1) {
                        return TOKEN.NONE;
                    }

                    switch (PeekChar) {
                        case '{':
                            return TOKEN.CURLY_OPEN;
                        case '}':
                            json.Read();
                            return TOKEN.CURLY_CLOSE;
                        case '[':
                            return TOKEN.SQUARED_OPEN;
                        case ']':
                            json.Read();
                            return TOKEN.SQUARED_CLOSE;
                        case ',':
                            json.Read();
                            return TOKEN.COMMA;
                        case '"':
                            return TOKEN.STRING;
                        case ':':
                            return TOKEN.COLON;
                        case '0':
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '-':
                            return TOKEN.NUMBER;
                    }

                    switch (NextWord) {
                        case "false":
                            return TOKEN.FALSE;
                        case "true":
                            return TOKEN.TRUE;
                        case "null":
                            return TOKEN.NULL;
                    }

                    return TOKEN.NONE;
                }
            }
        }

        /// <summary>
        /// Converts a IDictionary / IList object or a simple type (string, int, etc.) into a JSON string
        /// </summary>
        /// <param name="json">A Dictionary&lt;string, object&gt; / List&lt;object&gt;</param>
        /// <returns>A JSON encoded string, or null if object 'json' is not serializable</returns>
        public static string Serialize(object obj) {
            return Serializer.Serialize(obj);
        }

        sealed class Serializer {
            StringBuilder builder;

            Serializer() {
                builder = new StringBuilder();
            }

            public static string Serialize(object obj) {
                var instance = new Serializer();

                instance.SerializeValue(obj);

                return instance.builder.ToString();
            }

            void SerializeValue(object value) {
                IList asList;
                IDictionary asDict;
                string asStr;

                if (value == null) {
                    builder.Append("null");
                }
                else if ((asStr = value as string) != null) {
                    SerializeString(asStr);
                }
                else if (value is bool) {
                    builder.Append((bool)value ? "true" : "false");
                }
                else if ((asList = value as IList) != null) {
                    SerializeArray(asList);
                }
                else if ((asDict = value as IDictionary) != null) {
                    SerializeObject(asDict);
                }
                else if (value is char) {
                    SerializeString(new string((char)value, 1));
                }
                else {
                    SerializeOther(value);
                }
            }

            void SerializeObject(IDictionary obj) {
                bool first = true;

                builder.Append('{');

                foreach (object e in obj.Keys) {
                    if (!first) {
                        builder.Append(',');
                    }

                    SerializeString(e.ToString());
                    builder.Append(':');

                    SerializeValue(obj[e]);

                    first = false;
                }

                builder.Append('}');
            }

            void SerializeArray(IList anArray) {
                builder.Append('[');

                bool first = true;

                foreach (object obj in anArray) {
                    if (!first) {
                        builder.Append(',');
                    }

                    SerializeValue(obj);

                    first = false;
                }

                builder.Append(']');
            }

            void SerializeString(string str) {
                builder.Append('\"');

                char[] charArray = str.ToCharArray();
                foreach (var c in charArray) {
                    switch (c) {
                        case '"':
                            builder.Append("\\\"");
                            break;
                        case '\\':
                            builder.Append("\\\\");
                            break;
                        case '\b':
                            builder.Append("\\b");
                            break;
                        case '\f':
                            builder.Append("\\f");
                            break;
                        case '\n':
                            builder.Append("\\n");
                            break;
                        case '\r':
                            builder.Append("\\r");
                            break;
                        case '\t':
                            builder.Append("\\t");
                            break;
                        default:
                            int codepoint = Convert.ToInt32(c);
                            if ((codepoint >= 32) && (codepoint <= 126)) {
                                builder.Append(c);
                            }
                            else {
                                builder.Append("\\u");
                                builder.Append(codepoint.ToString("x4"));
                            }
                            break;
                    }
                }

                builder.Append('\"');
            }

            void SerializeOther(object value) {
                // NOTE: decimals lose precision during serialization.
                // They always have, I'm just letting you know.
                // Previously floats and doubles lost precision too.
                if (value is float) {
                    //builder.Append(((float)value).ToString("R"));
                    builder.Append(((float)value).ToString("0.0######"));
                }
                else if (value is int
                  || value is uint
                  || value is long
                  || value is sbyte
                  || value is byte
                  || value is short
                  || value is ushort
                  || value is ulong) {
                    builder.Append(value);
                }
                else if (value is double
                  || value is decimal) {
                    //builder.Append(Convert.ToDouble(value).ToString("R"));
                    builder.Append(Convert.ToDouble(value).ToString("0.0##############"));
                }



                else if (value is Color) {
                    builder.Append("#"+ColorUtility.ToHtmlStringRGB((Color)value));
                }




                // сериализация классов
                else if (value.GetType().IsClass) {
                    Dictionary<string, object> fields = new Dictionary<string, object>();

                    // поля класса
                    foreach (var field in value.GetType().GetFields()) {
                        bool ignore = false;
                        string name = field.Name;
                        foreach (JsonSerilizable atribute in field.GetCustomAttributes(typeof(JsonSerilizable), false)) {
                            if (atribute.name != null) {
                                name = atribute.name;
                            };
                            ignore = atribute.ignore;
                        };
                        if (!ignore) {
                            fields[name] = field.GetValue(value);
                        };
                    };

                    // свойства класса
                    foreach (var property in value.GetType().GetProperties()) {
                        bool ignore = false;
                        string name = property.Name;
                        foreach (JsonSerilizable attribute in property.GetCustomAttributes(typeof(JsonSerilizable), false)) {
                            if (attribute.name != null) {
                                name = attribute.name;
                            };
                            ignore = attribute.ignore;
                        };
                        if (!ignore) {
                            fields[name] = property.GetValue(value, null);
                        };
                    };

                    if (fields.Count > 0) {
                        //добавление типа класса
                        // if (CleanSerialization)
                            fields["__type"] = value.GetType().FullName;
                        SerializeValue(fields);
                    };
                }

                else {
                    SerializeString(value.ToString());
                }
            }
        }
    }
}
