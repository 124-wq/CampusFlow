import React, { useState, useEffect, useRef } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { 
  BookOpen, LayoutDashboard, BrainCircuit, Upload, 
  MessageSquare, Search, FileText, Award, ChevronLeft, Send, Globe, MoreVertical, Paperclip, Smile, X, HardDrive, Star, Sparkles, Heart, CloudUpload, Cpu
} from 'lucide-react';
import axios from 'axios';
const API_BASE = "http://54.227.118.150:8000";
const disciplines = [
  { id: 1, name: 'B.Tech / B.E', branches: ['CSE', 'IT', 'ECE', 'ME', 'Civil'], color: 'from-purple-300 to-indigo-300' },
  { id: 2, name: 'BCA / MCA', branches: ['Full Stack', 'Cloud', 'Cyber', 'Data Science'], color: 'from-pink-300 to-rose-300' },
  { id: 3, name: 'Applied Sciences', branches: ['Biotech', 'Physics', 'Forensic'], color: 'from-teal-200 to-emerald-300' },
  { id: 4, name: 'MBA / BBA', branches: ['Finance', 'Marketing', 'HR'], color: 'from-orange-200 to-orange-400' },
  { id: 5, name: 'Law', branches: ['Corporate', 'Criminal', 'Civil'], color: 'from-blue-300 to-cyan-300' }
];function CampusDashboard({ signOut, user }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('browse'); 
  const [selectedDegree, setSelectedDegree] = useState(disciplines[0].name);
  const [selectedBranch, setSelectedBranch] = useState(disciplines[0].branches[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cloudFiles, setCloudFiles] = useState([]);
  const [karma, setKarma] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [communityPosts, setCommunityPosts] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Smart Search States
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  const [isCreatingHub, setIsCreatingHub] = useState(false);
  const [hubName, setHubName] = useState("");
  const [hubPass, setHubPass] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isGroupUnlocked, setIsGroupUnlocked] = useState(false);
  const [groupPasswordInput, setGroupPasswordInput] = useState("");
  const [uiStatus, setUiStatus] = useState(""); 
  const [availableHubs, setAvailableHubs] = useState([]);
  const [activeJoinedHub, setActiveJoinedHub] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHubInfo, setShowHubInfo] = useState(false); 
  const [securityToken, setSecurityToken] = useState(Math.random()); 
  const fileInputRef = useRef(null); 

  const userEmail = user?.signInDetails?.loginId || "Student";

  const refreshHubsList = async () => {
    try {
      const res = await fetch(`${API_BASE}/list-branch-groups/${encodeURIComponent(selectedBranch)}`);
      const data = await res.json();
      setAvailableHubs(data.groups || []);
    } catch (e) { console.error("Sync error"); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const p = await fetch(`${API_BASE}/user-profile/${encodeURIComponent(userEmail)}`);
        const data = await p.json();
        setKarma(data.karma || 0);
        const l = await fetch(`${API_BASE}/leaderboard`);
        setLeaderboard(await l.json());
      } catch (e) { console.error("Init failed"); } finally { setIsLoading(false); }
    };
    init();
  }, [userEmail]);

  useEffect(() => {
    if (activeTab === 'community') refreshHubsList();
    if (activeTab === 'library' && viewMode === 'files') fetchFiles(selectedDegree, selectedBranch);
  }, [selectedBranch, activeTab, viewMode]);

  const fetchFiles = async (deg, br) => {
    try {
      const r = await fetch(`${API_BASE}/list-files?degree=${encodeURIComponent(deg)}&branch=${encodeURIComponent(br)}`);
      const d = await r.json(); 
      setCloudFiles(Array.isArray(d.files) ? d.files : []);
    } catch (e) { setCloudFiles([]); }
  };
  

  const handleTopicSearch = async () => {
    if (!searchQuery.trim()) return alert("Write something sweet! ✨");
    setSearchLoading(true);
    setSearchProgress(10);
    try {
      setSearchProgress(40);
      // Calling the new Smart Search Backend Endpoint
      const res = await fetch(`${API_BASE}/smart-search?query=${encodeURIComponent(searchQuery)}&branch=${encodeURIComponent(selectedBranch)}`);
      setSearchProgress(80);
      const data = await res.json();
      // Update the file list with relevant search results
      setCloudFiles(data.results || []);
      setSearchProgress(100);
    } catch (e) { alert("Scan error 🎀"); } finally {
      setTimeout(() => {
        setSearchLoading(false);
        setSearchProgress(0);
      }, 500);
    }
  };

  const handleAiAnalysis = async () => {
    if (!chatMessage.trim() || !file?.filename) return;
    setAiResponse("Bifurcating Neural Context... 🧠");
    try {
      const res = await fetch(`${API_BASE}/ask-campus?question=${encodeURIComponent(chatMessage)}&filename=${encodeURIComponent(file.filename)}`);
      const data = await res.json(); 
      setAiResponse(data.answer || data.error);
    } catch (err) { setAiResponse("System Fault 🌸"); }
  };

  const handleUpload = async () => {
    const selectedFile = fileInputRef.current?.files[0];
    if (!selectedFile) return alert("Pick packet first! 📎");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setUiStatus("☁️ Ingressing to S3...");
      const res = await axios.post(
        `${API_BASE}/upload?email=${encodeURIComponent(userEmail)}&degree=${selectedDegree}&branch=${selectedBranch}`,
        formData,
        { onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)) }
      );
      if (res.data.new_karma) {
    // --- SYNC FIX: Re-fetch profile and leaderboard to update UI ---
    const profileRes = await fetch(`${API_BASE}/user-profile/${encodeURIComponent(userEmail)}`);
    const updatedData = await profileRes.json();
    setKarma(updatedData.karma); 

    const leadRes = await fetch(`${API_BASE}/leaderboard`);
    setLeaderboard(await leadRes.json());
    
    setUiStatus("✨ +50 XP Synced!");
    setUploadProgress(0);
}
    } catch (e) { setUiStatus("❌ Link Fault."); setUploadProgress(0); }
  };

  const handleCreateHub = async () => {
    if (!hubName || !hubPass) return setUiStatus("🎀 Incomplete credentials!");
    try {
      const res = await fetch(`${API_BASE}/create-group?name=${encodeURIComponent(hubName)}&branch=${encodeURIComponent(selectedBranch)}&password=${encodeURIComponent(hubPass)}&creator=${encodeURIComponent(userEmail)}`, { method: 'POST' });
      const data = await res.json();
      if (data.invite_link) { setInviteLink(data.invite_link); setUiStatus("Establishment OK!"); refreshHubsList(); }
    } catch (e) { setUiStatus("❌ Error."); }
  };

