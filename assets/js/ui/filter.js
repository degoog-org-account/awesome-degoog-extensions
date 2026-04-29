export const wireFilter = (inputId, gridId) => {
  const input = document.getElementById(inputId);
  const grid = document.getElementById(gridId);
  if (!input || !grid) return;
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    Array.prototype.forEach.call(grid.children, (col) => {
      const hay = (col.textContent || "").toLowerCase();
      col.style.display = !q || hay.indexOf(q) >= 0 ? "" : "none";
    });
  };
  input.addEventListener("input", apply);
};
