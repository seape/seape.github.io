import{_ as r}from"./plugin-vue_export-helper-c27b6911.js";import{r as c,o as m,c as u,b as n,d as e,e as t,w as s,f as d}from"./app-49149863.js";const b="/assets/images/github/git_struct.webp",v="/assets/images/github/remote_collaborate.png",p={},g=d('<h2 id="the-structure-of-git" tabindex="-1"><a class="header-anchor" href="#the-structure-of-git" aria-hidden="true">#</a> The structure of git</h2><figure><img src="'+b+'" alt="The structure for git" tabindex="0" loading="lazy"><figcaption>The structure for git</figcaption></figure><h2 id="collaboration" tabindex="-1"><a class="header-anchor" href="#collaboration" aria-hidden="true">#</a> Collaboration</h2><figure><img src="'+v+'" alt="The structure for git" tabindex="0" loading="lazy"><figcaption>The structure for git</figcaption></figure><h2 id="git-code-hosting-center" tabindex="-1"><a class="header-anchor" href="#git-code-hosting-center" aria-hidden="true">#</a> Git Code Hosting Center</h2>',5),h={href:"https://github.com/",target:"_blank",rel:"noopener noreferrer"},k={href:"https://gitee.com",target:"_blank",rel:"noopener noreferrer"},f=n("h2",{id:"git-basic-operation",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#git-basic-operation","aria-hidden":"true"},"#"),e(" Git basic operation")],-1),_=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#初始化本地库(创建.git目录，并创建本地库相关内容和文件)"),e(`
`),n("span",{class:"token function"},"git"),e(` init

`),n("span",{class:"token comment"},"#设置签名(项目级别)"),e(`
`),n("span",{class:"token comment"},"# tom/email   注意：这里的签名和登录远程库无任何关系"),e(`
`),n("span",{class:"token comment"},"# 作用：区分不同开发人员的身份"),e(`
`),n("span",{class:"token function"},"git"),e(` config user.name tom_pro
`),n("span",{class:"token function"},"git"),e(` config user.email good@mail.com

`),n("span",{class:"token comment"},"#设置签名(系统级别)"),e(`
`),n("span",{class:"token comment"},"# tom/email   注意：这里的签名和登录远程库无任何关系"),e(`
`),n("span",{class:"token comment"},"# 作用：区分不同开发人员的身份"),e(`
`),n("span",{class:"token function"},"git"),e(" config "),n("span",{class:"token parameter variable"},"--global"),e(` user.name tom_pro
`),n("span",{class:"token function"},"git"),e(" config "),n("span",{class:"token parameter variable"},"--global"),e(` user.email good@mail.com

`),n("span",{class:"token comment"},"#优先级说明"),e(`
`),n("span",{class:"token comment"},"# 1. 项目级别/仓库级别：仅在当前本地库生效【优先级最高】"),e(`
`),n("span",{class:"token comment"},"# 2. 系统用户级别：当前操作系统用户范围生效"),e(`

`),n("span",{class:"token comment"},"#项目签名保存目录"),e(`
`),n("span",{class:"token comment"},"# .git/config"),e(`
`),n("span",{class:"token comment"},"#系统签名保存目录"),e(`
`),n("span",{class:"token comment"},"#~/.gitconfig"),e(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),x=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#本地库状态"),e(`
`),n("span",{class:"token function"},"git"),e(` status
`),n("span",{class:"token comment"},"#添加到缓存区"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"add"),e(` filename.ext
`),n("span",{class:"token comment"},"#删除缓存区文件"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"rm"),e(),n("span",{class:"token parameter variable"},"--cached"),e(` filename.ext
`),n("span",{class:"token comment"},"#提交到本地库"),e(`
`),n("span",{class:"token function"},"git"),e(" commit filename.ext "),n("span",{class:"token parameter variable"},"-m"),e(),n("span",{class:"token string"},'"Comments for the committed file"'),e(`


`),n("span",{class:"token comment"},"#查看提交信息"),e(`
`),n("span",{class:"token function"},"git"),e(` log

`),n("span",{class:"token comment"},"#查看提交信息，每条日志显示一行"),e(`
`),n("span",{class:"token function"},"git"),e(" log "),n("span",{class:"token parameter variable"},"--pretty"),n("span",{class:"token operator"},"="),e(`oneline
`),n("span",{class:"token comment"},"#查看提交信息，每条日志显示一行，hash值部分显示"),e(`
`),n("span",{class:"token function"},"git"),e(" log "),n("span",{class:"token parameter variable"},"--online"),e(`
`),n("span",{class:"token comment"},"#查看提交信息，每条日志显示一行，并存在指针(HEAD)移动不同版本所需步数"),e(`
`),n("span",{class:"token function"},"git"),e(` reflog
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),A=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#reset命令参数对比"),e(`
`),n("span",{class:"token comment"},"#  1. --soft: 只在本地库移动HEAD指针"),e(`
`),n("span",{class:"token comment"},"#  2. --mixed：本地库移动HEAD指针/并重置暂存区"),e(`
`),n("span",{class:"token comment"},"#  3. --hard: 本地库移动指针/重置暂存区/重置工作区"),e(`

`),n("span",{class:"token comment"},"#git reset --hard 索引值或局部索引值"),e(`
`),n("span",{class:"token function"},"git"),e(" reset "),n("span",{class:"token parameter variable"},"--hard"),e(` 7bf0e31

`),n("span",{class:"token comment"},"#该方式只可以后退"),e(`
`),n("span",{class:"token comment"},"#后退一步"),e(`
`),n("span",{class:"token function"},"git"),e(" reset "),n("span",{class:"token parameter variable"},"--hard"),e(` HEAD^

`),n("span",{class:"token comment"},"#后退三步（n个^后退n布）"),e(`
`),n("span",{class:"token function"},"git"),e(" reset "),n("span",{class:"token parameter variable"},"--hard"),e(` HEAD^^^

`),n("span",{class:"token comment"},"#指定后退步数"),e(`
`),n("span",{class:"token function"},"git"),e(" reset "),n("span",{class:"token parameter variable"},"--hard"),e(` HEAD~3
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),E=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#工作区和暂存区文件比较"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"diff"),e(` filename

