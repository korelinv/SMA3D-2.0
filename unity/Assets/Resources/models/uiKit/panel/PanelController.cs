using SMA.models;
using SMA.system;
using UnityEngine;
using UnityEngine.UI;

public class PanelController : UI {
    public Image image;
    private string imagePath;
    private void SetImage(object[] parameters) {
        WWW imageRequest = parameters[0] as WWW;
        if (string.IsNullOrEmpty(imageRequest.error)) {
            image.overrideSprite = Sprite.Create(imageRequest.texture, new Rect(0, 0, imageRequest.texture.width, imageRequest.texture.height), new Vector2(0.5f, 0.5f));
        }
        else {
            SendErrorMessage(imageRequest.error);
        };
    }
    public override void Set(bool update) {
        base.Set(update);
        Color finalColor = new Color(1, 1, 1, 0);
        string color = (string)GetVariable("color");
        ColorUtility.TryParseHtmlString(color, out finalColor);
        finalColor.a = (float)GetVariable("opacity");
        image.color = finalColor;
        string newImagePath = (string)GetVariable("imagePath");
        if (imagePath != newImagePath) {
            imagePath = newImagePath;
            if (!string.IsNullOrEmpty(imagePath))
                StartCoroutine(proxyLoader.Load(imagePath, SetImage));
        };
    }
}