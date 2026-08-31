'use client'

import { useMemo, useState } from 'react'
import { ArrowUp, AudioLines, Bot, Check, ChevronDown, Command, FileUp, Menu, MoreHorizontal, Plus, Search, Settings2, Sparkles, X, Zap } from 'lucide-react'

const models = [
  { name: 'Llama 3', detail: 'Meta · 70B', color: 'model-blue' },
  { name: 'Gemini', detail: 'Google · 1.5 Pro', color: 'model-green' },
  { name: 'Claude', detail: 'Anthropic · 3.5 Sonnet', color: 'model-orange' },
  { name: 'GPT', detail: 'OpenAI · 4o', color: 'model-lilac' },
  { name: 'Mistral', detail: 'Mistral AI · Large', color: 'model-rose' },
]

type Message = { role: 'user' | 'assistant'; content: string; time: string }

const seedMessages: Message[] = [
  { role: 'user', content: 'Help me map out a launch strategy for a new AI productivity tool.', time: '09:41 AM' },
  { role: 'assistant', content: 'Absolutely. Let’s build a focused launch system around three pillars: positioning, distribution, and momentum.', time: '09:41 AM' },
  { role: 'assistant', content: '### The core narrative\n\nPosition your product as the calm, intelligent layer between people and their work — not another tool to manage.\n\n- **Lead with the outcome:** reclaim focused time\n- **Show the magic:** one prompt → a finished workflow\n- **Build trust:** transparent, human-first AI\n\n```\nlaunch_theme = "Work, elevated."\nprimary_metric = "activated_workspaces"\n```', time: '09:42 AM' },
]

export default function Home() {
  const [activeModel, setActiveModel] = useState(models[3])
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filteredChats = useMemo(() => ['AI launch strategy', 'Product positioning notes', 'Q3 growth experiments'].filter((chat) => chat.toLowerCase().includes(search.toLowerCase())), [search])

  function sendMessage() {
    const text = input.trim()
    if (!text || isTyping) return
    setMessages((current) => [...current, { role: 'user', content: text, time: 'Now' }])
    setInput('')
    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', content: `Here’s a clear way to think about that through ${activeModel.name}: start with the highest-leverage decision, define the signal you want to create, then turn it into one focused next step.`, time: 'Now' }])
      setIsTyping(false)
    }, 900)
  }

  function newChat() { setMessages([]); setInput(''); setDrawerOpen(false) }

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <aside className={`sidebar ${drawerOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-inner">
        <div className="brand-row"><div className="brand-mark"><Sparkles size={17} /></div><span>OMNI<span className="brand-muted">BRAIN</span></span><button className="mobile-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <button className="new-chat" onClick={newChat}><Plus size={17} /> New chat <span className="shortcut">⌘ K</span></button>
        <label className="search-box"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations" /><span>⌘ /</span></label>
        <div className="section-label">Models <span>5 online</span></div>
        <div className="model-list">{models.map((model) => <button className={`model-item ${activeModel.name === model.name ? 'model-active' : ''}`} key={model.name} onClick={() => { setActiveModel(model); setDrawerOpen(false) }}><span className={`model-icon ${model.color}`}><Bot size={16} /></span><span className="model-copy"><strong>{model.name}</strong><small>{model.detail}</small></span><i className="online-dot" />{activeModel.name === model.name && <Check size={14} className="model-check" />}</button>)}</div>
        <div className="section-label recent-label">Recent <span><MoreHorizontal size={16} /></span></div>
        <div className="recent-list">{filteredChats.map((chat, index) => <button className={`recent-chat ${index === 0 ? 'recent-active' : ''}`} key={chat}><span className="recent-dot" /><span>{chat}</span><small>{index === 0 ? 'Now' : `${index + 1}h`}</small></button>)}</div>
        <div className="sidebar-bottom"><button className="side-action"><Settings2 size={17} /> Settings</button><div className="profile"><div className="avatar">AK</div><div><strong>Alex Kim</strong><small>Pro workspace</small></div><MoreHorizontal size={17} /></div></div>
      </div>
    </aside>
    {drawerOpen && <button className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />}
    <section className="workspace">
      <header className="topbar"><button className="mobile-menu" onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="current-model"><span className={`model-icon ${activeModel.color}`}><Bot size={16} /></span><div><strong>{activeModel.name}</strong><span>Balanced reasoning</span></div><ChevronDown size={15} /></div><div className="topbar-actions"><span className="ai-status"><i /> AI online</span><button className="icon-btn" aria-label="Command menu"><Command size={17} /></button><button className="icon-btn" aria-label="More actions"><MoreHorizontal size={19} /></button></div></header>
      <div className="chat-scroll"><div className="chat-content">{messages.length === 0 && <div className="empty-state"><div className="empty-icon"><Sparkles size={23} /></div><p className="eyebrow">A workspace for better thinking</p><h1>What will we<br /><span>create today?</span></h1><p className="empty-copy">Ask anything, explore ideas, or turn a blank page into momentum.</p></div>}{messages.length > 0 && <div className="conversation"><div className="conversation-date"><span>Today, August 31</span></div>{messages.map((message, index) => <article className={`message-row ${message.role}`} key={`${message.time}-${index}`}><div className="message-avatar">{message.role === 'assistant' ? <Sparkles size={15} /> : 'AK'}</div><div className="message-body"><div className="message-meta"><strong>{message.role === 'assistant' ? activeModel.name : 'You'}</strong><span>{message.time}</span></div><div className={`message-bubble ${message.role}`}>{message.content.split('\n').map((line, i) => <p key={i} className={line.startsWith('###') ? 'message-heading' : line.startsWith('- ') ? 'bullet-line' : line.startsWith('```') ? 'code-line' : ''}>{line.startsWith('### ') ? line.slice(4) : line.startsWith('- ') ? line.slice(2) : line}</p>)}</div>{message.role === 'assistant' && index === 2 && <div className="message-tools"><button>Copy</button><button>Regenerate</button></div>}</div></article>)}{isTyping && <div className="message-row assistant"><div className="message-avatar"><Sparkles size={15} /></div><div className="message-body"><div className="message-meta"><strong>{activeModel.name}</strong><span>Thinking</span></div><div className="typing-bubble"><i /><i /><i /></div></div></div>}</div>}</div></div>
      <div className="composer-wrap"><div className="composer"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); sendMessage() } }} placeholder="Message your AI..." rows={1} /><div className="composer-footer"><div className="composer-tools"><button aria-label="Attach file"><FileUp size={18} /></button><button aria-label="Voice input"><AudioLines size={18} /></button><span>Shift + Enter for new line</span></div><button className={`send-btn ${input.trim() ? 'send-active' : ''}`} onClick={sendMessage} aria-label="Send message"><ArrowUp size={18} /></button></div></div><div className="composer-note"><Zap size={12} /> OmniBrain can make mistakes. Check important info.</div></div>
    </section>
  </main>
}
