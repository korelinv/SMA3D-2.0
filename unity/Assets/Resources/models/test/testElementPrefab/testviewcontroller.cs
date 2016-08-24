using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using SMA.elements;
using SMA.system;
using System;
using UnityEngine.UI;

public class testviewcontroller : View {

    public void ReceivedSettings() {
    }

    public void ReceivedDataset() {
        build();
    }

    private void build() {

        foreach (Transform child in pool.transform) {
            Destroy(child.gameObject);
        };


        float x = (float)GetVariable("X");
        float y = (float)GetVariable("Y");
        float z = (float)GetVariable("Z");

        float scaleX = (float)GetVariable("scaleX");
        float scaleY = (float)GetVariable("scaleY");
        float scaleZ = (float)GetVariable("scaleZ");

        Color fc;
        ColorUtility.TryParseHtmlString((string)GetVariable("colorFirst"), out fc);
        Color sc;
        ColorUtility.TryParseHtmlString((string)GetVariable("colorSecond"), out sc);


        transform.localPosition = new Vector3(x,y,z);
        transform.localScale = new Vector3(scaleX,scaleY,scaleZ);

        bool fa = (bool)GetVariable("showFirst");
        bool sa = (bool)GetVariable("showSecond");

        string testout = "data\n";
        //int step = -dataPool.Count/2;
        /*
        foreach (Dictionary<string, object> element in dataPool) {
            float f = 0;
            int s = 0;
            DateTime tt;
            string ttt = "";
            GameObject newDim = Instantiate(dimpref, transform.localPosition + new Vector3(-step * 4, 0, 0), transform.localRotation) as GameObject;
            newDim.transform.SetParent(pool.transform,false);   
            f = (float)element["first"]; 
            s = (int)element["second"];
            tt = (DateTime)element["caption"];
            ttt = tt.ToString("dd.MM.yyyy"); 
            newDim.GetComponent<dimctrl>().Set(f, s, ttt, fa, sa, fc, sc);
            testout = testout + "\t" + f.ToString("0.000000") + ", " + s.ToString("0.000000") +", "+ ttt + ", " + fa.ToString() + ", " + sa.ToString()+"\n";         
            step++;
        };
        */

    }

    public void UpdatedSettings() {
        build();
    }


    public override void PostAwake() {

        OnReceivedDataset.AddListener(ReceivedDataset);
        OnReceivedSettings.AddListener(ReceivedSettings);
        OnUpdateSettings.AddListener(UpdatedSettings);

        //RegisterField("first", "первый столбец", primitiveDataType.@float);
        //RegisterField("second", "второй столбец", primitiveDataType.@int);
        //RegisterField("caption", "подпись", primitiveDataType.@datetime);  

        //RegisterVariable("showFirst", "Показывать первый столбец", CustomFieldType.BOOL, true, false, false);
        //RegisterVariable("showSecond", "Показывать второй столбец", CustomFieldType.BOOL, true, false, false);

        //RegisterVariable("colorFirst", "Цвет первого столбца", CustomFieldType.STRING, "#FFFFFFFF", false, false);
        //RegisterVariable("colorSecond", "Цвет второго столбца", CustomFieldType.STRING, "#FFFFFFFF", false, false);

        //RegisterVariable("X", "смещение по оси X", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Y", "смещение по оси Y", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("Z", "смещение по оси Z", CustomFieldType.FLOAT, 0, false, false);
        //RegisterVariable("scaleX", "масштаб по оси X", CustomFieldType.FLOAT, 1, false, false);
        //RegisterVariable("scaleY", "масштаб по оси Y", CustomFieldType.FLOAT, 1, false, false);
        //RegisterVariable("scaleZ", "масштаб по оси Z", CustomFieldType.FLOAT, 1, false, false);

    }

    public GameObject dimpref;
    public GameObject pool;

}
