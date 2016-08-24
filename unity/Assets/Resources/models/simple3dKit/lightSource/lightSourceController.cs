using SMA.models;
using UnityEngine;

public class lightSourceController : Regular {
    public Light __light;
    public override void Set(bool update) {
        base.Set(update);
        __light.type = (LightType)(int)GetVariable("type");
        __light.spotAngle = (float)GetVariable("spotAngle");
        __light.range = (float)GetVariable("range");
        string color = (string)GetVariable("color");
        float opacity = (float)GetVariable("opacity");
        Color finalColor = new Color(1,1,1);
        ColorUtility.TryParseHtmlString(color, out finalColor);
        finalColor.a = opacity;
        __light.intensity = (float)GetVariable("intensity");
        __light.shadowStrength = (float)GetVariable("shadowStrength"); 
    }
}
