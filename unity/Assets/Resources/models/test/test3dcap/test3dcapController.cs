using UnityEngine;
using System.Collections;
using SMA.elements;
using SMA.system;

public class test3dcapController : View {

    public TextMesh text;

    public void ReceivedSettings() {
        set();
    }

    private void set() {
        float x = (float)GetVariable("X");
        float y = (float)GetVariable("Y");
        float z = (float)GetVariable("Z");
        int fs = (int)GetVariable("fontSize");
        string cp = (string)GetVariable("value");

        transform.localPosition = new Vector3(x, y, z);

        text.fontSize = fs;
        text.text = cp;
    }

    public void ReceivedDataset() {
    }

    public void UpdatedSettings() {
        set();
    }

    public override void PostAwake() {

        OnReceivedDataset.AddListener(ReceivedDataset);
        OnReceivedSettings.AddListener(ReceivedSettings);
        OnUpdateSettings.AddListener(UpdatedSettings);

        //RegisterVariable("value", "Значение", CustomFieldType.STRING, "Заголовок", false, false);
        //RegisterVariable("fontSize", "Размер шрифта", CustomFieldType.INT, 150, false, false);
        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Z", "смещение по оси Z", CustomFieldType.FLOAT, 0, false, false);
    }

}
