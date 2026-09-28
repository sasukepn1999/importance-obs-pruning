// Gallery data: each set maps to static/images/<dir>/<id>/{dense,obs_S,ours_S}.jpg
// `dense: true` marks examples that ship a dense (unpruned) reference image.
const SETS = [
  {
    label: "PixArt-Σ · Unstructured Pruning",
    dir: "pixart",
    levels: [45, 50, 55, 60],
    items: [
      { id: "00156", dense: true, prompt: "A baby holding a spoon looking at a cupcake and candle." },
      { id: "00513", dense: true, prompt: "A kitten sitting in a sink with a green brush with green bristles." },
      { id: "00037", prompt: "A young man and his cute cat enjoy a nap together." },
      { id: "00000", prompt: "A black Honda motorcycle parked in front of a garage." },
      { id: "00261", prompt: "A motorcycle is parked on a dirt road in a forest." },
      { id: "00012", prompt: "A cat eating a bird it has caught." },
      { id: "00035", prompt: "A cat at attention between two parked cars." },
      { id: "00036", prompt: "A dog sitting between its masters feet on a footstool watching tv." },
      { id: "00008", prompt: "A beautiful dessert waiting to be shared by two people." },
    ],
  },
  {
    label: "SD3-Medium · Unstructured Pruning",
    dir: "sd3",
    levels: [30, 40, 45, 50],
    items: [
      { id: "00780", dense: true, prompt: "A cat is sitting in a car near the dash." },
      { id: "00389", prompt: "A man walking beside sheep on a country road." },
      { id: "00067", prompt: "An American Airlines plane is in the sky." },
      { id: "00326", prompt: "Two people riding a motorcycle to the beach." },
      { id: "00377", prompt: "A silver car in the street next to a metal railing." },
      { id: "00323", prompt: "This new fridge goes great in this clean kitchen." },
    ],
  },
  {
    label: "PixArt-Σ · Structured Pruning",
    dir: "structured",
    levels: [20, 30, 40],
    items: [
      { id: "00000", dense: true, prompt: "A black Honda motorcycle parked in front of a garage." },
      { id: "00001", dense: true, prompt: "A Honda motorcycle parked in a grass driveway." },
      { id: "00014", dense: true, prompt: "A shot of an elderly man inside a kitchen." },
      { id: "00015", dense: true, prompt: "A cat in between two cars in a parking lot." },
      { id: "00020", dense: true, prompt: "A man sleeping with his cat next to him." },
      { id: "00032", dense: true, prompt: "A cat stands between two parked cars on a grassy sidewalk." },
      { id: "00104", dense: true, prompt: "A long haired cat eating a dead bird." },
      { id: "00114", dense: true, prompt: "A striped cat sitting near a brick wall." },
      { id: "00123", dense: true, prompt: "A giraffe and a zebra checking each other out." },
      { id: "00127", dense: true, prompt: "A red truck has a black dog in the drivers chair." },
      { id: "00167", dense: true, prompt: "An Egyptian airlines plane landing at an airport." },
    ],
  },
  {
    // Category-targeted pruning: static/images/target/<cat>/<id>/{obs,ours}_{general,target}.jpg
    label: "PixArt-Σ · Category-Targeted Pruning (60%)",
    dir: "target",
    targeted: true,
    items: [
      ...["00173", "00181", "00195", "00789"].map((id) => ({ id: `woman/${id}`, cat: "Woman" })),
      ...["00019", "00032", "00065", "00069"].map((id) => ({ id: `cat/${id}`, cat: "Cat" })),
      ...["00031", "00035", "00039", "00093"].map((id) => ({ id: `airplane/${id}`, cat: "Airplane" })),
      ...["00009", "00047", "00137", "00167"].map((id) => ({ id: `motorcycle/${id}`, cat: "Motorcycle" })),
    ],
  },
];

const TARGET_VARIANTS = [
  ["obs_general", "OBS-Diff", "general"],
  ["obs_target", "OBS-Diff", "target"],
  ["ours_general", "Ours", "general"],
  ["ours_target", "Ours", "target"],
];

// ---------------- Importance-signal viewer data ----------------
// Images: static/images/signals/<id>/{dense,obs,ours_<sig>,map_<sig>}.jpg
const SIG_EXAMPLE = { id: "00000", sp: 55, prompt: "A black Honda motorcycle parked in front of a garage." };

// PixArt-Σ unstructured at 55%, full MS-COCO eval (paper Tab. "other signals"): [CLIP, ImageReward, MUSIQ]
const SIG_METRICS = { obs: [31.65, 0.64, 68.25], cfg: [31.69, 0.70, 69.25], det: [31.79, 0.75, 69.62], canny: [31.83, 0.76, 69.12] };

