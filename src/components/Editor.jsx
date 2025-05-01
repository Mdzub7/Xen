"use client";
import { Moon, Sun, Sparkles, Wrench, File, Expand, Shrink, Settings } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import axios from "axios";
import LanguageDisplay from "./LanguageSelector";
import { Box } from "@chakra-ui/react";
import Output from "./Output";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

// Keep boilerplates in a separate file to improve code organization
const BOILERPLATES = {
  'javascript': "// JavaScript code snippet\nconsole.log('Hello, world!');",
  'python': "# Python code snippet\nprint('Hello, world!')",
  'typescript': "// TypeScript code snippet\nconst message: string = 'Hello, world!';\nconsole.log(message);",
  'java': "// Java code snippet\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, world!\");\n  }\n}",
  'csharp': "// C# code snippet\nusing System;\n\npublic class Program\n{\n  public static void Main(string[] args)\n  {\n    Console.WriteLine(\"Hello, world!\");\n  }\n}",
  'cpp': "// C++ code snippet\n#include <iostream>\n\nint main() {\n  std::cout << \"Hello, world!\" << std::endl;\n  return 0;\n}",
  'go': "// Go code snippet\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n  fmt.Println(\"Hello, world!\")\n}",
  'html': "<!DOCTYPE html>\n<html>\n<head>\n<title>My First Webpage</title>\n</head>\n<body>\n\n<h1>Hello World!</h1>\n\n<p>This is my first webpage.</p>\n\n</body>\n</html>",
  'markdown': "# Markdown code snippet\n\n## Heading 2\n\nThis is a paragraph.",
  'text': "Plain Text",
};

// Define a direct mapping of file extensions to language identifiers
const EXTENSION_TO_LANGUAGE = {
  js: 'javascript',
  jsx: 'javascriptreact',
  py: 'python',
  ts: 'typescript',
  tsx: 'typescriptreact',
  java: 'java',
  cs: 'csharp',
  cpp: 'cpp',
  c: 'cpp',
  go: 'go',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
};

