using SMA.models;
using UnityEngine;
using UnityEngine.UI;

public class TextController : UI {
    public Text text;
    public override void Set(bool update) {
        base.Set(update);
        string textColor = (string)GetVariable("textColor");
        float textOpacity = (float)GetVariable("textOpacity");
        Color textFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(textColor, out textFinalColor);
        textFinalColor.a = textOpacity;
        text.text = (string)GetVariable("text");
        text.fontSize = (int)GetVariable("fontSize");
        text.color = textFinalColor;
        text.alignment = (TextAnchor)(int)GetVariable("alignment");
        text.horizontalOverflow = (HorizontalWrapMode)(int)GetVariable("horizontalOverflow");
        text.verticalOverflow = (VerticalWrapMode)(int)GetVariable("verticalOverflow");
        text.resizeTextForBestFit = (bool)GetVariable("bestFit");
    }
}