using MiniJSON;
using System;
using System.Collections.Generic;

namespace SMA.system {

    /// <summary>
    /// Коды сообщений
    /// </summary>
    public enum MessageCode {
                                AUTORIZE,                               // запрос авторизации
                                REQUEST_SNAPSHOT,                       // запросить снепшот (базавые поля - все кроме поля data)
                                RECEIVE_SYS_SOURCES,                    // получить список системных сервисов
                                CASCADE_VARIABLE_UPFATE,                // каскадное обновление переменных в потомках
                                RECEIVE_SNAPSHOT,                       // получить снепшот
                                REFRESH,                                // обновить элемент
                                SWAP_SNAPSHOT,                          // перегрузить снепшот у головного элемента
                                SEND_VARIABLES,                         // отправить переменные
                                SEND_INVOCATION,                        // отправка вызова метода
                                INVOKE_METHOD,                          // вызов встроеного метода
                                RECEIVE_VARIABLES,                      // получить переменные
                                REQUEST_FOOTPRINT,                      // запросить список дочерних элементов
                                RECEIVE_FOOTPRINT,                      // получить отпечаток
                                ERROR,                                  // ошибка
                                ALERT,                                  // предупреждение
                                NULL,                                   // пустой код сообщения (не используется в реальных ситуациях)
                                CREATE_WEBFORM,                         // создание выбформы
                                REQUEST_DATA,                           // запрос разобранных данных
                                LOAD_DATA,                              // загрузка данных
                                PARSE_POOL,                             // парсинг пула
                                RECEIVE_POOL,                           // получение пула
                                OPEN_SNAPSHOT,                          // команда открыть снепшот
                                LOAD_SNAPSHOT,                          // загрузить снепшот
                                PARSE_SNAPSHOT,                         // парсинг снепшота
                                RESOLVE_STRUCTURE,                      // калбек посторения структуры
                                REQUEST_MUTATED                         // запрос текущего состояния снепшота
    }
    
    /// <summary>
    /// Сообщение для передачи данных между интеракторами (Interactor)
    /// </summary>
    public class Message{
        /// <summary>
        /// Парсер кодов сообщений из строки в MessageCode
        /// </summary>
        /// <param name="input">входная строка</param>
        /// <returns>код сообщения (MessageCode.NULL в случае исключения)</returns>
        public static MessageCode ParseCode(string input) {
            MessageCode result;
            try {
                result = (MessageCode)Enum.Parse(typeof(MessageCode), input.ToUpper());
            }
            catch (ArgumentException) {
                result = MessageCode.NULL;
            };
            return result;
        }

        public string code {
            get { return _code.ToString(); }
            set { _code = ParseCode(value); }
        }
        public string sender;
        public string receiver;
        [JsonSerilizable(ignore = true)]
        public bool processed;
        [JsonSerilizable(ignore = true)]
        public MessageCode _code;
        public Dictionary<string, object> fields;

        public Message() {
            sender = null;
            receiver = null;
            processed = false;
            _code = MessageCode.NULL;
            fields = new Dictionary<string, object>();
        }




        // <Зарефакторить> 
        // легаси
        public Message(string Sender, string Receiver, MessageCode Code) {
            sender = Sender;
            receiver = Receiver;
            processed = false;
            this._code = Code;
            fields = new Dictionary<string, object>();
        }
        public Message(string Sender) {
            sender = Sender;
            receiver = null;
            processed = false;
            _code = MessageCode.NULL;
            fields = new Dictionary<string, object>();
        }

        public bool ContainsField(string fieldName) {
            return fields.ContainsKey(fieldName);
        }
        
        public void InsertField(string fieldName, object fieldValue) {
            fields[fieldName] = fieldValue;
        }
        
        public object ExtractField(string fieldName) {
            if (fields.ContainsKey(fieldName)) {
                return fields[fieldName];
            }
            else {
                return null;
            };
        }
        // </Зарефакторить> 

    }

}
