using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using SMA.elements;

public class cap3ddynController : View {
    public void ReceivedSettings() {
    }

    public void ReceivedDataset() {
        build();
    }

    public TextMesh text;

    private void build() {
        int fontsize = (int)GetVariable("fontsize");
        float x = (float)GetVariable("X");
        float y = (float)GetVariable("Y");
        float z = (float)GetVariable("Z");
        string spacer = (string)GetVariable("spacer");

        transform.localPosition = new Vector3(x, y, z);
        text.fontSize = fontsize;

        string buf = "";
        bool first = true;

        /*
        foreach (Dictionary<string, object> element in dataPool) {
            if (element.ContainsKey("field")) {
                if (!first)
                    buf = buf + spacer;
                buf = buf + (string)element["field"];
            };
        };
        */
        text.text = buf;
    }

    public void UpdatedSettings() {
        build();
    }

    public override void PostAwake() {

        OnReceivedDataset.AddListener(ReceivedDataset);
        OnReceivedSettings.AddListener(ReceivedSettings);
        OnUpdateSettings.AddListener(UpdatedSettings);

        //RegisterField("field", "поле", SMA.system.primitiveDataType.@string);

        //RegisterVariable("spacer", "разделитель", CustomFieldType.STRING, "", false, false);
        //RegisterVariable("fontsize", "размер шрифта", CustomFieldType.INT, 150, false, false);
        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Z", "смещение по оси Z", CustomFieldType.FLOAT, 0, false, false);
    }

}