const SIGNALS = {
  cfg: {
    name: "Ours (CFG)",
    map: "CFG map",
    insight: "The CFG response is strongest where the prompt changes the denoiser's prediction, so parameters serving the subject are protected over the background. This is our default signal.",
  },
  det: {
    name: "Ours (Object-local CFG)",
    map: "Object-local CFG map",
    insight: "Keeping the CFG map only inside YOLOv8 detections focuses preservation on whole objects, so motorcycle parts such as the windshield and kickstand survive (red box). It gives the best MUSIQ at every tested sparsity.",
  },
  canny: {
    name: "Ours (Canny)",
    map: "Canny edge map",
    insight: "Edge guidance shifts the objective toward local boundaries and fine detail, which gives sharper wheel textures (red box), and it needs no CFG. It gives the best ImageReward at 50–60% sparsity.",
  },
};

// Pairs shown in the hero marquee: [set index, item id, sparsity]
const MARQUEE = [
  [2, "00000", 40], [0, "00156", 60], [1, "00780", 50], [2, "00123", 40],
  [0, "00513", 60], [1, "00326", 50], [2, "00015", 40], [0, "00037", 60],
  [1, "00389", 50], [2, "00127", 40], [0, "00261", 60], [1, "00067", 50],
];

const img = (set, id, kind) => `static/images/${set.dir}/${id}/${kind}.jpg`;

function el(tag, attrs = {}, html = "") {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (html) node.innerHTML = html;
  return node;
}

// ---------------- Hero marquee ----------------
function buildMarquee() {
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  const strip = el("div", { class: "hero-teaser-strip" });
  MARQUEE.forEach(([si, id, sp]) => {
    const set = SETS[si];
    const model = set.dir === "sd3" ? "SD3" : "PixArt-Σ";
    const kind = set.dir === "structured" ? "structured" : "unstructured";
    strip.appendChild(el("figure", { class: "pair-tile" }, `
      <img src="${img(set, id, "obs_" + sp)}" alt="">
      <img src="${img(set, id, "ours_" + sp)}" alt="">
      <span class="tag-sp">${model} · ${sp}% ${kind}</span>
      <span class="tag-l">OBS-Diff</span>
      <span class="tag-r">Ours</span>`));
  });
  track.appendChild(strip);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Loop by shifting the track one strip-width at a time. The strip width is measured
  // (not assumed), and enough copies are added to cover the viewport, so the wrap is invisible.
  const SPEED = 60; // px per second
  let period = 0, offset = 0, last = null, paused = false;

  const layout = () => {
    period = strip.getBoundingClientRect().width;
    const needed = Math.ceil(window.innerWidth / period) + 1;
    while (track.children.length < needed + 1) track.appendChild(strip.cloneNode(true));
    offset %= period;
  };

  const step = (now) => {
    if (last !== null && !paused && period > 0) {
      offset = (offset + SPEED * (now - last) / 1000) % period;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
    last = now;
    requestAnimationFrame(step);
  };

  track.addEventListener("mouseenter", () => { paused = true; });
  track.addEventListener("mouseleave", () => { paused = false; });
  window.addEventListener("resize", layout);
  layout();
  requestAnimationFrame(step);
}

// ---------------- Performance tabs ----------------
function bindTabs() {
  const tabs = document.querySelectorAll(".perf-tabs li");
  tabs.forEach((li) => li.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    li.classList.add("is-active");
    document.querySelectorAll(".tab-content").forEach((c) => { c.style.display = "none"; });
    document.getElementById(li.dataset.tab + "-content").style.display = "";
  }));
  // Links elsewhere on the page can open a specific tab.
  document.querySelectorAll("[data-open-tab]").forEach((link) => link.addEventListener("click", () => {
    const li = document.querySelector(`.perf-tabs li[data-tab="${link.dataset.openTab}"]`);
    if (li) li.click();
  }));
}

