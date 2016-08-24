using SMA.models;
using UnityEngine;
using UnityEngine.UI;

public class gridLayoutController : UI {
    public GridLayoutGroup grid;
    public override void Set(bool update) {
        base.Set(update);
        RectOffset padding = new RectOffset();
        padding.bottom = (int)GetVariable("paddingBottom");
        padding.top = (int)GetVariable("paddingTop");
        padding.left = (int)GetVariable("paddingLeft");
        padding.right = (int)GetVariable("paddingRight");
        Vector2 cellSize = new Vector2();
        cellSize.x = (float)GetVariable("cellSizeX");
        cellSize.y = (float)GetVariable("cellSizeY");
        Vector2 spacing = new Vector2();
        spacing.x = (float)GetVariable("spacingX");
        spacing.y = (float)GetVariable("spacingY");
        grid.padding = padding;
        grid.cellSize = cellSize;
        grid.spacing = spacing;

        grid.startCorner = (GridLayoutGroup.Corner)(int)GetVariable("startCorner");
        grid.startAxis = (GridLayoutGroup.Axis)(int)GetVariable("startAxis");
        grid.childAlignment = (TextAnchor)(int)GetVariable("childAlignment");
        grid.constraint = (GridLayoutGroup.Constraint)(int)GetVariable("constraint");
        grid.constraintCount = (int)GetVariable("constraintCount");

    }
}