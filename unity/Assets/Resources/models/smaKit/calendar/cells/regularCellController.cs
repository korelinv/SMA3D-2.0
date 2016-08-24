using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System;

public class regularCellController : commonCellController {

    public Button button;

    void Start() {
        button.onClick.AddListener(Select);
    }

    public DateEvent onDateChanged = new DateEvent();

    //API
    public void Select() {
        onDateChanged.Invoke(this);
    }

}
