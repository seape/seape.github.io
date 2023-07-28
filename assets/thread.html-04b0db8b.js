import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,f as t}from"./app-49149863.js";const e={},p=t(`<p>In this article, I implement a very simple thread pool using threading package. Details see the code below.</p><h2 id="thread-implementation" tabindex="-1"><a class="header-anchor" href="#thread-implementation" aria-hidden="true">#</a> Thread implementation</h2><div class="language-python line-numbers-mode" data-ext="py"><pre class="language-python"><code><span class="token keyword">import</span> threading

<span class="token keyword">class</span> <span class="token class-name">thread_util</span><span class="token punctuation">:</span>
    <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> thread_max <span class="token operator">=</span> <span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>__thread_pool__ <span class="token operator">=</span> <span class="token builtin">list</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>__thread_max__ <span class="token operator">=</span> <span class="token number">1</span>
        <span class="token keyword">if</span> thread_max<span class="token punctuation">:</span>
            self<span class="token punctuation">.</span>__thread_max__ <span class="token operator">=</span> thread_max
    
    <span class="token keyword">def</span> <span class="token function">process</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> target<span class="token punctuation">,</span> args<span class="token punctuation">,</span> name<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&#39;&#39;&#39;
        @param target The function to excute using thread
        @param args The arguments for target
        @param name The name of the thread
        &#39;&#39;&#39;</span>
        th <span class="token operator">=</span> threading<span class="token punctuation">.</span>Thread<span class="token punctuation">(</span>target<span class="token operator">=</span>target<span class="token punctuation">,</span> args<span class="token operator">=</span>args<span class="token punctuation">,</span> name<span class="token operator">=</span> name<span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>__thread_pool__<span class="token punctuation">.</span>append<span class="token punctuation">(</span>th<span class="token punctuation">)</span>
        th<span class="token punctuation">.</span>start<span class="token punctuation">(</span><span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>__update_thread__<span class="token punctuation">(</span><span class="token punctuation">)</span>
    
    <span class="token keyword">def</span> <span class="token function">wait</span><span class="token punctuation">(</span>self<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&#39;&#39;&#39;
        Waiting the thread pool
        &#39;&#39;&#39;</span>
        self<span class="token punctuation">.</span>__update_thread__<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    
    <span class="token keyword">def</span> <span class="token function">__update_thread__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> count <span class="token operator">=</span> <span class="token boolean">None</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        c <span class="token operator">=</span> self<span class="token punctuation">.</span>__thread_max__
        <span class="token keyword">if</span> count<span class="token punctuation">:</span>
            c <span class="token operator">=</span> count
        <span class="token keyword">while</span> <span class="token builtin">len</span><span class="token punctuation">(</span>self<span class="token punctuation">.</span>__thread_pool__<span class="token punctuation">)</span> <span class="token operator">&gt;=</span> c<span class="token punctuation">:</span>
            dead_pool <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
            <span class="token keyword">for</span> th <span class="token keyword">in</span> self<span class="token punctuation">.</span>__thread_pool__<span class="token punctuation">:</span>
                <span class="token keyword">if</span> <span class="token keyword">not</span> th<span class="token punctuation">.</span>is_alive<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
                    dead_pool<span class="token punctuation">.</span>append<span class="token punctuation">(</span>th<span class="token punctuation">)</span>
            <span class="token keyword">for</span> item <span class="token keyword">in</span> dead_pool<span class="token punctuation">:</span>
                self<span class="token punctuation">.</span>__thread_pool__<span class="token punctuation">.</span>remove<span class="token punctuation">(</span>item<span class="token punctuation">)</span>
            <span class="token comment">#time.sleep(0.1)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,3),o=[p];function c(i,l){return s(),a("div",null,o)}const d=n(e,[["render",c],["__file","thread.html.vue"]]);export{d as default};
