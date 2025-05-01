"use client";
import { Box } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";

const LanguageDisplay = ({ fileType }) => {
    const displayedLanguage = Object.keys(LANGUAGE_VERSIONS).find(
        (lang) => LANGUAGE_VERSIONS[lang] === fileType
    ) || fileType || "Unknown";

    return (
        <Box className="flex items-center bg-gray-800 bg-opacity-40 px-2 py-1 rounded-md">
            <p className="mr-2 text-gray-300 text-sm">Language:</p>
            <span className="text-white text-sm">{displayedLanguage}</span>
        </Box>
    );
};

export default LanguageDisplay;