`),n("span",{class:"token comment"},"#工作区和本地库文件比较"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"diff"),e(` HEAD filename

`),n("span",{class:"token comment"},"#工作区和本地库历史版本文件比较"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"diff"),e(` HEAD^ filename

`),n("span",{class:"token comment"},"#不增加文件名称，对比所有差异文件"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"diff"),e(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),w=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#查看分支"),e(`
`),n("span",{class:"token function"},"git"),e(" branch "),n("span",{class:"token parameter variable"},"-v"),e(`

`),n("span",{class:"token comment"},"#创建新分支hot_fix"),e(`
`),n("span",{class:"token function"},"git"),e(` branch hot_fix

`),n("span",{class:"token comment"},"#切换分支"),e(`
`),n("span",{class:"token function"},"git"),e(` checkout hot_fix

`),n("span",{class:"token comment"},"#合并分支"),e(`
`),n("span",{class:"token comment"},"# 切换至接受合并的分支"),e(`
`),n("span",{class:"token function"},"git"),e(` checkout master
`),n("span",{class:"token comment"},"# 合并hot_fix分支至master分支中"),e(`
`),n("span",{class:"token function"},"git"),e(` merge hot_fix 
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),C=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#当合并产生冲突时，分支进入到解决冲突状态，编辑冲突文件，内容如上图所示，"),e(`
`),n("span",{class:"token comment"},"#之后将冲突文件编辑至理想状态后，之后将文件标记为已解决状态"),e(`
`),n("span",{class:"token comment"},"#最后提交合并"),e(`

`),n("span",{class:"token comment"},"#1. 标记文件为解决状态"),e(`
`),n("span",{class:"token function"},"git"),e(),n("span",{class:"token function"},"add"),e(` conflict.file
`),n("span",{class:"token comment"},"#2. 提交合并文件(冲突解决状态下，不可以添加文件名称)"),e(`
`),n("span",{class:"token function"},"git"),e(` commit
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),H=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#添加远程源"),e(`
`),n("span",{class:"token comment"},"#git remote add [远程分支名称] [远程地址]"),e(`
`),n("span",{class:"token function"},"git"),e(" remote "),n("span",{class:"token function"},"add"),e(` origin https://github.com/seamice/periodic.git

`),n("span",{class:"token comment"},"#推送至远程库"),e(`
`),n("span",{class:"token comment"},"#git push [远程分支名称] [需推送分支]"),e(`
`),n("span",{class:"token function"},"git"),e(` push origin master

