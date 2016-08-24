using SMA.models;

public class logicNOTController : Regular {
    public override void Set(bool update) {
        base.Set(update);
        bool logicResult = !(bool)GetVariable("input");
        SetVariableValue("result", logicResult);
        if (!update) Watch("result", logicResult);
    }
}
