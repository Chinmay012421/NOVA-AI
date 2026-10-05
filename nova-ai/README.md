# NOVA AI

A futuristic personal AI assistant built with HTML, CSS, JavaScript, Node.js, Express, and the OpenAI API.

## Project structure

```text
nova-ai/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── render.yaml
├── .node-version
├── .env.example
├── .gitignore
└── README.md
```

## Run locally

1. Install Node.js 20+.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
```

4. Copy `.env.example` to `.env`.
5. Put your API key in `.env`.
6. Start NOVA:

```bash
npm start
```

7. Open `http://localhost:10000`.

## Deploy to Render

Create a Render Web Service from this GitHub repository.

Use:

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

Then add these Environment Variables in Render:

- `OPENAI_API_KEY` = your real API key
- `OPENAI_MODEL` = `gpt-5-mini`

Do not put the real API key in `index.html`, `app.js`, or any other frontend file.

## Voice

NOVA uses the browser's built-in speech recognition when available. The AI response can also be spoken using the browser's speech synthesis.

## Important

The frontend never receives the OpenAI API key. Browser requests go to `/api/chat`, and the Render server calls the AI provider.
