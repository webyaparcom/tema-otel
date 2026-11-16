/* tanitim-medya — Medya-hazır tanıtım: metin + 30 sn video / ses oynatıcı / TTS «Dinle» yuvası
   (15 Kas 2026, G4 · mcp:webmaker/20261115-202337-k60m · D17–D19; G5 medya modülleri ve hero-sahne ile aynı yuva sözleşmesi).
   Yer tutucular: tnmsinif tnmust tnmbaslik tnmmetin tnmdinle tnmmaddeler tnmcta tnmmedya tnmkontrol tnmses tnmsure.
   Video (D19): desing.video ≤30 sn (uzunsa betik sure. sn'de durdurur) + poster ZORUNLU eş (yoksa img; ikisi de yoksa yuva
   data-wm-ai-yuva="tanitim" gradyan yer tutucu — G5/ComfyUI doldurur). autoplay:false (varsayılan) → tıkla-oynat, sesli, denetimli;
   autoplay:true → sessiz döngü önizleme + durdur düğmesi. Ses: desing.ses (dosya ya da dil sözlüğü) → <audio controls> (data-wm-ses-yuva).
   TTS: desing.tts → «Dinle» düğmesi (data-wm-tts-yuva): ses_tts[dil] kaydı varsa onu çalar, yoksa tarayıcı sesi (speechSynthesis, sayfa
   dilinde ses varsa); ikisi de yoksa düğme gizli kalır. Metin: baslik → site adı, metin → setting.description; maddeler data'dan. */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `/img/${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];

const stil = ["yan", "genis"].includes(String(des.stil || "").trim()) ? String(des.stil).trim() : "yan";
let sure = parseInt(des.sure, 10);
if (!Number.isFinite(sure) || sure < 3) sure = 30;
sure = Math.min(30, sure);

const video = medyaUrl(pick(des.video));
const videoMobil = medyaUrl(pick(des.video_mobil));
const img = medyaUrl(des.img);
const poster = medyaUrl(des.poster) || img;
const alt = pick(des.alt).trim();
const otomatik = dogru(des.autoplay, false);
const altyazi = medyaUrl(pick(des.altyazi));

let tnmMedya = "";
let videoVar = false;
if (video && poster) {
  videoVar = true;
  const kaynak = (videoMobil ? `<source src="${esc(videoMobil)}" media="(max-width: 768px)" />` : "") + `<source src="${esc(video)}" />`;
  const iz = altyazi ? `<track kind="captions" src="${esc(altyazi)}" srclang="{{lang}}" default />` : "";
  tnmMedya = `<img class="modulex-tnm-poster" src="${esc(poster)}" alt="${esc(alt)}" width="1200" height="1500" loading="lazy" decoding="async" />`
    + `<video class="modulex-tnm-video" playsinline${otomatik ? " muted loop autoplay" : ""} preload="${otomatik ? "metadata" : "none"}" poster="${esc(poster)}"${otomatik ? ' aria-hidden="true" tabindex="-1"' : ""}>${kaynak}${iz}</video>`
    + `<span class="modulex-tnm-sure" aria-hidden="true"><span class="material-symbols-outlined">timer</span>${sure}</span>`;
} else if (img) {
  tnmMedya = `<img class="modulex-tnm-poster" src="${esc(img)}" alt="${esc(alt)}" width="1200" height="1500" loading="lazy" decoding="async" />`;
} else {
  tnmMedya = '<div class="modulex-tnm-yuva" aria-hidden="true"><span class="modulex-tnm-yuva-isik"></span><span class="material-symbols-outlined">movie</span></div>';
}
const tnmKontrol = videoVar
  ? `<button class="modulex-tnm-kontrol" type="button" aria-pressed="${otomatik ? "true" : "false"}" aria-label="${otomatik ? "@video-pause@" : "@video-play@"}" data-oynat="@video-play@" data-durdur="@video-pause@" data-kip="${otomatik ? "dongu" : "tikla"}">`
    + '<svg class="modulex-tnm-halka" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="21" pathLength="100" /><circle class="modulex-tnm-halka-dolu" cx="24" cy="24" r="21" pathLength="100" /></svg>'
    + '<span class="material-symbols-outlined modulex-tnm-ikon-durdur" aria-hidden="true">pause</span><span class="material-symbols-outlined modulex-tnm-ikon-oynat" aria-hidden="true">play_arrow</span></button>'
  : "";

const ses = medyaUrl(pick(des.ses));
const sesBaslik = pick(des.ses_baslik).trim();
const tnmSes = ses
  ? `<div class="modulex-tnm-ses" data-wm-ses-yuva="tanitim"><span class="material-symbols-outlined" aria-hidden="true">graphic_eq</span>`
    + (sesBaslik ? `<p class="modulex-tnm-ses-baslik" id="tnm-{{id}}-ses">${esc(sesBaslik)}</p>` : "")
    + `<audio class="modulex-tnm-audio" controls preload="none" src="${esc(ses)}"${sesBaslik ? ' aria-labelledby="tnm-{{id}}-ses"' : ""}></audio></div>`
  : "";

const ttsSes = medyaUrl(des.ses_tts && typeof des.ses_tts === "object" ? (des.ses_tts[json.lang] || "") : "");
const tnmDinle = dogru(des.tts, true)
  ? `<button class="modulex-tnm-dinle" type="button" hidden data-wm-tts-yuva="tanitim"${ttsSes ? ` data-ses="${esc(ttsSes)}"` : ""} aria-pressed="false" data-dinle="@listen@" data-durdur="@listen-stop@">`
    + '<span class="material-symbols-outlined" aria-hidden="true">volume_up</span><span class="modulex-tnm-dinle-metin">@listen@</span></button>'
  : "";

const maddeler = veri
  .map((o) => ({ ikon: ikonAd(o && o.ikon), baslik: pick(o && o.baslik).trim(), metin: pick(o && o.metin).trim() }))
  .filter((o) => o.baslik);
const tnmMaddeler = maddeler.length
  ? `<ul class="modulex-tnm-maddeler">${maddeler.map((m) => `<li>${m.ikon ? `<span class="material-symbols-outlined" aria-hidden="true">${m.ikon}</span>` : '<span class="modulex-tnm-imge" aria-hidden="true"></span>'}<div><h3>${esc(m.baslik)}</h3>${m.metin ? `<p>${satirlar(m.metin)}</p>` : ""}</div></li>`).join("")}</ul>`
  : "";

const ust = pick(des.ust).trim();
const baslik = pick(des.baslik).trim();
const metin = pick(des.metin).trim() || pick(setting.description).trim();
const ctaAd = pick(des.cta_ad).trim();
const ctaUrl = href(des.cta_url);

const tnmSinif = [
  ` modulex-tnm--${stil}`,
  dogru(des.medyaBasta, false) ? " modulex-tnm--medya-basta" : "",
  videoVar ? " modulex-tnm--video" : "",
  !video && !img ? " modulex-tnm--yuva" : "",
  ses ? " modulex-tnm--sesli" : "",
].join("");

html = html
  .replaceAll("{{tnmsinif}}", () => tnmSinif)
  .replaceAll("{{tnmust}}", () => (ust ? `<p class="modulex-tnm-ust">${esc(ust)}</p>` : ""))
  .replaceAll("{{tnmbaslik}}", () => (baslik ? esc(baslik) : "{{web-name}}"))
  .replaceAll("{{tnmmetin}}", () => (metin ? `<p class="modulex-tnm-metin">${satirlar(metin)}</p>` : ""))
  .replaceAll("{{tnmdinle}}", () => tnmDinle)
  .replaceAll("{{tnmmaddeler}}", () => tnmMaddeler)
  .replaceAll("{{tnmcta}}", () => (ctaAd && ctaUrl ? `<a class="modulex-tnm-cta" href="${esc(ctaUrl)}">${esc(ctaAd)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : ""))
  .replaceAll("{{tnmmedya}}", () => tnmMedya)
  .replaceAll("{{tnmkontrol}}", () => tnmKontrol)
  .replaceAll("{{tnmses}}", () => tnmSes)
  .replaceAll("{{tnmsure}}", () => String(sure));
