using SMA.models;
using System.Collections.Generic;

public class scalerController : Regular {

    private int inputs = 0;
    private List<float> inputValues = new List<float>();
    private float totalPositive = 0;
    private float totalNegative = 0;

    private float negativeMin = 0;
    private float positiveMin = 0;
    private float negativeMultiplexer = 1;
    private float positiveMultiplexer = 1;

    public override void Set(bool update) {
        base.Set(update);
        inputValues.Clear();
        totalPositive = 0;
        totalNegative = 0;

        if (GetVariable("negativeMin") != null) negativeMin = (float)GetVariable("negativeMin");
        if (GetVariable("positiveMin") != null) positiveMin = (float)GetVariable("positiveMin");
        if (GetVariable("negativeMultiplexer") != null) negativeMultiplexer = (float)GetVariable("negativeMultiplexer");
        if (GetVariable("positiveMultiplexer") != null) positiveMultiplexer = (float)GetVariable("positiveMultiplexer");

        inputs = (int)GetVariable("inputs");
        for (int i = 0; i < inputs; i++) {
            object _input = GetVariable("input#"+i);
            if (_input != null) {
                if (_input is int) {
                    int converted = (int)_input;
                    inputValues.Add(converted);
                    if (converted >= 0) totalPositive += converted;
                    else totalNegative -= converted;
                }
                else {
                    float converted = (float)_input;
                    inputValues.Add(converted);
                    if (converted >= 0) totalPositive += converted;
                    else totalNegative -= converted;
                };
            };
        };


        for (int i = 0; i < inputValues.Count; i++) {
            float result = 0;
            if ((inputValues[i] >= 0) && (totalPositive != 0)) {
                result = (inputValues[i] / totalPositive) * positiveMultiplexer;
                if ((result != 0) && (result < positiveMin)) result = positiveMin;
            }
            else if ((inputValues[i] < 0) && (totalNegative != 0)) {
                result = (inputValues[i] / totalNegative) * negativeMultiplexer;
                if (result > negativeMin) result = negativeMin;
            };
            SetVariableValue("output#" + i, result);
        };

        onChanged.Invoke();

    }


}
