export const initSlider = (container, urls) => {
  container.innerHTML = "";
  if (!urls.length) {
    container.hidden = true;
    return;
  }
  container.hidden = false;
  container.classList.add("ade-slider");
  const stage = document.createElement("div");
  stage.className = "ade-slider-stage";
  const img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  stage.appendChild(img);
  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "ade-slider-nav ade-slider-prev";
  prev.setAttribute("aria-label", "Previous screenshot");
  prev.textContent = "<";
  const next = document.createElement("button");
  next.type = "button";
  next.className = "ade-slider-nav ade-slider-next";
  next.setAttribute("aria-label", "Next screenshot");
  next.textContent = ">";
  const counter = document.createElement("span");
  counter.className = "ade-slider-counter";
  const dots = document.createElement("div");
  dots.className = "ade-slider-dots";
  container.appendChild(prev);
  container.appendChild(stage);
  container.appendChild(next);
  container.appendChild(counter);
  container.appendChild(dots);

  let idx = 0;
  const paint = () => {
    img.src = urls[idx];
    counter.textContent = idx + 1 + " / " + urls.length;
    Array.prototype.forEach.call(dots.children, (d, i) => {
      d.setAttribute("aria-pressed", i === idx ? "true" : "false");
    });
    const single = urls.length <= 1;
    prev.disabled = single;
    next.disabled = single;
  };
  const go = (n) => {
    idx = (n + urls.length) % urls.length;
    paint();
  };
  prev.addEventListener("click", () => go(idx - 1));
  next.addEventListener("click", () => go(idx + 1));
  urls.forEach((_u, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "ade-slider-dot";
    d.setAttribute("aria-label", "Go to screenshot " + (i + 1));
    d.addEventListener("click", () => go(i));
    dots.appendChild(d);
  });

  img.addEventListener("click", () => {
    const dlg = document.getElementById("ade-lightbox");
    if (!dlg) return;
    const lb = dlg.querySelector("img");
    lb.src = img.src;
    if (typeof dlg.showModal === "function") dlg.showModal();
  });

  document.addEventListener("keydown", (e) => {
    if (!container.isConnected || container.hidden) return;
    if (e.key === "ArrowLeft") go(idx - 1);
    else if (e.key === "ArrowRight") go(idx + 1);
  });

  paint();
};

export const wireLightbox = () => {
  const dlg = document.getElementById("ade-lightbox");
  if (!dlg) return;
  const close = dlg.querySelector(".ade-lightbox-close");
  if (close) close.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
};
