using SMA.models;
using SMA.system;
using UnityEngine;
using UnityEngine.Rendering;

public class PlaneController : Regular {
    public Renderer _renderer;
    string textureUrl = null;
    private Vector2 tiling = new Vector2(1, 1);
    private Vector2 textureOffset = new Vector2(0, 0);

    public override void Set(bool update) {
        base.Set(update);

        _renderer.shadowCastingMode = (ShadowCastingMode)(int)GetVariable("shadowCastingMode");
        _renderer.receiveShadows = (bool)GetVariable("receiveShadows");
        tiling.x = (float)GetVariable("tilingX");
        tiling.y = (float)GetVariable("tilingY");
        textureOffset.x = (float)GetVariable("textureOffsetX");
        textureOffset.y = (float)GetVariable("textureOffsetY");
        _renderer.material.mainTextureScale = tiling;
        _renderer.material.mainTextureOffset = textureOffset;

        string newtextureUrl = (string)GetVariable("textureUrl");
        if (textureUrl != newtextureUrl) {
            textureUrl = newtextureUrl;
            if (!string.IsNullOrEmpty(textureUrl))
                StartCoroutine(proxyLoader.Load(textureUrl, SetImage));
        };
    }
    private void SetImage(object[] parameters) {
        WWW imageRequest = parameters[0] as WWW;
        if (string.IsNullOrEmpty(imageRequest.error)) {
            Texture2D texture = new Texture2D(2, 2);
            texture.filterMode = FilterMode.Bilinear;
            texture.LoadImage(imageRequest.bytes);
            texture.wrapMode = (TextureWrapMode)(int)GetVariable("mainTextureWrapMode");
            _renderer.material.mainTexture = texture;
            _renderer.material.mainTextureScale = tiling;
            _renderer.material.mainTextureOffset = textureOffset;
        }
        else {
            SendErrorMessage(imageRequest.error);
        };
    }
}