`),n("span",{class:"token comment"},"#克隆远程库"),e(`
`),n("span",{class:"token function"},"git"),e(` clone https://github.com/seamice/periodic.git

`),n("span",{class:"token comment"},"#列出分支文件（可以更改ls-tree相关参数更改输出内容样式）"),e(`
`),n("span",{class:"token function"},"git"),e(" ls-tree "),n("span",{class:"token parameter variable"},"-r"),e(` --name-only sat_down/master

`),n("span",{class:"token comment"},"#查看所有远程分支"),e(`
`),n("span",{class:"token function"},"git"),e(" branch "),n("span",{class:"token parameter variable"},"-r"),e(`

`),n("span",{class:"token comment"},"#检出远程的feature-branch分支到本地"),e(`
`),n("span",{class:"token function"},"git"),e(" checkout "),n("span",{class:"token parameter variable"},"-b"),e(` feature-branch origin/feature-branch    

`),n("span",{class:"token comment"},"#创建并切换到分支feature-branch  "),e(`
`),n("span",{class:"token function"},"git"),e(" checkout "),n("span",{class:"token parameter variable"},"-b"),e(` feature-branch    
`),n("span",{class:"token comment"},"#推送本地的feature-branch(冒号前面的)分支到远程origin的feature-branch(冒号后面的)分支(没有会自动创建)"),e(`
`),n("span",{class:"token function"},"git"),e(` push origin feature-branch:feature-branch    
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),D=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,[n("span",{class:"token comment"},"#抓取远程库并和本地库融合"),e(`
`),n("span",{class:"token comment"},"# pull命令效果是fetch + merge"),e(`
`),n("span",{class:"token function"},"git"),e(` pull origin master

`),n("span",{class:"token comment"},"#抓取远程库origin master分支"),e(`
`),n("span",{class:"token function"},"git"),e(` fetch origin master

`),n("span",{class:"token comment"},"#切换至远程分支"),e(`
`),n("span",{class:"token function"},"git"),e(` checkout origin/master

`),n("span",{class:"token comment"},"#切换至本地分支"),e(`
`),n("span",{class:"token function"},"git"),e(` checkout master

`),n("span",{class:"token comment"},"#合并至本地master"),e(`
`),n("span",{class:"token function"},"git"),e(` merge origin/master  
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),T=n("h2",{id:"references",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#references","aria-hidden":"true"},"#"),e(" References")],-1),y={href:"https://www.youtube.com/watch?v=iR8CbeZktoA",target:"_blank",rel:"noopener noreferrer"};function N(V,B){const l=c("ExternalLinkIcon"),o=c("CodeTabs");return m(),u("div",null,[g,n("ul",null,[n("li",null,[n("a",h,[e("Github"),t(l)])]),n("li",null,[n("a",k,[e("码云"),t(l)])])]),f,t(o,{id:"30",data:[{id:"git init"},{id:"status and log"},{id:"version switch"},{id:"compare"},{id:"branch"},{id:"conflict"},{id:"remote"},{id:"fetch and pull"}]},{title0:s(({value:a,isActive:i})=>[e("git init")]),title1:s(({value:a,isActive:i})=>[e("status and log")]),title2:s(({value:a,isActive:i})=>[e("version switch")]),title3:s(({value:a,isActive:i})=>[e("compare")]),title4:s(({value:a,isActive:i})=>[e("branch")]),title5:s(({value:a,isActive:i})=>[e("conflict")]),title6:s(({value:a,isActive:i})=>[e("remote")]),title7:s(({value:a,isActive:i})=>[e("fetch and pull")]),tab0:s(({value:a,isActive:i})=>[_]),tab1:s(({value:a,isActive:i})=>[x]),tab2:s(({value:a,isActive:i})=>[A]),tab3:s(({value:a,isActive:i})=>[E]),tab4:s(({value:a,isActive:i})=>[w]),tab5:s(({value:a,isActive:i})=>[C]),tab6:s(({value:a,isActive:i})=>[H]),tab7:s(({value:a,isActive:i})=>[D]),_:1}),T,n("ol",null,[n("li",null,[n("a",y,[e("尚学堂教程"),t(l)])])])])}const I=r(p,[["render",N],["__file","basic_usage.html.vue"]]);export{I as default};
