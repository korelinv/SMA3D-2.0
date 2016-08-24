using UnityEngine;
using System.Collections;
using SMA.elements;
using SMA.system;
using UnityEngine.UI;

public class testButtonController : View {

    public Button btn;
    public RectTransform trs;
    public Text tx;

    public void ReceivedSettings() {
        set();
    }

    private void set() {
        float x = (float)GetVariable("X");
        float y = (float)GetVariable("Y");

        float w = (float)GetVariable("width");
        float h = (float)GetVariable("height");

        string cp = (string)GetVariable("caption");
        int fs = (int)GetVariable("fontSize");

        tx.text = cp;
        tx.fontSize = fs;
        trs.sizeDelta = new Vector2(w, h);
        trs.anchoredPosition = new Vector3(x, -y);
        btn.onClick.RemoveAllListeners();
        btn.onClick.AddListener(GetAction("OnClick"));
    }

    public override void PostAwake() {

        OnReceivedSettings.AddListener(ReceivedSettings);

        //RegisterVariable("caption", "текст", CustomFieldType.STRING, "", true, false);
        //RegisterVariable("fontSize", "размер шрифта", CustomFieldType.INT, 14, true, false);

        //RegisterVariable("width", "ширина", CustomFieldType.FLOAT, 150, true, false);
        //RegisterVariable("height", "высота", CustomFieldType.FLOAT, 30, true, false);

        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);

        //RegisterAction("OnClick", "Действие по нажатию");
    }

}
