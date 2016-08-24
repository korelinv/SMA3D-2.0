using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using SMA.elements;
using SMA.system;
using System;
using UnityEngine.UI;

public class testPLGController : View {

    public void ReceivedSettings() {
        Set();
    }

    public void ReceivedDataset() {
        build();
    }

    public segPLGController segA;
    public segPLGController segB;
    public segPLGController segC;
    Color clA;
    Color clB;
    Color clC;
    float z = 0;
    float y = 0;
    float x = 0;
    float scXZ = 1;
    float scY = 1;
    float rotation = 0;

    private void Set() {     
        x = (float)GetVariable("X");
        y = (float)GetVariable("Y");
        z = (float)GetVariable("Z");
        ColorUtility.TryParseHtmlString((string)GetVariable("colorA"), out clA);       
        ColorUtility.TryParseHtmlString((string)GetVariable("colorB"), out clB);     
        ColorUtility.TryParseHtmlString((string)GetVariable("colorC"), out clC);
        scXZ = (float)GetVariable("scaleXZ");
        scY = (float)GetVariable("scaleY");
        rotation = (float)GetVariable("rotation");
        transform.localPosition = new Vector3(x, y, z);
        transform.localScale = new Vector3(scXZ, scY, scXZ);
        transform.RotateAround(transform.position, Vector3.up, rotation);
    }

    private void build() {
        float segAsumm = 0;
        float segBsumm = 0;
        float segCsumm = 0;
        /*
        for (int index = dataPool.Count; index != 0; index--) {
            if (dataPool[index-1].ContainsKey("segA"))
                segAsumm += (int)dataPool[index - 1]["segA"];
            if (dataPool[index - 1].ContainsKey("segB"))
                segBsumm += (int)dataPool[index - 1]["segB"];
            if (dataPool[index - 1].ContainsKey("segC"))
                segCsumm += (int)dataPool[index - 1]["segC"];
        };
        */
        segA.Set(segAsumm,0.25f,clA);
        segB.Set(segBsumm,0.2125f, clB);
        segC.Set(segCsumm,0.2f, clC);
    }

    public void UpdatedSettings() {
        Set();
        build();
    }

    public override void PostAwake() {

        OnReceivedDataset.AddListener(ReceivedDataset);
        OnReceivedSettings.AddListener(ReceivedSettings);
        OnUpdateSettings.AddListener(UpdatedSettings);

        //RegisterField("segA", "Первый сегмент", SMA.system.primitiveDataType.@int);
        //RegisterField("segB", "Второй сегмент", SMA.system.primitiveDataType.@int);
        //RegisterField("segC", "Третий сегмент", SMA.system.primitiveDataType.@int);

        //RegisterVariable("colorA", "Цвет первого сегмента", CustomFieldType.STRING, "#FFFFFF", false, false);
        //RegisterVariable("colorB", "Цвет второго сегмента", CustomFieldType.STRING, "#FFFFFF", false, false);
        //RegisterVariable("colorC", "Цвет третьего сегмента", CustomFieldType.STRING, "#FFFFFF", false, false);


        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Z", "смещение по оси Z", CustomFieldType.FLOAT, 0, false, false);

        //RegisterVariable("rotation","поворот вокруг оси Y", CustomFieldType.FLOAT, 0, false, false);

        //RegisterVariable("scaleXZ", "масштаб по осям X-Z", CustomFieldType.FLOAT, 1, false, false);
        //RegisterVariable("scaleY", "масштаб по оси Y", CustomFieldType.FLOAT, 1, false, false);
    }

}
