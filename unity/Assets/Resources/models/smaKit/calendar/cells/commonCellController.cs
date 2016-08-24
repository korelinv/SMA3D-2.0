using UnityEngine;
using UnityEngine.UI;
using System;

public class commonCellController : MonoBehaviour {

    public Text caption;
    public DateTime date;


    public void Set(DateTime __date) {
        date = __date;
        caption.text = date.Day.ToString();
    }
}
