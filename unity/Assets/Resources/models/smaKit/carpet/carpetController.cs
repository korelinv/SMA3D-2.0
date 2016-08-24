using SMA.elements;
using SMA.system;
using UnityEngine;
using System.Collections.Generic;
using UnityEngine.Events;
using SMA.models;

public class carpetController : Regular {
    public brickStackController brickStack;
    private float percentTimeFree = 0;
    private float percentTimeWork = 0;
    private float timeFree = 0;
    private float timeWork = 0;
    private int requestNotServed = 0;
    private int requestTotal = 0;
    private List<float> windows = new List<float>(new float[] { 0, 0, 0 });
    private int totalColors = 0;
    private List<Color> colors = new List<Color>();
    public override void ReceivedDataset() {
        ProcessData();
        brickStack.SetValues(windows, true);
        base.ReceivedDataset();
    }

    public override void UpdatedSettings() {
        base.UpdatedSettings();
        RequestData();
    }

    public override void Set(bool update) {
        base.Set(update);
        Vector3 stackScale = new Vector3();
        stackScale.x = (float)GetVariable("stackScaleX");
        stackScale.y = (float)GetVariable("stackScaleY");
        stackScale.z = (float)GetVariable("stackScaleZ");
        brickStack.SetDimensions(stackScale);
        totalColors = (int)GetVariable("totalColors");
        for (int i = 0; i < totalColors; i++) {
            if (GetVariable("color#" + i) != null) {
                string colorRaw = (string)GetVariable("color#" + i);
                Color newColor = new Color();
                ColorUtility.TryParseHtmlString(colorRaw, out newColor);
                colors.Add(newColor);
            }
            else {
                colors.Add(new Color(1, 1, 1));
            };
        };
        brickStack.SetColors(colors, update);
    }
    private void ProcessData() {

        int count = 0;

        windows[0] = 0;
        windows[1] = 0;
        windows[2] = 0;

        foreach (PoolElement element in pool) {
            percentTimeFree += (float)element.GetProperty("percentTimeFree", 0f);
            percentTimeWork += (float)element.GetProperty("percentTimeWork", 0f);
            timeFree += (float)element.GetProperty("timeFree", 0f);
            timeWork += (float)element.GetProperty("timeWork", 0f);
            requestNotServed = (int)element.GetProperty("requestNotServed", 0);
            requestTotal = (int)element.GetProperty("requestTotal", 0);
            windows[0] += (int)element.GetProperty("windowsService", 0);
            windows[1] += (int)element.GetProperty("windowsAllocated", 0);
            windows[2] += (int)element.GetProperty("windowsAll", 0);
            count++;
        };

        if (count > 0) {
            percentTimeFree = percentTimeFree / count;
            percentTimeWork = percentTimeWork / count;
            timeFree = timeFree / count;
            timeWork = timeWork / count;
        };

        SetVariableValue("windowsService", (int)windows[0]);
        SetVariableValue("windowsAllocated", (int)windows[1]);
        SetVariableValue("windowsAll", (int)windows[2]);

        SetVariableValue("percentTimeFree", percentTimeFree);
        SetVariableValue("percentTimeWork", percentTimeWork);
        SetVariableValue("timeFree", timeFree);
        SetVariableValue("timeWork", timeWork);
        SetVariableValue("requestNotServed", requestNotServed);
        SetVariableValue("requestTotal", requestTotal);

    }
}
