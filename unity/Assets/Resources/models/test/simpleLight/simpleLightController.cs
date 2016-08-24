using UnityEngine;
using System.Collections;
using SMA.elements;

public class simpleLightController : View {

    public GameObject torch;

    public override void PostAwake() {
        base.PostAwake();

        OnReceivedSettings.AddListener(ReceiveSettings);

        //RegisterVariable("posX","Смещение по оси X",CustomFieldType.FLOAT,0,true,false);
        //RegisterVariable("posY", "Смещение по оси Y", CustomFieldType.FLOAT, 0, true, false);
        //RegisterVariable("posZ", "Смещение по оси Z", CustomFieldType.FLOAT, 0, true, false);

        //RegisterVariable("rotationX", "поворот по оси X", CustomFieldType.FLOAT, 0, true, false);
        //RegisterVariable("rotationY", "поворот по оси Y", CustomFieldType.FLOAT, 0, true, false);

        //RegisterVariable("intencity", "", CustomFieldType.FLOAT, 1, true, false);
        //RegisterVariable("color", "", CustomFieldType.STRING, "#ffffff", true, false);

    }

    void ReceiveSettings() {

        float posX = 0;
        float posY = 0;
        float posZ = 0;
        posX = (float)GetVariable("posX");
        posY = (float)GetVariable("posY");
        posZ = (float)GetVariable("posZ");

        float rotationX = 0;
        float rotationY = 0;
        rotationX = (float)GetVariable("rotationX");
        rotationY = (float)GetVariable("rotationY");

        float intencity = 1;
        intencity = (float)GetVariable("intencity");
        Color color = new Color();
        ColorUtility.TryParseHtmlString((string)GetVariable("color"), out color);

        transform.localPosition = new Vector3(posX,posY,posZ);
        torch.transform.RotateAround(transform.position,Vector3.left,rotationX);
        torch.transform.RotateAround(transform.position, Vector3.up, rotationY);
        torch.GetComponent<Light>().intensity = intencity;
        torch.GetComponent<Light>().color = color;
    }

}
