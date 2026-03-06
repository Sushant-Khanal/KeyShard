import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  :root {
    --bg:      #0a0a0a;
    --bg2:     #111111;
    --bg3:     #171717;
    --bd:      #222222;
    --bd2:     #333333;
    --text:    #e4e2dc;
    --muted:   #666666;
    --dim:     #3a3a3a;
    --amber:   #f59e0b;
    --amber2:  #d97706;
    --red:     #ef4444;
    --green:   #22c55e;
    --blue:    #60a5fa;
    --mono:    'IBM Plex Mono', monospace;
    --sans:    'IBM Plex Sans', sans-serif;
    --disp:    'Bebas Neue', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--dim); }
  ::selection { background: var(--amber); color: #000; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 52px; display: flex; align-items: center; padding: 0 28px;
    border-bottom: 1px solid transparent;
    transition: border-color .3s, background .3s;
    font-family: var(--mono);
  }
  nav.scrolled { background: rgba(10,10,10,.96); border-color: var(--bd); backdrop-filter: blur(10px); }

  .logo {
    display: flex; align-items: center; gap: 10px; text-decoration: none;
    font-family: var(--disp); font-size: 1.4rem; letter-spacing: .12em; color: var(--text);
  }
  .logo-diamond {
    width: 26px; height: 26px; border: 1.5px solid var(--amber);
    transform: rotate(45deg); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .logo-diamond-fill { width: 9px; height: 9px; background: var(--amber); }

  .nav-links { margin-left: auto; display: flex; align-items: center; gap: 32px; }
  .nav-a {
    font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
    color: var(--muted); text-decoration: none; transition: color .15s; cursor: pointer;
    background: none; border: none; font-family: var(--mono);
  }
  .nav-a:hover { color: var(--text); }
  .nav-gh {
    font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; font-weight: 600;
    background: var(--amber); color: #000; padding: 8px 16px; text-decoration: none;
    transition: background .15s;
  }
  .nav-gh:hover { background: var(--amber2); }

  .disp { font-family: var(--disp); letter-spacing: .04em; line-height: .92; }

  .label {
    font-family: var(--mono); font-size: .65rem; letter-spacing: .2em;
    text-transform: uppercase; color: var(--amber);
    display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
  }
  .label::before { content: ''; display: block; width: 20px; height: 1px; background: var(--amber); }

  .wrap { max-width: 1200px; margin: 0 auto; }
  .section { padding: 88px 28px; }

  .btn {
    display: inline-flex; align-items: center; gap: 9px;
    font-family: var(--mono); font-size: .72rem; letter-spacing: .1em;
    text-transform: uppercase; text-decoration: none; cursor: pointer;
    padding: 12px 22px; border: 1px solid; transition: background .15s, color .15s, border-color .15s;
    background: none;
  }
  .btn-solid { background: var(--amber) !important; color: #000; border-color: var(--amber); }
  .btn-solid:hover { background: var(--amber2) !important; border-color: var(--amber2); }
  .btn-outline { color: var(--text); border-color: var(--bd2); }
  .btn-outline:hover { border-color: var(--text); }

  .tag {
    font-family: var(--mono); font-size: .63rem; letter-spacing: .07em;
    border: 1px solid var(--bd2); color: var(--muted); padding: 4px 10px; display: inline-block;
  }

  .grid-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(var(--bd) 1px,transparent 1px), linear-gradient(90deg,var(--bd) 1px,transparent 1px);
    background-size: 72px 72px; opacity: .5;
  }

  .hero {
    min-height: 100vh; display: flex; align-items: flex-end;
    padding: 0 28px 72px; position: relative; overflow: hidden;
    border-bottom: 1px solid var(--bd);
  }
  .hero-meta { font-family: var(--mono); font-size: .63rem; letter-spacing: .14em; color: var(--dim); text-transform: uppercase; }

  .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); border-left: 1px solid var(--bd); }
  .stat-cell { border-right:1px solid var(--bd); border-top:1px solid var(--bd); border-bottom:1px solid var(--bd); padding: 28px 24px; }
  .stat-v { font-family: var(--disp); font-size: 2.6rem; letter-spacing: .04em; }
  .stat-l { font-family: var(--mono); font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-top: 5px; }

  .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); border-left:1px solid var(--bd); border-top:1px solid var(--bd); }
  .feat-cell { border-right:1px solid var(--bd); border-bottom:1px solid var(--bd); padding:32px 28px; transition: background .2s; }
  .feat-cell:hover { background: var(--bg3); }
  .feat-num { font-family:var(--mono); font-size:.62rem; color:var(--amber); letter-spacing:.1em; margin-bottom:18px; }
  .feat-title { font-size:.95rem; font-weight:600; margin-bottom:9px; line-height:1.3; }
  .feat-desc { font-size:.8rem; color:var(--muted); line-height:1.75; }

  .flow-grid { display:grid; grid-template-columns:repeat(4,1fr); border-left:1px solid var(--bd); }
  .flow-cell { border-right:1px solid var(--bd); padding:36px 24px; position:relative; }
  .flow-n { font-family:var(--disp); font-size:3.8rem; color:var(--bg3); line-height:1; margin-bottom:20px; user-select:none; }
  .flow-title { font-size:.88rem; font-weight:600; margin-bottom:8px; }
  .flow-desc { font-size:.78rem; color:var(--muted); line-height:1.75; }
  .flow-connector {
    position:absolute; top:44px; right:-5px;
    width:9px; height:9px; transform:rotate(45deg); z-index:2;
    border:1.5px solid var(--amber); background:var(--bg);
  }

  .code-block {
    background:var(--bg); border:1px solid var(--bd);
    font-family:var(--mono); font-size:.72rem; color:var(--muted);
    padding:20px 22px; line-height:1.85; overflow-x:auto;
  }
  .h1 { color:var(--amber); } .h2 { color:var(--green); } .h3 { color:var(--blue); }

  .s-input {
    width:100%; background:var(--bg); border:1px solid var(--bd2);
    color:var(--text); padding:13px 15px; font-family:var(--mono);
    font-size:.88rem; letter-spacing:.06em; outline:none; transition:border-color .2s;
  }
  .s-input:focus { border-color:var(--amber); }
  .s-bar-track { height:3px; background:var(--bd); }
  .s-bar-fill { height:100%; transition:width .35s ease, background .35s; }
  .s-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--bd); }
  .s-k { font-family:var(--mono); font-size:.68rem; color:var(--muted); letter-spacing:.07em; }
  .s-v { font-family:var(--mono); font-size:.68rem; font-weight:600; }

  .roc-row { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .roc-lbl { font-family:var(--mono); font-size:.65rem; width:70px; color:var(--muted); letter-spacing:.08em; }
  .roc-track { flex:1; height:5px; background:var(--bd); }
  .roc-fill { height:100%; transition:width .9s ease; }
  .roc-val { font-family:var(--mono); font-size:.65rem; width:34px; text-align:right; font-weight:600; }

  .tech-row { display:grid; grid-template-columns:160px 1fr 1fr; border-bottom:1px solid var(--bd); padding:18px 0; align-items:center; }
  .tech-row:first-child { border-top:1px solid var(--bd); }
  .tech-name { font-family:var(--mono); font-size:.8rem; font-weight:600; display:flex; align-items:center; gap:10px; }
  .tech-dot { width:7px; height:7px; transform:rotate(45deg); flex-shrink:0; }
  .tech-role { font-size:.8rem; color:var(--muted); }
  .tech-detail { font-size:.75rem; color:var(--dim); }

  @keyframes scan { 0%{transform:translateY(-100%);} 100%{transform:translateY(100vh);} }
  .scan { position:absolute; left:0; right:0; height:1px; pointer-events:none; z-index:1;
    background:linear-gradient(90deg,transparent,rgba(245,158,11,.25),transparent);
    animation:scan 7s linear infinite; }

  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  .cur { animation:blink 1s step-end infinite; color:var(--amber); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
  .fade-up { animation:fadeUp .6s ease both; }

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:start; }

  @media (max-width:900px) {
    .feat-grid { grid-template-columns:1fr 1fr; }
    .flow-grid { grid-template-columns:1fr 1fr; }
    .stat-grid { grid-template-columns:1fr 1fr; }
    .two-col { grid-template-columns:1fr !important; }
    .hero-grid { grid-template-columns:1fr !important; }
  }
  @media (max-width:600px) {
    .feat-grid,.flow-grid,.stat-grid { grid-template-columns:1fr; }
    .nav-a { display:none; }
    .node-viz { display:none; }
  }
`;

function analyze(pw: string) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s += 18; if (pw.length >= 12) s += 10; if (pw.length >= 16) s += 8;
  if (/[A-Z]/.test(pw)) s += 14; if (/[a-z]/.test(pw)) s += 5;
  if (/[0-9]/.test(pw)) s += 15; if (/[^A-Za-z0-9]/.test(pw)) s += 20;
  const uniq = new Set(pw).size / pw.length;
  if (uniq > .6) s += 5; if (uniq > .8) s += 5;
  const score = Math.min(s, 100);
  const label = score < 35 ? "WEAK" : score < 65 ? "MEDIUM" : "STRONG";
  const color = score < 35 ? "#ef4444" : score < 65 ? "#f59e0b" : "#22c55e";
  const entropy = +(Math.log2(new Set(pw).size || 1) * pw.length / 6).toFixed(1);
  return { score, label, color, entropy,
    upper: /[A-Z]/.test(pw), digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw), len: pw.length };
}

function NodeDiagram() {
  const [active, setActive] = useState<Set<number>>(new Set());
  useEffect(() => {
    const id = setInterval(() => {
      const n = Math.floor(Math.random() * 5);
      setActive(p => new Set([...p, n]));
      setTimeout(() => setActive(p => { const s = new Set(p); s.delete(n); return s; }), 650);
    }, 520);
    return () => clearInterval(id);
  }, []);
  const nodes = [[200,44],[355,128],[310,296],[90,296],[45,128]];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[1,3],[2,4],[3,0]];
  const SZ = 13;
  return (
    <svg viewBox="0 0 400 346" style={{width:"100%",maxWidth:380}}>
      {edges.map(([a,b],i)=>(
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={active.has(a)&&active.has(b)?"rgba(245,158,11,.55)":"rgba(255,255,255,.06)"}
          strokeWidth="1" style={{transition:"stroke .3s"}} />
      ))}
      {nodes.map(([x,y],i)=>(
        <g key={i}>
          <rect x={x-SZ} y={y-SZ} width={SZ*2} height={SZ*2} transform={`rotate(45 ${x} ${y})`}
            fill={active.has(i)?"rgba(245,158,11,.9)":"#181818"}
            stroke={active.has(i)?"#f59e0b":"#333"} strokeWidth="1.5" style={{transition:"all .3s"}} />
          <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fontSize="8.5"
            fill={active.has(i)?"#000":"#555"} fontFamily="'IBM Plex Mono',monospace" fontWeight="600">N{i+1}</text>
          <text x={x} y={y+26} textAnchor="middle" fontSize="7"
            fill={active.has(i)?"rgba(245,158,11,.6)":"rgba(70,70,70,.7)"}
            fontFamily="'IBM Plex Mono',monospace" letterSpacing="1">NODE_{i+1}</text>
        </g>
      ))}
    </svg>
  );
}

function useInView(ref: React.RefObject<HTMLElement>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:.15});
    if (ref.current) o.observe(ref.current);
    return ()=>o.disconnect();
  }, [ref]);
  return v;
}




function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 52;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function KeyShard() {
  const [scrolled, setScrolled] = useState(false);
  const [pw, setPw] = useState("");
  const rocRef = useRef<HTMLDivElement>(null!);
  const rocVis = useInView(rocRef);
  const result = analyze(pw);

  useEffect(() => {
    const h = ()=>setScrolled(window.scrollY>36);
    window.addEventListener("scroll", h);
    return ()=>window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    ["features","Features"],
    ["security","Security"],
    ["ml","ML Engine"],
    ["stack","Stack"],
  ];

  return (
    <>
      <style>{CSS}</style>

      <nav className={scrolled?"scrolled":""}>
        <a href="#" className="logo">
          <div className="logo-diamond"><div className="logo-diamond-fill"/></div>
          KEYSHARD
        </a>
        <div className="nav-links">
          {navLinks.map(([id,label])=>(
            <button key={id} className="nav-a" onClick={()=>scrollTo(id)}>{label}</button>
          ))}
          <a href="https://github.com/Sushant-Khanal/KeyShard" target="_blank" rel="noreferrer" className="nav-gh">GitHub ↗</a>
        </div>
      </nav>

 
      <div className="hero">
        <div className="grid-bg"/>
        <div className="scan"/>
        <div style={{position:"absolute",top:56,left:28,width:18,height:18,borderTop:"1px solid var(--amber)",borderLeft:"1px solid var(--amber)",opacity:.5}}/>
        <div style={{position:"absolute",top:56,right:28,width:18,height:18,borderTop:"1px solid var(--amber)",borderRight:"1px solid var(--amber)",opacity:.5}}/>
        <div style={{position:"absolute",bottom:72,right:28,width:18,height:18,borderBottom:"1px solid var(--amber)",borderRight:"1px solid var(--amber)",opacity:.5}}/>

        <div className="wrap" style={{width:"100%"}}>
          <p className="hero-meta" style={{marginBottom:30}}>
            DISTRIBUTED PASSWORD MANAGEMENT &nbsp;·&nbsp; ZERO-KNOWLEDGE &nbsp;·&nbsp; OPEN SOURCE
          </p>
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:48,alignItems:"center"}}>
            <div>
              <h1 className="disp fade-up" style={{fontSize:"clamp(4.5rem,11vw,9.5rem)"}}>
                SECURE.<br/>
                <span style={{color:"var(--amber)"}}>ZERO-KNOWLEDGE.</span>
              </h1>
              <p style={{color:"var(--muted)",fontSize:".9rem",lineHeight:1.8,maxWidth:480,marginTop:32,fontWeight:300}}>
                KeyShard eliminates centralized storage risk by sharding your encrypted vault across independent nodes — with Argon2id key derivation, AES-256-GCM encryption, and an XGBoost-powered strength classifier.
              </p>
              <div style={{display:"flex",gap:12,marginTop:32,flexWrap:"wrap"}}>
                <button className="btn btn-solid" onClick={()=>scrollTo("features")}>Explore Features →</button>
                <a href="https://github.com/Sushant-Khanal/KeyShard" target="_blank" rel="noreferrer" className="btn btn-outline">View Source</a>
              </div>
            </div>
            <div className="node-viz" style={{flexShrink:0}}>
              <NodeDiagram/>
              <p style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--dim)",letterSpacing:".12em",marginTop:8}}>
                LIVE NODE ACTIVITY SIMULATION
              </p>
            </div>
          </div>
        </div>
      </div>

   
      <div className="stat-grid">
        {[["440K","Passwords in training set"],["80.42%","ML macro accuracy"],["AES-256-GCM","Encryption standard"],["5-NODE","Default cluster"]].map(([v,l])=>(
          <div key={l} className="stat-cell">
            <div className="stat-v">{v}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>

      
      <div id="features" className="section" style={{borderBottom:"1px solid var(--bd)"}}>
        <div className="wrap">
          <div className="label">Capabilities</div>
          <h2 className="disp" style={{fontSize:"clamp(2.8rem,6vw,5rem)",marginBottom:44}}>
            BUILT ON<br/>ZERO TRUST
          </h2>
          <div className="feat-grid">
            {[
              ["01","Distributed Storage","Encrypted credential data sharded across BoltDB-backed nodes using consistent hashing. No single point of failure. No central authority."],
              ["02","Zero-Knowledge Model","Master key derived locally via Argon2id. The server stores only ciphertext, IVs, and auth tags. Plaintext never leaves your device."],
              ["03","AES-256-GCM Vault","Authenticated encryption with associated data. Every vault entry carries an integrity tag — tampered data fails before decryption."],
              ["04","AI Strength Analysis","XGBoost classifier trained on 440K real-world passwords. 14 structural and entropy features extracted. 80.42% macro-average accuracy."],
              ["05","SHAP Explainability","Tree SHAP values expose exactly which features — length, diversity, transition patterns — drove each strength prediction."],
              ["06","Docker-Native Cluster","Five-node cluster in a single docker-compose.yml. Isolated volumes, environment parity, horizontal scaling without code changes."],
            ].map(([n,t,d])=>(
              <div key={n} className="feat-cell">
                <div className="feat-num">{n}</div>
                <div className="feat-title">{t}</div>
                <div className="feat-desc">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section" style={{background:"var(--bg2)",borderBottom:"1px solid var(--bd)"}}>
        <div className="wrap">
          <div className="label">Authentication Flow</div>
          <h2 className="disp" style={{fontSize:"clamp(2.6rem,5vw,4.5rem)",marginBottom:44}}>
            CRYPTOGRAPHIC<br/>PIPELINE
          </h2>
          <div className="flow-grid">
            {[
              ["01","Master Password","User provides master password. Nothing is transmitted. All derivation is on-device, in memory."],
              ["02","Argon2id → HKDF","256-bit key derived with Argon2id (64MB / 3 iter / 4 threads). Split via HKDF into VaultKey and UserKey."],
              ["03","AES-GCM Encrypt","Vault encrypted client-side with a unique IV per operation. Ciphertext + IV + GCM auth tag sent to cluster."],
              ["04","Shard & Replicate","xxHash maps each key to a node on the consistent hash ring. Replicas ensure availability if nodes go offline."],
            ].map(([n,t,d],i,arr)=>(
              <div key={n} className="flow-cell">
                {i < arr.length-1 && <div className="flow-connector"/>}
                <div className="flow-n">{n}</div>
                <div className="flow-title">{t}</div>
                <div className="flow-desc">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div id="security" className="section" style={{borderBottom:"1px solid var(--bd)"}}>
        <div className="wrap two-col">
          <div>
            <div className="label">Zero Knowledge</div>
            <h2 className="disp" style={{fontSize:"clamp(2.2rem,4vw,3.6rem)",marginBottom:24,lineHeight:.92}}>
              THE SERVER<br/>KNOWS NOTHING
            </h2>
            <p style={{color:"var(--muted)",lineHeight:1.8,fontSize:".86rem",marginBottom:28,fontWeight:300}}>
              Every cryptographic operation runs on your device. The backend is a blind store — it receives opaque blobs and returns them on authenticated request. No key escrow. No recovery backdoor.
            </p>
            <div className="code-block">
              <div><span className="h1">// Client-side only — never transmitted</span></div>
              <div>&nbsp;</div>
              <div><span className="h3">masterKey</span> = <span className="h1">argon2id</span>(password, uuid_salt, {"{"}</div>
              <div>&nbsp; memory: <span className="h2">65536</span>, time: <span className="h2">3</span>, threads: <span className="h2">4</span></div>
              <div>{"}"})</div>
              <div>&nbsp;</div>
              <div>[<span className="h3">vaultKey</span>, <span className="h3">userKey</span>] = <span className="h1">hkdf</span>(masterKey)</div>
              <div>&nbsp;</div>
              <div><span className="h3">userHash</span> = <span className="h1">sha256</span>(userKey) <span className="h1">// stored server-side</span></div>
              <div><span className="h3">vault</span>    = <span className="h1">aes_gcm_encrypt</span>(data, vaultKey, iv)</div>
            </div>
            <div style={{marginTop:28}}>
              {[
                ["Argon2id KDF","Memory-hard — resists GPU and side-channel attacks"],
                ["HKDF key separation","Auth key never touches vault encryption"],
                ["GCM auth tag","Tampered ciphertext detected before decryption"],
                ["Session wipe","Keys cleared from memory on logout or app close"],
              ].map(([t,d])=>(
                <div key={t} style={{display:"flex",gap:12,marginBottom:14}}>
                  <div style={{width:7,height:7,background:"var(--amber)",transform:"rotate(45deg)",marginTop:5,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:".84rem",fontWeight:600}}>{t}</div>
                    <div style={{fontSize:".76rem",color:"var(--muted)",marginTop:2}}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div>
            <div className="label">Live Demo</div>
            <h3 className="disp" style={{fontSize:"2rem",marginBottom:22}}>STRENGTH ANALYZER</h3>
            <div style={{border:"1px solid var(--bd2)",padding:24}}>
              <div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--muted)",letterSpacing:".12em",marginBottom:9}}>INPUT</div>
              <input className="s-input" type="text" placeholder="type a password..."
                value={pw} onChange={e=>setPw(e.target.value)}/>
              {result && (
                <div style={{marginTop:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontFamily:"var(--mono)",fontSize:".64rem",color:"var(--muted)",letterSpacing:".1em"}}>STRENGTH</span>
                    <span style={{fontFamily:"var(--mono)",fontSize:".64rem",fontWeight:600,color:result.color,letterSpacing:".1em"}}>
                      {result.label} · {result.score}/100
                    </span>
                  </div>
                  <div className="s-bar-track">
                    <div className="s-bar-fill" style={{width:`${result.score}%`,background:result.color}}/>
                  </div>
                  <div style={{marginTop:18}}>
                    {([
                      ["LENGTH", result.len>=12?"GOOD":result.len>=8?"FAIR":"SHORT", result.len>=12?"#22c55e":result.len>=8?"#f59e0b":"#ef4444"],
                      ["UPPERCASE", result.upper?"PRESENT":"MISSING", result.upper?"#22c55e":"#ef4444"],
                      ["DIGITS", result.digit?"PRESENT":"MISSING", result.digit?"#22c55e":"#ef4444"],
                      ["SPECIAL CHARS", result.special?"PRESENT":"MISSING", result.special?"#22c55e":"#ef4444"],
                      ["ENTROPY EST.", `${result.entropy} bits`, result.entropy>40?"#22c55e":result.entropy>20?"#f59e0b":"#ef4444"],
                    ] as [string,string,string][]).map(([k,v,c])=>(
                      <div key={k} className="s-row">
                        <span className="s-k">{k}</span>
                        <span className="s-v" style={{color:c}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!pw && (
                <div style={{marginTop:20,fontFamily:"var(--mono)",fontSize:".68rem",color:"var(--dim)",letterSpacing:".1em"}}>
                  — AWAITING INPUT —
                </div>
              )}
            </div>
            <p style={{marginTop:10,fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--dim)",lineHeight:1.7}}>
              * heuristic approximation only — does not reflect the production XGBoost model trained on 14 engineered features.
            </p>
          </div>
        </div>
      </div>

   
      <div id="ml" className="section" style={{background:"var(--bg2)",borderBottom:"1px solid var(--bd)"}}>
        <div className="wrap two-col">
          <div>
            <div className="label">ML Engine</div>
            <h2 className="disp" style={{fontSize:"clamp(2.4rem,5vw,4rem)",marginBottom:22,lineHeight:.92}}>
              XGBOOST<br/>+ SHAP
            </h2>
            <p style={{color:"var(--muted)",fontSize:".86rem",lineHeight:1.8,marginBottom:22,fontWeight:300}}>
              Trained on 440K balanced samples from the RockYou dataset, labeled by zxcvbn, then feature-engineered into 14 structural and entropy signals. Raw passwords discarded post-extraction.
            </p>
            <p style={{color:"var(--muted)",fontSize:".86rem",lineHeight:1.8,marginBottom:28,fontWeight:300}}>
              Tree SHAP exposes which factors most influenced each prediction — users see why a password scored the way it did.
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:32}}>
              {["Password length","Char entropy","Uppercase ratio","Digit distribution","Special char count","Transition patterns","Habit score","Dict root detect","Repetition score","N-gram frequency","Char diversity","Positional patterns","Sequence complexity","Breach freq. proxy"].map(f=>(
                <span key={f} className="tag">{f}</span>
              ))}
            </div>
            <div style={{borderTop:"1px solid var(--bd)",paddingTop:24,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
              {[["74%","Weak recall"],["76%","Medium F1"],["95%","Strong acc."]].map(([v,l])=>(
                <div key={l}>
                  <div className="disp" style={{fontSize:"2.2rem",color:"var(--amber)"}}>{v}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--muted)",marginTop:3,letterSpacing:".1em",textTransform:"uppercase"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div ref={rocRef}>
            <div style={{fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--muted)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:22}}>
              ROC-AUC Scores
            </div>
            {[{l:"STRONG",a:.98,c:"#22c55e"},{l:"WEAK  ",a:.93,c:"#ef4444"},{l:"MEDIUM",a:.90,c:"#f59e0b"}].map(r=>(
              <div key={r.l} className="roc-row">
                <span className="roc-lbl">{r.l}</span>
                <div className="roc-track"><div className="roc-fill" style={{width:rocVis?`${r.a*100}%`:"0%",background:r.c}}/></div>
                <span className="roc-val" style={{color:r.c}}>{r.a.toFixed(2)}</span>
              </div>
            ))}
            <div style={{marginTop:32,border:"1px solid var(--bd)"}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid var(--bd)",fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--muted)",letterSpacing:".12em"}}>
                CONFUSION MATRIX (THRESHOLD 0.41)
              </div>
              {[
                ["WEAK   →","74.03%","23.70%","2.27%"],
                ["MEDIUM →","10.63%","76.27%","13.10%"],
                ["STRONG →","0.22%","5.04%","94.75%"],
              ].map((row,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"90px 1fr 1fr 1fr",fontFamily:"var(--mono)",fontSize:".68rem",borderBottom:i<2?"1px solid var(--bd)":"none"}}>
                  <div style={{padding:"9px 14px",color:"var(--muted)",borderRight:"1px solid var(--bd)"}}>{row[0]}</div>
                  {row.slice(1).map((v,j)=>(
                    <div key={j} style={{padding:"9px 10px",color:i===j?"var(--amber)":"var(--dim)",fontWeight:i===j?600:400,textAlign:"center"}}>{v}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{marginTop:24,border:"1px solid var(--bd)"}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid var(--bd)",fontFamily:"var(--mono)",fontSize:".62rem",color:"var(--muted)",letterSpacing:".12em"}}>TRAINING</div>
              {[["Dataset","RockYou — balanced 440K"],["Labeling","zxcvbn library"],["Algorithm","XGBoost + RandomizedSearchCV"],["Explain","Tree SHAP"],["Macro avg.","80.42%"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontFamily:"var(--mono)",fontSize:".69rem",padding:"8px 16px",borderBottom:"1px solid var(--bd)"}}>
                  <span style={{color:"var(--muted)"}}>{k}</span>
                  <span style={{color:"var(--text)"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

   
      <div id="stack" className="section" style={{borderBottom:"1px solid var(--bd)"}}>
        <div className="wrap">
          <div className="label">Technology</div>
          <h2 className="disp" style={{fontSize:"clamp(2.8rem,6vw,5rem)",marginBottom:40}}>
            SYSTEM STACK
          </h2>
          {[
            ["Go","#00ADD8","Distributed key-value store","BoltDB-backed nodes, consistent hashing via xxHash, HTTP routing, shard replication"],
            ["Node.js","#68a063","Backend API server","REST API layer, authentication flow, request routing, Redis rate limiting"],
            ["React Native","#60a5fa","Mobile application","Cross-platform vault UI, client-side key derivation, session management"],
            ["Python","#fbbf24","ML pipeline","XGBoost training, SHAP analysis, 14-feature engineering, hyperparameter tuning"],
            ["BoltDB","#a3e635","Node-level storage","Embedded key-value store per distributed node — zero external dependencies"],
            ["AES-256-GCM","#f59e0b","Vault encryption","Authenticated encryption with associated data — confidentiality + integrity in one pass"],
            ["HKDF","#e879f9","Key derivation","Splits 256-bit Argon2id master key into separate VaultKey and UserKey"],
            ["Ed25519","#f87171","Asymmetric signatures","Node identity verification and inter-node message authentication"],
            ["Docker","#38bdf8","Deployment","Multi-node containerization, isolated volumes, docker-compose cluster orchestration"],
          ].map(([n,c,r,d])=>(
            <div key={n} className="tech-row">
              <div className="tech-name">
                <div className="tech-dot" style={{background:c as string}}/>
                {n}
              </div>
              <span className="tech-role">{r}</span>
              <span className="tech-detail">{d}</span>
            </div>
          ))}
        </div>
      </div>

   
      <div className="section" style={{background:"var(--bg2)",borderBottom:"1px solid var(--bd)"}}>
        <div className="wrap two-col" style={{alignItems:"center"}}>
          <h2 className="disp" style={{fontSize:"clamp(3rem,7vw,6rem)",lineHeight:.88}}>
            YOUR VAULT.<br/>
            <span style={{color:"var(--amber)"}}>YOUR NODES.</span><br/>
            YOUR KEYS.
          </h2>
          <div>
            <p style={{color:"var(--muted)",lineHeight:1.8,fontSize:".9rem",marginBottom:32,fontWeight:300}}>
              KeyShard is open-source and self-hostable. No vendor lock-in. No subscription. No third-party dependency. Spin up your own cluster, own your encryption, own your data.
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <a href="https://github.com/Sushant-Khanal/KeyShard" target="_blank" rel="noreferrer" className="btn btn-solid">
                Get Started on GitHub ↗
              </a>
              <button className="btn btn-outline" onClick={()=>scrollTo("features")}>Read Docs</button>
            </div>
          </div>
        </div>
      </div>

  
      <footer style={{borderTop:"1px solid var(--bd)",padding:"24px 28px"}}>
        <div className="wrap" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div className="logo-diamond" style={{width:20,height:20}}>
              <div className="logo-diamond-fill" style={{width:7,height:7}}/>
            </div>
            <span style={{fontFamily:"var(--disp)",letterSpacing:".1em",fontSize:".95rem"}}>KEYSHARD</span>
          </div>
          <div style={{fontFamily:"var(--mono)",fontSize:".6rem",color:"var(--dim)",letterSpacing:".1em"}}>
            DISTRIBUTED PASSWORD MANAGEMENT &nbsp;·&nbsp; OPEN SOURCE &nbsp;·&nbsp; MIT LICENSE
          </div>
          <a href="https://github.com/Sushant-Khanal/KeyShard" target="_blank" rel="noreferrer"
            style={{fontFamily:"var(--mono)",fontSize:".65rem",color:"var(--muted)",textDecoration:"none",letterSpacing:".06em"}}>
            github.com/Sushant-Khanal/KeyShard ↗
          </a>
        </div>
      </footer>
    </>
  );
}