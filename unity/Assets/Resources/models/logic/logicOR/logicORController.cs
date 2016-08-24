﻿using SMA.models;
using System.Collections.Generic;

public class logicORController : Regular {
    private int inputsCount = 0;
    private List<bool> inputs = new List<bool>();
    public override void Set(bool update) {
        base.Set(update);
        inputsCount = (int)GetVariable("inputsCount");
        bool logicResult = false;
        for (int i = 0; i < inputsCount; i++) {
            if (GetVariable("input#" + i) != null) {
                logicResult = logicResult || (bool)GetVariable("input#" + i);
            };
        };
        SetVariableValue("result",logicResult);
        if (!update) Watch("result",logicResult);
    }
}
