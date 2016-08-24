using UnityEngine;
using System.Collections;
using UnityEngine.Events;
using System;

public class DateEvent : UnityEvent<regularCellController> {}

public class calendarGridController : MonoBehaviour {

    /*
	void Start () {
        Configure(DateTime.Today, true);
    }
    */


    public GameObject placeholderCell;
    public GameObject dummyCell;
    public GameObject regularCell;

    private DateTime selectedDate;
    private DateTime displayingDate;
    private bool dummyOffset = false;
    private regularCellController currentlySelected;

    //API
    public void Configure(DateTime date, bool stackMode) {
        selectedDate = date;
        displayingDate = new DateTime(selectedDate.Year, selectedDate.Month, 1);
        dummyOffset = stackMode;
        Populate();
    }
    public DateTime GetSelectedDate() {
        return selectedDate;
    }
    public DateTime GetDisplayingDate() {
        return displayingDate;
    }
    public void NextMonth() {
        Drop();
        displayingDate = displayingDate.AddMonths(1);
        Populate();
        onViewingChanged.Invoke();
    }
    public void PrevMonth() {
        Drop();
        displayingDate = displayingDate.AddMonths(-1);
        Populate();
        onViewingChanged.Invoke();
    }
    public UnityEvent onChanged = new UnityEvent();
    public UnityEvent onViewingChanged = new UnityEvent();

    private void Populate() {

        //displayingDate = new DateTime(selectedDate.Year,selectedDate.Month,1);

        int daysInMont = DateTime.DaysInMonth(displayingDate.Year, displayingDate.Month);
        int lastDayOfPrevious = DateTime.DaysInMonth(displayingDate.AddMonths(-1).Year, displayingDate.AddMonths(-1).Month);
        int firstDayPosition = (int)displayingDate.DayOfWeek;
        int frontOffset = 0;
        int totalCells = 0;
        int rearOffset = 0;

        GameObject offsetModel = placeholderCell;

        if (dummyOffset) offsetModel = dummyCell;

        if (firstDayPosition > 0) frontOffset = firstDayPosition - 1;
        for (int i = 0; i < frontOffset; i++) {
            GameObject placeholder = Instantiate(offsetModel) as GameObject;
            placeholder.transform.SetParent(transform);
            if (dummyOffset) placeholder.GetComponent<commonCellController>().Set(new DateTime(displayingDate.Year,displayingDate.AddDays(-1).Month,lastDayOfPrevious - frontOffset + i + 1));

            totalCells++;
        };

        for (int i = 1; i <= daysInMont; i++) {
            GameObject cell = Instantiate(regularCell) as GameObject;
            cell.transform.SetParent(transform);

            regularCellController cellController = cell.GetComponent<regularCellController>();
            cellController.Set(new DateTime(displayingDate.Year, displayingDate.Month, i));

            cellController.onDateChanged.AddListener(APIFireOnChanged);

            if ((displayingDate.Month == selectedDate.Month) &&
                (displayingDate.Year == selectedDate.Year) &&
                (i == selectedDate.Day)) {
                currentlySelected = cellController;
                currentlySelected.button.interactable = false;
            };



            totalCells++;
        };

        if (dummyOffset) rearOffset = 42 - totalCells;
        else {
            if (totalCells < 35) rearOffset = 35 - totalCells;
            else rearOffset = 42 - totalCells;
        };

        for (int i = 0; i < rearOffset; i++) {
            GameObject placeholder = Instantiate(offsetModel) as GameObject;
            placeholder.transform.SetParent(transform);

            if (dummyOffset) placeholder.GetComponent<commonCellController>().Set(new DateTime(displayingDate.Year,displayingDate.Month,i+1));
        };
    }

    private void Drop() {
        currentlySelected = null;
        foreach (Transform child in transform) {
            Destroy(child.gameObject);
        };
    }

    private void APIFireOnChanged(regularCellController cell) {
        if (currentlySelected != null) currentlySelected.button.interactable = true;
        currentlySelected = cell;
        currentlySelected.button.interactable = false;
        selectedDate = currentlySelected.date;
        onChanged.Invoke();
    }

}
