using SMA.models;
using UnityEngine.Events;

public class stringifierController : Regular {

    private int segments = 0;
    private string separator = "";
    private string finalString = "";
    private UnityEvent onConverted = new UnityEvent();

    public override void Set(bool update) {
        base.Set(update);
        finalString = "";
        segments = (int)GetVariable("segments");
        separator = (string)GetVariable("separator");
        for (int i = 1; i <= segments; i++) {
            object segment = GetVariable("segment#" + i);
            if (segment != null) {
                if (i != 1)
                    finalString = finalString + separator;
                string proxy = segment.ToString();
                finalString = finalString + proxy;
            };
        };
        SetVariableValue("finalString", finalString);
        if (!update) {
            onConverted.RemoveAllListeners();
            onConverted.AddListener(GetAction("onConverted"));
        };
        onConverted.Invoke();
    }

}