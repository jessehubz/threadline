"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, MessageSquare, X, Plus, ArrowLeft } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { getConversations, getOrCreateConversation, sendDirectMessage, getDirectMessages, getTeamMembers, markConversationRead } from "@/actions/dm-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MessageUser { id: string; name: string | null; username?: string | null; email: string; imageUrl: string | null; }
interface Message { id: string; content: string; isSystem: boolean; createdAt: string; user: MessageUser; }
interface Conversation { id: string; isGroup: boolean; name: string | null; participants: Array<{ id: string; user: MessageUser }>; messages: Array<{ id: string; content: string; createdAt: string; user: { id: string; name: string | null; email: string } }>; }

export function ChatPopup({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [teammates, setTeammates] = useState<MessageUser[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      try {
        const c = await getConversations();
        setConversations(c as unknown as Conversation[]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open]);
  useEffect(() => {
    if (!selectedConvo) return;
    const conversationId = selectedConvo.id;
    async function load() {
      setMessagesLoading(true);
      try {
        const msgs = await getDirectMessages(conversationId);
        setMessages(msgs.map((m) => ({ id: m.id, content: m.content, isSystem: m.isSystem, createdAt: m.createdAt.toISOString(), user: m.user })));
      } catch {
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    }
    load();
    markConversationRead(conversationId).catch(() => {});
  }, [selectedConvo]);
  useEffect(() => { if (!selectedConvo) return; const ch = getPusherClient().subscribe(`private-dm-${selectedConvo.id}`); ch.bind("new-dm", (d: Message) => { setMessages((p) => [...p, d]); markConversationRead(selectedConvo.id).catch(() => {}); }); return () => { ch.unbind_all(); getPusherClient().unsubscribe(`private-dm-${selectedConvo.id}`); }; }, [selectedConvo]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function getOther(c: Conversation) { return c.participants.find((p) => p.user.id !== currentUserId)?.user; }
  async function handleNewChat() { setShowNewChat(true); try { setTeammates(await getTeamMembers()); } catch {} }
  async function startConvo(userId: string) { setShowNewChat(false); startTransition(async () => { try { const c = await getOrCreateConversation(userId) as unknown as Conversation; setConversations((p) => p.some((x) => x.id === c.id) ? p : [{ ...c, messages: [] }, ...p]); setSelectedConvo({ ...c, messages: [] }); } catch { toast.error("Failed"); } }); }
  function handleSend() { if (!input.trim() || !selectedConvo) return; const content = input.trim(); setInput(""); startTransition(async () => { try { await sendDirectMessage({ conversationId: selectedConvo.id, content }); } catch {} }); }

  return (
    <>
      <button onClick={() => setOpen(!open)} className={cn("relative rounded-xl p-2 transition-colors", open ? "accent-bg accent-color" : "text-body hover:bg-hover hover:text-heading")} aria-label="Messages"><MessageSquare className="h-5 w-5" /></button>
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[480px] w-[360px] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-themed-subtle bg-card shadow-2xl animate-[scaleIn_170ms_var(--ease-out-strong)_both]">
          <div className="flex items-center justify-between border-b border-themed-subtle px-4 py-3">
            {selectedConvo ? (<><button onClick={() => setSelectedConvo(null)} className="rounded-lg p-1 text-dim hover:bg-hover"><ArrowLeft className="h-4 w-4" /></button><p className="text-card-title">{getOther(selectedConvo)?.name || getOther(selectedConvo)?.email || "Chat"}</p><button onClick={() => setOpen(false)} className="rounded-lg p-1 text-dim hover:bg-hover"><X className="h-4 w-4" /></button></>) : (<><p className="text-card-title">Messages</p><div className="flex items-center gap-1"><button onClick={handleNewChat} className="rounded-lg p-1.5 text-dim hover:bg-hover hover:accent-color"><Plus className="h-4 w-4" /></button><button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-dim hover:bg-hover"><X className="h-4 w-4" /></button></div></>)}
          </div>
          {!selectedConvo ? (
            <div className="flex-1 overflow-y-auto">{showNewChat ? (<div className="p-3">{teammates.map((t) => (<button key={t.id} onClick={() => startConvo(t.id)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-heading hover:bg-page"><div className="flex h-8 w-8 items-center justify-center rounded-full accent-bg text-xs font-semibold accent-color">{(t.name||t.email).charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1 text-left"><span className="block truncate">{t.name||t.email}</span>{t.username && <span className="block truncate text-xs text-dim">@{t.username}</span>}</div></button>))}<button onClick={() => setShowNewChat(false)} className="mt-2 w-full text-center text-xs text-body">Cancel</button></div>) : loading ? (<div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" /></div>) : conversations.length === 0 ? (<div className="flex flex-col items-center py-12"><MessageSquare className="h-8 w-8 text-dim mb-2" /><p className="text-sm text-body">No conversations</p><button onClick={handleNewChat} className="mt-2 text-sm font-medium accent-color">Start one</button></div>) : (conversations.map((c) => { const o = getOther(c); return (<button key={c.id} onClick={() => setSelectedConvo(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-page border-b border-surface-50"><div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg text-sm font-semibold accent-color">{(o?.name||o?.email||"?").charAt(0).toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-heading truncate">{o?.name||o?.email}</p>{c.messages[0] && <p className="text-xs text-body truncate">{c.messages[0].content}</p>}</div></button>); }))}</div>
          ) : (<><div className="flex-1 overflow-y-auto px-3 py-3">{messagesLoading ? <div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-themed border-t-[var(--accent)]" /></div> : messages.length === 0 ? <p className="text-center text-xs text-body py-12">No messages yet</p> : <div className="space-y-3">{messages.map((m) => { if (m.isSystem) return (<div key={m.id} className="flex justify-center"><p className="text-xs text-dim">{m.content}</p></div>); const isOwn = m.user.id === currentUserId; return (<div key={m.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}><div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2", isOwn ? "bg-[var(--accent)] text-[var(--on-accent)]" : "bg-hover text-heading")}><p className="text-[13px] whitespace-pre-wrap break-words">{m.content}</p><p className={cn("text-[10px] mt-0.5", isOwn ? "text-[var(--accent)]" : "text-body")}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div>); })}<div ref={messagesEndRef} /></div>}</div><div className="border-t border-themed-subtle px-3 py-2.5"><div className="flex items-center gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type a message..." className="flex-1 rounded-xl border border-themed bg-page px-3.5 py-2 text-sm text-heading placeholder-surface-400 outline-none focus:border-[var(--accent)]" /><button onClick={handleSend} disabled={!input.trim()||isPending} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50"><Send className="h-4 w-4" /></button></div></div></>)}
        </div>
      )}
    </>
  );
}
