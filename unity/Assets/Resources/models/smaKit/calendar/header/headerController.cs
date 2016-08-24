using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.Events;

public class headerController : MonoBehaviour {

    public Button next;
    public Button prev;
    public Text caption;

    //API
    public void Configure(UnityAction __next, UnityAction __prev, string __caption) {
        next.onClick.AddListener(__next);
        prev.onClick.AddListener(__prev);
        SetCaption(__caption);
    }
    public void SetCaption(string text) {
        caption.text = text;
    }
}
