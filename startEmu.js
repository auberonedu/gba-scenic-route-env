async function resolveRomUrl() {
  let res;

  // 1) Load rom.json
  try {
    res = await fetch("./rom.json", { cache: "no-store" });
  } catch (err) {
    throw {
      kind: "rom-json-missing",
      detail: `Failed to fetch ./rom.json (${err?.message ?? err})`
    };
  }

  if (!res.ok) {
    throw {
      kind: "rom-json-missing",
      detail: `./rom.json not found (HTTP ${res.status})`
    };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw {
      kind: "rom-json-invalid",
      detail: "./rom.json exists but is not valid JSON"
    };
  }

  const rom = data?.rom;
  if (typeof rom !== "string" || rom.trim() === "") {
    throw {
      kind: "rom-json-invalid",
      detail: 'Expected: { "rom": "your-game.gba" }'
    };
  }

  const romPath = rom.startsWith("./") ? rom : `./${rom}`;

  // 2) Verify the ROM actually exists
  const romCheck = await fetch(romPath, { method: "HEAD", cache: "no-store" });
  if (!romCheck.ok) {
    throw {
      kind: "rom-missing",
      detail: `ROM file ${romPath} not found (HTTP ${romCheck.status})`
    };
  }

  return romPath;
}

function showErrorOnPage(title, message) {
  const box = document.createElement("div");
  box.style.maxWidth = "800px";
  box.style.padding = "20px";
  box.style.background = "#1e1e1e";
  box.style.color = "#eee";
  box.style.border = "1px solid #444";
  box.style.borderRadius = "6px";
  box.style.fontFamily = "system-ui, sans-serif";

  const h = document.createElement("h2");
  h.textContent = title;

  const p = document.createElement("p");
  p.textContent = message;

  const hint = document.createElement("pre");
  hint.textContent =
`What to check:
• Did the project compile successfully?
• Are there errors in the GitHub Actions / build logs?
• Was a .gba file produced?

If the build failed, the ROM will not exist.`;
  hint.style.background = "#111";
  hint.style.padding = "12px";
  hint.style.borderRadius = "4px";
  hint.style.whiteSpace = "pre-wrap";

  box.appendChild(h);
  box.appendChild(p);
  box.appendChild(hint);

  document.body.prepend(box);
}

(async () => {
  let romUrl;

  try {
    romUrl = await resolveRomUrl();
  } catch (err) {
    console.error("[Emulator startup failed]", err);

    if (err.kind === "rom-json-missing" || err.kind === "rom-json-invalid") {
      showErrorOnPage(
        "Game could not be started",
        "The emulator could not find rom.json, or it is invalid."
      );
    } else if (err.kind === "rom-missing") {
      showErrorOnPage(
        "Game could not be started",
        "The ROM file listed in rom.json could not be found."
      );
    } else {
      showErrorOnPage(
        "Game could not be started",
        "An unexpected error occurred while loading the game."
      );
    }

    return;
  }

  // EmulatorJS config (GBA only)
  window.EJS_player = "#game";
  window.EJS_core = "gba";
  window.EJS_gameUrl = romUrl;
  window.EJS_gameName = "game";
  window.EJS_pathtodata = "https://cdn.emulatorjs.org/latest/data/";
  window.EJS_startOnLoaded = true;
  window.EJS_disableDatabases = true;
  window.EJS_DEBUG_XX = true;

  // Load emulator runtime after config
  const s = document.createElement("script");
  s.src = "https://cdn.emulatorjs.org/latest/data/loader.js";
  document.head.appendChild(s);
})();
