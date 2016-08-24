using UnityEngine;
using System.Collections;

public class dimctrl : MonoBehaviour {

    public GameObject first;
    public GameObject second;
    public GameObject third;
    public MeshRenderer firstMesh;
    public MeshRenderer secondMesh;

    public void Set(float f, float s, string t, bool fa, bool sa, Color32 fc, Color32 sc) {

        if (fa) {
            first.transform.localScale = new Vector3(1, f / 5, 1);
            first.transform.localPosition = new Vector3(0, (f / 5) / 2, 0);
            firstMesh.material.color = fc;
        }
        else
            first.SetActive(false);

        if (sa) {
            second.transform.localScale = new Vector3(2, s / 5, 2);
            second.transform.localPosition = new Vector3(-1.75f, (s / 5) / 2, -0.75f);
            secondMesh.material.color = sc;
        }
        else
            second.SetActive(false);         

        third.GetComponent<TextMesh>().text = t;

    }
    /*
    void Update() {

        if (F > first.transform.localScale.y) {

        };

        if (S > second.transform.localScale.y) {
        };

    }
    */

}