// ---------------- Gallery + modal ----------------
function buildGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  SETS.forEach((set, si) => {
    grid.appendChild(el("div", { class: "gallery-label" }, set.label));
    const row = el("div", { class: "gallery-row" });
    set.items.forEach((item) => {
      let thumb, badge, caption;
      if (set.targeted) {
        thumb = img(set, item.id, "ours_target");
        badge = `Target: ${item.cat}`;
        caption = `Ours (target), calibrated on "${item.cat.toLowerCase()}" prompts`;
      } else {
        const top = set.levels[set.levels.length - 1];
        thumb = img(set, item.id, "ours_" + top);
        badge = `${top}% sparse`;
        caption = item.prompt;
      }
      const card = el("figure", { class: "gallery-card", tabindex: "0", role: "button",
                                  "aria-label": `Compare: ${caption}` }, `
        <img src="${thumb}" alt="${caption}" loading="lazy">
        <span class="sp-badge${set.targeted ? " is-gold" : ""}">${badge}</span>
        <figcaption>${caption}</figcaption>`);
      const open = () => openModal(si, item);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      row.appendChild(card);
    });
    grid.appendChild(row);
  });

  const modal = document.getElementById("gallery-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("gallery-modal__close")) closeModal();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

function openModal(si, item) {
  const set = SETS[si];
  const modal = document.getElementById("gallery-modal");
  const grid = modal.querySelector(".gallery-modal__grid");
  modal.querySelector(".gallery-modal__meta").textContent = set.label;
  grid.innerHTML = "";

  if (set.targeted) {
    modal.querySelector(".gallery-modal__prompt").textContent =
      `Target category: ${item.cat}. "General" models are calibrated on category-diverse prompts; ` +
      `"target" models only on prompts containing "${item.cat.toLowerCase()}".`;
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    TARGET_VARIANTS.forEach(([, m, v]) => grid.appendChild(el("span",
      { class: "gm-col" + (m === "Ours" ? " accent" : "") }, `${m} (${v})`)));
    TARGET_VARIANTS.forEach(([k, m, v]) => grid.appendChild(el("img",
      { src: img(set, item.id, k), alt: `${m} (${v})` })));
    showModal(modal);
    return;
  }

  modal.querySelector(".gallery-modal__prompt").textContent = `"${item.prompt}"`;
  const n = set.levels.length;
  const hasDense = !!item.dense;
  grid.style.gridTemplateColumns = `${hasDense ? "1.3fr " : ""}auto repeat(${n}, 1fr)`;

  // Header row
  if (hasDense) grid.appendChild(el("span", { class: "gm-col" }, "Dense"));
  grid.appendChild(el("span"));
  set.levels.forEach((s) => grid.appendChild(el("span", { class: "gm-col" }, `${s}% sparsity`)));

  // Dense image spans both method rows
  if (hasDense) {
    grid.appendChild(el("div", { class: "gm-dense" },
      `<img src="${img(set, item.id, "dense")}" alt="Dense"><p>unpruned</p>`));
  }
  grid.appendChild(el("span", { class: "gm-row" }, "OBS-Diff"));
  set.levels.forEach((s) => grid.appendChild(el("img", { src: img(set, item.id, "obs_" + s), alt: `OBS-Diff ${s}%` })));
  grid.appendChild(el("span", { class: "gm-row accent" }, "Ours"));
  set.levels.forEach((s) => grid.appendChild(el("img", { src: img(set, item.id, "ours_" + s), alt: `Ours ${s}%` })));
  showModal(modal);
}

function showModal(modal) {
  modal.classList.add("is-active");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("gallery-modal");
  modal.classList.remove("is-active");
  modal.setAttribute("aria-hidden", "true");
  document.documentElement.style.overflow = "";
}

// ---------------- Importance-signal viewer ----------------
function buildSignalViewer() {
  const $ = (id) => document.getElementById(id);
  if (!$("svDense")) return;
  const ex = SIG_EXAMPLE;
  const base = `static/images/signals/${ex.id}`;
  $("svDense").src = `${base}/dense.jpg`;
  $("svObs").src = `${base}/obs.jpg`;
  $("svPrompt").textContent = `"${ex.prompt}"`;

  const render = (key) => {
    const sig = SIGNALS[key];
    $("svMap").src = `${base}/map_${key}.jpg`;
    $("svOurs").src = `${base}/ours_${key}.jpg`;
    $("svMapCap").textContent = sig.map;
    $("svOursCap").textContent = `${sig.name}, ${ex.sp}% sparse`;
    $("svInsight").textContent = sig.insight;

    const names = ["CLIP", "ImageReward", "MUSIQ"];
    $("svMetrics").innerHTML = names.map((n, i) => {
      const a = SIG_METRICS.obs[i], b = SIG_METRICS[key][i];
      const d = b - a;
      return `<div class="sv-metric"><span class="svm-name">${n}</span>
        <span class="svm-val">${a.toFixed(2)} <i class="fas fa-arrow-right"></i> <b>${b.toFixed(2)}</b></span>
        <span class="svm-delta">${d >= 0 ? "+" : ""}${d.toFixed(2)}</span></div>`;
    }).join("") + `<p class="svm-note">OBS-Diff &rarr; ours, averaged over 1,000 MS-COCO prompts at ${ex.sp}% sparsity</p>`;

    document.querySelectorAll(".sig-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.sig === key));
  };

  document.querySelectorAll(".sig-btn").forEach((b) => b.addEventListener("click", () => render(b.dataset.sig)));
  render("cfg");
}

document.addEventListener("DOMContentLoaded", () => {
  buildMarquee();
  bindTabs();
  buildGallery();
  buildSignalViewer();
});
