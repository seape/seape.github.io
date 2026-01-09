const h=document.querySelector(".back-to-top");h&&(window.addEventListener("scroll",()=>{window.scrollY>300?h.classList.add("show"):h.classList.remove("show")}),h.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})}));document.querySelectorAll('a[href^="#"]').forEach(d=>{d.addEventListener("click",function(l){l.preventDefault();const e=this.getAttribute("href");if(e){const o=document.querySelector(e);o&&o.scrollIntoView({behavior:"smooth"})}})});function x(){const d=document.querySelectorAll("pre:not([data-enhanced])"),l=15;d.forEach(e=>{e.setAttribute("data-enhanced","true");const o=e.querySelector("code");let r="code";if(o?.classList.contains("language-mermaid")||e.classList.contains("mermaid")||e.closest(".mermaid-container"))return;if(o){const n=o.className.split(" ");for(const t of n)if(t.startsWith("language-")){r=t.replace("language-","");break}}const f=e;f.dataset.language&&(r=f.dataset.language);const k=((o?o.textContent:e.textContent)||"").split(`
`).length,v=k>l,s=document.createElement("div");s.className="code-block-wrapper"+(v?" collapsed":"");const c=document.createElement("div");c.className="code-block-header",c.innerHTML=`
            <span class="code-block-lang">${r}</span>
            <div class="code-block-actions">
              ${v?`
                <button class="code-block-btn collapse-btn" title="展开/收缩">
                  <svg class="collapse-icon transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span class="collapse-text">展开</span>
                </button>
              `:""}
              <button class="code-block-btn copy-btn" title="复制代码">
                <svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="copy-text">复制</span>
              </button>
            </div>
          `;const p=document.createElement("div");if(p.className="code-block-content",!e.parentNode)return;if(e.parentNode.insertBefore(s,e),s.appendChild(c),s.appendChild(p),p.appendChild(e),v){const n=document.createElement("div");n.className="code-block-expand",n.innerHTML=`
              <button class="expand-btn">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>展开代码 (${k} 行)</span>
              </button>
            `,p.appendChild(n);const t=document.createElement("div");t.className="code-block-collapse",t.innerHTML=`
              <button class="collapse-bottom-btn">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                <span>收起代码</span>
              </button>
            `,p.appendChild(t);const a=n.querySelector(".expand-btn");a&&a.addEventListener("click",()=>{s.classList.remove("collapsed");const u=c.querySelector(".collapse-text");u&&(u.textContent="收缩")});const m=t.querySelector(".collapse-bottom-btn");m&&m.addEventListener("click",()=>{s.classList.add("collapsed");const u=c.querySelector(".collapse-text");u&&(u.textContent="展开"),s.scrollIntoView({behavior:"smooth",block:"start"})})}const i=c.querySelector(".copy-btn");i&&i.addEventListener("click",async()=>{const n=o?o.textContent:e.textContent;try{await navigator.clipboard.writeText(n||""),i.classList.add("copied");const t=i.querySelector(".copy-text"),a=i.querySelector(".copy-icon");t&&(t.textContent="已复制"),a&&(a.innerHTML=`
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                `),setTimeout(()=>{i.classList.remove("copied"),t&&(t.textContent="复制"),a&&(a.innerHTML=`
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  `)},2e3)}catch(t){console.error("复制失败:",t)}});const b=c.querySelector(".collapse-btn");b&&b.addEventListener("click",()=>{const n=s.classList.toggle("collapsed"),t=b.querySelector(".collapse-text");t&&(t.textContent=n?"展开":"收缩")})})}x();const y=new MutationObserver(d=>{let l=!1;d.forEach(e=>{e.addedNodes.length&&e.addedNodes.forEach(o=>{if(o.nodeType===1){const r=o;(r.tagName==="PRE"||r.querySelector?.("pre:not([data-enhanced])"))&&(l=!0)}})}),l&&x()});y.observe(document.body,{childList:!0,subtree:!0});
