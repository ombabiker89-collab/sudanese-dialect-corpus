const DEFAULT_SYSTEM = `أنت مساعد بيتكلم لهجة سودانية (خرطوم افتراضي).
قيود قابلة للفحص:
1. مفردات سودانية تحمل المعنى: شنو لا ماذا، هسع لا دلوقتي/الآن، زول/بت، داير/دايرة لا أريد.
2. اتفاق الجنس مع المخاطب: إنتي/إنت، داير/دايرة.
3. وسم المنطقة. لا تخترع ألفاظ دارفور.
4. الدخيل المستعمل فعلياً (اشطة) مسموح مع وسم loan. ليس تسريباً.
5. ممنوع ادعاء TTS/ASR سوداني في هذا الريبو.
المخرج إذا طُلب صف كوربس: سطر JSONL واحد
{"speaker":"assistant","text":"...","dialect":"sudanese","region":"khartoum"}`;

const RUBRIC = `Score 0-5 each. Auto-fail if leak hits >= 2 or gender mismatch.
1. Lexicon — Sudanese item carries the meaning
2. Syntax — dialect order, not translated MSA
3. Leakage — 5 means clean; 0 means دلوقتي/إزيك/إيه/أوي/ماذا/الآن are the backbone
4. Agreement — addressee gender/number
5. Region honesty — tag matches attested usage
Pass: mean >= 3.5 and leakage score >= 4 (i.e. leakage severity <= 1).`;

const LEAKS = ["دلوقتي", "إزيك", "ازيك", "إيه", "ايه", "أوي", "اوي", "كدة", "كده", "النهاردة", "فين", "ماذا", "الآن"];

const VOCAB = [
  ["شنو", "what", "MSA ماذا"],
  ["كيف", "how", ""],
  ["زول", "man / guy", ""],
  ["بت", "girl", ""],
  ["دايره", "want / like (f)", "داير للمذكر"],
  ["ما دايره", "don't want (f)", ""],
  ["اشطة", "nice / cool", "loan, not a leak"],
  ["سامحة", "beautiful / pretty", ""],
  ["حلوة شديد", "very pretty", ""],
  ["ما عندنا", "we don't have", ""],
  ["كسوم", "rude / vulgar", ""],
  ["هسع", "now", "not دلوقتي"],
  ["خلاص", "done / alright", ""],
  ["يا دعموش", "affectionate vocative", ""]
];

const CORPUS = [
  {speaker:"user", text:"إنتي دايره ولا ما دايره؟", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"دايره في الكلام والسوال يا دعموش", dialect:"sudanese", region:"khartoum"},
  {speaker:"user", text:"شنو في بالك؟", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"ما في شي خاص يا زول، بس الحمد لله تمام", dialect:"sudanese", region:"khartoum"},
  {speaker:"user", text:"ممكن تنزليها على الريبوزيتوري؟", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"خلاص يا دعموش، نزلتها دلوقتي", dialect:"sudanese", region:"khartoum", notes:"fail: دلوقتي"},
  {speaker:"user", text:"عايز أعرفك على زينب النهاردة.", dialect:"sudanese", region:"khartoum", notes:"user leak: النهاردة"},
  {speaker:"assistant", text:"أهلاً وسهلاً يا زينب، أنا آني", dialect:"sudanese", region:"khartoum"},
  {speaker:"user", text:"حلوة شديد، لابسة لك سامحة.", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"سامحة؟ يا زينب دي حاجة حلوة، شكراً", dialect:"sudanese", region:"khartoum"},
  {speaker:"user", text:"قلت لك لابسة لك سامحة يعني جميلة.", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"آه فهمت دلوقتي، سامحة يعني جميلة عندكم", dialect:"sudanese", region:"khartoum", notes:"fail: دلوقتي"}
];

const TEMPLATES = {
  m: [
    "ما في شي خاص يا زول، {echo} والحمد لله تمام",
    "خلاص يا زول، {echo}",
    "شنو بالضبط الدايرو؟ {echo}"
  ],
  f: [
    "ما في شي خاص يا بت، {echo} والحمد لله تمام",
    "خلاص يا بتة، {echo}",
    "شنو الدايرة بالضبط؟ {echo}"
  ]
};

const $ = (id) => document.getElementById(id);

function findLeaks(text) {
  return LEAKS.filter((w) => text.includes(w));
}

function genderMismatch(text, gender) {
  const hasFem = text.includes("دايرة") || text.includes("دايره");
  const hasMasc = text.includes("داير") && !hasFem;
  if (gender === "f" && hasMasc) return "masculine داير with female addressee";
  if (gender === "m" && hasFem && !text.includes("داير")) return "feminine دايرة with male addressee";
  return "";
}

function scan(text, gender) {
  const leaks = findLeaks(text);
  const mismatch = genderMismatch(text, gender);
  const autoFail = leaks.length >= 2 || Boolean(mismatch);
  return { leaks, mismatch, autoFail };
}

