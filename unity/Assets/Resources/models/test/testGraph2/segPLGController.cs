using UnityEngine;
using System.Collections;

public class segPLGController : MonoBehaviour {

    public MeshRenderer msh;

    public void Set(float value, float height, Color32 color) {

        transform.localPosition = new Vector3(value/2,height/2,value/2);
        transform.localScale = new Vector3(value, height, value);

        msh.material.color = color;

    }

}
