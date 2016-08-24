using UnityEngine;
using System.Collections;

public class testcam : MonoBehaviour {

    public GameObject cam;
	
	// Update is called once per frame
	void Update () {
        if (Input.GetMouseButton(1)) {
            transform.Rotate(Vector3.up, Input.GetAxis("Mouse X") * 60 * Time.deltaTime);
        };
        if (Input.GetAxis("Mouse ScrollWheel") != 0) {
            cam.transform.Translate(new Vector3(0, 0, Input.GetAxis("Mouse ScrollWheel") * 500 * Time.deltaTime));
        };

	}
}
