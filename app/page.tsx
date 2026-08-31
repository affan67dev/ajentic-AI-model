'use client'

import { useMemo, useRef, useState } from 'react'
import { ArrowUp, AudioLines, Camera, Check, Command, Copy, FileText, FileUp, Image as ImageIcon, Link2, Menu, MoreHorizontal, Music2, Paperclip, Plus, Search, Settings2, Share2, Sparkles, ThumbsDown, ThumbsUp, Volume2, X, Zap } from 'lucide-react'

const models = [
  { name: 'Llama 3', detail: 'Meta · 70B', color: 'model-blue' },
  { name: 'Gemini', detail: 'Google · 1.5 Pro', color: 'model-green' },
  { name: 'Claude', detail: 'Anthropic · 3.5 Sonnet', color: 'model-orange' },
  { name: 'GPT', detail: 'OpenAI · 4o', color: 'model-lilac' },
  { name: 'Mistral', detail: 'Mistral AI · Large', color: 'model-rose' },
]

type Message = { role: 'user' | 'assistant'; content: string; time: string }
type Attachment = { name: string; type: string; url?: string }

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code className="message-inline-code" key={index}>{part.slice(1, -1)}</code>
    const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)
    if (link) return <a href={link[2]} target="_blank" rel="noreferrer" key={index}>{link[1]}</a>
    return part
  })
}

