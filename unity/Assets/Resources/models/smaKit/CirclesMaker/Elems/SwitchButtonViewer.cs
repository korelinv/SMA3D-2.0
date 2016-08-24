using UnityEngine;
using System.Collections;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System;

public enum BState {ABS,OTN};

public class SwitchButtonViewer : MonoBehaviour, IPointerClickHandler {

    private BState state = BState.OTN;
    public RectTransform stateAbs;
    public RectTransform stateOtn;
    //public CirclesController headObject;

    private Color hexFullPanel = new Color(0.5f,0.5f,0.5f,1f);
    private Color hexEmptyPanel = new Color(0.5f,0.5f,0.5f,0.05f);
    private Color hexFullText = new Color(1,1,1,1);
    private Color hexEmptyText = new Color(1,1,1,0.05f);

    void Start() {
        //headObject = transform.root.GetComponent<CirclesController>();
        stateAbs.GetComponent<Image>().color = hexEmptyPanel;
        stateAbs.GetChild(0).GetComponent<Text>().color = hexEmptyText;
        stateOtn.GetComponent<Image>().color = hexFullPanel;
        stateOtn.GetChild(0).GetComponent<Text>().color = hexFullText;
        state = BState.OTN;
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        SwitchState();
    }

    void SwitchState() {
        switch (state)
        {
            case BState.OTN:
                {
                    stateAbs.GetComponent<Image>().color = hexFullPanel;
                    stateAbs.GetChild(0).GetComponent<Text>().color = hexFullText;
                    stateOtn.GetComponent<Image>().color = hexEmptyPanel;
                    stateOtn.GetChild(0).GetComponent<Text>().color = hexEmptyText;
                    state = BState.ABS;
                    StateOverallCircles.isByPercent = false;
                    if (StateOverallCircles.ready) StateOverallCircles.circles.MakeCirclesPhysics();
                    //headObject.MakeCirclesPhysics();
                    break;
                }
            case BState.ABS:
                {
                    stateAbs.GetComponent<Image>().color = hexEmptyPanel;
                    stateAbs.GetChild(0).GetComponent<Text>().color = hexEmptyText;
                    stateOtn.GetComponent<Image>().color = hexFullPanel;
                    stateOtn.GetChild(0).GetComponent<Text>().color = hexFullText;
                    StateOverallCircles.isByPercent = true;
                    if (StateOverallCircles.ready) StateOverallCircles.circles.MakeCirclesPhysics();
                    //headObject.MakeCirclesPhysics();
                    state = BState.OTN;
                    break;
                }
        }
    }
}
