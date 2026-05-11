import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

/* ── Copy button ─────────────────────────────────────── */
const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="btn btn-ghost py-1 px-2 text-[11px]"
      title="Copy"
    >
      {done
        ? <Check size={11} style={{ color: 'var(--green)' }} />
        : <Copy size={11} style={{ color: 'var(--text-muted)' }} />
      }
    </button>
  );
};

/* ── Language tabs + code block ─────────────────────── */
const LANGS: Record<string, string> = { curl: 'cURL', python: 'Python', javascript: 'JavaScript', php: 'PHP' };

const hl = (code: string, lang: string) => {
  const esc = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (lang === 'curl') return esc
    .replace(/\b(curl)\b/g, '<span class="tok-func">$1</span>')
    .replace(/\b(POST|GET|PATCH|DELETE)\b/g, '<span class="tok-keyword">$1</span>')
    .replace(/(-H|-d|--data)/g, '<span class="tok-func">$1</span>')
    .replace(/(https?:\/\/[^\s'"\\]+)/g, '<span class="tok-string">$1</span>')
    .replace(/"([^"]+)":/g, '"<span class="tok-key">$1</span>":')
    .replace(/: "([^"]+)"/g, ': "<span class="tok-string">$1</span>"')
    .replace(/#.+/g, '<span class="tok-comment">$&</span>');
  if (lang === 'python') return esc
    .replace(/\b(import|from|def|return|if|else|while|for|in|True|False|None|not|print)\b/g, '<span class="tok-keyword">$1</span>')
    .replace(/\b(requests|json|hmac|hashlib|time)\b/g, '<span class="tok-func">$1</span>')
    .replace(/\.(get|post|patch|delete|json|raise_for_status|encode|hexdigest|new|update|digest|compare_digest|decode|body|getBody|response)\b/g, '.<span class="tok-method">$1</span>')
    .replace(/"([^"]+)":/g, '"<span class="tok-key">$1</span>":')
    .replace(/: "([^"]+)"/g, ': "<span class="tok-string">$1</span>"')
    .replace(/f"([^"]+)"/g, '<span class="tok-string">f"$1"</span>')
    .replace(/#.+/g, '<span class="tok-comment">$&</span>');
  if (lang === 'javascript') return esc
    .replace(/\b(const|let|var|async|await|return|import|from|if|else|while|for|of|new)\b/g, '<span class="tok-keyword">$1</span>')
    .replace(/\b(fetch|console\.log|JSON\.stringify|JSON\.parse|setTimeout|crypto|Buffer|express)\b/g, '<span class="tok-func">$1</span>')
    .replace(/\.(then|catch|json|ok|data|status|headers|body|digest|update|createHmac|timingSafeEqual|sendStatus|send)\b/g, '.<span class="tok-method">$1</span>')
    .replace(/`([^`]*)`/g, '<span class="tok-string">`$1`</span>')
    .replace(/"([^"]+)":/g, '"<span class="tok-key">$1</span>":')
    .replace(/: "([^"]+)"/g, ': "<span class="tok-string">$1</span>"')
    .replace(/\/\/.+/g, '<span class="tok-comment">$&</span>');
  if (lang === 'php') return esc
    .replace(/(&lt;\?php|\$[a-zA-Z_]+|echo|json_decode|json_encode|http_response_code|file_get_contents|hash_hmac|hash_equals|error_log|exit)/g, '<span class="tok-keyword">$&</span>')
    .replace(/"([^"]+)":/g, '"<span class="tok-key">$1</span>":')
    .replace(/: "([^"]+)"/g, ': "<span class="tok-string">$1</span>"')
    .replace(/"([^"]+)"/g, '<span class="tok-string">"$1"</span>')
    .replace(/#.+|\/\/.+/g, '<span class="tok-comment">$&</span>');
  return esc;
};

const CodeBlock: React.FC<{ code: Record<string, string> }> = ({ code }) => {
  const langs = Object.keys(code);
  const [lang, setLang] = useState(langs[0]);
  return (
    <div className="rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex gap-0.5">
          {langs.map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
              style={{
                background: lang === l ? 'var(--surface)' : 'transparent',
                color: lang === l ? 'var(--text-primary)' : 'var(--text-muted)',
                border: lang === l ? '1px solid var(--border-md)' : '1px solid transparent',
              }}
            >
              {LANGS[l] || l}
            </button>
          ))}
        </div>
        <CopyBtn text={code[lang]} />
      </div>
      <pre
        className="p-4 text-[12.5px] leading-relaxed overflow-x-auto"
        style={{ background: 'var(--surface)', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}
      >
        <code dangerouslySetInnerHTML={{ __html: hl(code[lang], lang) }} />
      </pre>
    </div>
  );
};

/* ── JSON block ──────────────────────────────────────── */
const JSONBlock: React.FC<{ obj: object; label?: string }> = ({ obj, label }) => {
  const text = JSON.stringify(obj, null, 2);
  return (
    <div className="rounded-lg overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label ?? 'Response'}</span>
        <CopyBtn text={text} />
      </div>
      <pre
        className="p-4 text-[12px] leading-relaxed overflow-x-auto"
        style={{ background: 'var(--surface)', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {text}
      </pre>
    </div>
  );
};

/* ── Param table row ─────────────────────────────────── */
const Param: React.FC<{ name: string; type: string; required?: boolean; desc: string }> = ({
  name, type, required, desc
}) => (
  <tr style={{ borderBottom: '1px solid var(--border)' }}>
    <td className="py-2.5 pr-4 align-top" style={{ width: 160 }}>
      <code className="text-[12px]" style={{ color: 'var(--blue)' }}>{name}</code>
      {required && <span className="ml-1 text-[10px]" style={{ color: 'var(--red)' }}>*</span>}
    </td>
    <td className="py-2.5 pr-4 align-top" style={{ width: 90 }}>
      <code className="text-[11px]" style={{ color: 'var(--amber)' }}>{type}</code>
    </td>
    <td className="py-2.5 align-top">
      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{desc}</span>
    </td>
  </tr>
);

/* ── Method badge ────────────────────────────────────── */
const METHOD: Record<string, React.CSSProperties> = {
  GET:    { background: 'rgba(34,197,94,0.08)',  color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' },
  POST:   { background: 'rgba(59,130,246,0.08)', color: 'var(--blue)',  border: '1px solid rgba(59,130,246,0.2)' },
  PUT:    { background: 'rgba(245,158,11,0.08)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)' },
  DELETE: { background: 'rgba(239,68,68,0.06)',  color: 'var(--red)',   border: '1px solid rgba(239,68,68,0.2)' },
};

const EndpointRow: React.FC<{ method: string; path: string; desc: string }> = ({ method, path, desc }) => (
  <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
    <span className="badge text-[10px] font-bold flex-shrink-0 mt-0.5 font-mono" style={METHOD[method]}>
      {method}
    </span>
    <div>
      <code className="text-[12.5px]" style={{ color: 'var(--text-secondary)' }}>{path}</code>
      <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  </div>
);

/* ── Section ─────────────────────────────────────────── */
const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="mb-12 scroll-mt-4">
    <h2 className="text-[15px] font-semibold text-white mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
      {title}
    </h2>
    {children}
  </section>
);

/* ── Sidebar nav ─────────────────────────────────────── */
const SECTIONS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'auth',          label: 'Authentication' },
  { id: 'create',        label: 'Create Session' },
  { id: 'status',        label: 'Get Status' },
  { id: 'analysis',      label: 'Get Analysis' },
  { id: 'run-analysis',  label: 'Run / Re-run Analysis' },
  { id: 'progress-reports', label: 'Progress Reports' },
  { id: 'transcript',    label: 'Get Transcript' },
  { id: 'webhooks',      label: 'Webhooks' },
  { id: 'portal',        label: 'Portal API' },
  { id: 'errors',        label: 'Errors' },
];

/* ── Page ───────────────────────────────────────────── */
const Docs: React.FC = () => {
  const [active, setActive] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      let curr = SECTIONS[0].id;
      SECTIONS.forEach(s => {
        const sec = document.getElementById(s.id);
        if (sec && sec.getBoundingClientRect().top < 100) curr = s.id;
      });
      setActive(curr);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <nav
        className="hidden xl:flex flex-col flex-shrink-0 py-6 px-3 sticky top-0 overflow-y-auto"
        style={{ width: 188, borderRight: '1px solid var(--border)', height: '100%' }}
      >
        <p
          className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-faint)' }}
        >
          API Reference
        </p>
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="text-left px-3 py-1.5 rounded-md text-[12.5px] transition-colors mb-0.5 docs-nav-item"
            style={{
              color: active === id ? 'var(--text-primary)' : 'var(--text-muted)',
              background: active === id ? 'var(--surface-2)' : 'transparent',
              fontWeight: active === id ? 500 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-8 py-8">

        {/* Title */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge text-[10px] font-mono" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>v1.0</span>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>REST API</span>
          </div>
          <h1 className="text-[22px] font-semibold text-white mb-2">SYM Developer API</h1>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Embed AI-powered interviews into your product. Create a session, send the room URL to your candidate, and retrieve structured Gemini analysis — all programmatically.
          </p>
          <div
            className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-md text-[12.5px] font-mono"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Base URL:
            <span style={{ color: 'var(--accent)' }}>https://api.speakyourmind.app</span>
          </div>
        </div>

        {/* === Overview === */}
        <Section id="overview" title="How it works">
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {[
              { n: '1', title: 'Create a Set', desc: 'Add questions to a set in the portal. Get a set_id.' },
              { n: '2', title: 'Create a Session', desc: 'POST with set_id and candidate details. Receive a room_url.' },
              { n: '3', title: 'Get Analysis', desc: 'Poll /analysis or receive full results via webhook.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="rounded-lg p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-[12px] font-mono mb-2" style={{ color: 'var(--text-faint)' }}>{n}</p>
                <p className="text-[13px] font-semibold text-white mb-1">{title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-md px-4 py-3 text-[12px]" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Sandbox mode: </span>
            Keys created in SANDBOX mode return mock sessions that don't consume quota — ideal for integration testing.
          </div>
        </Section>

        {/* === Auth === */}
        <Section id="auth" title="Authentication">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            All Public API requests must include your API key in the <code className="inline-code">X-API-Key</code> header.
            Generate keys from the <a href="/api-keys" style={{ color: 'var(--accent)' }}>API Keys</a> page.
          </p>
          <CodeBlock code={{
            curl: `curl -X POST https://api.speakyourmind.app/api/v1/developer/sessions/ \\
  -H "X-API-Key: sym_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"set_id": "...", "candidate_name": "Alice"}'`,
            python: `import requests

response = requests.post(
    "https://api.speakyourmind.app/api/v1/developer/sessions/",
    headers={
        "X-API-Key": "sym_live_your_key_here",
        "Content-Type": "application/json"
    },
    json={"set_id": "uuid", "candidate_name": "Alice"}
)`,
            javascript: `const response = await fetch(
  "https://api.speakyourmind.app/api/v1/developer/sessions/",
  {
    method: "POST",
    headers: {
      "X-API-Key": "sym_live_your_key_here",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ set_id: "uuid", candidate_name: "Alice" })
  }
);`,
            php: `<?php
$res = $client->post(
    "https://api.speakyourmind.app/api/v1/developer/sessions/",
    [
        "headers" => ["X-API-Key" => "sym_live_your_key_here"],
        "json"    => ["set_id" => "uuid", "candidate_name" => "Alice"]
    ]
);`,
          }} />
          <div className="rounded-md px-4 py-3 text-[12px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            <div><span style={{ color: 'var(--amber)' }}>sym_sandbox_…</span> · Sandbox key — no quota, mock responses</div>
            <div className="mt-1"><span style={{ color: 'var(--green)' }}>sym_live_…</span> · Live key — consumes quota, real AI analysis</div>
          </div>
        </Section>

        {/* === Create === */}
        <Section id="create" title="Create Interview Session">
          <div className="rounded-lg px-4 py-1 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EndpointRow method="POST" path="/api/v1/developer/sessions/" desc="Create a new interview room for a candidate" />
          </div>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Request Body</p>
          <div className="rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full" style={{ background: 'var(--surface)' }}>
              <tbody className="px-4">
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="pl-4" colSpan={3}>
                    <div className="py-1" />
                  </td>
                </tr>
                <Param name="set_id"             type="uuid"    required desc="UUID of the question set to use" />
                <Param name="candidate_name"      type="string"  required desc="Full name — shown in the interview room" />
                <Param name="candidate_email"     type="string"  required desc="Candidate email address" />
                <Param name="candidate_metadata"  type="object"         desc="Optional key-value metadata (e.g. job_id, role)" />
                <Param name="webhook_url"         type="string"         desc="URL to POST the analysis to when complete" />
                <Param name="expiry_hours"        type="integer"        desc="Hours until room_url expires (default 72, max 168)" />
              </tbody>
            </table>
          </div>
          <CodeBlock code={{
            curl: `curl -X POST https://api.speakyourmind.app/api/v1/developer/sessions/ \\
  -H "X-API-Key: sym_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "set_id": "3f4a1b2c-...",
    "candidate_name": "Alice Smith",
    "candidate_email": "alice@company.com",
    "candidate_metadata": {"job_id": "SWE-042"},
    "webhook_url": "https://your-app.com/hooks/sym",
    "expiry_hours": 48
  }'`,
            python: `import requests

response = requests.post(
    "https://api.speakyourmind.app/api/v1/developer/sessions/",
    headers={"X-API-Key": "sym_live_your_key_here"},
    json={
        "set_id": "3f4a1b2c-...",
        "candidate_name": "Alice Smith",
        "candidate_email": "alice@company.com",
        "candidate_metadata": {"job_id": "SWE-042"},
        "webhook_url": "https://your-app.com/hooks/sym",
        "expiry_hours": 48
    }
)
data = response.json()
room_url = data["data"]["room_url"]
print(f"Send this to Alice: {room_url}")`,
            javascript: `const res = await fetch(
  "https://api.speakyourmind.app/api/v1/developer/sessions/",
  {
    method: "POST",
    headers: {
      "X-API-Key": "sym_live_your_key_here",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      set_id: "3f4a1b2c-...",
      candidate_name: "Alice Smith",
      candidate_email: "alice@company.com",
      candidate_metadata: { job_id: "SWE-042" },
      webhook_url: "https://your-app.com/hooks/sym"
    })
  }
);
const { data } = await res.json();
console.log("Room URL:", data.room_url);`,
            php: `$res = $client->post("https://api.speakyourmind.app/api/v1/developer/sessions/", [
    "headers" => ["X-API-Key" => "sym_live_your_key_here"],
    "json"    => [
        "set_id"             => "3f4a1b2c-...",
        "candidate_name"     => "Alice Smith",
        "candidate_email"    => "alice@company.com",
        "candidate_metadata" => ["job_id" => "SWE-042"],
        "webhook_url"        => "https://your-app.com/hooks/sym"
    ]
]);
$data = json_decode($res->getBody(), true)["data"];
echo $data["room_url"];`,
          }} />
          <JSONBlock label="201 Created" obj={{
            status: "success",
            data: {
              room_id: "e4a1f923-c2b4-4d91-a7f3-8b0e2d1c9a56",
              room_url: "https://speakyourmind.app/interview-room/e4a1f923-...",
              candidate_name: "Alice Smith",
              set_name: "Frontend Engineer Interview",
              question_count: 5,
              expires_at: "2026-04-28T18:30:00Z",
              status: "PENDING"
            }
          }} />
        </Section>

        {/* === Status === */}
        <Section id="status" title="Get Session Status">
          <div className="rounded-lg px-4 py-1 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EndpointRow method="GET" path="/api/v1/developer/sessions/{room_id}/" desc="Returns current status without full analysis" />
          </div>
          <CodeBlock code={{
            curl:       `curl https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/ \\\n  -H "X-API-Key: sym_live_your_key_here"`,
            python:     `r = requests.get(\n    f"https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/",\n    headers={"X-API-Key": "sym_live_your_key_here"}\n)\nprint(r.json()["data"]["status"])  # PENDING | IN_PROGRESS | COMPLETED | EXPIRED`,
            javascript: `const { data } = await (await fetch(\n  \`https://api.speakyourmind.app/api/v1/developer/sessions/\${roomId}/\`,\n  { headers: { "X-API-Key": "sym_live_your_key_here" } }\n)).json();\nconsole.log(data.status);`,
            php:        `$res = $client->get(".../{$roomId}/", ["headers" => ["X-API-Key" => "..."]]);\n$status = json_decode($res->getBody(), true)["data"]["status"];`,
          }} />
        </Section>

        {/* === Analysis === */}
        <Section id="analysis" title="Get Full Analysis">
          <div className="rounded-lg px-4 py-1 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EndpointRow method="GET" path="/api/v1/developer/sessions/{room_id}/analysis/" desc="Full Gemini AI analysis (available when analysis_status = DONE)" />
          </div>
          <CodeBlock code={{
            curl:   `curl https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/analysis/ \\\n  -H "X-API-Key: sym_live_your_key_here"`,
            python: `import time\n\nwhile True:\n    r = requests.get(\n        f"https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/analysis/",\n        headers={"X-API-Key": "sym_live_your_key_here"}\n    )\n    body = r.json()\n    if body["status"] == "success":\n        print("Score:", body["data"]["overall_score"])\n        break\n    time.sleep(5)  # poll every 5s`,
            javascript: `const poll = async (roomId, key) => {\n  while (true) {\n    const res = await fetch(\n      \`https://api.speakyourmind.app/api/v1/developer/sessions/\${roomId}/analysis/\`,\n      { headers: { "X-API-Key": key } }\n    );\n    const body = await res.json();\n    if (body.status === "success") return body.data;\n    await new Promise(r => setTimeout(r, 5000));\n  }\n};`,
            php:    `// Prefer webhooks over polling in production\n$res = $client->get(".../analysis/", ["headers" => ["X-API-Key" => "..."]]);\n$analysis = json_decode($res->getBody(), true)["data"]["analysis"];`,
          }} />
          <JSONBlock label="200 OK" obj={{
            status: "success",
            data: {
              room_id: "e4a1f923-...",
              overall_score: 82,
              verdict: "HIRE",
              analysis: {
                summary: "Alice demonstrated strong problem-solving…",
                assessment_verdict: "YES",
                verdict: "HIRE",
                competency_breakdown: {
                  technical_skills: { score: 7.5, notes: "Solid depth on system design." },
                  communication: { score: 8.0, notes: "Clear and structured." },
                  problem_solving: { score: 8.2, notes: "Strong structured approach." },
                  cultural_fit: { score: 7.8, notes: "Collaborative tone." }
                },
                competency_scores: { communication: 80, problem_solving: 82, domain_knowledge: 75, confidence: 82 },
                skill_ladder: { level: "Emerging", score: 71, dimension_percentages: { clarity: 72, confidence: 82 } },
                per_question: [{ question_index: 0, score: 8.2, feedback: "Clear and relevant.", better_answer: "…", focus_area: "problem_solving" }]
              }
            }
          }} />
        </Section>

        {/* === Run analysis (API key) === */}
        <Section id="run-analysis" title="Run or Re-run Analysis">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Starts Gemini analysis for a <strong className="text-[var(--text-secondary)]">COMPLETED</strong> session.
            First-time runs work when analysis is <code className="inline-code">PENDING</code> or <code className="inline-code">FAILED</code>.
            To replace an existing report, send <code className="inline-code">{"{ \"regenerate\": true }"}</code> or <code className="inline-code">?regenerate=true</code>
            — required when <code className="inline-code">analysis_status</code> is already <code className="inline-code">DONE</code>.
            Scoring aligns with the main SYM interview pipeline (competency breakdown + skill ladder).
          </p>
          <div className="rounded-lg px-4 py-1 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EndpointRow method="POST" path="/api/v1/developer/sessions/{room_id}/run-analysis/" desc="Run or regenerate analysis (X-API-Key)" />
          </div>
          <CodeBlock code={{
            curl:
              `# First run (or retry after failure):\ncurl -X POST "https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/run-analysis/" \\\n  -H "X-API-Key: sym_live_your_key_here" \\\n  -H "Content-Type: application/json" -d "{}"\n\n# Replace existing analysis:\ncurl -X POST "https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/run-analysis/?regenerate=true" \\\n  -H "X-API-Key: sym_live_your_key_here"`,
            python:
              `requests.post(\n    f"https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/run-analysis/",\n    headers={"X-API-Key": "sym_live_your_key_here"},\n    json={"regenerate": True},  # omit or False for first run\n    timeout=120,\n).json()`,
            javascript:
              `await fetch(\`\${base}/sessions/\${roomId}/run-analysis/\`, {\n  method: "POST",\n  headers: { "X-API-Key": key, "Content-Type": "application/json" },\n  body: JSON.stringify({ regenerate: true }),\n});`,
          }} />
        </Section>

        {/* === Progress reports === */}
        <Section id="progress-reports" title="Progress Reports (batch)">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Generate a senior-coach style guidance report (structured, student-facing) for 1–5 <strong className="text-[var(--text-secondary)]">COMPLETED</strong> sessions in one request.
            Sessions are analyzed in <strong className="text-[var(--text-secondary)]">chronological order by completion time</strong>.
            Each session gets its own persisted report row; use <code className="inline-code">report_id</code> from the response for later retrieval.
            Async mode returns <code className="inline-code">202</code> — poll <code className="inline-code">GET …/progress-reports/?batch_id=…</code> until each row is <code className="inline-code">DONE</code> or <code className="inline-code">FAILED</code>.
          </p>
          <div className="rounded-lg px-4 py-1 mb-5 space-y-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EndpointRow method="POST" path="/api/v1/developer/progress-reports/" desc="Body: { session_room_ids: [uuid,…] } — max 5 (X-API-Key)" />
            <EndpointRow method="GET" path="/api/v1/developer/progress-reports/?batch_id={batch_id}" desc="List rows for a batch (polling)" />
            <EndpointRow method="GET" path="/api/v1/developer/progress-reports/{report_id}/" desc="Fetch stored JSON report by id" />
            <EndpointRow method="DELETE" path="/api/v1/developer/progress-reports/{report_id}/" desc="Delete a stored progress report row" />
            <EndpointRow method="GET" path="/api/v1/developer/sessions/{room_id}/progress-report/" desc="Latest progress report for a room" />
            <EndpointRow method="POST" path="/api/v1/developer/sessions/{room_id}/progress-report/run/" desc="Generate or regenerate latest progress report (regenerate=true if already DONE)" />
          </div>
          <CodeBlock code={{
            curl:
              '# Start batch\ncurl -X POST "https://api.speakyourmind.app/api/v1/developer/progress-reports/" \\n  -H "X-API-Key: sym_live_your_key_here" \\n  -H "Content-Type: application/json" \\n  -d \'{"session_room_ids":["uuid1","uuid2"]}\'\n\n# Poll\ncurl "https://api.speakyourmind.app/api/v1/developer/progress-reports/?batch_id=BATCH_UUID" \\n  -H "X-API-Key: sym_live_your_key_here"',
            python:
              'import requests\nr = requests.post(\n  "https://api.speakyourmind.app/api/v1/developer/progress-reports/",\n  headers={"X-API-Key": "...", "Content-Type": "application/json"},\n  json={"session_room_ids": ["uuid1", "uuid2"]},\n  timeout=180,\n)\nprint(r.status_code, r.json())',
            javascript:
              'await fetch(base + "/api/v1/developer/progress-reports/", {\n  method: "POST",\n  headers: { "X-API-Key": key, "Content-Type": "application/json" },\n  body: JSON.stringify({ session_room_ids: [roomId1, roomId2] }),\n});',
          }} />
          <p className="text-[12px] mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Portal (JWT): same paths under <code className="inline-code">/api/v1/dev-portal/</code>. Session detail includes{' '}
            <code className="inline-code">progress_report_latest</code> summary; use the Progress reports page to submit batches interactively.
          </p>
        </Section>

        {/* === Transcript === */}
        <Section id="transcript" title="Get Transcript">
          <div className="rounded-lg px-4 py-1 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EndpointRow method="GET" path="/api/v1/developer/sessions/{room_id}/transcript/" desc="Raw Q&A — available immediately after completion" />
          </div>
          <CodeBlock code={{
            curl:       `curl https://api.speakyourmind.app/api/v1/developer/sessions/{room_id}/transcript/ \\\n  -H "X-API-Key: sym_live_your_key_here"`,
            python:     `r = requests.get(".../transcript/", headers={"X-API-Key": "..."})\nfor a in r.json()["data"]["answers"]:\n    print(f"Q{a['question_index']+1}:", a["answer_text"])`,
            javascript: `const { data } = await (await fetch(\`.../transcript/\`, { headers: { "X-API-Key": "..." } })).json();\ndata.answers.forEach(a => console.log(\`Q\${a.question_index+1}:\`, a.answer_text));`,
            php:        `$answers = json_decode($client->get(".../transcript/", [...])->getBody(), true)["data"]["answers"];`,
          }} />
        </Section>

        {/* === Webhooks === */}
        <Section id="webhooks" title="Webhooks">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            When a <code className="inline-code">webhook_url</code> is provided at session creation, SYM POSTs the full analysis to it when ready.
            Payloads are signed with HMAC-SHA256 using your webhook secret — always verify the signature before trusting the payload.
          </p>
          <div className="rounded-md px-4 py-3 text-[12px] mb-5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', color: 'var(--text-secondary)' }}>
            Verify the <code className="inline-code">X-SYM-Signature</code> header using a constant-time comparison to prevent timing attacks.
          </div>
          <CodeBlock code={{
            python: `import hmac, hashlib\nfrom flask import Flask, request, abort\n\napp = Flask(__name__)\nSECRET = "your_webhook_secret_here"\n\n@app.route("/hooks/sym", methods=["POST"])\ndef sym_webhook():\n    sig = request.headers.get("X-SYM-Signature", "")\n    expected = "sha256=" + hmac.new(\n        SECRET.encode(), request.data, hashlib.sha256\n    ).hexdigest()\n    if not hmac.compare_digest(sig, expected):\n        abort(400, "Invalid signature")\n    payload = request.json\n    print(payload["verdict"], payload["overall_score"])\n    return "", 200`,
            javascript: `import crypto from "crypto";\nimport express from "express";\n\nconst app = express();\nconst SECRET = "your_webhook_secret_here";\n\napp.post("/hooks/sym", express.raw({ type: "application/json" }), (req, res) => {\n  const sig = req.headers["x-sym-signature"] ?? "";\n  const expected = "sha256=" + crypto\n    .createHmac("sha256", SECRET)\n    .update(req.body)\n    .digest("hex");\n  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))\n    return res.sendStatus(400);\n  const { verdict, overall_score } = JSON.parse(req.body);\n  console.log(verdict, overall_score);\n  res.sendStatus(200);\n});`,
            php: `<?php\n$secret  = "your_webhook_secret_here";\n$payload = file_get_contents("php://input");\n$sig     = $_SERVER["HTTP_X_SYM_SIGNATURE"] ?? "";\n$expected = "sha256=" . hash_hmac("sha256", $payload, $secret);\nif (!hash_equals($expected, $sig)) {\n    http_response_code(400);\n    exit("Invalid signature");\n}\n$data = json_decode($payload, true);\nerror_log($data["verdict"]);\nhttp_response_code(200);`,
            curl: `# Webhook payload example\ncurl -X POST https://your-app.com/hooks/sym \\\n  -H "Content-Type: application/json" \\\n  -H "X-SYM-Signature: sha256=<hmac>" \\\n  -H "X-SYM-Event: interview.completed" \\\n  -d '{"event":"interview.completed","verdict":"HIRE","overall_score":82}'`,
          }} />
        </Section>

        {/* === Portal === */}
        <Section id="portal" title="Portal API (JWT)">
          <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
            These endpoints use JWT Bearer tokens from login, not API keys. Used by this portal dashboard.
          </p>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="px-4">
              <EndpointRow method="POST" path="/api/v1/dev-portal/auth/login/" desc="Obtain JWT access + refresh tokens" />
              <EndpointRow method="GET"  path="/api/v1/dev-portal/dashboard/" desc="Usage statistics and quota" />
              <EndpointRow method="GET"  path="/api/v1/dev-portal/sets/" desc="List question sets" />
              <EndpointRow method="POST" path="/api/v1/dev-portal/sets/" desc="Create a question set" />
              <EndpointRow method="PUT"  path="/api/v1/dev-portal/sets/{id}/questions/" desc="Replace all questions in a set" />
              <EndpointRow method="GET"  path="/api/v1/dev-portal/api-keys/" desc="List API keys" />
              <EndpointRow method="POST" path="/api/v1/dev-portal/api-keys/" desc="Create an API key" />
              <EndpointRow method="GET"  path="/api/v1/dev-portal/sessions/" desc="List sessions (filterable by status, set)" />
              <EndpointRow method="GET"  path="/api/v1/dev-portal/sessions/{room_id}/" desc="Full session detail with analysis" />
              <EndpointRow method="POST" path="/api/v1/dev-portal/sessions/{room_id}/run-analysis/" desc="Run / regenerate analysis (JWT). Body regenerate: true when analysis already DONE" />
              <EndpointRow method="POST" path="/api/v1/dev-portal/progress-reports/" desc="Batch progress reports (1–5 session_room_ids)" />
              <EndpointRow method="GET" path="/api/v1/dev-portal/progress-reports/?batch_id={batch_id}" desc="Poll batch status" />
              <EndpointRow method="GET" path="/api/v1/dev-portal/progress-reports/{report_id}/" desc="Fetch one stored progress report" />
              <EndpointRow method="DELETE" path="/api/v1/dev-portal/progress-reports/{report_id}/" desc="Delete one stored progress report" />
              <EndpointRow method="GET" path="/api/v1/dev-portal/sessions/{room_id}/progress-report/" desc="Latest progress report for a session" />
              <EndpointRow method="POST" path="/api/v1/dev-portal/sessions/{room_id}/progress-report/run/" desc="Generate/regenerate latest progress report for a session" />
            </div>
          </div>
        </Section>

        {/* === Errors === */}
        <Section id="errors" title="Errors">
          <div className="rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full" style={{ background: 'var(--surface)' }}>
              <tbody>
                {[
                  ['400', 'Bad Request',      'Missing or invalid fields'],
                  ['401', 'Unauthorized',     'Invalid or missing X-API-Key'],
                  ['404', 'Not Found',        'Session or set not owned by you'],
                  ['409', 'Conflict',         'Session already completed or started'],
                  ['410', 'Gone',             'Room URL has expired'],
                  ['429', 'Too Many Requests','Rate limit exceeded'],
                  ['500', 'Server Error',     'AI pipeline error — contact support'],
                ].map(([code, name, desc], i, arr) => (
                  <tr
                    key={code}
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td className="px-4 py-2.5 w-12">
                      <code
                        className="text-[12px] font-bold"
                        style={{ color: code.startsWith('4') ? 'var(--amber)' : code.startsWith('5') ? 'var(--red)' : 'var(--green)' }}
                      >
                        {code}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 w-36">
                      <span className="text-[12.5px] font-medium text-white">{name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{desc}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Rate limit headers are returned with every response. Per-day and per-month limits apply to{' '}
            <code className="inline-code">POST /sessions/</code> only. Sandbox keys are exempt from rate limits.
          </p>
        </Section>

      </div>

      <style>{`
        .docs-nav-item:hover:not([style*="var(--surface-2)"]) {
          color: var(--text-secondary) !important;
          background: var(--surface-2) !important;
        }
      `}</style>
    </div>
  );
};

export default Docs;