function renderMessageContent(content: string) {
  const blocks: React.ReactNode[] = []
  let codeLines: string[] = []
  let inCode = false
  content.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCode) blocks.push(<pre className="message-code" key={`code-${index}`}><code>{codeLines.join('\n')}</code></pre>)
      codeLines = []
      inCode = !inCode
      return
    }
    if (inCode) { codeLines.push(line); return }
    if (!line.trim()) { blocks.push(<span className="message-break" key={`break-${index}`} />); return }
    const numbered = line.match(/^\d+\.\s(.+)/)
    const className = line.startsWith('### ') ? 'message-heading' : line.startsWith('- ') ? 'bullet-line' : numbered ? 'numbered-line' : undefined
    const text = line.startsWith('### ') ? line.slice(4) : line.startsWith('- ') ? line.slice(2) : numbered ? numbered[1] : line
    blocks.push(<p className={className} key={`line-${index}`}>{renderInlineMarkdown(text)}</p>)
  })
  if (codeLines.length) blocks.push(<pre className="message-code" key="code-final"><code>{codeLines.join('\n')}</code></pre>)
  return blocks
}

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
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({})
  const [speakingMessage, setSpeakingMessage] = useState<number | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [modelControlOpen, setModelControlOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [linkDraft, setLinkDraft] = useState('')
  const [linkMode, setLinkMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSubscribed] = useState(true)
  const [autoMode, setAutoMode] = useState(true)
  const filteredChats = useMemo(() => ['AI launch strategy', 'Product positioning notes', 'Q3 growth experiments'].filter((chat) => chat.toLowerCase().includes(search.toLowerCase())), [search])

  async function copyResponse(content: string, index: number) {
    await navigator.clipboard?.writeText(content)
    setCopiedMessage(index)
    window.setTimeout(() => setCopiedMessage((current) => current === index ? null : current), 1400)
  }

  async function shareResponse(content: string) {
    if (navigator.share) await navigator.share({ text: content })
    else await navigator.clipboard?.writeText(content)
  }

  function readResponse(content: string, index: number) {
    if (!('speechSynthesis' in window)) return
    if (speakingMessage === index) { window.speechSynthesis.cancel(); setSpeakingMessage(null); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.onend = () => setSpeakingMessage((current) => current === index ? null : current)
    window.speechSynthesis.speak(utterance)
    setSpeakingMessage(index)
  }

  function handleFile(file?: File) {
    if (!file) return
    setAttachment({ name: file.name, type: file.type, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined })
    setAttachmentMenuOpen(false)
    setLinkMode(false)
  }

  function submitLink() {
    const value = linkDraft.trim()
    if (!value) return
    setAttachment({ name: value, type: 'text/uri-list' })
    setLinkDraft('')
    setLinkMode(false)
    setAttachmentMenuOpen(false)
  }

  function sendMessage() {
    const text = input.trim()
    if ((!text && !attachment) || isTyping) return
    const attachmentLabel = attachment ? `\n\nAttachment: ${attachment.name}` : ''
    setMessages((current) => [...current, { role: 'user', content: `${text}${attachmentLabel}`, time: 'Now' }])
    setInput('')
    setAttachment(null)
    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', content: 'Here’s a clear way to think about that: start with the highest-leverage decision, define the signal you want to create, then turn it into one focused next step.', time: 'Now' }])
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
        <div className="section-label recent-label">Recent <span><MoreHorizontal size={16} /></span></div>
        <div className="recent-list">{filteredChats.map((chat, index) => <button className={`recent-chat ${index === 0 ? 'recent-active' : ''}`} key={chat}><span className="recent-dot" /><span>{chat}</span><small>{index === 0 ? 'Now' : `${index + 1}h`}</small></button>)}</div>
        <div className="sidebar-bottom"><button className="side-action"><Settings2 size={17} /> Settings</button><div className="profile"><div className="avatar">AK</div><div><strong>Alex Kim</strong><small>Pro workspace</small></div><MoreHorizontal size={17} /></div></div>
      </div>
    </aside>
    {drawerOpen && <button className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />}
    <section className="workspace">
      <header className="topbar"><button className="mobile-menu" onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="current-model"><span className={`model-icon ${activeModel.color}`}><Sparkles size={16} /></span><div><strong>OmniBrain</strong><span>{isTyping ? 'Thinking…' : 'Ready when you are'}</span></div></div><div className="topbar-actions"><span className="ai-status"><i /> AI online</span><div className="control-wrap"><button className="icon-btn" onClick={() => setModelControlOpen((open) => !open)} aria-label="Open AI control" aria-expanded={modelControlOpen}><Settings2 size={17} /></button>{modelControlOpen && <div className="model-popover"><div className="popover-kicker">AI mode</div><button className={`mode-option ${autoMode ? 'mode-selected' : ''}`} onClick={() => { setAutoMode(true); setModelControlOpen(false) }}><span className="mode-dot" /><span><strong>Auto</strong><small>{isSubscribed ? 'Recommended' : 'OmniBrain automatically chooses the best available AI'}</small></span>{autoMode && <Check size={14} />}</button>{isSubscribed ? <>{models.map((model) => <button className={`mode-option ${!autoMode && activeModel.name === model.name ? 'mode-selected' : ''}`} key={model.name} onClick={() => { setActiveModel(model); setAutoMode(false); setModelControlOpen(false) }}><span className="mode-dot" /><span><strong>{model.name}</strong></span>{!autoMode && activeModel.name === model.name && <Check size={14} />}</button>)}</> : <div className="locked-mode"><span>Automatic AI routing is enabled for your plan.</span><button onClick={() => setModelControlOpen(false)}>Unlock model selection</button></div>}</div>}</div><button className="icon-btn" aria-label="Command menu"><Command size={17} /></button><button className="icon-btn" aria-label="More actions"><MoreHorizontal size={19} /></button></div></header>
      <div className="chat-scroll"><div className="chat-content">{messages.length === 0 && <div className="empty-state"><div className="empty-icon"><Sparkles size={23} /></div><p className="eyebrow">A workspace for better thinking</p><h1>What will we<br /><span>create today?</span></h1><p className="empty-copy">Ask anything, explore ideas, or turn a blank page into momentum.</p></div>}{messages.length > 0 && <div className="conversation"><div className="conversation-date"><span>Today, August 31</span></div>{messages.map((message, index) => <article className={`message-row ${message.role}`} key={`${message.time}-${index}`}>{message.role === 'assistant' && <div className="message-avatar"><Sparkles size={15} /></div>}<div className="message-body"><div className="message-meta"><strong>{message.role === 'assistant' ? 'OmniBrain' : 'You'}</strong><span>{message.time}</span></div><div className={`message-bubble ${message.role}`}>{renderMessageContent(message.content)}</div>{message.role === 'assistant' && !isTyping && <div className="message-tools" onClick={(event) => event.stopPropagation()}><button className="message-tool" onClick={() => copyResponse(message.content, index)} aria-label="Copy response" title="Copy response">{copiedMessage === index ? <Check size={15} /> : <Copy size={15} />}</button><button className="message-tool" onClick={() => shareResponse(message.content)} aria-label="Share response" title="Share response"><Share2 size={15} /></button><button className={`message-tool ${feedback[index] === 'up' ? 'tool-active' : ''}`} onClick={() => setFeedback((current) => ({ ...current, [index]: current[index] === 'up' ? undefined : 'up' }))} aria-label="Thumbs up" title="Thumbs up"><ThumbsUp size={15} /></button><button className={`message-tool ${feedback[index] === 'down' ? 'tool-active' : ''}`} onClick={() => setFeedback((current) => ({ ...current, [index]: current[index] === 'down' ? undefined : 'down' }))} aria-label="Thumbs down" title="Thumbs down"><ThumbsDown size={15} /></button><button className={`message-tool ${speakingMessage === index ? 'tool-active' : ''}`} onClick={() => readResponse(message.content, index)} aria-label="Read response aloud" title="Read response aloud"><Volume2 size={15} /></button><span className="message-more"><button className="message-tool" onClick={() => setOpenMenu(openMenu === index ? null : index)} aria-label="More response actions" title="More response actions"><MoreHorizontal size={16} /></button>{openMenu === index && <span className="message-menu"><button onClick={() => setOpenMenu(null)}>Regenerate response</button><button onClick={() => setOpenMenu(null)}>Report response</button></span>}</span></div>}</div></article>)}{isTyping && <div className="message-row assistant"><div className="message-avatar"><Sparkles size={15} /></div><div className="message-body"><div className="message-meta"><strong>OmniBrain</strong><span>Thinking…</span></div><div className="typing-bubble"><i /><i /><i /></div></div></div>}</div>}</div></div>
      <nav className="bottom-nav" aria-label="Message composer">
        {attachmentMenuOpen && <>
          <button className="composer-dismiss" onClick={() => setAttachmentMenuOpen(false)} aria-label="Close attachment menu" />
          <div className="attachment-menu">
            <strong>Add to OmniBrain</strong>
            <div className="attachment-grid">
              <button onClick={() => cameraInputRef.current?.click()}><Camera size={18} /><span>Camera</span></button>
              <button onClick={() => fileInputRef.current?.click()}><ImageIcon size={18} /><span>Photos</span></button>
              <button onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /><span>Files</span></button>
              <button onClick={() => fileInputRef.current?.click()}><FileText size={18} /><span>Documents</span></button>
              <button onClick={() => setLinkMode(true)}><Link2 size={18} /><span>Link</span></button>
              <button onClick={() => fileInputRef.current?.click()}><Music2 size={18} /><span>Audio</span></button>
            </div>
            {linkMode && <form className="link-form" onSubmit={(event) => { event.preventDefault(); submitLink() }}><input autoFocus value={linkDraft} onChange={(event) => setLinkDraft(event.target.value)} placeholder="Paste a URL" aria-label="Paste a URL" /><button type="submit" aria-label="Add link"><ArrowUp size={15} /></button></form>}
          </div>
        </>}
        {attachment && <div className="attachment-preview">{attachment.url ? <img src={attachment.url} alt="Selected attachment" /> : <FileText size={15} />}<span>{attachment.name}</span><button onClick={() => setAttachment(null)} aria-label={`Remove ${attachment.name}`}><X size={14} /></button></div>}
        <input ref={cameraInputRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => handleFile(event.target.files?.[0])} />
        <div className="composer">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); sendMessage() } }} placeholder="Ask OmniBrain…" rows={1} />
          <div className="composer-footer"><button className={`attach-btn ${attachmentMenuOpen ? 'composer-control-active' : ''}`} onClick={() => setAttachmentMenuOpen((open) => !open)} aria-label="Add attachment"><Plus size={18} /></button><input ref={fileInputRef} className="sr-only" type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx" onChange={(event) => handleFile(event.target.files?.[0])} /><div className="composer-tools"><button className={isRecording ? 'composer-control-active' : ''} onClick={() => setIsRecording((recording) => !recording)} aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}><AudioLines size={18} /></button><button className={`send-btn ${input.trim() || attachment ? 'send-active' : ''}`} onClick={sendMessage} disabled={!input.trim() && !attachment} aria-label="Send message"><ArrowUp size={18} /></button></div></div>
        </div>
        <div className="composer-note"><Zap size={12} /> OmniBrain can make mistakes. Check important information.</div>
      </nav>
    </section>
  </main>
}
