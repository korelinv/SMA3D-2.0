using SMA.models;
using UnityEngine;
using UnityEngine.Events;

public class mouseInputController : Regular {
    private float xMultiplicator = 1;
    private float yMultiplicator = 1;
    private float scrollMultiplicator = 1;
    private bool smooth = true;
    private int trackMode = 0;
    private float x = 0;
    private float deltaX = 0;
    private float y = 0;
    private float deltaY = 0;
    private float scroll = 0;
    private float scrollDelta = 0;
    private bool invertX = false;
    private bool invertY = false;
    private bool invertScroll = false;
    UnityEvent onChange = new UnityEvent();
    private int GetMode(bool right, bool left) {
        int result = 0;
        if (!right && !left)
            result = 0;
        else if (right && left)
            result = 3;
        else {
            if (right)
                result = 1;
            else
                result = 2;
        };
        return result;
    }
    void Update() {
        bool changed = false;
        int mode = GetMode(Input.GetMouseButton(0), Input.GetMouseButton(1));
        float comp = 1;
        if (smooth)
            comp = Time.deltaTime;
        int ix = 1;
        if (invertX)
            ix = -1;
        int iy = 1;
        if (invertY)
            iy = -1;
        int iscroll = 1;
        if (invertScroll)
            iscroll = -1;
        if (mode != 0) {
            changed = true;
            deltaX = Input.GetAxis("Mouse X") * xMultiplicator * comp * ix;
            deltaY = Input.GetAxis("Mouse Y") * yMultiplicator * comp * iy;
            x += deltaX;
            y += deltaY;
            if (mode == trackMode) {
                SetVariableValue("x", x);
                SetVariableValue("deltaX", deltaX);
                SetVariableValue("y", y);
                SetVariableValue("deltaY", deltaY);
            };
        };
        float scrollwheel = Input.GetAxis("Mouse ScrollWheel");
        if (scrollwheel != 0) {
            changed = true;
            scrollDelta = scrollwheel * scrollMultiplicator * comp * iscroll;
            scroll += scrollDelta;
            SetVariableValue("scroll", scroll);
            SetVariableValue("scrollDelta", scrollDelta);
        };
        if (changed)
            onChange.Invoke();
    }
    public override void Set(bool update) {
        base.Set(update);
        xMultiplicator = (float)GetVariable("xMultiplicator");
        yMultiplicator = (float)GetVariable("yMultiplicator");
        scrollMultiplicator = (float)GetVariable("scrollMultiplicator");
        smooth = (bool)GetVariable("smooth");
        trackMode = (int)GetVariable("trackMode");
        x = (float)GetVariable("x");
        deltaX = (float)GetVariable("deltaX");
        y = (float)GetVariable("y");
        deltaY = (float)GetVariable("deltaY");
        scroll = (float)GetVariable("scroll");
        scrollDelta = (float)GetVariable("scrollDelta");
        invertX = (bool)GetVariable("invertX");
        invertY = (bool)GetVariable("invertY");
        invertScroll = (bool)GetVariable("invertScroll");
        if (!update) {
            onChange.RemoveAllListeners();
            onChange.AddListener(GetAction("onChange"));
        };
    }
}