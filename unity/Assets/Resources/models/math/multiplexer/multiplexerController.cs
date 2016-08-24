using SMA.models;

public class multiplexerController : Regular {


    private int inputs = 0;
    private float multiplexer = 0;

    public override void Set(bool update) {
        base.Set(update);

        inputs = (int)GetVariable("inputs");
        multiplexer = (float)GetVariable("multiplexer");

        for (int i = 0; i < inputs; i++) {
            object _input = GetVariable("input#" + i);
            if (_input != null) {
                float result = 0;
                if (_input is int) result = multiplexer * (int)_input;
                else result = multiplexer * (float)_input;
                SetVariableValue("output#" + i, result);
            };
        };

        onChanged.Invoke();

    }


}
