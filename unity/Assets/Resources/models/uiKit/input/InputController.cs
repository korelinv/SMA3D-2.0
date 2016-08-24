using SMA.models;
using SMA.system;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

public class InputController : UI {
    public Text text;
    public Text placeholder;
    public InputField input;
    private UnityEvent onValueChanged;
    private UnityEvent onEndEdit;
    private string imagePath;
    private void SetImage(object[] parameters) {
        WWW imageRequest = parameters[0] as WWW;
        if (string.IsNullOrEmpty(imageRequest.error)) {
            input.image.overrideSprite = Sprite.Create(imageRequest.texture, new Rect(0, 0, imageRequest.texture.width, imageRequest.texture.height), new Vector2(0.5f, 0.5f));
        }
        else {
            SendErrorMessage(imageRequest.error);
        };
    }
    private void EndEdit(string value) {
        SetVariableValue("text", input.text);
        onEndEdit.Invoke();
    }
    private void Changed(string value) {
        SetVariableValue("text", input.text);
        onValueChanged.Invoke();
    }
    public override void PostAwake() {
        base.PostAwake();
        onChanged = new UnityEvent();
        onEndEdit = new UnityEvent();
        input.onEndEdit.AddListener(EndEdit);
        input.onValueChanged.AddListener(Changed);
    }
    public override void Set(bool update) {
        base.Set(update);
        string textColor = (string)GetVariable("textColor");
        float textOpacity = (float)GetVariable("textOpacity");
        Color textFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(textColor, out textFinalColor);
        text.fontSize = (int)GetVariable("fontSize");
        textFinalColor.a = textOpacity;
        text.color = textFinalColor;
        string placeholderColor = (string)GetVariable("placeholderColor");
        float placeholderOpacity = (float)GetVariable("placeholderOpacity");
        Color placeholderFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(textColor, out placeholderFinalColor);
        placeholderFinalColor.a = placeholderOpacity;
        placeholder.text = (string)GetVariable("placeholder");
        placeholder.fontSize = (int)GetVariable("placeholderFontSize");
        placeholder.color = placeholderFinalColor;
        input.interactable = (bool)GetVariable("interactable");
        input.text = (string)GetVariable("text");
        input.characterLimit = (int)GetVariable("characterLimit");
        input.caretBlinkRate = (float)GetVariable("caretBlinkRate");
        input.caretWidth = (int)GetVariable("caretWidth");
        input.readOnly = (bool)GetVariable("readOnly");
        string selectionColor = (string)GetVariable("selectionColor");
        float selectionColorOpacity = (float)GetVariable("selectionColorOpacity");
        Color selectionFinalColor = new Color(1, 1, 1, 0);
        ColorUtility.TryParseHtmlString(selectionColor, out selectionFinalColor);
        selectionFinalColor.a = selectionColorOpacity;
        input.selectionColor = selectionFinalColor;
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
        input.colors = colors;
        string newimagePath = (string)GetVariable("imagePath");
        if (imagePath != newimagePath) {
            imagePath = newimagePath;
            if (!string.IsNullOrEmpty(imagePath))
                StartCoroutine(proxyLoader.Load(imagePath, SetImage));
        };
        if (!update) {
            onEndEdit.RemoveAllListeners();
            onValueChanged.RemoveAllListeners();
            onEndEdit.AddListener(GetAction("onEndEdit"));
            onValueChanged.AddListener(GetAction("onValueChanged"));
        };
    }
}
