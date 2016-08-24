using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine.UI;
using SMA.models;
using SMA.system;

public class CirclesController : UI
{
    public RectTransform circlePrefab;
    public RectTransform areaOfSpawn;
    private RectTransform springParent;
    private List<Vector2> radiuses = new List<Vector2>();

    // Use this for initialization
    public override void PostAwake()
    {
        base.PostAwake();
        StateOverallCircles.circles = this;
    }

    public override void Set(bool update)
    {
        base.Set(update);
        //MakeCirclesPhysics();
    }

    public void MakeCirclesPhysics() {
        if (StateOverallCircles.ready)
        {
            StateOverallCircles.ready = false;
            Values[] val = FindObjectsOfType(typeof(Values)) as Values[];

            if(val.Length>0)
            foreach (Values v in val) Destroy(v.gameObject);

            List<RedsAndGreenz> physList = Model.GetData();

            List<RedsAndGreenz> relSizes = Model.GetRelativeSizes(physList);
            relSizes = Model.WhoIsBigger(relSizes);

            if (StateOverallCircles.isByPercent)
                relSizes = Model.GetDataSortedPercent(relSizes);
            else
                relSizes = Model.GetDataSorted(relSizes);

            float circlesArea = Model.GetSum(relSizes);
            float spawnrectArea = areaOfSpawn.rect.width * areaOfSpawn.rect.height;
            float multCoeff = spawnrectArea / circlesArea;

            radiuses = new List<Vector2>();
            foreach (RedsAndGreenz member in relSizes)
            {
                float rad = (Mathf.Sqrt(member.green * multCoeff)) / Mathf.PI;
                float rad2 = (Mathf.Sqrt(member.red * multCoeff)) / Mathf.PI;
                radiuses.Add(new Vector2(rad, rad2));
            }

            int index = 0;

            foreach (RedsAndGreenz member in relSizes)
            {
                bool lastOne = false;

                if (index == relSizes.Count - 1)lastOne = true;

                StartCoroutine(Makecircle((float)index, member, index, lastOne));
                index++;
            }
            
        }
       
    }

    IEnumerator Makecircle(float seconds, RedsAndGreenz member, int index, bool lastOne) {

        yield return new WaitForSeconds(seconds/40);

        RectTransform rt = Instantiate(circlePrefab);
        rt.GetComponent<Values>().green = (int)member.tooltipgreen;
        rt.GetComponent<Values>().red = (int)member.tooltipred;
        rt.name = rt.name + index;

        if (index == 0)
        {
            springParent = rt;
            rt.GetComponent<Rigidbody2D>().isKinematic = true;
            rt.SetParent(rectTransform);
        }
        else
        {
            Rigidbody2D toConnectto = springParent.GetComponent<Rigidbody2D>();
            rt.GetComponent<SpringJoint2D>().connectedBody = toConnectto;
            rt.SetParent(rectTransform);
        }
        Vector3[] fourCornersArray = new Vector3[4];
        areaOfSpawn.GetWorldCorners(fourCornersArray);
        if (index == 0) rt.position = new Vector2(fourCornersArray[0].x + (areaOfSpawn.rect.width / 2), fourCornersArray[0].y + radiuses[index].x);
        else
            rt.position = new Vector3(Random.Range(0, 600), Random.Range(500, 600), 0);
        if (member.greenIsBigger)
        {
            rt.sizeDelta = new Vector2(radiuses[index].x * 2, radiuses[index].x * 2);
            rt.GetChild(0).GetComponent<RectTransform>().sizeDelta = new Vector2(radiuses[index].y * 2, radiuses[index].y * 2);
        }
        else
        {
            rt.sizeDelta = new Vector2(radiuses[index].y * 2, radiuses[index].y * 2);
            rt.GetChild(0).GetComponent<RectTransform>().sizeDelta = new Vector2(radiuses[index].x * 2, radiuses[index].x * 2);
        }

        rt.GetComponent<CircleCollider2D>().radius = rt.sizeDelta.x * 0.5f;

        if (member.greenIsBigger)
        {
            rt.GetComponent<Image>().color = new Color(0, 1, 0, 0);
            rt.GetChild(0).GetComponent<Image>().color = new Color(1,0,0,0);
        }

        else
        {
            rt.GetComponent<Image>().color = new Color(1, 0, 0, 0);
            rt.GetChild(0).GetComponent<Image>().color = new Color(1, 0, 0, 0);
        }
        if (lastOne) StateOverallCircles.ready = true;
    }
}
