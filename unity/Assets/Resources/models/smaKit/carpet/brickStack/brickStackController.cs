using System.Collections.Generic;
using UnityEngine;

public class brickStackController : MonoBehaviour {

    public GameObject brick;

    private List<float> data = new List<float>();
    private List<Color> colors = new List<Color>();

    //API
    public void Set(List<float> __data, List<Color> __colors, Vector3 __dimnesions) {
        SetDimensions(__dimnesions);
        SetValues(__data,false);
        SetColors(__colors,true);
    }
    public void SetValues(List<float> __data, bool force) {
        data = __data;
        if (force) {
            Drop();
            Build();
        };
    }
    public void SetColors(List<Color> __colors, bool force) {
        colors = __colors;
        if (force) {
            Drop();
            Build();
        };
    }
    public void SetDimensions(Vector3 __dimnesions) {
        transform.localScale = __dimnesions;
    }

    private void Build() {



        float max = 0;
        foreach (float value in data) {
            if (value >= max)
                max = value;
        };
        if (max > 0) {
            int index = 0;
            float step = 0.5f / data.Count;
            foreach (float value in data) {
                GameObject newBrick = Instantiate(brick, transform.position, transform.rotation) as GameObject;
                newBrick.transform.SetParent(transform);
                float scale = value / max;

                int sc1 = 0;
                for (int i = 0; i < data.Count; i++) {
                    if (value >= data[i]) sc1++;
                };

                newBrick.transform.localScale = new Vector3(scale, 1 - sc1 * step, scale);
                newBrick.transform.localPosition = new Vector3((scale - 1) / 2, - sc1 * step / 2, (scale - 1) / 2);


                if (index < colors.Count)
                    newBrick.GetComponent<MeshRenderer>().material.color = colors[index];
                index++;
            };
        };         
    }

    private void Drop() {
        foreach (Transform child in transform) {
            Destroy(child.gameObject);
        };
    }
	
}
