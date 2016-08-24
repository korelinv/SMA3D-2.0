using UnityEngine;
using SMA.system;
using SMA.elements;
using SMA.globals;
using SMA.models;
using System.Collections;
using UnityEngine.Events;

public class Chess_controller : View {

    UnityEvent oncustom = new UnityEvent();

    public override void PostAwake()
    {
        base.PostAwake();
        OnReceivedSettings.AddListener(OnReceiveSettings);
    }

    public void OnReceiveSettings() {

        oncustom.AddListener(GetAction("some"));

        foreach (PoolElement element in pool) {

        }


    }
}
