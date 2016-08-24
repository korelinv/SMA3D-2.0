using SMA.models;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class incrementerController : Regular {
    private float step = 0;
    private int stepsPassed = 0;
    private bool active = false;
    private bool adjustForFramerate = false;
    private float progress = 0;
    private int direction = 1;
    private float max = 0;
    private float min = 0;
    private int loopType = 0;
    public UnityEvent OnIncrement = new UnityEvent();
    public void StartIncrementor(Dictionary<string, object> parameters) {
        active = true;
    }
    public void StopIncrementor(Dictionary<string, object> parameters) {
        active = false;
    }
    public void ResrtIncrementor(Dictionary<string, object> parameters) {
        stepsPassed = 0;
        progress = 0;
    }
    public void ChangeDirection(Dictionary<string, object> parameters) {
        direction = direction * (-1);
    }
    public override void RegisterMethods() {
        ImplementMethod("start",StartIncrementor);
        ImplementMethod("stop", StartIncrementor);
        ImplementMethod("reset", StartIncrementor);
        ImplementMethod("reverse", ChangeDirection);
    }
    public override void Set(bool update) {
        base.Set(update);
        step = (float)GetVariable("step");
        active = (bool)GetVariable("active");
        adjustForFramerate = (bool)GetVariable("adjustForFramerate");
        progress = (float)GetVariable("progress");
        direction = (int)GetVariable("direction");
        max = (float)GetVariable("max");
        min = (float)GetVariable("min");
        loopType = (int)GetVariable("loopType");
        if (!update) {
            OnIncrement.RemoveAllListeners();
            OnIncrement.AddListener(GetAction("OnIncrement"));
        };
    }
    void Update() {
        if (active) {
            if (adjustForFramerate) progress += direction * step * Time.deltaTime;
            else progress += direction * step;
            stepsPassed++;
            SetVariableValue("progress", progress);
            SetVariableValue("stepsPassed", stepsPassed);
            switch (loopType) {
                case 0:
                    if (((progress >= max) && (direction == 1)) || ((progress <= min) && (direction == -1))) {
                        active = false;
                        if (direction == 1) progress = max;
                        else progress = min;
                        SetVariableValue("active", active);
                    };
                    break;
                case 1:
                    if ((progress >= max) && (direction == 1)) progress = min;
                    else if ((progress <= min) && (direction == -1)) progress = max;
                    break;
                case 2:
                    if (((progress >= max) && (direction == 1)) || ((progress <= min) && (direction == -1))) {
                        if (direction == 1)  progress = max;
                        else progress = min;
                        direction = (-1) * direction;
                    };
                    break;
            };
            OnIncrement.Invoke();
        };
    }
}
