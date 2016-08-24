using SMA.models;
using System;
using UnityEngine.Events;

public class calendarController : UI {
    public headerController header;
    public calendarGridController grid;
    public UnityEvent onChange = new UnityEvent();
    private DateTime displayingDate = DateTime.Now;
    private DateTime date = DateTime.Now;
    private void RefreshCaption() {
        displayingDate = grid.GetDisplayingDate();
        header.SetCaption(displayingDate.ToString("MM.yyyy"));
    }
    private void SelectDate() {
        date = grid.GetSelectedDate();
        SetVariableValue("date", date.ToString("dd.MM.yyyy"));
        onChange.Invoke();
    }
    private void Build() {
        header.Configure(grid.NextMonth, grid.PrevMonth, displayingDate.ToString("MM.yyyy"));
        grid.Configure(displayingDate, false);
        grid.onViewingChanged.AddListener(RefreshCaption);
        grid.onChanged.AddListener(SelectDate);
    }
    public override void Set(bool update) {
        base.Set(update);
        bool sucsess = false;
        sucsess = DateTime.TryParse((string)GetVariable("date"), out date);
        if (!sucsess)
            date = DateTime.Now;
        displayingDate = date;
        Build();
        if (!update) {
            onChange.RemoveAllListeners();
            onChange.AddListener(GetAction("onChange"));
        };
    }
}