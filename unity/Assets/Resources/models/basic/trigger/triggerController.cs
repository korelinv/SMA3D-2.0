using SMA.models;
using UnityEngine.Events;

public class triggerController : Regular {
    private UnityEvent onTriggered = new UnityEvent();
    private bool triggered = false;
    private void TryTrigger() {
        if (triggered) {
            triggered = false;
            SetVariableValue("triggered", triggered);
            onTriggered.Invoke();
        };
    }
    public override void Set(bool update) {
        base.Set(update);
        triggered = (bool)GetVariable("triggered");
        if (!update) {
            onTriggered.RemoveAllListeners();
            onTriggered.AddListener(GetAction("onTriggered"));       
        };
        TryTrigger();
    }
}