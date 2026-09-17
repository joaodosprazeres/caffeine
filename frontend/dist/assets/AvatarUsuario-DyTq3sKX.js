import{f as n,r as g,j as e,s as b}from"./index-D3jNIkXB.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=n("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=n("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]),s={sm:"w-8 h-8",lg:"w-16 h-16"},p={sm:16,lg:32};function y({avatarUrl:t,nomeExibicao:d,tamanho:r="sm",editavel:f=!1,enviando:u=!1,onSelecionarArquivo:l}){const c=g.useRef(null);function m(a){var o;const i=(o=a.target.files)==null?void 0:o[0];i&&l&&l(i),a.target.value=""}return e.jsxs("div",{className:`relative ${s[r]} shrink-0`,children:[t?e.jsx("img",{src:t,alt:`Avatar de ${d}`,className:`${s[r]} rounded-full object-cover border border-coffee-100`}):e.jsx("div",{className:`${s[r]} rounded-full bg-coffee-300 border border-coffee-100 flex items-center justify-center`,role:"img","aria-label":b.avatarPlaceholderAlt,children:e.jsx(x,{size:p[r],className:"text-coffee-900","aria-hidden":"true"})}),f&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button","aria-label":"Alterar foto de perfil",disabled:u,onClick:()=>{var a;return(a=c.current)==null?void 0:a.click()},className:"absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center disabled:opacity-60",children:e.jsx(h,{size:14,"aria-hidden":"true"})}),e.jsx("input",{ref:c,type:"file",accept:"image/jpeg,image/png,image/webp",className:"sr-only","aria-label":"Selecionar nova foto de perfil",onChange:m})]})]})}export{y as A};
