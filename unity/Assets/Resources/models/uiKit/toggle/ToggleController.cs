using SMA.elements;
using System.Collections;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;
using SMA.system;
using SMA.models;


public class ToggleController : UI {
    public Toggle toggle;
    public Text text;
    public Image checkMark;
    public Image box;
    private UnityEvent onValueChanged;
    private string boxImagePath;
    private string checkMarkImagePath;
    private void SetImage(object[] parameters) {
        WWW imageRequest = parameters[0] as WWW;
        Image image = parameters[1] as Image;
        if (string.IsNullOrEmpty(imageRequest.error)) {
            image.overrideSprite = Sprite.Create(imageRequest.texture, new Rect(0, 0, imageRequest.texture.width, imageRequest.texture.height), new Vector2(0.5f, 0.5f));
        }
        else {
            SendErrorMessage(imageRequest.error);
        };
    }
    private void Changed(bool value) {
        SetVariableValue("value", toggle.isOn);
        onValueChanged.Invoke();
    }
    public override void PostAwake() {
        base.PostAwake();
        onValueChanged = new UnityEvent();
        toggle.onValueChanged.AddListener(Changed);
    }
    public override void Set(bool update) {
        base.Set(update);
        toggle.isOn = (bool)GetVariable("value");
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
        toggle.colors = colors;
        text.text = (string)GetVariable("caption");
        string textColor = (string)GetVariable("textColor");
        float textOpacity = (float)GetVariable("textOpacity");
        Color textFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(textColor, out textFinalColor);
        text.fontSize = (int)GetVariable("fontSize");
        textFinalColor.a = textOpacity;
        text.color = textFinalColor;
        toggle.interactable = (bool)GetVariable("interactable");
        string newboxImagePath = (string)GetVariable("boxImagePath");
        if (boxImagePath != newboxImagePath) {
            boxImagePath = newboxImagePath;
            if (!string.IsNullOrEmpty(boxImagePath))
                StartCoroutine(proxyLoader.Load(boxImagePath, SetImage, new object[] { box }));
        };
        string newcheckMarkImagePath = (string)GetVariable("checkMarkImagePath");
        if (checkMarkImagePath != newcheckMarkImagePath) {
            checkMarkImagePath = newcheckMarkImagePath;
            if (!string.IsNullOrEmpty(checkMarkImagePath))
                StartCoroutine(proxyLoader.Load(checkMarkImagePath, SetImage, new object[] { checkMark }));
        };
        if (!update) {
            onValueChanged.RemoveAllListeners();
            onValueChanged.AddListener(GetAction("onValueChanged"));
        };
    }
}