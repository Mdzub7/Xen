"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import Chat from "@/components/Chat";
import Editor from "@/components/Editor";
import SearchBar from "@/components/Searchbar";
import { MessageCircle, Menu, PanelLeftOpen, Code, Play, Search, Settings, LayoutDashboard, PlusCircle, Folder } from "lucide-react"; 
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
            onClick={() => setIsNavOpen(!isNavOpen)}
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
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </nav>

        {/* File Explorer Panel */}
        <div
          className={`transition-all duration-300 bg-gray-900 border-r border-gray-800 ${
            isNavOpen ? "w-[250px]" : "w-0"
          } overflow-hidden`}
        >
          {isNavOpen && (
            <div className="flex flex-col h-full">
              <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">File Explorer</h2>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg transition-all">
                      <PlusCircle size={16} className="text-white" />
                    </button>
                    <button className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-lg transition-all">
                      <Folder size={16} className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <NavPanel workspaceId={workspaceId} openFile={setSelectedFile} />
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
