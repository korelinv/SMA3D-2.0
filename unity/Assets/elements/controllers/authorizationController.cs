#define develop_remote

using MiniJSON;
using SMA.globals;
using SMA.system;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class authorizationController : Interactor {

    public override void PostAwake() {
        SetCustomID("AUTHORIZATION");
    }

    public override void ProcessMessage(Message message) {
        base.ProcessMessage(message);
        if (message._code != MessageCode.ERROR)
            SendErrorMessage("Client Error (Incorrect communication message): " + message._code.ToString());
    }

    void Start () {
        #if !UNITY_EDITOR && UNITY_WEBGL
            WebGLInput.captureAllKeyboardInput = false;
        #endif

        #if production
            globals.proxy = "http://sma3d.proitr.ru:8040/proxy?url=";
            globals.snapshotsSource = "http://sma3d.proitr.ru:8090/snapshot?id=";
            globals.datasetSource = "http://sma3d.proitr.ru:8090/getDatasource";
        #endif
        #if develop
            globals.proxy = "http://localhost:8040/proxy?url=";
            globals.snapshotsSource = "http://localhost:8090/snapshot?id=";
            globals.datasetSource = "http://localhost:8090/getDatasource";
        #endif
        #if develop_remote
            globals.proxy = "http://10.242.4.106:8040/proxy?url=";
            globals.snapshotsSource = "http://10.242.4.106:8090/snapshot?id=";
            globals.datasetSource = "http://10.242.4.106:8090/getDatasource";
        #endif
        proxyLoader.DefaultProxyUrl = globals.proxy;

        Application.ExternalCall("GetStartPoint");

    }

}

