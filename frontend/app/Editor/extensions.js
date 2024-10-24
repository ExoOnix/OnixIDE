// loadLanguageExtensions.js
import { langs } from '@uiw/codemirror-extensions-langs';

export const loadLanguageExtensions = (filename) => {
    const ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

    switch (ext) {
        case 'js':
        case 'mjs':
        case 'jsx':
            return [langs.javascript()];

        case 'ts':
        case 'tsx':
            return [langs.typescript()];

        case 'md':
        case 'markdown':
            return [langs.markdown()];

        case 'yaml':
        case 'yml':
            return [langs.yaml()];

        case 'json':
            return [langs.json()];

        case 'py':
            return [langs.python()];

        case 'java':
            return [langs.java()];  // Assuming you have a Java lang extension

        case 'php':
            return [langs.php()];    // Assuming you have a PHP lang extension

        case 'rb':
        case 'ruby':
            return [langs.ruby()];   // Assuming you have a Ruby lang extension

        case 'cs':
        case 'c':
        case 'cpp':
            return [langs.cpp()];    // Assuming you have a C/C++ lang extension

        case 'go':
            return [langs.go()];

        case 'rs':
            return [langs.rust()];   // Assuming you have a Rust lang extension

        case 'kt':
        case 'kts':
            return [langs.kotlin()]; // Assuming you have a Kotlin lang extension

        case 'swift':
            return [langs.swift()];   // Assuming you have a Swift lang extension

        case 'dockerfile':
        case 'docker':
            return [langs.docker()];  // Assuming you have a Docker lang extension

        case 'sh':
            return [langs.shell()];   // Assuming you have a Shell lang extension

        case 'scala':
            return [langs.scala()];    // Assuming you have a Scala lang extension

        case 'lua':
            return [langs.lua()];      // Assuming you have a Lua lang extension

        case 'html':
            return [langs.html()];

        case 'css':
            return [langs.css()];

        case 'scss':
            return [langs.sass()];

        // Add any additional languages as needed

        default:
            return [];
    }
};
