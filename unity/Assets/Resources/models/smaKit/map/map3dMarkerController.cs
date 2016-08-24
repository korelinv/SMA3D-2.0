using UnityEngine;
using UnityEngine.Events;
using System.Collections.Generic;

public class map3dMarkerController : MonoBehaviour {

    public class intEvent : UnityEvent<int,string> {}


    public void Set(float _x, float _y, Vector3 _scale, Color _color, int _id, string _meta) {
        color = _color;
        id = _id;
        meta = _meta;
        transform.localScale = _scale;
        transform.localPosition = new Vector3(_x,0,_y);

        GetComponentInChildren<MeshRenderer>().material.color =_color;

    }

    public Color color;
    public int id;
    public string meta;
    public intEvent OnMarkerSelect = new intEvent();

    void OnMouseDown() {
        OnMarkerSelect.Invoke(id, meta);
    }

}
