import React from "react";
import { Folder, File, FileImage } from "lucide-react"; // Lucide icons
import {
    JavascriptOriginal,
    Html5Original,
    Css3Original,
    JsonOriginal,
    MarkdownOriginal,
    TypescriptOriginal,
    ReactOriginal,
    PythonOriginal,
    JavaOriginal,
    PhpOriginal,
    RubyOriginal,
    CsharpOriginal,
    COriginal,
    GoOriginal,
    RustOriginal,
    KotlinOriginal,
    SwiftOriginal,
    DockerOriginal,
    BashOriginal,
    ScalaOriginal,
    LuaOriginal,
    YamlOriginal
} from 'devicons-react'; // Icons from devicons-react

export const TypeIcon = (props) => {
    const { droppable, extension } = props;

    // Conditional rendering based on file extension
    if (droppable) {
        return <Folder width={"15px"} />;
    }

    switch (extension.toLowerCase()) {
        case "js":
            return <JavascriptOriginal width={"15px"} />;
        case "jsx":
            return <ReactOriginal width={"15px"} />;
        case "ts":
            return <TypescriptOriginal width={"15px"} />;
        case "tsx":
            return <ReactOriginal width={"15px"} />;

        case "html":
            return <Html5Original width={"15px"} />;

        case "css":
            return <Css3Original width={"15px"} />;

        case "json":
            return <JsonOriginal width={"15px"} />;

        case "md":
        case "markdown":
            return <MarkdownOriginal width={"15px"} />;

        case "py":
            return <PythonOriginal width={"15px"} />;

        case "java":
            return <JavaOriginal width={"15px"} />;

        case "php":
            return <PhpOriginal width={"15px"} />;

        case "rb":
        case "ruby":
            return <RubyOriginal width={"15px"} />;

        case "cs":
            return <CsharpOriginal width={"15px"} />;

        case "c":
        case "cpp":
            return <COriginal width={"15px"} />;

        case "go":
            return <GoOriginal width={"15px"} />;

        case "rs":
            return <RustOriginal width={"15px"} />;

        case "kt":
        case "kts":
            return <KotlinOriginal width={"15px"} />;

        case "swift":
            return <SwiftOriginal width={"15px"} />;

        case "dockerfile":
        case "docker":
            return <DockerOriginal width={"15px"} />;

        case "sh":
            return <BashOriginal width={"15px"} />;

        case "scala":
            return <ScalaOriginal width={"15px"} />;

        case "lua":
            return <LuaOriginal width={"15px"} />;

        case "yaml":
        case "yml":
            return <YamlOriginal width={"15px"} />;

        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "bmp":
        case "svg":
            return <FileImage width={"15px"} />;

        // Default file icon for other cases
        default:
            return <File width={"15px"} />;
    }
};
