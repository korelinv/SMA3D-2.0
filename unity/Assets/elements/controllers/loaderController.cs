using SMA.system;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SMA.globals;

public class loaderController : Interactor {

    public override void PostAwake() {
        SetCustomID("LOADER");
    }

    public override void ProcessMessage(Message message) {
        base.ProcessMessage(message);
        switch (message._code) {
            case MessageCode.LOAD_SNAPSHOT:
                ProcessSnapshotLoading(message);
                break;
            case MessageCode.LOAD_DATA:
                ProcessDataLoading(message);
                break;
            default:
                if (message._code != MessageCode.ERROR)
                    SendErrorMessage("Client Error (Incorrect communication message): " + message._code.ToString());
                break;
        };
    }
   
    private void ProcessSnapshotLoading(Message message) {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters["sender"] = message.sender;
        parameters["code"] = message._code;
        StartCoroutine(Load(globals.snapshotsSource + message.fields["id"], parameters));
    }

    private void ProcessDataLoading(Message message) {
        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters["sender"] = message.sender;
        parameters["code"] = message._code;
        if (message.fields.ContainsKey("factory")) {
            parameters["factory"] = message.fields["factory"];
            parameters["target"] = message.fields["target"];
        };

        Dictionary<string, object> postDataAssembly = new Dictionary<string, object>();
        postDataAssembly["id"] = message.fields["id"];
        postDataAssembly["request"] = message.fields["request"];
        postDataAssembly["parameters"] = message.fields["parameters"];

        Dictionary<string, string> headers = new Dictionary<string, string>();
        headers["Content-type"] = "application/json";
        byte[] data = System.Text.Encoding.UTF8.GetBytes(MiniJSON.Json.Serialize(postDataAssembly));
        StartCoroutine(Load(globals.datasetSource, headers, data, parameters));
    }


    /// <summary>
    /// GET
    /// </summary>
    /// <param name="url"></param>
    /// <param name="parameters"></param>
    /// <returns></returns>
    private IEnumerator Load(string url, Dictionary<string,object> parameters) {
        WWW request = new WWW(url);
        yield return request;
        if (string.IsNullOrEmpty(request.error)) {
            parameters.Add("data", request.text);
            Deliver(parameters);
        }
        else {
            SendErrorMessage("Web request error: " + request.error + " (path = " + url + ")");
        };
    }

    /// <summary>
    /// POST
    /// </summary>
    /// <param name="url"></param>
    /// <param name="headers"></param>
    /// <param name="data"></param>
    /// <param name="parameters"></param>
    /// <returns></returns>
    private IEnumerator Load(string url, Dictionary<string,string> headers, byte[] data, Dictionary<string, object> parameters) {
        WWW request = new WWW(url, data, headers);
        yield return request;
        if (string.IsNullOrEmpty(request.error)) {
            parameters["data"] = request.text;
            Deliver(parameters);
        }
        else {
            SendErrorMessage("Web request error: " + request.error + " (path = " + url + ")");
        };
    }

    private void Deliver(Dictionary<string,object> parameters) {
        Message result = new Message();
        result.sender = instanceID;
        result.receiver = "PARSER";
        switch ((MessageCode)parameters["code"]) {
            case MessageCode.LOAD_SNAPSHOT:
                result._code = MessageCode.PARSE_SNAPSHOT;
                result.sender = (string)parameters["sender"];
                result.fields["data"] = parameters["data"];
                break;
            case MessageCode.LOAD_DATA:
                result._code = MessageCode.PARSE_POOL;
                result.sender = (string)parameters["sender"];
                result.fields["data"] = parameters["data"];
                if (parameters.ContainsKey("factory")) {
                    result.fields["factory"] = parameters["factory"];
                    result.fields["target"] = parameters["target"];
                };
                break;
        };
        EmitMessage(result);
    }

}
