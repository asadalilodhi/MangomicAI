/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
"use client";
import { useRef, useState, useEffect } from "react";
import type { PointerEvent, ReactNode } from "react";
import {
  ArrowUp, BadgeCheck, Box, ChevronDown, ChevronUp, CircleHelp, Code2, Copy, Download,
  EllipsisVertical, Eraser, Eye, FileEdit, Hand, Image as ImageIcon, Menu, MousePointer2, Palette,
  PenLine, Play, Plus, Redo2, Rocket, Share2, Sparkles, SquareDashedMousePointer, Star,
  Undo2, WandSparkles, X, Zap,
} from "lucide-react";
import { motion } from "framer-motion";

type Point = { x: number; y: number };
type DragProps = { children: ReactNode; className?: string; initial?: Point };

function useDrag(initial: Point = { x: 0, y: 0 }) {
  const [pos, setPos] = useState<Point>(initial);
  const [dragging, setDragging] = useState(false);
  const start = useRef<Point>({ x: 0, y: 0 });
  const origin = useRef<Point>(initial);
  const bind = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).closest("button,input,textarea")) return;
      setDragging(true); start.current = { x: e.clientX, y: e.clientY }; origin.current = pos;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => dragging && setPos({ x: origin.current.x + e.clientX - start.current.x, y: origin.current.y + e.clientY - start.current.y }),
    onPointerUp: () => setDragging(false),
  };
  return { pos, dragging, bind };
}

function Draggable({ children, className = "", initial }: DragProps) {
  const { pos, dragging, bind } = useDrag(initial);
  return <motion.div {...bind} animate={{ x: pos.x, y: pos.y, scale: dragging ? 1.012 : 1 }} className={`cursor-grab active:cursor-grabbing ${className}`}>{children}</motion.div>;
}

