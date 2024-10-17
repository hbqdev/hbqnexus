from flask import Flask, render_template

app = Flask(__name__)

services = [
    {
        "name": "Nexus Stream",
        "url": "stream.tinflix.win",
        "description": "Stream your favorite movies and TV shows for free, no ads, no fuss, no strings attached."
    },
    {
        "name": "Nexus Cloud",
        "url": "cloud.hbqnexus.win",
        "description": "Secure cloud storage and file sharing solution for all your personal and professional needs."
    },
    {
        "name": "Nexus SonicLib",
        "url": "soniclib.hbqnexus.win",
        "description": "Your personal audio library, offering high-quality music streaming and podcast hosting."
    },
    {
        "name": "Nexus Tinflix",
        "url": "tinflix.win",
        "description": "A curated collection of indie films and documentaries for the discerning viewer."
    },
    {
        "name": "Nexus Tinlit",
        "url": "tinlit.win",
        "description": "Discover and read a vast collection of short stories and flash fiction from emerging authors."
    },
    {
        "name": "Nexus News",
        "url": "news.hbqnexus.win",
        "description": "Stay informed with our personalized news aggregator, bringing you the stories that matter most."
    },
    {
        "name": "Nexus YoutubeDL",
        "url": "youtubedl.hbqnexus.win",
        "description": "Easy-to-use YouTube video downloader for offline viewing and archiving."
    },
    {
        "name": "Nexus PDF",
        "url": "pdf.hbqnexus.win",
        "description": "Powerful PDF manipulation tools for merging, splitting, and converting documents."
    },
    {
        "name": "Nexus Reddit",
        "url": "rdt.hbqnexus.win",
        "description": "A streamlined Reddit client for a clutter-free browsing experience."
    },
    {
        "name": "Nexus Notes",
        "url": "notes.hbqnexus.win",
        "description": "Secure, synced note-taking application for all your devices."
    },
    {
        "name": "Nexus Imagen",
        "url": "imagen.hbqnexus.win",
        "description": "AI-powered image generation and manipulation tools at your fingertips."
    },
    {
        "name": "Nexus Moods",
        "url": "moods.hbqnexus.win",
        "description": "Track and analyze your daily moods to improve your mental well-being."
    },
    {
        "name": "Nexus Tools",
        "url": "tools.hbqnexus.win",
        "description": "A suite of productivity tools to streamline your workflow and boost efficiency."
    },
    {
        "name": "Nexus Chat",
        "url": "chat.hbqnexus.win",
        "description": "chatGPT alternatives, premium API access to all major foundation models (Claude, GPT-4o, Gemini, Mistral)."
    },
    {
        "name": "Nexus Search",
        "url": "search.hbqnexus.win",
        "description": "Privacy-focused search engine that doesn't track your queries or personal information."
    }
]

@app.route('/')
def index():
    return render_template('index.html', services=services)

if __name__ == '__main__':
    app.run(debug=True)

