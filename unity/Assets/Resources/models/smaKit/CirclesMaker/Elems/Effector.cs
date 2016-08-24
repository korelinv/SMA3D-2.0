using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;

public class Effector : MonoBehaviour {

    private int counter;

    void OnCollisionEnter2D(Collision2D coll) {
        if (counter == 0) { 
            StartCoroutine(GetVisibleAndStatic());
        }
        counter++;
    }

    IEnumerator GetVisibleAndStatic() {
        yield return new WaitForSeconds(1);
        gameObject.GetComponent<Rigidbody2D>().isKinematic = true;

        Color color = gameObject.GetComponent<Image>().color;
        color = new Color(color.r,color.g,color.b,1);
        gameObject.GetComponent<Image>().color = color;

        Color color1 = transform.GetChild(0).GetComponent<Image>().color;
        color1 = new Color(color1.r, color1.g, color1.b, 1);
        transform.GetChild(0).GetComponent<Image>().color = color1;
    }
}