function GlassButton({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <button onClick={onClick} className={`group flex items-center gap-2 rounded-full border border-[#bd5363]/22 bg-[#0b0305]/72 px-3.5 py-2 text-[13px] font-semibold text-[#f7ecee] shadow-[inset_0_1px_0_rgba(205,76,94,.14),0_10px_30px_rgba(17,24,39,.08)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-[#722131]/42 hover:shadow-[inset_0_1px_0_rgba(205,76,94,.16),0_18px_40px_rgba(132,42,55,.18)] ${className}`}>{children}</button>;
}

function Dropdown({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`absolute z-50 rounded-2xl border border-[#bd5363]/22 bg-[#0b0305]/90 p-2 text-[13px] font-semibold text-[#f7ecee] shadow-[0_22px_60px_rgba(76,5,25,.18)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

function DropItem({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#722131]/42/10">{children}</button>;
}

function TopBar({ notify, onGenerate, extractionState, setExtractionState, onSaveOverrides }: { notify: (x: string) => void, onGenerate: () => void, extractionState?: any, setExtractionState?: (x: any) => void, onSaveOverrides?: () => void }) {
  const [mode, setMode] = useState("Generate");
  const [menu, setMenu] = useState<string | null>(null);
  return <>
    <div className="fixed left-7 top-5 z-30 flex items-center gap-3"><button onClick={() => notify("Workspace menu opened")} className="grid h-10 w-12 place-items-center rounded-full border border-[#bd5363]/22 bg-[#0b0305]/72 shadow-inner backdrop-blur-xl transition hover:bg-[#722131]/42"><Menu size={21} /></button><div className="text-[13px] font-bold tracking-[.01em] text-[#f7ecee]">Director's Studio</div></div>
    <div className="fixed left-1/2 top-4 z-30 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-[#bd5363]/22 bg-[linear-gradient(145deg,rgba(48,12,20,.42),rgba(18,6,10,.82)_48%,rgba(8,2,5,.92))] px-3 py-2 shadow-[inset_0_1px_0_rgba(205,76,94,.14),inset_0_-14px_26px_rgba(205,76,94,.12),0_22px_62px_rgba(0,0,0,.32),-8px_0_24px_rgba(184,68,86,.18),0_10px_28px_rgba(205,76,94,.17)] backdrop-blur-2xl md:flex">
      {([ [Sparkles,"Generate"], [FileEdit, "Schema"], [PenLine,"Modify"], [Eye,"Preview"] ] as const).map(([Icon,label]) => <div key={label as string} className="relative"><GlassButton onClick={() => { if(label === "Generate"){onGenerate()}else{setMode(label as string); setMenu(menu === label ? null : label as string); notify(`${label} menu opened`);} }} className={`px-2.5 py-1.5 ${mode === label ? "bg-[#722131]/50 ring-2 ring-[#8a2838]/35" : ""}`}><Icon size={16} className={label === "Generate" ? "text-[#d8a1aa]" : ""} />{label}<ChevronDown size={14} /></GlassButton>
      
      {menu === label && label !== "Schema" && <Dropdown className="left-0 top-11 w-48"><DropItem onClick={() => notify(`${label}: quick option`)}><Sparkles size={15} /> Quick {label}</DropItem><DropItem onClick={() => notify(`${label}: advanced option`)}><WandSparkles size={15} /> Advanced</DropItem><DropItem onClick={() => notify(`${label}: settings`)}><Palette size={15} /> Settings</DropItem></Dropdown>}
      
      {menu === "Schema" && label === "Schema" && (
        <Dropdown className="left-0 top-11 w-[380px] p-5 cursor-default">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-[#d8a1aa] text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-2"><FileEdit size={14}/> Live Schema Data</h3>
          </div>
          {!extractionState ? (
             <div className="text-xs text-[#ead7db]/50 italic">Start chatting with the Director to build schema...</div>
          ) : (
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Title</label>
                 <input value={extractionState.title || ""} onChange={(e) => setExtractionState?.({...extractionState, title: e.target.value})} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-lg p-2 text-[12px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors shadow-inner" placeholder="Enter title..." />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-[10px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Genre</label>
                   <input value={extractionState.genre || ""} onChange={(e) => setExtractionState?.({...extractionState, genre: e.target.value})} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-lg p-2 text-[12px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors shadow-inner" placeholder="e.g. Cyberpunk" />
                 </div>
                 <div>
                   <label className="text-[10px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Style</label>
                   <select value={extractionState.style_template || ""} onChange={(e) => setExtractionState?.({...extractionState, style_template: e.target.value})} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-lg p-2 text-[12px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors shadow-inner appearance-none cursor-pointer">
                      <option value="" disabled>Select style...</option>
                      <option value="Manga">Manga</option>
                      <option value="Manhwa">Manhwa</option>
                      <option value="Comic">Comic</option>
                      <option value="Anime">Anime</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label className="text-[10px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Core Premise</label>
                 <textarea rows={3} value={extractionState.core_premise || ""} onChange={(e) => setExtractionState?.({...extractionState, core_premise: e.target.value})} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-lg p-2 text-[12px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors shadow-inner resize-none" placeholder="Describe the story..." />
               </div>
               {extractionState.characters && extractionState.characters.length > 0 && (
                 <div className="pt-2 border-t border-[#bd5363]/20">
                   <label className="text-[10px] text-[#d8a1aa] uppercase font-bold mb-3 block">Characters</label>
                   <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                     {extractionState.characters.map((c: any, idx: number) => (
                       <div key={idx} className="p-3 bg-[#0b0305]/60 rounded-xl border border-[#bd5363]/10 space-y-3">
                         <div>
                           <label className="text-[9px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Name</label>
                           <input value={c.name || ""} onChange={(e) => {
                             const newChars = [...extractionState.characters];
                             newChars[idx] = { ...newChars[idx], name: e.target.value };
                             setExtractionState?.({...extractionState, characters: newChars});
                           }} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-md p-1.5 text-[11px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors" />
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                           <div>
                             <label className="text-[9px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Voice Type</label>
                             <input value={c.voice_type || ""} onChange={(e) => {
                               const newChars = [...extractionState.characters];
                               newChars[idx] = { ...newChars[idx], voice_type: e.target.value };
                               setExtractionState?.({...extractionState, characters: newChars});
                             }} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-md p-1.5 text-[11px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors" />
                           </div>
                           <div>
                             <label className="text-[9px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Personality</label>
                             <input value={c.personality || ""} onChange={(e) => {
                               const newChars = [...extractionState.characters];
                               newChars[idx] = { ...newChars[idx], personality: e.target.value };
                               setExtractionState?.({...extractionState, characters: newChars});
                             }} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-md p-1.5 text-[11px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors" />
                           </div>
                         </div>
                         <div>
                           <label className="text-[9px] text-[#ead7db]/50 uppercase font-semibold mb-1 block">Visual Description</label>
                           <textarea rows={2} value={c.visual_description || ""} onChange={(e) => {
                             const newChars = [...extractionState.characters];
                             newChars[idx] = { ...newChars[idx], visual_description: e.target.value };
                             setExtractionState?.({...extractionState, characters: newChars});
                           }} className="w-full bg-[#050102]/80 border border-[#bd5363]/20 rounded-md p-1.5 text-[11px] text-[#f7ecee] outline-none focus:border-[#d8a1aa]/60 transition-colors resize-none" />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               <button onClick={() => { setMenu(null); notify("Schema overrides saved!"); if(onSaveOverrides) onSaveOverrides(); }} className="w-full py-2 bg-[#722131] hover:bg-[#8a2838] transition-colors rounded-lg text-xs font-bold text-white shadow-lg border border-[#bd5363]">Save Overrides</button>
             </div>
          )}
        </Dropdown>
      )}
      
      </div>)}
      <EllipsisVertical size={17} className="mx-1 text-[#ead7db]/50" /><button onClick={() => notify("More actions expanded")} className="rounded-full px-3 py-1.5 text-[13px] font-semibold transition hover:bg-[#722131]/42">More <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#c6495b] align-middle shadow-[0_0_12px_#c6495b]" /></button>
    </div>
    <div className="fixed right-6 top-5 z-30 flex items-center gap-2"><button onClick={() => notify("All changes saved")} className="grid h-9 w-9 place-items-center rounded-full border border-[#bd5363]/22 bg-[#0b0305]/72 shadow-inner backdrop-blur-xl"><BadgeCheck size={17} className="fill-[#f7ecee] text-[#f7ecee]" /></button><GlassButton onClick={() => notify("Preview launched")} className="h-9 w-9 justify-center px-0"><Play size={16} /></GlassButton><GlassButton onClick={() => notify("Export package prepared")}><Download size={16} />Export</GlassButton><GlassButton onClick={() => notify("Share link copied")}><Share2 size={16} />Share</GlassButton><button onClick={() => notify("Profile opened")} className="h-9 w-9 rounded-full border-2 border-[#b05a65]/25 bg-[linear-gradient(135deg,#2b0a12,#6d2631_52%,#c7a0a5)] shadow-lg" /></div>
  </>;
}

function LeftPanels({ notify, running, messages, extractionState }: { notify: (x: string) => void; running: boolean; messages: any[]; extractionState: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const userPrompts = messages.filter((m: any) => m.role === 'user').map((m: any) => m.content);
  return <>
    <div className="fixed left-4 top-[78px] z-20 hidden lg:block">
      <Draggable>
        <section className={`relative overflow-hidden rounded-[18px] border border-[#bd5363]/22 bg-[linear-gradient(145deg,rgba(48,12,20,.42),rgba(18,6,10,.82)_48%,rgba(8,2,5,.92))] p-3 shadow-[inset_0_1px_0_rgba(205,76,94,.14),inset_0_-18px_38px_rgba(205,76,94,.15),0_24px_64px_rgba(0,0,0,.34),-10px_0_28px_rgba(184,68,86,.24),0_12px_32px_rgba(205,76,94,.22)] backdrop-blur-2xl transition-all ${collapsed ? "grid h-[64px] w-[64px] place-items-center" : "w-[360px]"}`}>
          <button onClick={() => setCollapsed(!collapsed)} className={`relative z-10 flex h-4 w-10 items-center justify-center gap-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,.28),0_5px_14px_rgba(0,0,0,.18)] transition hover:scale-110 ${collapsed ? "mx-auto mb-0" : "mb-4"}`}><span className="h-1 w-1 rounded-full bg-white" /><span className="h-1 w-1 rounded-full bg-white" /></button>
          {!collapsed && <>
            <div className="max-h-[300px] overflow-y-auto space-y-3 p-2 border-b border-[#bd5363]/20 mb-4">
              {messages.map((m: any, i: number) => (
                <div key={i} className={`p-3 rounded-xl text-[12px] ${m.role === 'user' ? 'bg-[#722131]/40 text-[#f7ecee] ml-4' : 'bg-[#0b0305]/70 text-[#ead7db] mr-4'}`}>
                  <span className="font-semibold">{m.content}</span>
                  {m.questions && m.questions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {m.questions.map((q: string, j: number) => (
                         <div key={j} onClick={() => notify("Question clicked")} className="p-2.5 bg-[#c6495b]/10 border border-[#c6495b]/30 rounded-lg text-[#f7ecee] shadow-inner font-medium cursor-pointer hover:bg-[#c6495b]/25 hover:border-[#c6495b]/50 transition-all flex items-start gap-2">
                           <CircleHelp size={14} className="shrink-0 text-[#d8a1aa] mt-0.5" />
                           <span className="leading-snug">{q}</span>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="min-h-[48px]">
                {running && <div className="p-3 bg-[#0b0305]/70 text-[#ead7db] text-[12px] rounded-xl mr-4 animate-pulse">Director is thinking...</div>}
              </div>
            </div>
            {extractionState && (
              <div className="p-2 space-y-2">
                <h3 className="text-xs font-bold text-[#d8a1aa] uppercase tracking-wider mb-2">Live Schema Lock</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[#c6495b]/20 rounded-md text-[11px] font-mono text-[#f7ecee] border border-[#bd5363]/30">{extractionState.is_complete ? "✅ Complete" : "⏳ Incomplete"}</span>
                  {extractionState.genre && <span className="px-2 py-1 bg-[#0b0305]/60 rounded-md text-[11px] font-mono text-[#ead7db] border border-[#bd5363]/20">Genre: {extractionState.genre}</span>}
                  {extractionState.style_template && <span className="px-2 py-1 bg-[#0b0305]/60 rounded-md text-[11px] font-mono text-[#ead7db] border border-[#bd5363]/20">Style: {extractionState.style_template}</span>}
                  {extractionState.characters?.map((c: any, idx: number) => (
                     <span key={idx} className="px-2 py-1 bg-[#722131]/30 rounded-md text-[11px] font-mono text-[#f7ecee] border border-[#bd5363]/30">Char: {c.name}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="my-3 h-px bg-white/14" />
            {agentOpen && userPrompts.length > 0 && (
               <div className="space-y-2.5 text-[12px] font-normal leading-snug mb-3">
                 {userPrompts.map((item: string, i: number) => (
                   <button onClick={() => notify(`Agent log: ${item}`)} key={i} className="flex w-full items-center gap-1.5 text-left !text-[12px] !font-normal !leading-snug hover:bg-[#722131]/20 rounded-md p-1 transition-colors">
                     <BadgeCheck size={13} strokeWidth={1.7} className="shrink-0 text-[#d8a1aa]" />
                     <span className="truncate !text-[12px] !font-normal !leading-snug text-[#ead7db]">{item}</span>
                   </button>
                 ))}
               </div>
            )}
            {agentOpen && userPrompts.length === 0 && (
               <div className="text-[11px] text-[#ead7db]/50 mb-3 italic px-1">No past prompts yet.</div>
            )}
            <button onClick={() => setAgentOpen(!agentOpen)} className="flex w-full items-center justify-between !text-[12px] !font-normal !leading-snug text-[#ead7db]/80 hover:text-[#ead7db] transition-colors">
              <span className="flex items-center gap-2"><Rocket size={13} strokeWidth={1.7} />Agent log</span>
              {agentOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </>}
        </section>
      </Draggable>
    </div>
  </>;
}

function StoryBoard({ panels, styleTemplate }: { panels: any[], styleTemplate?: string }) {
  if (!panels || panels.length === 0) {
    return (
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-[380px] w-[600px] flex-col items-center justify-center rounded-[34px] border border-[#bd5363]/22 bg-[linear-gradient(145deg,rgba(48,12,20,.42),rgba(18,6,10,.82)_48%,rgba(8,2,5,.92))] p-5 text-[#ead7db]/50 shadow-2xl backdrop-blur-2xl">
          <Sparkles size={32} className="mb-4 opacity-50" />
          <p className="text-sm">Talk to the Director to lock JSON schema and generate panels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-0 z-10 w-full h-full pt-[120px] pb-[40px] overflow-y-auto custom-scrollbar flex flex-col items-center">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-7xl px-10 pb-32 w-full mt-10">
        {panels.map((panel, idx) => (
          <div key={idx} className="group relative w-full overflow-hidden rounded-[34px] border border-[#bd5363]/22 bg-[linear-gradient(145deg,rgba(48,12,20,.42),rgba(18,6,10,.82)_48%,rgba(8,2,5,.92))] p-4 shadow-[inset_0_1px_0_rgba(205,76,94,.14),0_35px_100px_rgba(0,0,0,.28)] backdrop-blur-2xl transition-transform hover:scale-[1.02] duration-500">
            <div className="relative h-full rounded-[24px] border border-[#bd5363]/18 bg-[linear-gradient(145deg,rgba(48,12,20,.42),rgba(18,6,10,.82)_48%,rgba(8,2,5,.92))] p-5 shadow-inner flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#d8a1aa]">Genblaze Provenance</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-[#f7ecee]">Panel {panel?.panel_number || idx + 1}</h2>
                </div>
                <WandSparkles className="text-[#d8a1aa]" />
              </div>
              
              {/* Image Container: 1:1 Aspect Ratio to match 1024x1024 generation */}
              <div className="relative w-full aspect-square bg-[#050102] rounded-2xl border border-[#bd5363]/10 overflow-hidden shrink-0">
                {panel?.image_url ? (
                  <img src={panel.image_url} className="absolute inset-0 w-full h-full object-contain bg-black/40" alt={`Panel ${panel.panel_number}`} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#ead7db]/50">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                )}
              </div>

              {/* Text / Dialogue Container below the image */}
              <div className="mt-4 flex-1 overflow-y-auto space-y-3 text-sm pr-2 custom-scrollbar">
                <div className="flex gap-2 items-center font-mono text-[10px] text-[#d8a1aa] bg-[#722131]/30 p-2 rounded-lg border border-[#bd5363]/30 truncate">
                  <ImageIcon size={12} className="shrink-0"/> <span className="truncate">{panel?.image_url ? 'B2 Image Ready' : 'Generating...'}</span>
                </div>
                {(styleTemplate === 'Anime' || panel?.audio_url) && (
                  <div className="flex gap-2 items-center font-mono text-[10px] text-[#d8a1aa] bg-[#722131]/30 p-2 rounded-lg border border-[#bd5363]/30 truncate">
                    <Play size={12} className="shrink-0"/> <span className="truncate">B2 Audio: {panel?.audio_url || 'Waiting...'}</span>
                  </div>
                )}
                {panel?.narration && (
                  <p className="p-3 bg-[#0b0305]/60 rounded-xl border border-[#bd5363]/20 text-white/80 shadow-md italic">
                    {panel.narration}
                  </p>
                )}
                {panel?.dialogue && Array.isArray(panel.dialogue) && panel.dialogue.map((d: any, i: number) => (
                  <p key={i} className="p-3 bg-[#0b0305]/90 rounded-xl border border-[#bd5363]/30 text-white shadow-md">
                    <span className="font-bold text-[#d8a1aa]">{d.character_id}:</span> "{d.text}"
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RightTools({ notify }: { notify: (x: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const tools = [[MousePointer2,"Select"], [SquareDashedMousePointer,"Frame"], [Eraser,"Erase"], [Hand,"Pan"], [ImageIcon,"B2 Cache"], [Palette,"Theme"], [Star,"Enforce Coherence"]] as const;
  const [active, setActive] = useState("Select");
  return <div className="fixed right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-4 rounded-full border border-[#bd5363]/22 bg-[#0b0305]/72 p-2 shadow-[inset_0_1px_0_rgba(205,76,94,.14),0_18px_45px_rgba(76,5,25,.14)] backdrop-blur-2xl">{tools.map(([Icon, label]) => <button title={label} onClick={() => { setActive(label); setOpen(open === label ? null : label); notify(`${label} tool selected`); }} key={label} className={`grid h-9 w-9 place-items-center rounded-full transition hover:scale-110 ${active === label ? "bg-[#050102] text-[#f7ecee] shadow-lg" : "text-[#ead7db]/80 hover:bg-[#722131]/42"}`}><Icon size={18} /></button>)}{open && <Dropdown className="right-14 top-16 w-44"><DropItem onClick={() => notify(`${open} option A`)}>Option A</DropItem><DropItem onClick={() => notify(`${open} option B`)}>Option B</DropItem><DropItem onClick={() => notify(`${open} settings`)}>Settings</DropItem></Dropdown>}</div>;
}

function PromptBar({ notify, runPrompt }: { notify: (x: string) => void; runPrompt: (p: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  return <div className="fixed bottom-3 left-1/2 z-30 w-[580px] max-w-[86vw] -translate-x-1/2"><Draggable><div className="relative overflow-hidden rounded-[22px] border border-[#bd5363]/22 bg-[linear-gradient(145deg,rgba(48,12,20,.42),rgba(18,6,10,.82)_48%,rgba(8,2,5,.92))] p-4 shadow-[inset_0_1px_0_rgba(205,76,94,.16),inset_0_-22px_44px_rgba(205,76,94,.15),0_24px_70px_rgba(0,0,0,.34),-12px_0_30px_rgba(184,68,86,.20),0_14px_36px_rgba(205,76,94,.22)] backdrop-blur-2xl ring-1 ring-[#c6495b]/24"><button onClick={() => notify("Shader chip removed")} className="mb-4 flex w-max items-center gap-2 rounded-full bg-[#0b0305]/72 px-3 py-1.5 text-xs font-semibold shadow-inner"><Box size={14} />Shader <X size={14} /></button><input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && prompt) { runPrompt(prompt); setPrompt(''); } }} placeholder="What would you like to change or create?" className="mb-7 w-full bg-transparent text-[13px] text-[#ead7db]/80 outline-none placeholder:text-[#ead7db]/65" /><div className="flex items-center justify-between"><div className="flex items-center gap-6 text-[#ead7db]/80"><div className="relative"><button onClick={() => setOpen(open === "attach" ? null : "attach")}><Plus size={21} /></button>{open === "attach" && <Dropdown className="bottom-10 left-[-14px] w-52"><DropItem onClick={() => notify("Upload files selected")}><ImageIcon size={16} />Upload Ref to B2</DropItem><DropItem onClick={() => notify("Website URL selected")}><Eye size={16} />Website URL</DropItem><DropItem onClick={() => notify("Variations selected")}><Box size={16} />Variations</DropItem></Dropdown>}</div><button onClick={() => notify("Code mode toggled")}><Code2 size={17} /></button></div><div className="flex items-center gap-3 text-[#ead7db]/80"><button onClick={() => notify("Prompt copied")}><Copy size={15} /></button><button onClick={() => notify("Palette options opened")}><Palette size={15} /></button><div className="relative"><button onClick={() => setOpen(open === "model" ? null : "model")} className="rounded-full bg-[#0b0305]/72 px-3 py-1.5 text-xs font-bold">Genblaze Pipeline</button>{open === "model" && <Dropdown className="bottom-11 right-0 w-80"><DropItem onClick={() => notify("3 Flash selected")}><Sparkles size={16} /> <span><b>3 Flash</b><br/><small className="font-normal text-[#ead7db]/65">Fast HTML design drafts</small></span></DropItem><DropItem onClick={() => notify("3.1 Pro selected")}><Sparkles size={16} /> <span><b>Thinking with 3.1 Pro ✓</b><br/><small className="font-normal text-[#ead7db]/65">Maximum quality and reasoning</small></span></DropItem><DropItem onClick={() => notify("Redesign mode selected")}><WandSparkles size={16} /> <span><b>Redesign</b><br/><small className="font-normal text-[#ead7db]/65">Attach screenshot and restyle</small></span></DropItem></Dropdown>}</div><button onClick={() => notify("Enhanced prompt")}><Zap size={17} /></button><button onClick={() => { if(prompt) { runPrompt(prompt); setPrompt(''); } else { notify("Prompt is empty"); } }} className="grid h-9 w-9 place-items-center rounded-full bg-[#0b0305]/72 text-[#ead7db]/50"><ArrowUp size={17} /></button></div></div></div></Draggable></div>;
}

function ParallaxBackground() {
  const outerBgRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const innerBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let mouseX = targetX;
    let mouseY = targetY;
    let bgX = 0;
    let bgY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      bgX = (e.clientX / window.innerWidth - .5) * 14;
      bgY = (e.clientY / window.innerHeight - .5) * 14;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const update = () => {
      mouseX += (targetX - mouseX) * 0.15;
      mouseY += (targetY - mouseY) * 0.15;

      if (outerBgRef.current) {
        outerBgRef.current.style.transform = `translate(${bgX * .35}px, ${bgY * .35}px)`;
      }
      if (lensRef.current) {
        lensRef.current.style.left = `${mouseX}px`;
        lensRef.current.style.top = `${mouseY}px`;
      }
      if (innerBgRef.current) {
        innerBgRef.current.style.transform = `translate(${-mouseX}px, ${-mouseY}px) scale(1.105)`;
        innerBgRef.current.style.transformOrigin = `${mouseX}px ${mouseY}px`;
      }
      
      animationFrameId = requestAnimationFrame(update);
    };
    update();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div ref={outerBgRef} className="absolute inset-0 ease-out" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.46) 1px, transparent 1.15px)", backgroundSize: "11px 11px" }} />
      <div ref={lensRef} className="pointer-events-none absolute z-[1] h-[180px] w-[216px] overflow-hidden rounded-[50%] ease-out" style={{ transform: "translate(-50%, -50%)", boxShadow: "inset 10px 12px 22px rgba(255,255,255,.22), inset -12px -14px 24px rgba(0,0,0,.045), 0 10px 24px rgba(0,0,0,.055)", background: "rgba(255,255,255,.025)", opacity: .86, WebkitMaskImage: "radial-gradient(ellipse at center, rgba(255,255,255,.50) 0 24%, rgba(255,255,255,.30) 46%, rgba(255,255,255,.12) 68%, transparent 82%)", maskImage: "radial-gradient(ellipse at center, rgba(255,255,255,.50) 0 24%, rgba(255,255,255,.30) 46%, rgba(255,255,255,.12) 68%, transparent 82%)" }}>
        <div ref={innerBgRef} className="absolute left-1/2 top-1/2 h-screen w-screen" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.78) 1px, transparent 1.15px)", backgroundSize: "11px 11px" }} />
        <div className="absolute inset-0 rounded-[50%]" style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,.26), rgba(255,255,255,.055) 34%, transparent 62%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.10)" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,rgba(122,34,49,.40),transparent_24%),linear-gradient(180deg,rgba(10,3,6,.20),rgba(4,1,3,.78))]" />
    </>
  );
}

export default function App() {
  const [toast, setToast] = useState("Ready");
  const [running, setRunning] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([{role: "assistant", content: "Welcome to the Genblaze Provenance Studio. Describe your scene."}]);
  const [extractionState, setExtractionState] = useState<any>(null);
  const [panels, setPanels] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<any>(null);

  const notify = (x: string) => { setToast(x); window.setTimeout(() => setToast("Ready"), 2200); };
  
  const runPrompt = async (p: string) => {
    if (!p.trim()) return;
    const newMsgs = [...messages, {role: "user", content: p}];
    setMessages(newMsgs);
    setRunning(true);
    notify(`Extracting Schema: ${p}`);
    try {
      const response = await fetch("http://localhost:8001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: p, current_state: extractionState }),
      });
      const data = await response.json();
      setMessages([...newMsgs, {role: "assistant", content: data.reply, questions: data.questions}]);
      if (data.extraction) setExtractionState(data.extraction);
      notify("Schema Lock complete");
      
      if (data.extraction && data.extraction.is_complete) {
        // Automatically start generation!
        handleGenerate(data.extraction);
      }
    } catch (error) {
      notify("Error connecting to backend");
    } finally {
      setRunning(false);
    }
  };

  const handleGenerate = async (finalState?: any) => {
    const payload = finalState || extractionState;
    if (!payload) return;
    notify("Generating 10-Panel Script...");
    setRunning(true);
    try {
      const scriptRes = await fetch("http://localhost:8001/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const scriptData = await scriptRes.json();
      setExtractionState(scriptData);
      
      // Initialize panels with the generated script so they instantly appear in the UI!
      if (scriptData.panels) {
        setPanels(scriptData.panels);
      }
      
      notify("Script generated! Starting Genblaze Image Pipeline...");
      
      const renderRes = await fetch("http://localhost:8001/api/render-panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scriptData),
      });
      
      if (!renderRes.body) return;
      const reader = renderRes.body.getReader();
      const decoder = new TextDecoder();
      
      // Seed currentPanels with the script data to avoid sparse arrays during streaming
      let currentPanels: any[] = scriptData.panels ? [...scriptData.panels] : [];
      let buffer = "";
       while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
           if (!line.trim()) continue;
           try {
               const data = JSON.parse(line);
               if (data.type === 'progress') {
                   notify(data.status);
               } else if (data.type === 'panel_complete') {
                   // Place the panel at its exact index so order is preserved
                   const newPanels = [...currentPanels];
                   newPanels[data.panel_index] = data.panel;
                   currentPanels = newPanels;
                   setPanels(currentPanels);
                   // Show the most recently completed panel
                   setActivePanel(data.panel);
               } else if (data.type === 'done') {
                   notify("Genblaze Pipeline Complete!");
                   setRunning(false);
                   return;
               }
           } catch(e) { console.error(e) }
        }
      }
      // Failsafe in case stream ends without sending 'done'
      setRunning(false);
      
    } catch (error) {
      notify("Error generating panels");
      setRunning(false);
    }
  };

  return <main className="relative h-screen w-screen overflow-hidden bg-background dark font-sans text-foreground">
    <ParallaxBackground />
    <TopBar 
      notify={notify} 
      onGenerate={handleGenerate} 
      extractionState={extractionState} 
      setExtractionState={setExtractionState} 
      onSaveOverrides={() => runPrompt("I have manually updated the schema using the Live Lock overrides. Please proceed with these details.")}
    />
    <LeftPanels notify={notify} running={running} messages={messages} extractionState={extractionState} />
    <StoryBoard panels={panels} styleTemplate={extractionState?.style_template} />
    <RightTools notify={notify} />
    <PromptBar notify={notify} runPrompt={runPrompt} />
    <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2"><GlassButton onClick={() => notify("Undo") } className="px-3"><Undo2 size={15} /><Redo2 size={15} /></GlassButton><GlassButton onClick={() => notify("Zoom controls opened")}>62%</GlassButton><GlassButton onClick={() => notify("Help opened")} className="h-9 w-9 justify-center px-0"><CircleHelp size={17} /></GlassButton></div>
    <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-[#bd5363]/22 bg-[#0b0305]/72 px-4 py-2 text-xs font-bold text-[#ead7db]/80 shadow-xl backdrop-blur-xl">{toast}</div>
  </main>;
}
// turbopack trigger
// force turbopack reload 1