export default function CodeEditor({ file }) {
  // State management
  const [selectedTheme, setSelectedTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedCode, setUpdatedCode] = useState("");
  const [isFixing, setIsFixing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  
  // Refs
  const monaco = useMonaco();
  const timeoutRef = useRef(null);
  const editorRef = useRef();
  const settingsRef = useRef(null);
  const isInitialMount = useRef(true);
  const hasAppliedBoilerplate = useRef(false);

  // Detect language based on file extension
  useEffect(() => {
    // Reset boilerplate flag when file changes
    hasAppliedBoilerplate.current = false;
    
    if (!file?.name) {
      setCodeLanguage("javascript");
      setUpdatedCode("// Select a file to start coding...");
      return;
    }
    
    const parts = file.name.split(".");
    if (parts.length > 1) {
      const extension = parts.pop().toLowerCase();
      const detectedLanguage = EXTENSION_TO_LANGUAGE[extension] || extension;
      setCodeLanguage(detectedLanguage);
      
      // Fetch file content (boilerplate logic is inside fetchFileContent)
      fetchFileContent(detectedLanguage);
    } else {
      setCodeLanguage("text");
      setUpdatedCode("");
    }
  }, [file?.id]); // Only re-run when file ID changes

  // Apply boilerplate only if the file is empty and it's the first load
  const applyBoilerplate = useCallback((language, existingContent) => {
    if (!existingContent || existingContent.trim() === "") {
      return BOILERPLATES[language] || `// No boilerplate available for ${language}`;
    }
    return existingContent;
  }, []);

  // Fetch file content from Firestore
  const fetchFileContent = useCallback(async (detectedLanguage) => {
    if (!file?.id || !file?.workspaceId) return;
    
    try {
      const filePath = `workspaces/${file.workspaceId}/files`;
      const fileRef = doc(db, filePath, file.id);
      const fileSnap = await getDoc(fileRef);

      if (fileSnap.exists()) {
        const fileData = fileSnap.data();
        // Use whatever content is in Firestore, even if it's an empty string
        const fileContent = fileData.content;
        
        // Check if this is a brand new file that has never had content
        if (fileContent === undefined) {
          // Only apply boilerplate if content is undefined (never set before)
          const boilerplate = BOILERPLATES[detectedLanguage] || `// No boilerplate available for ${detectedLanguage}`;
          setUpdatedCode(boilerplate);
          // Save the boilerplate to Firestore immediately
          await updateDoc(fileRef, { content: boilerplate });
        } else {
          // Use existing content (even if it's empty)
          setUpdatedCode(fileContent || "");
        }
      } else {
        // File document doesn't exist yet, this is a brand new file
        const boilerplate = BOILERPLATES[detectedLanguage] || `// No boilerplate available for ${detectedLanguage}`;
        setUpdatedCode(boilerplate);
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
      // Only set default content as fallback if there's an error
      setUpdatedCode("// Error loading file content");
    }
  }, [file]);

  // Listen for changes to the file content in Firestore
  useEffect(() => {
    if (!file?.id || !file?.workspaceId) return;

    const filePath = `workspaces/${file.workspaceId}/files`;
    const fileRef = doc(db, filePath, file.id);

    // Track if we're currently updating from local changes
    // This prevents applying remote changes while we're still typing
    let isLocalUpdate = false;

    const unsubscribe = onSnapshot(fileRef, (snapshot) => {
      if (snapshot.exists() && !isLocalUpdate) {
        const data = snapshot.data();
        // Only update if the content is different and we're not the source of the change
        if (data.content !== updatedCode) {
          setUpdatedCode(data.content || "");
        }
      }
    });

    return () => unsubscribe();
  }, [file]);

  // Auto-save with debounce
  const handleEditorChange = useCallback((value) => {
    // Always update the local state immediately with whatever the user types
    setUpdatedCode(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce auto-save to reduce Firestore writes
    timeoutRef.current = setTimeout(() => {
      saveToFirestore(value);
    }, 500); // 500ms debounce
  }, []);

  // Save content to Firestore
  const saveToFirestore = useCallback(async (content) => {
    if (!file?.id || !file?.workspaceId) return;
    
    try {
      // Flag to indicate we're making a local update
      window.isLocalUpdate = true;
      
      const filePath = `workspaces/${file.workspaceId}/files`;
      const fileRef = doc(db, filePath, file.id);
      
      // Use setDoc with merge option to handle both new and existing files
      // This prevents errors if the document doesn't exist yet
      await updateDoc(fileRef, { 
        content,
        lastModified: new Date().toISOString() 
      });
      
      // Reset the flag after a short delay
      setTimeout(() => {
        window.isLocalUpdate = false;
      }, 100);
    } catch (error) {
      console.error("Error saving file:", error);
      window.isLocalUpdate = false;
    }
  }, [file]);

  // Editor mount handler
  const onMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  // Generate documentation
  const generateDocs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/generate-documentation", { 
        code: updatedCode, 
        language: codeLanguage 
      });
      
      const documentation = res.data.documentation;
      setUpdatedCode((prevCode) => `${prevCode}\n\n${documentation}`);
      
      // Save updated code with documentation
      saveToFirestore(`${updatedCode}\n\n${documentation}`);
    } catch (error) {
      console.error("Failed to generate documentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix syntax errors
  const fixSyntaxErrors = async () => {
    setIsFixing(true);
    try {
      const res = await axios.post("/api/get-errors", { 
        code: updatedCode, 
        codeLanguage 
      });
      
      if (res.data.fixedCode) {
        setUpdatedCode(res.data.fixedCode);
        // Save fixed code
        saveToFirestore(res.data.fixedCode);
      }
    } catch (error) {
      console.error("Failed to fix syntax:", error);
    } finally {
      setIsFixing(false);
    }
  };

  // Toggle expanded mode
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
    // Reflow the editor layout after state update
    setTimeout(() => editorRef.current?.layout(), 100);
  }, []);

  // Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Available themes
  const themes = [
    { name: "Dark", value: "vs-dark" },
    { name: "Light", value: "light" },
    { name: "High Contrast", value: "hc-black" },
  ];

  return (
    <div className={`bg-gray-900 m-2 h-[94%] rounded-xl p-3 ${isExpanded ? "fixed inset-0 z-50 m-0" : "relative"}`}>
      <Box className="relative h-full">
        <div className="flex h-full">
          <Box w={isExpanded ? "100%" : "78%"} transition="all 0.3s ease" className="h-[100%]">
            <div className="flex justify-between items-center h-[10%] pr-12">
              {file && (
                <div className="flex items-center bg-gray-900 text-white px-4 max-h-[50px] rounded-md shadow-md border border-gray-700 w-40">
                  <File size={16} className="mr-2 text-green-400" />
                  <span className="text-sm text-gray-300 line-clamp-1">{file.name}</span>
                </div>
              )}
              <div className="flex gap-3 items-center">
                <button
                  onClick={toggleExpand}
                  className="flex items-center justify-center p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {isExpanded ? <Shrink size={18} /> : <Expand size={18} />}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-center p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={fixSyntaxErrors}
                  disabled={isFixing}
                  className="flex items-center justify-center p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Wrench size={18} />
                </button>
                <button
                  onClick={generateDocs}
                  disabled={isLoading}
                  className="flex items-center justify-center p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Sparkles size={18} />
                </button>
              </div>
              <LanguageDisplay fileType={codeLanguage} />
            </div>
            
            {/* Settings Panel */}
            {showSettings && (
              <div 
                ref={settingsRef}
                className="absolute top-16 right-4 bg-gray-800 p-4 rounded-md shadow-xl border border-gray-700 z-10"
              >
                <h3 className="text-gray-300 mb-2">Settings</h3>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-gray-400 text-sm">Theme</label>
                    <div className="flex gap-2 mt-1">
                      {themes.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setSelectedTheme(theme.value)}
                          className={`px-2 py-1 rounded-md text-xs ${
                            selectedTheme === theme.value
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Font Size</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
                        className="px-2 py-1 rounded-md bg-gray-700 text-gray-300"
                      >
                        -
                      </button>
                      <span className="text-gray-300">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
                        className="px-2 py-1 rounded-md bg-gray-700 text-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Editor
              height={isExpanded ? "calc(100vh - 100px)" : "92%"}
              theme={selectedTheme}
              language={codeLanguage}
              value={updatedCode}
              onMount={onMount}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                wordWrap: "on",
                minimap: { enabled: false },
                bracketPairColorization: true,
                suggest: { preview: true },
                inlineSuggest: {
                  enabled: true,
                  showToolbar: "onHover",
                  mode: "subword",
                  suppressSuggestions: false,
                },
                quickSuggestions: { other: true, comments: true, strings: true },
                suggestSelection: "recentlyUsed",
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                formatOnPaste: true,
                formatOnType: true,
                scrollBeyondLastLine: false,
              }}
            />
          </Box>
          {!isExpanded && <Output editorRef={editorRef} language={codeLanguage} />}
        </div>
      </Box>
    </div>
  );
}