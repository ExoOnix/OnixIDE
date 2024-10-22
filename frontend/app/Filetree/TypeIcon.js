import React from "react";
import { Folder, File } from "lucide-react";

export const TypeIcon = (props) => {
    return props.droppable ? <Folder width={"15px"} /> : <File width={"15px"} />;
};
