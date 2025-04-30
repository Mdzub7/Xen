"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import Chat from "@/components/Chat";
import Editor from "@/components/Editor";
import SearchBar from "@/components/Searchbar";
import { MessageCircle, Menu, PanelLeftOpen, Code, Play } from "lucide-react"; 
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
      
      {/* Header */}
      <header className="workspace-header flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="workspace-logo">Xen.ai</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors px-3">Dashboard</Link>
          <Link href="/workspace" className="text-sm text-gray-300 hover:text-white transition-colors px-3">Workspace</Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* File Panel Toggle */}
        <button
          className="absolute top-3 left-4 z-20 p-1.5 hover:bg-gray-800 rounded-md"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
            <PanelLeftOpen 
              size={20} 
              className="text-gray-400 hover:text-white transition-colors"
            />
        </button> 

        {/* Left Side - File & Folder Panel */}
        <nav
          className={`workspace-nav transition-all duration-300 ${
            isNavOpen ? "w-[18%]" : "w-0"
          } overflow-hidden flex flex-col h-full`}
        >
          <div className="py-3 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider mt-6">FILE EXPLORER</div>
          {isNavOpen && (
              <NavPanel workspaceId={workspaceId} openFile={setSelectedFile} />
          )}
        </nav>

        {/* Main - Editor Content */}
        <main className="flex-1 h-full flex flex-col py-2 overflow-auto">
          <div className="flex h-[6%] gap-12 items-center justify-between px-6 mb-2">
            <h1 className="text-xl font-medium">Workspace: <span className="text-indigo-400 font-mono">{workspaceName}</span></h1>
            <div className="flex items-center gap-4">
                <div className="workspace-button flex items-center gap-2 px-3 py-1.5"> 
                  <SearchBar workspaceId={workspaceId} /> 
                </div>
                <button className="workspace-button-primary flex items-center gap-2 px-4 py-1.5 rounded-md">
                  <Play size={16} />
                  Run Code
                </button>
                <div className="workspace-button px-3 py-1.5 rounded-md flex items-center justify-center gap-2">
                  <ShowMembers workspaceId={workspaceId} />
                </div>
            </div>
          </div>

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