const handleUnlockHub = async (hub) => {
  try {
    const res = await fetch(`${API_BASE}/verify-group-access?invite_code=${hub.invite_code}&password=${groupPasswordInput}`, { method: 'POST' });
    const data = await res.json();
    
    if (data.authorized) {
      setIsGroupUnlocked(true);
      setActiveJoinedHub(hub);
      
      // NEW: Fetch persistent history from the database
      const msgRes = await fetch(`${API_BASE}/get-messages/${hub.invite_code}`);
      const history = await msgRes.json();
      setCommunityPosts(history); 
      
      setGroupPasswordInput("");
    }
  } catch (e) { console.error("History sync failed"); }
};
  const handleFileShare = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setCommunityPosts([...communityPosts, {
 sender: userEmail,
 text: `📄 Shared: ${selectedFile.name}`,
 invite_code: activeJoinedHub.invite_code,
 isMedia: true
}]);
    }
  };

  const transmitMessage = async () => {
  <button onClick={transmitMessage}
className="bg-purple-400 p-8 rounded-full text-white hover:bg-purple-500 transition-all shadow-2xl shadow-purple-100 active:scale-90">
<Send size={32}/>
</button>

  const newPost = { 
    invite_code: activeJoinedHub.invite_code, 
    sender: userEmail, 
    text: chatMessage 
  };

  try {
    // Save to database so others can see it
    await axios.post(`${API_BASE}/send-message?invite_code=${newPost.invite_code}&sender=${newPost.sender}&text=${encodeURIComponent(newPost.text)}`);
    
    // Update local UI immediately
    setCommunityPosts([...communityPosts, newPost]);
    setChatMessage("");
  } catch (e) { alert("Message delivery failed 🎀"); }
};

  if (isLoading) return <div className="min-h-screen bg-[#fdf2ff] flex flex-col items-center justify-center text-purple-400 font-black animate-pulse uppercase tracking-[0.3em]">🎀 Booting Scholastic OS...</div>;

  return (
    <div className="min-h-screen bg-[#fdf2ff] text-slate-600 flex font-sans selection:bg-purple-200 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200 blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* CUTESY SIDEBAR */}
      <nav className="w-72 bg-white/80 backdrop-blur-xl p-8 flex flex-col border-r border-purple-100 shadow-xl z-50 rounded-r-[4rem]">
        <h1 className="text-2xl font-black text-purple-400 mb-12 flex gap-3 items-center italic tracking-tighter uppercase"><Sparkles size={26} className="text-pink-400 fill-pink-200 animate-bounce"/> CampusFlow</h1>
        <div className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-4 w-full p-5 rounded-[2.5rem] font-bold transition-all border-b-4 ${activeTab === 'dashboard' ? 'bg-purple-400 text-white border-purple-600 shadow-lg' : 'hover:bg-purple-50 border-transparent text-purple-300'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => {setActiveTab('library'); setViewMode('browse');}} className={`flex items-center gap-4 w-full p-5 rounded-[2.5rem] font-bold transition-all border-b-4 ${activeTab === 'library' ? 'bg-purple-400 text-white border-purple-600 shadow-lg' : 'hover:bg-purple-50 border-transparent text-purple-300'}`}><Search size={20}/> Library</button>
          <button onClick={() => {setActiveTab('community'); setIsGroupUnlocked(false); setActiveJoinedHub(null); refreshHubsList(); setSecurityToken(Math.random());}} className={`flex items-center gap-4 w-full p-5 rounded-[2.5rem] font-bold transition-all border-b-4 ${activeTab === 'community' ? 'bg-purple-400 text-white border-purple-600 shadow-lg' : 'hover:bg-purple-50 border-transparent text-purple-300'}`}><MessageSquare size={20}/> Community</button>
          <button onClick={() => setActiveTab('upload')} className={`flex items-center gap-4 w-full p-5 rounded-[2.5rem] font-bold transition-all border-b-4 ${activeTab === 'upload' ? 'bg-purple-400 text-white border-purple-600 shadow-lg' : 'hover:bg-purple-50 border-transparent text-purple-300'}`}><Upload size={20}/> Contribute</button>
        </div>
        <button onClick={signOut} className="mt-auto py-4 bg-rose-50 text-rose-400 font-bold rounded-full border border-rose-100 hover:bg-rose-400 hover:text-white transition-all text-xs uppercase shadow-sm">Terminate👋</button>
      </nav>

      <main className="flex-1 relative overflow-hidden flex flex-col p-6 z-10">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[3rem] border border-purple-50 flex items-center justify-between z-40 shadow-sm mb-6">
           <div className="flex items-center gap-4">
             <button onClick={() => { if(viewMode === 'files') setViewMode('browse'); else setSecurityToken(Math.random()); }} className="p-3 text-purple-300 hover:text-purple-500 transition-colors bg-purple-50 rounded-full shadow-inner"><ChevronLeft size={22}/></button>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 italic underline decoration-purple-100 underline-offset-4">Access Point / {activeTab}</span>
           </div>
           <div className="flex items-center gap-3 bg-pink-50 px-6 py-3 rounded-full border border-pink-100 shadow-sm">
             <Heart size={18} className="text-pink-400 fill-pink-400 animate-pulse" />
             <span className="text-pink-500 font-black text-xs uppercase tracking-tighter italic">{karma} XP SYNCED</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {activeTab === 'dashboard' && (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-top-6">
              <div className="bg-white p-10 rounded-[4rem] border border-purple-100 shadow-xl relative overflow-hidden">
                <h2 className="text-2xl font-black text-purple-400 mb-10 flex items-center gap-3 uppercase italic tracking-tighter">⭐ Scholar Hall</h2>
                {leaderboard.map((u, i) => (
                  <div key={i} className={`flex justify-between py-6 border-b border-purple-50 last:border-0 px-8 rounded-[2rem] transition-all hover:scale-[1.02] ${u.email === userEmail ? 'bg-purple-50 shadow-inner ring-2 ring-purple-100' : ''}`}>
                    <span className="font-bold text-slate-500 uppercase text-xs">⭐ {u.email.split('@')[0]}</span>
                    <span className="text-purple-400 font-black text-xs">{u.karma} pts</span>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-purple-200 via-pink-200 to-rose-200 p-16 rounded-[5rem] shadow-2xl flex flex-col justify-between text-purple-800 relative group overflow-hidden border-4 border-white">
                <Star className="absolute top-12 right-12 w-32 h-32 opacity-20 animate-spin-slow" />
                <h2 className="text-5xl font-black italic tracking-tighter drop-shadow-sm uppercase leading-tight">System Node: <br/>{userEmail.split('@')[0]}</h2>
                <div className="mt-12 bg-white/50 p-12 rounded-[4rem] border border-white shadow-inner text-center backdrop-blur-sm">
                  <p className="text-8xl font-black text-purple-500 tracking-tighter drop-shadow-md">{karma}</p>
                  <p className="text-[11px] uppercase font-black text-purple-400 tracking-[0.3em] mt-6 italic">Verified Network XP ✨</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="p-4 animate-in fade-in">
              {viewMode === 'browse' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-white">
                  {disciplines.map(d => (
                    <div key={d.id} onClick={() => { setSelectedDegree(d.name); setViewMode('files'); fetchFiles(d.name, d.branches[0]); }} className={`bg-gradient-to-br ${d.color} p-12 rounded-[4rem] cursor-pointer hover:rotate-3 hover:scale-[1.05] transition-all shadow-xl h-80 flex flex-col justify-between group border-4 border-white shadow-purple-200`}>
                      <Cpu size={50} className="text-white opacity-60 group-hover:scale-125 transition-all" />
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">{d.name}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div key={selectedBranch}>
                  <div className="flex gap-4 mb-10 bg-white p-8 rounded-[4rem] shadow-sm border border-purple-50 flex-col">
                    <div className="flex gap-4">
                      <input placeholder="SCAN KNOWLEDGE INDEX... ✨" className="flex-1 bg-purple-50 border-none rounded-full py-6 px-10 outline-none text-purple-500 font-bold uppercase text-xs tracking-widest shadow-inner placeholder:text-rose-200" onChange={(e) => setSearchQuery(e.target.value)} />
                      <button onClick={handleTopicSearch} className="bg-purple-400 text-white px-10 rounded-full font-black uppercase text-xs shadow-lg hover:bg-purple-500 transition-all active:scale-95">Search</button>
                      <select className="bg-purple-50 border-none px-10 rounded-full text-xs font-black uppercase text-purple-400 tracking-widest outline-none shadow-inner" value={selectedBranch} onChange={(e) => {setSelectedBranch(e.target.value); fetchFiles(selectedDegree, e.target.value);}}>
                        {disciplines.find(d => d.name === selectedDegree)?.branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    
                    {searchLoading && (
                      <div className="mt-4 p-4 text-center">
                        <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2 animate-pulse">🔍 Searching across campus library... {searchProgress}%</div>
                        <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden shadow-inner border border-purple-100">
                          <div className="bg-gradient-to-r from-purple-400 to-pink-300 h-full transition-all duration-500" style={{ width: `${searchProgress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {cloudFiles.map((f, i) => (
                      <div key={i} className="bg-white p-12 rounded-[5rem] border-b-[12px] border-purple-100 hover:border-purple-300 transition-all group shadow-xl text-center">
                        <FileText className="text-purple-300 mx-auto mb-8 group-hover:scale-110 transition-all group-hover:text-pink-400" size={40} />
                        <h3 className="font-black text-sm truncate mb-10 text-slate-500 uppercase tracking-tighter italic px-4">{f.filename}</h3>
                        <div className="space-y-4">
                           <button onClick={() => { setFile(f); setActiveTab('ai'); setAiResponse(""); }} className="w-full py-5 bg-purple-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 shadow-md shadow-purple-100">AI Ingress ✨</button>
                           {/* DOWNLOAD FIX - Direct Backend Link */}
                           <button onClick={() => window.open(`${API_BASE}/download/${f.filename}`)} className="w-full py-4 bg-pink-50 text-pink-400 rounded-full text-[10px] font-black uppercase border border-pink-100 hover:bg-pink-100 transition-all shadow-sm">Download Packet</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="p-10 max-w-4xl mx-auto animate-in zoom-in-95">
               {!file ? <p className="text-center py-20 text-rose-300 font-black uppercase tracking-widest animate-pulse italic">Select document from Library first ✨</p> : (
                <div className="bg-white p-12 rounded-[4rem] border-4 border-rose-50 shadow-2xl">
                  <div className="flex items-center gap-4 text-rose-400 mb-8 bg-rose-50 p-6 rounded-[2rem] border border-rose-100 shadow-inner">
                    <BrainCircuit className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Neural Engine Node: {file?.filename}</span>
                  </div>
                  <textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Ask Gemma..." className="w-full bg-rose-50 border-none rounded-[2rem] p-8 mb-8 h-48 outline-none focus:ring-4 focus:ring-rose-100 text-rose-600 font-bold text-lg shadow-inner italic" />
                  <button onClick={handleAiAnalysis} className="w-full py-6 bg-rose-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-[1.02] transition-all">Execute Neural Scan</button>
                  {aiResponse && <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border-l-8 border-rose-400 animate-in slide-in-from-top-4 shadow-inner text-slate-600 font-medium whitespace-pre-wrap italic">{aiResponse}</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-4 flex items-center justify-center h-full animate-in slide-in-from-bottom-12">
               <div className="bg-white p-20 rounded-[5rem] border-4 border-purple-50 w-full max-w-2xl text-center shadow-2xl relative overflow-hidden">
                  <Upload size={60} className="mx-auto text-pink-300 mb-10 animate-bounce"/>
                  <h2 className="text-4xl font-black text-purple-400 mb-12 italic uppercase tracking-tighter">Scholastic Injection</h2>
                  <div className="grid grid-cols-2 gap-8 mb-12 text-left text-xs font-black text-purple-300 uppercase tracking-widest">
                    <div className="space-y-3">
                      <p className="pl-6 italic">Degree Sector</p>
                      <select className="bg-purple-50 p-6 w-full rounded-full border-none text-xs font-black uppercase text-purple-400 outline-none shadow-inner" value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)}>
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <p className="pl-6 italic">Target Branch Node</p>
                      <select className="bg-purple-50 p-6 w-full rounded-full border-none text-xs font-black uppercase text-purple-400 outline-none shadow-inner" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                        {disciplines.find(d => d.name === selectedDegree)?.branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  {uploadProgress > 0 && <div className="mb-10 bg-purple-50 rounded-full h-4 overflow-hidden shadow-inner border border-purple-100"><div className="bg-gradient-to-r from-purple-400 to-pink-400 h-full transition-all duration-500" style={{width: `${uploadProgress}%`}}></div></div>}
                  <input type="file" ref={fileInputRef} onChange={(e)=>setFile(e.target.files[0])} className="block w-full text-[11px] font-black text-purple-200 file:mr-6 file:py-4 file:px-12 file:rounded-full file:border-0 file:bg-pink-400 file:text-white file:font-black mb-12 cursor-pointer shadow-sm" />
                  <button onClick={handleUpload} className="w-full py-8 bg-purple-400 text-white font-black rounded-full hover:bg-purple-500 transition-all uppercase tracking-[0.4em] text-xs shadow-xl shadow-purple-100 italic">Initialize Ingress 🧚‍♀️</button>
                  {uiStatus && <p className="mt-8 text-xs font-black text-purple-400 animate-pulse italic uppercase tracking-widest">{uiStatus}</p>}
               </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="flex flex-1 overflow-hidden h-[85vh] rounded-[4rem] shadow-2xl border-8 border-white bg-white">
              <div className="w-80 bg-white border-r border-purple-50 flex flex-col">
                <div className="p-8 flex justify-between items-center h-24 bg-purple-50/50 border-b border-purple-100">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-white flex items-center justify-center font-black text-purple-400 shadow-md border-2 border-purple-100 rotate-12 italic text-xl uppercase">{userEmail[0]}</div>
                  <div className="flex gap-6 text-purple-300">
                    <Globe className="cursor-pointer hover:text-purple-500 transition-all hover:scale-110" size={24} onClick={() => {
                      const link = prompt("PASTE HUB ACCESS KEY: 🗝️");
                      if(link) setUiStatus("⚡ SYNCHRONIZING NODE...");
                    }}/>
                  <MoreVertical size={24} className="cursor-pointer hover:text-purple-500" onClick={() => setShowHubInfo(!showHubInfo)}/>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                  {availableHubs.map((hub, i) => (
                    <div key={i} onClick={() => { 
                      setActiveJoinedHub(hub); setIsGroupUnlocked(false); setGroupPasswordInput(""); setIsCreatingHub(false); setShowHubInfo(false);
                      setSecurityToken(Math.random()); 
                    }} 
                         className={`flex items-center gap-5 p-8 cursor-pointer transition-all border-b border-purple-50/50 ${activeJoinedHub?.invite_code === hub.invite_code ? 'bg-purple-400 text-white shadow-inner scale-[1.02] z-10' : 'hover:bg-purple-50'}`}>
                      <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black border-2 ${activeJoinedHub?.invite_code === hub.invite_code ? 'bg-white border-white text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-300'}`}>{hub.group_name[0]}</div>
                      <div className="flex-1 overflow-hidden">
                        <span className={`font-black text-xs truncate w-32 uppercase italic tracking-tighter ${activeJoinedHub?.invite_code === hub.invite_code ? 'text-white' : 'text-slate-600'}`}>{hub.group_name}</span>
                        <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${activeJoinedHub?.invite_code === hub.invite_code ? 'text-white/60' : 'text-purple-200'}`}>{hub.branch} Hub</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => {setIsCreatingHub(true); setInviteLink(""); setActiveJoinedHub(null); setHubName(""); setHubPass(""); setSecurityToken(Math.random());}} className="w-full p-12 text-purple-400 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-purple-50 transition-all italic underline underline-offset-8 decoration-pink-300">+ New Private Hub 🍭</button>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-[#fffdfd] relative shadow-inner">
                {uiStatus && <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 bg-white px-12 py-4 rounded-full text-[10px] font-black border-2 border-purple-100 text-purple-400 shadow-2xl animate-in slide-in-from-top-6 uppercase italic tracking-[0.2em]">{uiStatus}</div>}

                {isCreatingHub ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 bg-purple-50/20 backdrop-blur-sm">
                    <div className="bg-white p-20 rounded-[5rem] border-4 border-white w-full max-w-md shadow-2xl animate-in zoom-in-95" key={`create-${securityToken}`}>
                      <div className="flex justify-between items-center mb-12 text-purple-400 italic font-black uppercase tracking-tighter text-2xl"><h2>Create Circle</h2><X className="cursor-pointer text-slate-300 hover:text-purple-400 transition-colors" onClick={()=>setIsCreatingHub(false)}/></div>
                      <div className="space-y-8">
                          <input name={`hname_${securityToken}`} autoComplete="off" placeholder="Node Alias Name" className="w-full bg-purple-50 border-none p-8 rounded-full outline-none text-purple-600 font-bold italic tracking-widest text-sm shadow-inner" onChange={(e) => setHubName(e.target.value)} />
                          <input name={`hpass_${securityToken}`} autoComplete="new-password" type="password" placeholder="Hub Access Pass" className="w-full bg-purple-50 border-none p-8 rounded-full outline-none text-purple-600 font-bold italic tracking-widest text-sm shadow-inner" onChange={(e) => setHubPass(e.target.value)} />
                          <button onClick={handleCreateHub} className="w-full py-8 bg-purple-400 text-white font-black rounded-full hover:bg-purple-500 transition-all uppercase text-xs tracking-[0.4em] shadow-lg shadow-purple-100">Initialize Circle 🗝️</button>
                      </div>
                    </div>
                  </div>
                ) : activeJoinedHub ? (
                  <div className="flex-1 flex flex-row h-full">
                    <div className="flex-1 flex flex-col h-full border-r border-purple-50">
                      <div className="h-24 bg-white flex items-center justify-between px-12 border-b border-purple-50 shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[2.5rem] bg-indigo-400 flex items-center justify-center font-black text-white shadow-xl rotate-3 italic uppercase text-2xl border-4 border-white">{activeJoinedHub.group_name[0]}</div>
                          <div><h3 className="font-black text-slate-800 text-lg italic tracking-tighter">{activeJoinedHub.group_name}</h3><p className="text-[10px] text-purple-300 font-black uppercase tracking-[0.4em] italic decoration-pink-300 underline underline-offset-4">Bifurcation Active</p></div>
                        </div>
                        <div className="flex gap-10 text-purple-200"><Search size={28} className="cursor-pointer hover:text-purple-400 transition-all"/><MoreVertical className="cursor-pointer hover:text-purple-400" size={28} onClick={() => setShowHubInfo(!showHubInfo)}/></div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-12 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] bg-fixed shadow-inner">
                        {!isGroupUnlocked ? (
                          <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95" key={`unlock-${securityToken}`}>
                            <div className="bg-white p-16 rounded-[5rem] border-4 border-white text-center max-w-sm shadow-2xl">
                              <BrainCircuit size={100} className="mx-auto text-purple-200 mb-12 animate-pulse shadow-2xl shadow-indigo-50 rounded-full p-8 border-4 border-white"/><h2 className="text-3xl font-black uppercase text-indigo-600 mb-6 italic tracking-tighter italic">Verification</h2>
                              <p className="text-xs text-slate-400 mb-12 font-black uppercase tracking-widest italic underline decoration-indigo-100 underline-offset-8">Manual credential entry required to bypass firewall.</p>
                              <input name={`auth_${securityToken}`} autoComplete="off" type="password" value={groupPasswordInput} placeholder="THE SECRET WORD..." 
                                     className="w-full bg-purple-50 border-none p-8 rounded-full outline-none mb-10 text-center text-xs font-black tracking-[0.8em] text-purple-500 shadow-inner italic" 
                                     onChange={(e)=>setGroupPasswordInput(e.target.value)} />
                              <button onClick={() => handleUnlockHub(activeJoinedHub)} className="w-full py-8 bg-purple-400 text-white font-black rounded-full hover:scale-105 transition-all shadow-xl shadow-purple-100 uppercase text-xs tracking-[0.2em] italic">Open Sync-Link 🍰</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-12 animate-in slide-in-from-bottom-8">
                            {communityPosts.filter(p => p.invite_code === activeJoinedHub.invite_code).map((post, idx) => (
                              <div key={idx} className={`flex ${post.sender === userEmail ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-12 py-8 rounded-[4rem] relative shadow-2xl ${post.sender === userEmail ? 'bg-purple-500 text-white rounded-tr-none shadow-purple-100 border border-purple-400' : 'bg-white text-slate-500 rounded-tl-none border-4 border-purple-50'}`}>
                                  <p className={`text-[9px] font-black mb-4 uppercase tracking-[0.4em] ${post.sender === userEmail ? 'text-purple-100' : 'text-purple-300'}`}>{post.sender === userEmail ? "LOCAL HOST ✨" : post.sender.split('@')[0]}</p>
                                  <p className="text-lg font-bold italic leading-tight tracking-tighter uppercase">{post.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {isGroupUnlocked && (
                        <div className="bg-white p-12 flex items-center gap-8 relative border-t-8 border-purple-50 shadow-2xl rounded-t-[6rem]">
                          <input type="file" ref={fileInputRef} onChange={handleFileShare} style={{display: 'none'}} />
                          <div className="flex gap-10 text-purple-200 pr-12 border-r-4 border-purple-50 shadow-inner p-4 rounded-3xl">
                            {/* EMOJI PICKER WORKING */}
                            <Smile size={36} className={`cursor-pointer transition-all hover:scale-110 ${showEmojiPicker ? 'text-purple-500' : 'text-purple-200'}`} onClick={()=>setShowEmojiPicker(!showEmojiPicker)}/>
                            <Paperclip size={36} className="cursor-pointer hover:text-purple-400 transition-all hover:-rotate-12" onClick={()=>fileInputRef.current.click()}/>
                          </div>
                          {showEmojiPicker && (
                            <div className="absolute bottom-40 left-10 bg-white p-8 rounded-[3rem] border-4 border-purple-50 shadow-2xl grid grid-cols-4 gap-6 animate-bounce">
                               {['📖','✨','🍰','🎓','🧚‍♀️','🧸','🍭','🎀'].map(e => (
                                 <button key={e} onClick={()=>{setChatMessage(chatMessage+e); setShowEmojiPicker(false);}} className="text-3xl hover:scale-125 transition-transform">{e}</button>
                               ))}
                            </div>
                          )}
                          <input
  autoComplete="off"
  value={chatMessage}
  onChange={(e) => setChatMessage(e.target.value)}
  placeholder="Transmit Data Packet... 🍭"
  className="flex-1 bg-purple-50 border-none rounded-full px-12 py-8 outline-none text-sm font-black text-indigo-600 italic shadow-inner placeholder:text-purple-200 tracking-tighter"
  onKeyDown={(e) => {
    if (e.key === "Enter") transmitMessage();
  }}
/>

<button
  onClick={transmitMessage}
  className="bg-purple-400 p-8 rounded-full text-white hover:bg-purple-500 transition-all shadow-2xl shadow-purple-100 active:scale-90"
>
  <Send size={32}/>
</button>
                        </div>
                      )}
                    </div>

                    {/* MEDIA REPOSITORY SIDEBAR */}
                    {showHubInfo && (
                      <div className="w-[450px] bg-white p-16 border-l-8 border-purple-50 overflow-y-auto animate-in slide-in-from-right-full shadow-2xl">
                         <h3 className="font-black text-purple-400 uppercase text-[11px] tracking-[0.6em] mb-16 border-b-8 border-purple-50 pb-10 flex items-center gap-6 italic underline decoration-pink-300"><HardDrive size={30} className="text-pink-300"/> Media Repository 🎁</h3>
                         <div className="space-y-12">
                            {communityPosts.filter(p => p.branch === activeJoinedHub.invite_code && p.isMedia).map((m, i) => (
                               <div key={i} className="bg-purple-50 p-10 rounded-[4rem] border-4 border-white flex items-center gap-8 group hover:bg-white transition-all cursor-pointer shadow-xl hover:scale-105 hover:border-purple-100">
                                  <FileText className="text-purple-300 group-hover:text-indigo-500 transition-all scale-125" size={40}/>
                                  <div className="overflow-hidden">
                                     <p className="text-xs font-black text-purple-400 group-hover:text-purple-600 truncate uppercase italic tracking-tighter">{m.text.split(': ')[1]}</p>
                                     <p className="text-[9px] text-indigo-300 font-black uppercase mt-2 tracking-widest">Neural Link Valid</p>
                                  </div>
                               </div>
                            ))}
                            {communityPosts.filter(p => p.branch === activeJoinedHub.invite_code && p.isMedia).length === 0 && (
                              <div className="text-center py-24 opacity-20"><HardDrive size={50} className="mx-auto mb-6 text-purple-200"/><p className="text-[11px] font-black uppercase italic tracking-widest">Sector Empty</p></div>
                            )}
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center animate-in zoom-in-95 p-20 bg-indigo-50/10">
                    <div className="bg-white p-32 rounded-[8rem] border-8 border-indigo-50 mb-20 shadow-[0_40px_80px_rgba(0,0,0,0.1)] backdrop-blur-3xl animate-bounce shadow-purple-100 border-b-[20px]"><MessageSquare size={160} className="text-purple-300 fill-purple-50 opacity-60"/></div>
                    <p className="text-xl font-black uppercase tracking-[0.8em] text-indigo-400 italic drop-shadow-xl underline decoration-pink-200">Initialize Sync Node 🧸</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() { return <Authenticator>{(p) => <CampusDashboard {...p} />}</Authenticator>; }