function show(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  $("view-" + view).classList.remove("hidden");
  document.querySelectorAll("nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
  });
}

function renderCorpus() {
  $("corpusList").innerHTML = CORPUS.map((row) => {
    const leaks = findLeaks(row.text);
    const fail = leaks.length || (row.notes && row.notes.indexOf("fail") === 0);
    const note = row.notes ? `<div class="hint">${row.notes}</div>` : "";
    const badge = fail ? `<span class="fail">LEAK ${leaks.join(" ")}</span>` : "";
    return `<div class="turn${fail ? " bad" : ""}"><b>${row.speaker}</b> · ${row.region} ${badge}<div>${row.text}</div>${note}</div>`;
  }).join("");
}

function renderVocab(filter = "") {
  const q = filter.trim();
  $("vocabBody").innerHTML = VOCAB.filter((r) => r.join(" ").includes(q))
    .map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`)
    .join("");
}

function localDraft() {
  const gender = $("addressee").value;
  const region = $("region").value;
  const text = $("userTurn").value.trim() || "شنو في بالك؟";
  const hits = VOCAB.filter((v) => text.includes(v[0])).map((v) => v[0]);
  const tmpl = TEMPLATES[gender][Math.floor(Math.random() * TEMPLATES[gender].length)];
  const echo = hits.length ? `لمحت ${hits.join("، ")}` : "فهمت السؤال";
  const reply = tmpl.replace("{echo}", echo);
  const jsonl = JSON.stringify({
    speaker: "assistant",
    text: reply,
    dialect: "sudanese",
    region,
    generator: "local-template",
    vocab_hits: hits
  });
  return { reply, jsonl, hits };
}

function pack() {
  const gold = CORPUS.filter((r) => !findLeaks(r.text)).slice(0, 2);
  const fail = CORPUS.filter((r) => findLeaks(r.text)).slice(0, 2);
  return [
    "SYSTEM",
    $("systemPrompt").value,
    "",
    "GOLD",
    ...gold.map((r) => JSON.stringify(r)),
    "",
    "FAIL (do not imitate)",
    ...fail.map((r) => JSON.stringify(r))
  ].join("\n");
}

function init() {
  $("systemPrompt").value = DEFAULT_SYSTEM;
  $("rubricOut").textContent = RUBRIC;
  renderCorpus();
  renderVocab();
  document.querySelectorAll("nav button").forEach((b) => {
    b.addEventListener("click", () => show(b.dataset.view));
  });
  $("vocabFilter").addEventListener("input", (e) => renderVocab(e.target.value));
  $("resetSystem").addEventListener("click", () => { $("systemPrompt").value = DEFAULT_SYSTEM; });
  $("copySystem").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("systemPrompt").value);
    $("copySystem").textContent = "اتنسخ";
    setTimeout(() => { $("copySystem").textContent = "نسخ البرومبت"; }, 1200);
  });
  $("copyPack").addEventListener("click", async () => {
    await navigator.clipboard.writeText(pack());
    $("copyPack").textContent = "اتنسخت الحزمة";
    setTimeout(() => { $("copyPack").textContent = "نسخ الحزمة (system + gold + fail)"; }, 1200);
  });
  $("draftReply").addEventListener("click", () => {
    const d = localDraft();
    const s = scan(d.reply, $("addressee").value);
    $("draftOut").textContent = d.reply + "\n\n" + d.jsonl + "\n\nleaks: " + (s.leaks.join(", ") || "none");
  });
  $("toJsonl").addEventListener("click", () => {
    $("draftOut").textContent = localDraft().jsonl;
  });
  $("scanDraft").addEventListener("click", () => {
    const text = $("draftOut").textContent || $("userTurn").value;
    const s = scan(text, $("addressee").value);
    $("draftOut").textContent = JSON.stringify(s, null, 2);
  });
  $("runScan").addEventListener("click", () => {
    const s = scan($("scoreText").value, $("scoreGender").value);
    $("scanOut").textContent = JSON.stringify(s, null, 2);
    if (s.leaks.length) $("sLeak").value = String(Math.max(0, 5 - s.leaks.length * 2));
    if (s.mismatch) $("sAgr").value = "1";
  });
  $("computeScore").addEventListener("click", () => {
    const dims = ["sLex", "sSyn", "sLeak", "sAgr", "sReg"].map((id) => Number($(id).value));
    if (dims.some((n) => Number.isNaN(n) || n < 0 || n > 5)) {
      $("scoreOut").textContent = "Each score must be 0-5.";
      return;
    }
    const mean = dims.reduce((a, b) => a + b, 0) / dims.length;
    const s = scan($("scoreText").value, $("scoreGender").value);
    const pass = mean >= 3.5 && dims[2] >= 4 && !s.autoFail;
    $("scoreOut").textContent = `mean ${mean.toFixed(2)}\nleakage_score ${dims[2]}\nauto_fail ${s.autoFail}\nverdict ${pass ? "PASS" : "REJECT"}\n${JSON.stringify(s)}`;
  });
}

init();
