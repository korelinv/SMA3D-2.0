using UnityEngine;
using System.Collections;

public class GC : MonoBehaviour {

    void Start() {
        InvokeRepeating("Collect", 5, 15);
    }

	void Collect () {
        Resources.UnloadUnusedAssets();
    }
}
