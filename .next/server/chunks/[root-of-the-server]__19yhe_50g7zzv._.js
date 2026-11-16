module.exports=[193695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},17141,e=>e.a(async(t,a)=>{try{var r=await e.y("nextly-2042afbdf41f0f4f");e.n(r),a()}catch(e){a(e)}},!0),138216,e=>e.a(async(t,a)=>{try{var r=await e.y("nextly-2042afbdf41f0f4f/config");e.n(r),a()}catch(e){a(e)}},!0),844376,(e,t,a)=>{t.exports=e.x("node:module",()=>require("node:module"))},814747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},929953,e=>{"use strict";var t=e.i(892648);let a=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");e.s(["C",0,function({title:e,link:t,description:r,items:i}){let n=i.map(e=>{let t,r=(e.categories??[]).map(e=>`<category>${a(e)}</category>`).join("");return`
    <item>
      <title>${a(e.title)}</title>
      <link>${a(e.link)}</link>
      <guid isPermaLink="true">${a(e.link)}</guid>
      ${e.pubDate?`<pubDate>${new Date(e.pubDate).toUTCString()}</pubDate>`:""}
      ${e.author?`<author>${a(e.author)}</author>`:""}
      ${e.description?`<description>${t=e.description,`<![CDATA[${t.replace(/]]>/g,"]]]]><![CDATA[>")}]]>`}</description>`:""}
      ${r}
    </item>`}).join("");return`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${a(e)}</title>
    <link>${a(t)}</link>
    <description>${a(r)}</description>
    <language>en-us</language>${n}
  </channel>
</rss>`},"i",0,function(e){return e.map(e=>({title:e.title,link:(0,t.I)(`/blog/${e.slug}`),description:e.excerpt??void 0,...e.publishedAt?{pubDate:e.publishedAt}:{},author:e.author?.name,categories:[...e.categories?.map(e=>e.name)??[],...e.tags?.map(e=>e.name)??[]]}))}])},892648,e=>{"use strict";let t=process.env.PORT??"3000",a=process.env.NEXT_PUBLIC_SITE_URL??"https://api.arkansastrademarketing.com/admin"??`http://localhost:${t}`;e.s(["A",0,a,"I",0,function(e="/"){let t=a.replace(/\/$/,""),r=e.startsWith("/")?e:`/${e}`;return`${t}${r}`}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__19yhe_50g7zzv._.js.map