using SMA.models;
using UnityEngine;

public class CameraController : Regular {
    public Camera _camera;
    public override void Set(bool update) {
        base.Set(update);
        _camera.clearFlags = (CameraClearFlags)(int)GetVariable("clearFlags");
        Color finalBackground = new Color(1, 1, 1, 0);
        string color = (string)GetVariable("background");
        ColorUtility.TryParseHtmlString(color, out finalBackground);
        finalBackground.a = (float)GetVariable("backgroundOpacity");
        _camera.backgroundColor = finalBackground;
        _camera.fieldOfView = (float)GetVariable("fieldOfView");
        _camera.farClipPlane = (float)GetVariable("farClipPlane");
        _camera.nearClipPlane = (float)GetVariable("nearClipPlane");
        Rect cameraRect = new Rect(
            (float)GetVariable("viewportX"),
            (float)GetVariable("viewportY"),
            (float)GetVariable("viewportW"),
            (float)GetVariable("viewportH")
        );
        _camera.rect = cameraRect;
        _camera.depth = (float)GetVariable("depth");
    }
}