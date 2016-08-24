using UnityEngine;
using System.Collections;
using SMA.models;
using SMA.system;

public class monitoringController : Regular {

    private string filterBy = "";

    private int all = 0;

    private int greenAll = 0;
    private int yellowAll = 0;
    private int orangeAll = 0;
    private int redAll = 0;

    private int deliveredAll = 0;
    private int processAll = 0;
    private int returnedAll = 0;

    private int deliveredGreen = 0;
    private int deliveredOrange = 0;
    private int deliveredRed = 0;
    private int deliveredYellow = 0;

    private int processGreen = 0;
    private int processOrange = 0;
    private int processYellow = 0;
    private int processRed = 0;

    private int returnedGreen = 0;
    private int returnedYellow = 0;
    private int returnedOrange = 0;
    private int returnedRed = 0;

    private int IEV = 0;
    private int shortService = 0;
    private int priorityService = 0;

    public override void ReceivedDataset() {
        ProcessData();
        base.ReceivedDataset();
    }

    public override void UpdatedSettings() {
        base.UpdatedSettings();
        RequestData();
    }

    public override void Set(bool update) {
        base.Set(update);
    }



    private void Reset() {
        all = 0;
        greenAll = 0;
        yellowAll = 0;
        orangeAll = 0;
        redAll = 0;
        returnedAll = 0;
        deliveredAll = 0;
        processAll = 0;
        deliveredGreen = 0;
        deliveredOrange = 0;
        deliveredRed = 0;
        deliveredYellow = 0;
        processGreen = 0;
        processOrange = 0;
        processYellow = 0;
        processRed = 0;
        returnedGreen = 0;
        returnedYellow = 0;
        returnedOrange = 0;
        returnedRed = 0;
    }


    private void ProcessData() {
        Reset();

        foreach (PoolElement element in pool) {

            greenAll += (int)element.GetProperty("deliveredGreen", 0) + (int)element.GetProperty("processGreen", 0) + (int)element.GetProperty("returnedGreen", 0);
            yellowAll += (int)element.GetProperty("deliveredYellow", 0) + (int)element.GetProperty("processYellow", 0) + (int)element.GetProperty("returnedYellow", 0);
            orangeAll += (int)element.GetProperty("deliveredOrange", 0) + (int)element.GetProperty("processOrange", 0) + (int)element.GetProperty("returnedOrange", 0);
            redAll += (int)element.GetProperty("deliveredRed", 0) + (int)element.GetProperty("processRed", 0) + (int)element.GetProperty("returnedRed", 0);

            deliveredGreen += (int)element.GetProperty("deliveredGreen", 0);
            deliveredYellow += (int)element.GetProperty("deliveredYellow", 0);
            deliveredOrange += (int)element.GetProperty("deliveredOrange", 0);
            deliveredRed += (int)element.GetProperty("deliveredRed", 0);

            processGreen += (int)element.GetProperty("processGreen", 0);
            processYellow += (int)element.GetProperty("processYellow", 0);
            processOrange += (int)element.GetProperty("processOrange", 0);
            processRed += (int)element.GetProperty("processRed", 0);

            returnedGreen += (int)element.GetProperty("returnedGreen", 0);
            returnedYellow += (int)element.GetProperty("returnedYellow", 0);
            returnedOrange += (int)element.GetProperty("returnedOrange", 0);
            returnedRed += (int)element.GetProperty("returnedRed", 0);

        };

        all = greenAll + yellowAll + orangeAll + redAll;
        deliveredAll = deliveredGreen + deliveredYellow + deliveredOrange + deliveredRed;
        processAll = processGreen + processYellow + processOrange + processRed;
        returnedAll = returnedGreen + returnedYellow + returnedOrange + returnedRed;

        SetVariableValue("greenAll", greenAll);
        SetVariableValue("yellowAll", yellowAll);
        SetVariableValue("orangeAll", orangeAll);
        SetVariableValue("redAll", redAll);

        SetVariableValue("all",all);

        SetVariableValue("deliveredAll", deliveredAll);
        SetVariableValue("processAll", processAll);
        SetVariableValue("returnedAll", returnedAll);

        SetVariableValue("deliveredGreen", deliveredGreen);
        SetVariableValue("deliveredYellow", deliveredYellow);
        SetVariableValue("deliveredOrange", deliveredOrange);
        SetVariableValue("deliveredRed", deliveredRed);

        SetVariableValue("processGreen", processGreen);
        SetVariableValue("processYellow", processYellow);
        SetVariableValue("processOrange", processOrange);
        SetVariableValue("processRed", processRed);

        SetVariableValue("returnedGreen", returnedGreen);
        SetVariableValue("returnedYellow", returnedYellow);
        SetVariableValue("returnedOrange", returnedOrange);
        SetVariableValue("returnedRed", returnedRed);
     
    }


}
