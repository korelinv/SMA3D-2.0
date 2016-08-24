using SMA.models;
using UnityEngine;
using UnityEngine.UI;

public class multiSegmentBarController : UI {
    public GameObject segment;
    public Transform container;
    private Component layoutComponent;
    private int segmentsCount = 0;
    private int orientation = 0;
    private void Clear() {
        foreach (Transform child in container) {
            Destroy(child);
        };
    }
    private void Fill() {
        if ((layoutComponent is HorizontalLayoutGroup) && (orientation == 1)) {
            Destroy(layoutComponent);
            container.gameObject.AddComponent<VerticalLayoutGroup>();
            layoutComponent = container.gameObject.GetComponent<HorizontalLayoutGroup>();
        };
        if ((layoutComponent is VerticalLayoutGroup) && (orientation == 0)) {
            Destroy(layoutComponent);
            container.gameObject.AddComponent<HorizontalLayoutGroup>();
            layoutComponent = container.gameObject.GetComponent<HorizontalLayoutGroup>();
        };
        if (layoutComponent == null) {
            switch (orientation) {
                case 0:
                    container.gameObject.AddComponent<HorizontalLayoutGroup>();
                    layoutComponent = container.gameObject.GetComponent<HorizontalLayoutGroup>();
                    break;
                case 1:
                    container.gameObject.AddComponent<VerticalLayoutGroup>();
                    layoutComponent = container.gameObject.GetComponent<VerticalLayoutGroup>();
                    break;
            };
        };
        for (int i = 0; i < segmentsCount; i++) {
            GameObject newSegment = Instantiate(segment) as GameObject;
            newSegment.transform.SetParent(container);
            LayoutElement layoutElement = newSegment.GetComponent<LayoutElement>();
            Image image = newSegment.GetComponent<Image>();
            if (GetVariable("segment#" + i) != null) {
                switch (orientation) {
                    case 0:
                        layoutElement.flexibleWidth = (int)GetVariable("segment#" + i);
                        break;
                    case 1:
                        layoutElement.flexibleHeight = (int)GetVariable("segment#" + i);
                        break;
                };
            }
            else {
                layoutElement.flexibleWidth = 0;
            };
            if ((GetVariable("color#" + i) != null) && (GetVariable("opacity#" + i) != null)) {
                string color = (string)GetVariable("color#" + i);
                float opacity = (float)GetVariable("opacity#" + i);
                Color finalColor = new Color();
                ColorUtility.TryParseHtmlString(color, out finalColor);
                finalColor.a = opacity;
                image.color = finalColor;
            };
        };
    }
    public override void Set(bool update) {
        base.Set(update);
        segmentsCount = (int)GetVariable("segmentsCount");
        orientation = (int)GetVariable("orientation");
        Clear();
        Fill();
    }
}