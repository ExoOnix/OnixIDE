import React from "react";
import { TypeIcon } from "./TypeIcon";
import "./CustomDragPreview.css";

export const CustomDragPreview = (props) => {
    const item = props.monitorProps.item;

    return (
        <div className="dragPreviewRoot">
            <div className="dragPreviewIcon">
                <TypeIcon droppable={item.droppable} />
            </div>
            <div className="dragPreviewLabel">{item.text}</div>
        </div>
    );
};
