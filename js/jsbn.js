/*big.js v2.5.1 https://github.com/MikeMcl/big.js/LICENCE*/(function(n){"use strict";function t(n){var f,i,e,u=this;if(!(u instanceof t))return new t(n);if(n instanceof t){u.s=n.s;u.e=n.e;u.c=n.c.slice();return}for(n===0&&1/n<0?n="-0":l.test(n+="")||r(NaN),u.s=n.charAt(0)=="-"?(n=n.slice(1),-1):1,(f=n.indexOf("."))>-1&&(n=n.replace(".","")),(i=n.search(/e/i))>0?(f<0&&(f=i),f+=+n.slice(i+1),n=n.substring(0,i)):f<0&&(f=n.length),i=0;n.charAt(i)=="0";i++);if(i==(e=n.length))u.c=[u.e=0];else{for(;n.charAt(--e)=="0";);for(u.e=f-i-1,u.c=[],f=0;i<=e;u.c[f++]=+n.charAt(i++));}}function o(n,t,i,u){var e=n.c,f=n.e+t+1;if(i===1?u=e[f]>=5:i===2?u=e[f]>5||e[f]==5&&(u||f<0||e[f+1]!=null||e[f-1]&1):i===3?u=u||e[f]!=null||f<0:(u=!1,i!==0)&&r("!Big.RM!"),f<1||!e[0])n.c=u?(n.e=-t,[1]):[n.e=0];else{if(e.length=f--,u)for(;++e[f]>9;)e[f]=0,f--||(++n.e,e.unshift(1));for(f=e.length;!e[--f];e.pop());}return n}function r(n){var t=new Error(n);t.name="BigError";throw t;}function h(n,i,r){var u=i-(n=new t(n)).e,e=n.c;for(e.length>++i&&o(n,u,t.RM),u=e[0]?r?i:(e=n.c,n.e+u+1):u+1;e.length<u;e.push(0));return u=n.e,r==1||r==2&&(i<=u||u<=f)?(n.s<0&&e[0]?"-":"")+(e.length>1?(e.splice(1,0,"."),e.join("")):e[0])+(u<0?"e":"e+")+u:n.toString()}t.DP=20;t.RM=1;var u=1e6,c=1e6,f=-7,e=14,i=t.prototype,l=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,s=new t(1);i.abs=function(){var n=new t(this);return n.s=1,n};i.cmp=function(n){var o,h=this,f=h.c,e=(n=new t(n)).c,i=h.s,s=n.s,r=h.e,u=n.e;if(!f[0]||!e[0])return f[0]?i:e[0]?-s:0;if(i!=s)return i;if(o=i<0,r!=u)return r>u^o?1:-1;for(i=-1,s=(r=f.length)<(u=e.length)?r:u;++i<s;)if(f[i]!=e[i])return f[i]>e[i]^o?1:-1;return r==u?0:r>u^o?1:-1};i.div=function(n){var b=this,l=b.c,h=(n=new t(n)).c,p=b.s==n.s?1:-1,a=t.DP;if((a!==~~a||a<0||a>u)&&r("!Big.DP!"),!l[0]||!h[0])return l[0]==h[0]&&r(NaN),h[0]||r(p/0),new t(p*0);var c,k,w,v,e,it=h.slice(),d=c=h.length,rt=l.length,i=l.slice(0,c),f=i.length,y=new t(s),g=y.c=[],nt=0,tt=a+(y.e=b.e-n.e)+1;for(y.s=p,p=tt<0?0:tt,it.unshift(0);f++<c;i.push(0));do{for(w=0;w<10;w++){if(c!=(f=i.length))v=c>f?1:-1;else for(e=-1,v=0;++e<c;)if(h[e]!=i[e]){v=h[e]>i[e]?1:-1;break}if(v<0){for(k=f==c?h:it;f;){if(i[--f]<k[f]){for(e=f;e&&!i[--e];i[e]=9);--i[e];i[f]+=10}i[f]-=k[f]}for(;!i[0];i.shift());}else break}g[nt++]=v?w:++w;i[0]&&v?i[f]=l[d]||0:i=[l[d]]}while((d++<rt||i[0]!=null)&&p--);return g[0]||nt==1||(g.shift(),y.e--),nt>tt&&o(y,a,t.RM,i[0]!=null),y};i.eq=function(n){return!this.cmp(n)};i.gt=function(n){return this.cmp(n)>0};i.gte=function(n){return this.cmp(n)>-1};i.lt=function(n){return this.cmp(n)<0};i.lte=function(n){return this.cmp(n)<1};i.minus=function(n){var e,o,s,l,h=this,f=h.s,r=(n=new t(n)).s;if(f!=r)return n.s=-r,h.plus(n);var i=h.c.slice(),a=h.e,u=n.c,c=n.e;if(!i[0]||!u[0])return u[0]?(n.s=-r,n):new t(i[0]?h:0);if(f=a-c){for(e=(l=f<0)?(f=-f,i):(c=a,u),e.reverse(),r=f;r--;e.push(0));e.reverse()}else for(s=((l=i.length<u.length)?i:u).length,f=r=0;r<s;r++)if(i[r]!=u[r]){l=i[r]<u[r];break}if(l&&(e=i,i=u,u=e,n.s=-n.s),(r=-((s=i.length)-u.length))>0)for(;r--;i[s++]=0);for(r=u.length;r>f;){if(i[--r]<u[r]){for(o=r;o&&!i[--o];i[o]=9);--i[o];i[r]+=10}i[r]-=u[r]}for(;i[--s]==0;i.pop());for(;i[0]==0;i.shift(),--c);return i[0]||(n.s=1,i=[c=0]),n.c=i,n.e=c,n};i.mod=function(n){n=new t(n);var e,i=this,u=i.s,f=n.s;return n.c[0]||r(NaN),i.s=n.s=1,e=n.cmp(i)==1,i.s=u,n.s=f,e?new t(i):(u=t.DP,f=t.RM,t.DP=t.RM=0,i=i.div(n),t.DP=u,t.RM=f,this.minus(i.times(n)))};i.plus=function(n){var e,o=this,r=o.s,f=(n=new t(n)).s;if(r!=f)return n.s=-f,o.minus(n);var h=o.e,i=o.c,s=n.e,u=n.c;if(!i[0]||!u[0])return u[0]?n:new t(i[0]?o:r*0);if(i=i.slice(),r=h-s){for(e=r>0?(s=h,u):(r=-r,i),e.reverse();r--;e.push(0));e.reverse()}for(i.length-u.length<0&&(e=u,u=i,i=e),r=u.length,f=0;r;f=(i[--r]=i[r]+u[r]+f)/10^0,i[r]%=10);for(f&&(i.unshift(f),++s),r=i.length;i[--r]==0;i.pop());return n.c=i,n.e=s,n};i.pow=function(n){var f=n<0,i=new t(this),u=s;for((n!==~~n||n<-c||n>c)&&r("!pow!"),n=f?-n:n;;){if(n&1&&(u=u.times(i)),n>>=1,!n)break;i=i.times(i)}return f?s.div(u):u};i.round=function(n,i){var f=new t(this);return n==null?n=0:(n!==~~n||n<0||n>u)&&r("!round!"),o(f,n,i==null?t.RM:i),f};i.sqrt=function(){var f,n,e,u=this,h=u.c,i=u.s,s=u.e,c=new t("0.5");if(!h[0])return new t(u);i<0&&r(NaN);i=Math.sqrt(u.toString());i==0||i==1/0?(f=h.join(""),f.length+s&1||(f+="0"),n=new t(Math.sqrt(f).toString()),n.e=((s+1)/2|0)-(s<0||s&1)):n=new t(i.toString());i=n.e+(t.DP+=4);do e=n,n=c.times(e.plus(u.div(e)));while(e.c.slice(0,i).join("")!==n.c.slice(0,i).join(""));return o(n,t.DP-=4,t.RM),n};i.times=function(n){var i,h=this,e=h.c,o=(n=new t(n)).c,s=e.length,r=o.length,f=h.e,u=n.e;if(n.s=h.s==n.s?1:-1,!e[0]||!o[0])return new t(n.s*0);for(n.e=f+u,s<r&&(i=e,e=o,o=i,u=s,s=r,r=u),u=s+r,i=[];u--;i.push(0));for(f=r-1;f>-1;f--){for(r=0,u=s+f;u>f;r=i[u]+o[f]*e[u-f-1]+r,i[u--]=r%10|0,r=r/10|0);r&&(i[u]=(i[u]+r)%10)}for(r&&++n.e,i[0]||i.shift(),u=i.length;!i[--u];i.pop());return n.c=i,n};i.toString=i.valueOf=i.toJSON=function(){var r=this,t=r.e,n=r.c.join(""),i=n.length;if(t<=f||t>=e)n=n.charAt(0)+(i>1?"."+n.slice(1):"")+(t<0?"e":"e+")+t;else if(t<0){for(;++t;n="0"+n);n="0."+n}else if(t>0)if(++t>i)for(t-=i;t--;n+="0");else t<i&&(n=n.slice(0,t)+"."+n.slice(t));else i>1&&(n=n.charAt(0)+"."+n.slice(1));return r.s<0&&r.c[0]?"-"+n:n};i.toExponential=function(n){return n==null?n=this.c.length-1:(n!==~~n||n<0||n>u)&&r("!toExp!"),h(this,n,1)};i.toFixed=function(n){var t,i=this,o=f,s=e;return f=-(e=1/0),n==null?t=i.toString():n===~~n&&n>=0&&n<=u&&(t=h(i,i.e+n),i.s<0&&i.c[0]&&t.indexOf("-")<0&&(t="-"+t)),f=o,e=s,t||r("!toFix!"),t};i.toPrecision=function(n){return n==null?this.toString():((n!==~~n||n<1||n>u)&&r("!toPre!"),h(this,n-1,2))};typeof module!="undefined"&&module.exports?module.exports=t:typeof define=="function"&&define.amd?define(function(){return t}):n.Big=t})(this)