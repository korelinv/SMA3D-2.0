using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using SMA.elements;

public class testPanelController : View {

    public Image img;
    public RectTransform rect;

    private float width = 200;
    private float height = 100;
    private Color color = new Color(1,1,1);
    private float posX = 0;
    private float posY = 0;

    public override void PostAwake() {
        base.PostAwake();

        OnReceivedSettings.AddListener(ReceiveSettings);

        //RegisterVariable("width","ширина",CustomFieldType.FLOAT,200,true,false);
        //RegisterVariable("height", "высота", CustomFieldType.FLOAT, 100, true, false);
        //RegisterVariable("color","цвет",CustomFieldType.COLOR,"#ffffff",true,false);
        //RegisterVariable("opacity", "прозрачность", CustomFieldType.FLOAT, 1, true, false);

        //RegisterVariable("posX", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("posY", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);
    }

    void ReceiveSettings() {

        width = (float)GetVariable("width");
        height = (float)GetVariable("height");
        posX = (float)GetVariable("posX");
        posY = (float)GetVariable("posY");

        ColorUtility.TryParseHtmlString((string)GetVariable("color"), out color);
        color.a = (float)GetVariable("opacity");

        img.color = color;
        rect.sizeDelta = new Vector2(width,height);
        rect.anchoredPosition = new Vector2(posX,-posY);

    }
}
