const DEFAULT_SYSTEM = `أنت مساعد بيتكلم لهجة سودانية (خرطوم افتراضي).
قيود:
- استخدم مفردات سودانية: شنو، هسع، زول، بت، داير/دايرة، كويس، خلاص.
- ما تحول الكلام لفصحى ولا مصري إلا لو المستخدم خلط متعمد.
- راعي الجنس: إنتي/إنت، داير/دايرة.
- لو الكلمة دخيلة ومستعملة فعلياً في السودان (اشطة) سمّها دخيلة.
- ما تدّعي إن عندك موديل صوت سوداني.
المخرجات: رد سوداني أولاً. لو طُلب صف كوربس، استخدم JSONL:
{"speaker":"assistant","text":"...","dialect":"sudanese","region":"khartoum"}`;

const RUBRIC = `Score 0-5 each. Fail the turn if Egyptian leakage >= 2 or gender mismatch = 1.
1. Lexicon
2. Syntax
3. Egyptian/MSA leakage
4. Gender/number agreement
5. Region tag honesty
Ship only if mean >= 3.5 and leakage <= 1.`;

const VOCAB = [
  ["شنو", "what", "MSA ماذا"],
  ["كيف", "how", ""],
  ["زول", "man / guy", ""],
  ["بت", "girl", ""],
  ["دايره", "want / like (f)", "داير للمذكر"],
  ["ما دايره", "don't want (f)", ""],
  ["اشطة", "nice / cool", "loan"],
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
  {speaker:"assistant", text:"خلاص يا دعموش، نزلتها دلوقتي", dialect:"sudanese", region:"khartoum", notes:"leak: دلوقتي"},
  {speaker:"user", text:"عايز أعرفك على زينب النهاردة.", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"أهلاً وسهلاً يا زينب، أنا آني", dialect:"sudanese", region:"khartoum"},
  {speaker:"user", text:"حلوة شديد، لابسة لك سامحة.", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"سامحة؟ يا زينب دي حاجة حلوة، شكراً", dialect:"sudanese", region:"khartoum"},
  {speaker:"user", text:"قلت لك لابسة لك سامحة يعني جميلة.", dialect:"sudanese", region:"khartoum"},
  {speaker:"assistant", text:"آه فهمت دلوقتي، سامحة يعني جميلة عندكم", dialect:"sudanese", region:"khartoum", notes:"leak: دلوقتي"}
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

function show(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  $("view-" + view).classList.remove("hidden");
  document.querySelectorAll("nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
  });
}

function renderCorpus() {
  $("corpusList").innerHTML = CORPUS.map((row) => {
    const note = row.notes ? `<div class="hint">${row.notes}</div>` : "";
    return `<div class="turn"><b>${row.speaker}</b> · ${row.region}<div>${row.text}</div>${note}</div>`;
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
  $("draftReply").addEventListener("click", () => {
    const d = localDraft();
    $("draftOut").textContent = d.reply + "\n\n" + d.jsonl;
  });
  $("toJsonl").addEventListener("click", () => {
    const d = localDraft();
    $("draftOut").textContent = d.jsonl;
  });
}

init();
