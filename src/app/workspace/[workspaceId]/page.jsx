"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import Chat from "@/components/Chat";
import Editor from "@/components/Editor";
import SearchBar from "@/components/Searchbar";
import { MessageCircle, Menu, PanelLeftOpen, Code, Play, Search, Settings, LayoutDashboard, PlusCircle, Folder, X } from "lucide-react"; 
import Header from "@/components/Header";
import ShowMembers from "@/components/Members";
import LiveCursor from "@/components/LiveCursor";
import NavPanel from "@/components/Navpanel";
import Link from "next/link";

const Workspace = () => {
  const { workspaceId } = useParams();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic here
  };


  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;

      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);

      if (workspaceSnap.exists()) {
        const workspaceData = workspaceSnap.data();
        setWorkspaceName(workspaceData.name);

        const membersRef = collection(db, `workspaces/${workspaceId}/members`);
        const membersSnap = await getDocs(membersRef);
        setMembersCount(membersSnap.size);
      } else {
        console.error("Workspace not found");
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    console.log("🔄 Parent re-rendered!");
  });

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white min-w-[1024px] relative">
      <Header workspaceId={workspaceId} workspaceName={workspaceName} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side Navigation Panel */}
        <nav className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-4">
          <button
            className={`p-2 rounded-lg transition-all ${isNavOpen ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => {
              setIsNavOpen(!isNavOpen);
              setIsSearchOpen(false);
              setIsSettingsOpen(false);
            }}
            title="Toggle Explorer"
          >
            <Code size={20} />
          </button>
          <Link href="/dashboard">
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              title="Dashboard"
            >
              <LayoutDashboard size={20} />
            </button>
          </Link>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="AI Chat"
          >
            <MessageCircle size={20} />
          </button>
          <button
            className={`p-2 rounded-lg transition-all ${isSearchOpen ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsNavOpen(false);
              setIsSettingsOpen(false);
            }}
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            className={`p-2 rounded-lg transition-all ${isSettingsOpen ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsNavOpen(false);
              setIsSearchOpen(false);
            }}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </nav>

        {/* File Explorer/Search/Settings Panel */}
        <div
          className={`transition-all duration-300 bg-gray-900 border-r border-gray-800 ${(
            isNavOpen || isSearchOpen || isSettingsOpen) ? "w-[250px]" : "w-0"
          } overflow-hidden`}
        >
          {isNavOpen && (
            <NavPanel workspaceId={workspaceId} openFile={setSelectedFile} />
          )}
          {isSearchOpen && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Search Files</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          )}
          {isSettingsOpen && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Workspace Settings</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">Theme</label>
                  <select className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">Font Size</label>
                  <select className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Auto Save</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main - Editor Content */}
        <main className="flex-1 h-full flex flex-col overflow-auto">


          <Editor file={selectedFile} />
        </main>
      </div>

      {/* Chat Panel (Overlapping from Bottom) */}
      <aside
        className={`fixed bottom-0 right-0 transition-all duration-300 shadow-lg ${
          isChatOpen ? "h-[82%]" : "h-0"
        } overflow-hidden w-[45%]`}
      >
        {isChatOpen && (
            <Chat workspaceId={workspaceId} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
        )}
      </aside>

      {/* Chat Toggle Button */}
      {
        !isChatOpen && (
            <button
              className="ai-chat-button fixed bottom-6 right-10 z-30 py-2.5 px-5 flex items-center gap-2 text-white rounded-full shadow-lg"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
             <MessageCircle className="h-5 w-5" /> AI-Chat
          </button>
        )
      }
      <LiveCursor workspaceId={workspaceId} />
    </div>
  );
};

export default Workspace;
