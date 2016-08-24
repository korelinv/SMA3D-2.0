using UnityEngine;
using System.Collections;
using SMA.system;
using SMA.elements;
using UnityEngine.UI;

public class testTextController : View {

    public RectTransform trs;
    public Text tx;

    public void ReceivedSettings() {
        set();
    }

    private void set() {
        float x = (float)GetVariable("X");
        float y = (float)GetVariable("Y");
        string cp = (string)GetVariable("caption");
        int fs = (int)GetVariable("fontSize");

        tx.text = cp;
        tx.fontSize = fs;
        trs.anchoredPosition = new Vector3(x, -y);
    }

    public void ReceivedDataset() {
    }

    public override void PostAwake() {

        OnReceivedDataset.AddListener(ReceivedDataset);
        OnReceivedSettings.AddListener(ReceivedSettings);

        //RegisterVariable("caption", "текст", CustomFieldType.STRING, "",false,false);
        //RegisterVariable("fontSize", "размер шрифта", CustomFieldType.INT, 14, false, false);
        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);

        //RegisterAction("OnClick", "Действие по нажатию");
    }

}
