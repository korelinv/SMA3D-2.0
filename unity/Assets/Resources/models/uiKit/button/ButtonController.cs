using SMA.models;
using SMA.system;
using UnityEngine;
using UnityEngine.UI;

public class ButtonController : UI {
    public Button button;
    public Text text;
    private string imagePath;
    public override void Set(bool update) {
        base.Set(update);
        string nColor = (string)GetVariable("nColor");
        string hColor = (string)GetVariable("hColor");
        string pColor = (string)GetVariable("pColor");
        string dColor = (string)GetVariable("dColor");
        float nOpacity = (float)GetVariable("nOpacity");
        float hOpacity = (float)GetVariable("hOpacity");
        float pOpacity = (float)GetVariable("pOpacity");
        float dOpacity = (float)GetVariable("dOpacity");
        float fadeDuration = (float)GetVariable("fadeDuration");
        float colorMultiplier = (float)GetVariable("colorMultiplier");
        Color nFinalColor = new Color(1, 1, 1, 0);
        Color hFinalColor = new Color(1, 1, 1, 0);
        Color pFinalColor = new Color(1, 1, 1, 0);
        Color dFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(nColor, out nFinalColor);
        ColorUtility.TryParseHtmlString(hColor, out hFinalColor);
        ColorUtility.TryParseHtmlString(pColor, out pFinalColor);
        ColorUtility.TryParseHtmlString(dColor, out dFinalColor);
        nFinalColor.a = nOpacity;
        hFinalColor.a = hOpacity;
        pFinalColor.a = pOpacity;
        dFinalColor.a = dOpacity;
        ColorBlock colors = new ColorBlock();
        colors.normalColor = nFinalColor;
        colors.highlightedColor = hFinalColor;
        colors.pressedColor = pFinalColor;
        colors.disabledColor = dFinalColor;
        colors.fadeDuration = fadeDuration;
        colors.colorMultiplier = colorMultiplier;
        button.interactable = (bool)GetVariable("interactable");
        button.colors = colors;
        string textColor = (string)GetVariable("textColor");
        float textOpacity = (float)GetVariable("textOpacity");
        Color textFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(textColor, out textFinalColor);
        textFinalColor.a = textOpacity;
        text.text = (string)GetVariable("caption");
        text.fontSize = (int)GetVariable("fontSize");
        text.color = textFinalColor;
        text.alignment = (TextAnchor)((int)GetVariable("textAlignment"));
        string newImagePath = (string)GetVariable("imagePath");
        if (newImagePath != imagePath) {
            imagePath = newImagePath;
            if (!string.IsNullOrEmpty(imagePath))
                StartCoroutine(proxyLoader.Load(imagePath, SetImage));
        };
        if (!update) {
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(GetAction("onClick"));
        };
    }
    private void SetImage(object[] parameters) {
        WWW imageRequest = parameters[0] as WWW;
        if (string.IsNullOrEmpty(imageRequest.error)) {
            button.image.overrideSprite = Sprite.Create(imageRequest.texture, new Rect(0, 0, imageRequest.texture.width, imageRequest.texture.height), new Vector2(0.5f, 0.5f));
        }
        else {
            SendErrorMessage(imageRequest.error);
        };
    }
}