using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class Model{

    public static List<RedsAndGreenz> GetData() {

        List<RedsAndGreenz>  data = new List<RedsAndGreenz>();
        int counterGreen = 0;
        int counterRed = 0;
        int oivAmount = Random.Range(10, 50);
        for (int i = 0; i < oivAmount; i++)
        {
            counterGreen = Random.Range(500, 5000);
            counterRed = Random.Range(0, 1000);
            if (counterRed > counterGreen) counterGreen = counterRed;
            RedsAndGreenz rng = new RedsAndGreenz();
            rng.green = counterGreen;
            rng.tooltipgreen = counterGreen;
            rng.red = counterRed;
            rng.tooltipred = counterRed;
            data.Add(rng);
        }

        return data;
    }

    public static List<RedsAndGreenz> GetDataSorted(List<RedsAndGreenz> list) {
        IEnumerable<RedsAndGreenz> query = list.OrderByDescending(rng => rng.tooltipred);
        return query.ToList();
    }

    public static List<RedsAndGreenz> GetDataSortedPercent(List<RedsAndGreenz> list) {
        IEnumerable<RedsAndGreenz> query = list.OrderByDescending(rng => rng.tooltipred/rng.tooltipgreen);
        return query.ToList();
    }

    public static List<RedsAndGreenz> WhoIsBigger(List<RedsAndGreenz> list) {
        foreach (RedsAndGreenz member in list) {
            if (Mathf.Approximately(member.red, member.green)) {
                member.greenIsBigger = false;
                continue;
            }

            if (member.green <= member.red) {
                member.greenIsBigger = false;
                continue;
            }

            member.greenIsBigger = true;

            
        }
        return list;
    }

    public static float CalculateArea(List<RedsAndGreenz> list) {

        float result = 0;

        foreach (RedsAndGreenz member in list) {
            if (member.green > member.red) result += Mathf.PI * (member.green * member.green);
            else result += Mathf.PI * (member.red * member.red);
        }

        return result;
    }

    public static float GetSum(List<RedsAndGreenz> list) {
        float result = 0;
        foreach (RedsAndGreenz member in list) {
            if (member.green > member.red) result += member.green;
            else result += member.red;
        }

        return result;
    }

    public static List<RedsAndGreenz> GetRelativeSizes(List<RedsAndGreenz> list) {
        List<RedsAndGreenz> listOut = new List<RedsAndGreenz>();
        float maxval = 0;
        foreach (RedsAndGreenz member in list) {
            if (member.green > maxval) maxval = member.green;
            if (member.red > maxval) maxval = member.red;
        }
        foreach (RedsAndGreenz member in list) {
            RedsAndGreenz addtoSkype = new RedsAndGreenz();
            addtoSkype.green = member.green / maxval;
            addtoSkype.tooltipgreen = member.tooltipgreen;
            addtoSkype.red = member.red / maxval;
            addtoSkype.tooltipred = member.tooltipred;
            listOut.Add(addtoSkype);
        }
        return listOut;
    }
}

public class RedsAndGreenz {
    public float tooltipgreen;
    public float tooltipred;
    public float green;
    public float red;
    public bool greenIsBigger;
}

public static class StateOverallCircles {
    public static bool ready = true;
    public static bool isByPercent;
    public static CirclesController circles;
}
