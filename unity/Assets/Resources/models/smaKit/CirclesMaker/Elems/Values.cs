using UnityEngine;
using System.Collections;
using UnityEngine.EventSystems;
using System;

public class Values : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler {

    public RectTransform tooltipPref;
    private RectTransform tooltip;
    public int green;
    public int red;

    public void OnPointerEnter(PointerEventData eventData)
    {
        tooltip = Instantiate(tooltipPref);
        tooltip.SetParent(this.transform.parent);
        tooltip.position = new Vector2(Input.mousePosition.x, Input.mousePosition.y);
        TooltipTexts ttt = tooltip.GetComponent<TooltipTexts>();
        ttt.green.text = "" + green;
        ttt.red.text = "" + red;
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        Destroy(tooltip.gameObject);
    }
}
