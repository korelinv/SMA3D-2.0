using SMA.models;
using UnityEngine;

public class CanvasController : Regular {
    public Canvas canvas;
    public override void Set(bool update) {
        base.Set(update);
        canvas.renderMode = (RenderMode)(int)GetVariable("renderMode");
        canvas.sortingOrder = (int)GetVariable("sortOrder");
        canvas.scaleFactor = (float)GetVariable("scaleFactor");
        canvas.referencePixelsPerUnit = (float)GetVariable("referencePixelsPerUnit");
    }
}
