using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using SMA.elements;

public class testAVGlabelController : View {

    public void ReceivedSettings() {
    }

    public void ReceivedDataset() {
        build();
    }

    public TextMesh text;

    private void build() {

        string msk = (string)GetVariable("mask");

        int fontsize = (int)GetVariable("fontsize");
        float x = (float)GetVariable("X");
        float y = (float)GetVariable("Y");
        float z = (float)GetVariable("Z");


        transform.localPosition = new Vector3(x, y, z);
        text.fontSize = fontsize;

        float summ = 0;
        int count = 0;

        /*
        foreach (Dictionary<string, object> element in dataPool) {
            if (element.ContainsKey("field")) {
                summ += (float)element["field"];
                count++;
            };
        };
        */


        float result = 0;
        if (count != 0) {
            result = summ / count;
        };
        text.text = result.ToString(msk);

    }

    public void UpdatedSettings() {
        build();
    }

    public override void PostAwake() {

        OnReceivedDataset.AddListener(ReceivedDataset);
        OnReceivedSettings.AddListener(ReceivedSettings);
        OnUpdateSettings.AddListener(UpdatedSettings);

        //RegisterField("field", "поле", SMA.system.primitiveDataType.@float);

        //RegisterVariable("mask", "формат вывода", CustomFieldType.STRING, "", false, false);

        //RegisterVariable("fontsize", "размер шрифта", CustomFieldType.INT, 150, false, false);
        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Z", "смещение по оси Z", CustomFieldType.FLOAT, 0, false, false);
    }

}
