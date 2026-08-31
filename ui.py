import gradio as gr

def predict(message, history):
    return "Main Zexio AI hoon 🧠\n\nAapka message mil gaya hai. Main aapki help ke liye ready hoon!"

css = """
body { background:#030914 !important; }
.gradio-container { max-width:1100px !important; margin:auto !important; background:#030914 !important; }
#header { text-align:left; padding:20px 10px; border-bottom:1px solid #172238; }
#logo { font-size:30px; font-weight:700; color:white; }
#status { color:#8d99aa; font-size:15px; }
#chat { border:none !important; background:#030914 !important; }
textarea { background:#0b1424 !important; color:white !important; border:1px solid #26354d !important; border-radius:22px !important; }
button { border-radius:20px !important; }
"""

with gr.Blocks(css=css, title="Zexio AI AI") as demo:
    gr.HTML("""
    <div id="header">
        <div id="logo">🧠 Zexio AI AI</div>
        <div id="status">Your Personal AI Assistant <span style="color:#00ff88">●</span></div>
    </div>
    """)
    
    gr.Markdown(
        "<h1 style='text-align:center;margin-top:45px'>How can I <span style='color:#00d9ff'>help</span> you today?</h1>"
        "<p style='text-align:center;color:#8d99aa'>Ask anything. Zexio AI is ready.</p>"
    )
    
    chatbot = gr.Chatbot(
        height=520,
        show_label=False,
        avatar_images=(None, None),
        bubble_full_width=False,
        type="messages"
    )
    
    with gr.Row():
        msg = gr.Textbox(
            placeholder="Message Zexio AI...",
            show_label=False,
            scale=8,
            lines=1
        )
        send = gr.Button("➤", scale=1, variant="primary")
    
    def chat(message, history):
        response = predict(message, history)
        history = history or []
        history.append({"role":"user","content":message})
        history.append({"role":"assistant","content":response})
        return "", history

    send.click(chat, [msg, chatbot], [msg, chatbot])
    msg.submit(chat, [msg, chatbot], [msg, chatbot])

demo.launch(share=True, show_api=False)
