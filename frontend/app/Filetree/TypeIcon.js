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
    const invertedLanguages = ["md", "rs", "sh"]; // Add the extensions for the languages to invert
    const invertIcon = invertedLanguages.includes(extension.toLowerCase()); // Check if the current extension should be inverted

    // Conditional rendering based on file extension
    if (droppable) {
        return <Folder width={"15px"} />;
    }

    const iconStyle = invertIcon ? { filter: 'invert(1)' } : {}; // Inline style for inversion

    switch (extension.toLowerCase()) {
        case "js":
            return <JavascriptOriginal width={"15px"} style={iconStyle} />;
        case "jsx":
            return <ReactOriginal width={"15px"} style={iconStyle} />;
        case "ts":
            return <TypescriptOriginal width={"15px"} style={iconStyle} />;
        case "tsx":
            return <ReactOriginal width={"15px"} style={iconStyle} />;

        case "html":
            return <Html5Original width={"15px"} style={iconStyle}  />;

        case "css":
            return <Css3Original width={"15px"} style={iconStyle}  />;

        case "json":
            return <JsonOriginal width={"15px"} style={iconStyle}  />;

        case "md":
        case "markdown":
            return <MarkdownOriginal width={"15px"} style={iconStyle}  />;

        case "py":
            return <PythonOriginal width={"15px"} style={iconStyle}  />;

        case "java":
            return <JavaOriginal width={"15px"} style={iconStyle}  />;

        case "php":
            return <PhpOriginal width={"15px"} style={iconStyle}  />;

        case "rb":
        case "ruby":
            return <RubyOriginal width={"15px"} style={iconStyle}  />;

        case "cs":
            return <CsharpOriginal width={"15px"} style={iconStyle}  />;

        case "c":
        case "cpp":
            return <COriginal width={"15px"} style={iconStyle}  />;

        case "go":
            return <GoOriginal width={"15px"} style={iconStyle}  />;

        case "rs":
            return <RustOriginal width={"15px"} style={iconStyle}  />;

        case "kt":
        case "kts":
            return <KotlinOriginal width={"15px"} style={iconStyle}  />;

        case "swift":
            return <SwiftOriginal width={"15px"} style={iconStyle}  />;

        case "dockerfile":
        case "docker":
            return <DockerOriginal width={"15px"} style={iconStyle}  />;

        case "sh":
            return <BashOriginal width={"15px"} style={iconStyle}  />;

        case "scala":
            return <ScalaOriginal width={"15px"} style={iconStyle}  />;

        case "lua":
            return <LuaOriginal width={"15px"} style={iconStyle}  />;

        case "yaml":
        case "yml":
            return <YamlOriginal width={"15px"} style={iconStyle}  />;

        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "bmp":
        case "svg":
            return <FileImage width={"15px"} style={iconStyle}  />;

        // Default file icon for other cases
        default:
            return <File width={"15px"} style={iconStyle}  />;
    }
};
