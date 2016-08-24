using UnityEngine;
using System.Collections;
using SMA.elements;
using SMA.system;
using System.Collections.Generic;
using UnityEngine.Events;
using SMA.models;

public class map3dController : Regular {

    public GameObject markerPrefab;
    public GameObject markersContainer;
    public UnityEvent onSelectMarker = new UnityEvent();
    private Vector3 markerScale = new Vector3();
    private float ankerX = 0;
    private float ankerY = 0;
    private int selectedMarkerId = 0;
    private string selectedMarkerName = "";
    private List<Color> colors = new List<Color>();
    private Dictionary<int, Dictionary<string, object>> dataModel = new Dictionary<int, Dictionary<string, object>>();
    private List<GameObject> markersList = new List<GameObject>();

    public override void ReceivedDataset() {
        PopulateMap();
        base.ReceivedDataset();
    }
    public override void UpdatedSettings() {
        base.UpdatedSettings();
        RequestData();
    }
    public override void Set(bool update) {
        base.Set(update);
        if (!update) {
            onSelectMarker.RemoveAllListeners();
            onSelectMarker.AddListener(GetAction("onSelectMarker"));
        };
        markerScale = new Vector3(
            (float)GetVariable("markerScaleX"),
            (float)GetVariable("markerScaleY"),
            (float)GetVariable("markerScaleZ")
        );
        ankerX = (float)GetVariable("ankerX");
        ankerY = (float)GetVariable("ankerY");
        selectedMarkerId = (int)GetVariable("selecetedMarkerId");
        selectedMarkerName = (string)GetVariable("selectedMarkerName");
        colors.Clear();
        for (int i = 0; i < 5; i++) {
            Color newColor = new Color();
            ColorUtility.TryParseHtmlString((string)GetVariable("color#" + i), out newColor);
            colors.Add(newColor);
        };
    }
    public void SelectMarker(int _id, string _name) {
        selectedMarkerId = _id;
        selectedMarkerName = _name;
        SetVariableValue("selectedMarkerId", selectedMarkerId);
        SetVariableValue("selectedMarkerName", selectedMarkerName);
        onSelectMarker.Invoke();
    }
    private void PopulateMap() {
        //drop
        foreach (GameObject marker in markersList) {
            Destroy(marker);
        };
        markersList.Clear();
        foreach (PoolElement element in pool) {
            float posX = 0;
            float posY = 0;
            int id = 0;
            string name = "";
            string geo = "";
            int chunk1 = 0;
            int chunk2 = 0;
            int chunk3 = 0;
            int chunk4 = 0;
            geo = (string)element.GetProperty("geo", "");
            name = (string)element.GetProperty("name", "");
            id = (int)element.GetProperty("id", 0);
            chunk1 = (int)element.GetProperty("chunk1", 0);
            chunk2 = (int)element.GetProperty("chunk2", 0);
            chunk3 = (int)element.GetProperty("chunk3", 0);
            chunk4 = (int)element.GetProperty("chunk4", 0);
            if (!string.IsNullOrEmpty(geo)) {
                string[] geoarray = geo.Split(',');
                float.TryParse(geoarray[0], out posX);
                float.TryParse(geoarray[1], out posY);
            };
            Dictionary<string, object> shard = new Dictionary<string, object>();
            shard["name"] = name;
            shard["geo"] = geo;
            shard["posX"] = posX;
            shard["posY"] = posY;
            shard["chunk1"] = chunk1;
            shard["chunk2"] = chunk2;
            shard["chunk3"] = chunk3;
            shard["chunk4"] = chunk4;
            dataModel[id] = shard;
        };
        foreach (KeyValuePair<int, Dictionary<string, object>> shard in dataModel) {
            int max = 0;
            int maxIndex = 0;
            for (int i = 1; i < 5; i++) {
                if ((int)shard.Value["chunk" + i] >= max) {
                    max = (int)shard.Value["chunk" + i];
                    maxIndex = i;
                };
            };
            if (max == 0) maxIndex = 0;
            GameObject newMarker = Instantiate(markerPrefab, transform.position, transform.rotation) as GameObject;
            newMarker.transform.SetParent(markersContainer.transform);
            map3dMarkerController newMarkerController = newMarker.GetComponent<map3dMarkerController>();
            newMarkerController.Set(
                (-(float)shard.Value["posX"] + ankerX) * 100,
                ((float)shard.Value["posY"] - ankerY) * 100,
                markerScale,
                colors[maxIndex],
                shard.Key,
                (string)shard.Value["name"]);
            newMarkerController.OnMarkerSelect.AddListener(SelectMarker);
            markersList.Add(newMarker);
        };
    }
}