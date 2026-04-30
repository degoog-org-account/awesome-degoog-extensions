const _doCopy = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_e) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_e) {
    return false;
  }
};

export const wireCopyButtons = () => {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    if (btn._adeWired) return;
    btn._adeWired = true;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttribute("data-copy") || "";
      const ok = await _doCopy(text);
      if (!btn.getAttribute("data-orig"))
        btn.setAttribute("data-orig", btn.textContent);
      const orig = btn.getAttribute("data-orig");
      btn.textContent = ok ? "Copied" : "Failed";
      setTimeout(() => {
        btn.textContent = orig;
      }, 1500);
    });
  });
};
