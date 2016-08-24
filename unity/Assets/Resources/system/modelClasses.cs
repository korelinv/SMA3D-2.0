using SMA.elements;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace SMA.models {

    public class Basic : View {
        private bool firstRun = true;
        private Dictionary<string, object> watchTower = new Dictionary<string, object>(); 
        public UnityEvent onStart = new UnityEvent();
        public UnityEvent onFinished = new UnityEvent();
        public UnityEvent onChanged = new UnityEvent();
        public virtual void ReceivedDataset() {
            if (firstRun) {
                onFinished.Invoke();
                firstRun = false;
            }
            else
                onChanged.Invoke();
        }
        public virtual void ReceivedSettings() {
            Set(false);
            onStart.Invoke();
            if (!RequiresDataset()) onFinished.Invoke(); 
        }
        public virtual void UpdatedSettings() {
            Set(true);
            if (Observe()) onChanged.Invoke();
        }
        public virtual void Set(bool update) {
            if (!update) {
                onStart.RemoveAllListeners();
                onStart.AddListener(GetAction("onStart"));
                onFinished.RemoveAllListeners();
                onFinished.AddListener(GetAction("onFinished"));
                onChanged.RemoveAllListeners();
                onChanged.AddListener(GetAction("onChanged"));
            };
        }
        public override void PostAwake() {
            base.PostAwake();
            OnReceivedDataset.AddListener(ReceivedDataset);
            OnReceivedSettings.AddListener(ReceivedSettings);
            OnUpdateSettings.AddListener(UpdatedSettings);
        }
        public void Watch(string __id, object __value) {
            watchTower[__id] = __value;
        }
        private bool Observe() {
            bool result = false;
            Dictionary<string, object> newWatchTower = new Dictionary<string, object>();
            foreach (KeyValuePair<string, object> suspect in watchTower) {
                if (!GetVariable(suspect.Key).Equals(suspect.Value)) {
                    result = true;
                    newWatchTower[suspect.Key] = GetVariable(suspect.Key);
                }
                else newWatchTower[suspect.Key] = suspect.Value;

            };
            watchTower = newWatchTower;
            return result;
        }
    }

    public class Regular : Basic {
        public override void Set(bool update) {
            base.Set(update);
            Vector3 position = new Vector3();
            position.x = (float)GetVariable("posX");
            position.y = (float)GetVariable("posY");
            position.z = (float)GetVariable("posZ");
            Vector3 scale = new Vector3();
            scale.x = (float)GetVariable("scaleX");
            scale.y = (float)GetVariable("scaleY");
            scale.z = (float)GetVariable("scaleZ");
            Vector3 rotation = new Vector3();
            if (update) {
                rotation.x = (float)GetVariable("offsetRotationX");
                rotation.y = (float)GetVariable("offsetRotationY");
                rotation.z = (float)GetVariable("offsetRotationZ");
            }
            else {
                rotation.x = (float)GetVariable("rotationX");
                rotation.y = (float)GetVariable("rotationY");
                rotation.z = (float)GetVariable("rotationZ");
            };
            transform.localPosition = position;
            transform.Rotate(rotation);
            transform.localScale = scale;
        }
    }

    public class UI : Basic {
        public RectTransform rectTransform;
        public override void Set(bool update) {
            base.Set(update);
            Vector3 position = new Vector2();
            position.x = (float)GetVariable("posX");
            position.y = (float)GetVariable("posY");
            position.z = (float)GetVariable("posZ");
            Vector2 size = new Vector2();
            size.x = (float)GetVariable("width");
            size.y = (float)GetVariable("height");
            Vector2 pivot = new Vector2();
            pivot.x = (float)GetVariable("pivotX");
            pivot.y = (float)GetVariable("pivotY");
            Vector2 anchorMin = new Vector2();
            anchorMin.x = (float)GetVariable("anchorMinX");
            anchorMin.y = (float)GetVariable("anchorMinY");
            Vector2 anchorMax = new Vector2();
            anchorMax.x = (float)GetVariable("anchorMaxX");
            anchorMax.y = (float)GetVariable("anchorMaxY");
            Vector3 scale = new Vector3();
            scale.x = (float)GetVariable("scaleX");
            scale.y = (float)GetVariable("scaleY");
            scale.z = (float)GetVariable("scaleZ");
            Vector3 rotation = new Vector3();
            if (update) {
                rotation.x = (float)GetVariable("offsetRotationX");
                rotation.y = (float)GetVariable("offsetRotationY");
                rotation.z = (float)GetVariable("offsetRotationZ");
            }
            else {
                rotation.x = (float)GetVariable("rotationX");
                rotation.y = (float)GetVariable("rotationY");
                rotation.z = (float)GetVariable("rotationZ");
            };
            rectTransform.anchoredPosition3D = position;
            rectTransform.sizeDelta = size;
            rectTransform.anchorMin = anchorMin;
            rectTransform.anchorMax = anchorMax;
            rectTransform.pivot = pivot;
            rectTransform.Rotate(rotation);
            rectTransform.localScale = scale;
        }
    }

}