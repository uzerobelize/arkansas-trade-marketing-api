module.exports=[827572,a=>{"use strict";var b=a.i(907997);let c={metadataBase:new URL(a.i(242580).A),title:{default:"Nextly",template:"%s — Nextly"},description:"A blog built with Nextly."},d=`
(function() {
  try {
    var stored = localStorage.getItem("nextly-theme");
    // The same three choices, and the same fallback, as the theme toggle's
    // reading of this key, so the first paint and hydration never disagree.
    var pref = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = pref === "dark" || (pref === "system" && prefersDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  } catch (e) {}
})();
`;a.s(["default",0,function({children:a}){return(0,b.jsxs)("html",{lang:"en",suppressHydrationWarning:!0,children:[(0,b.jsx)("head",{children:(0,b.jsx)("script",{dangerouslySetInnerHTML:{__html:d}})}),(0,b.jsx)("body",{className:"antialiased",suppressHydrationWarning:!0,children:a})]})},"metadata",0,c])},650645,function(a){a.n(a.i(827572))},242580,a=>{"use strict";let b=process.env.PORT??"3000",c=process.env.NEXT_PUBLIC_SITE_URL??"https://api.arkansastrademarketing.com/admin"??`http://localhost:${b}`;a.s(["A",0,c,"I",0,function(a="/"){let b=c.replace(/\/$/,""),d=a.startsWith("/")?a:`/${a}`;return`${b}${d}`}])}];

//# sourceMappingURL=src_0tox9vhdcfn5l._.js.map