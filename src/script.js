
      const $ = (s) => document.querySelector(s),
        $$ = (s) => [...document.querySelectorAll(s)];
      const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)),
        seg = (p, a, b) => clamp((p - a) / (b - a));
      const ease = (t) =>
          t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
        lerp = (a, b, t) => a + (b - a) * t;

      const story = $("#story"),
        panel = $("#panel"),
        copy = $("#copy"),
        h = $("#h");
      const cards = $$(".card"),
        lines = $$(".ln");

      // split copy into words for scroll-linked reveal
      $$("#copy p").forEach((p, pi, all) => {
        const ws = p.textContent
          .split(" ")
          .map((w) => `<span class="w">${w}</span>`);
        p.innerHTML =
          pi === all.length - 1
            ? ws.slice(0, -3).join(" ") +
              '<br><mark class="hl">' +
              ws.slice(-3).join(" ") +
              "</mark>"
            : ws.join(" ");
      });
      const hl = $(".hl"),
        row = $(".row"),
        stage = $(".stage"),
        plane = $("#plane"),
        bin = $("#bin"),
        nxt = $("#next");


      lines.forEach((l) => {
        l.innerHTML = [...l.textContent]
          .map((c) => (c === " " ? " " : `<span class="l">${c}</span>`))
          .join("");
      });
      const letters = $$(".l");
      const rnd = (n) => {
        const x = Math.sin(n * 127.1) * 43758.5453;
        return x - Math.floor(x);
      };
      letters.forEach((el, k) => {
        el._r = [rnd(k * 3 + 1), rnd(k * 3 + 2), rnd(k * 3 + 3)];
      });

      

      const cr = (a, t) => {
        const n = a.length - 1,
          x = clamp(t) * n,
          i = Math.min(n - 1, Math.floor(x)),
          f = x - i,
          p0 = a[Math.max(0, i - 1)],
          p1 = a[i],
          p2 = a[i + 1],
          p3 = a[Math.min(n, i + 2)];
        return (
          0.5 *
          (2 * p1 +
            (-p0 + p2) * f +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f +
            (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)
        );
      };
    


      const PX = [
        -0.04, 0.08, 0.19, 0.31, 0.4, 0.435, 0.36, 0.17, -0.02, 0.03, 0.19,
      ];
      const PY = [
        0.04, 0.07, 0.12, 0.2, 0.23, 0.15, 0.05, 0.03, 0.12, 0.3, 0.585,
      ];
      const PR = [35, 40, 50, 55, 20, -50, -130, -190, -250, -275, -290];
      
      const F = [
        { x: -0.05, y: 0.42, r: -4 },
        { x: 0, y: 0.27, r: 1 },
        { x: 0.02, y: 0, r: 3 },
      ];
      

      const G = [
        { x: -0.22, y: -0.08, r: -5 },
        { x: 0, y: 0.02, r: -1 },
        { x: 0.24, y: 0.1, r: 5 },
      ];
      const words = $$(".w");


      const C = [
        { x: 0.2, y: 0.28, r: -3.5, sink: 0.55, rs: -2.5 },
        { x: 0, y: -0.07, r: 0, sink: 0.5, rs: 0 },
        { x: -0.02, y: -0.3, r: 2.5, sink: 0.7, rs: 1.5 },
      ];
      let cw, ch, step, lh, W, A, B, HL, RW, SH;

      function layout() {
        cw = cards[0].offsetWidth;
        ch = cards[0].offsetHeight;
        step = innerWidth <= 760 ? cw * 0.5 : cw + Math.min(16, cw * 0.045);
        const fs = parseFloat(getComputedStyle(h).fontSize);
        lh = fs * 1.1;
        W = h.clientWidth;
        h.style.height = lh * 3 + "px";
        const w = lines.map((l) => l.offsetWidth),
          gap = fs * 0.28,
          total = w[0] + w[1] + w[2] + gap * 2;
      

        let x = Math.max(0, (W - total) / 2);
        A = [];
        w.forEach((wi, i) => {
          A.push(total <= W ? x : 0);
          x += wi + gap;
        });
        B = w.map((wi, i) => Math.max(0, Math.min(i * W * 0.23, W - wi)));
        HL = h.getBoundingClientRect().left;
        RW = row.clientWidth;
        SH = stage.clientHeight;
        bin.style.left = HL + 0.19 * RW + "px";
        bin.style.top = SH * 0.56 + "px";
        letters.forEach((el) => {
          el._x = HL + el.offsetLeft + el.offsetWidth / 2;
        });
      }

      function read() {
        return clamp(
          -story.getBoundingClientRect().top /
            (story.offsetHeight - innerHeight),
        );
      }
      function frame(q) {
        const pp = clamp(q / 0.72),
          m = seg(q, 0.72, 1); 
        const p = clamp(pp / 0.58); 
        const t = ease(seg(p, 0, 0.3)),
          s = seg(p, 0.3, 0.7);
        cards.forEach((c, i) => {
          const k = C[i],
            f = F[i];
          let x = (i - 1) * step + k.x * cw * t,
            y = (k.y * t + k.sink * s) * ch,
            r = k.r * t + k.rs * s;
          
          const ys =
            innerHeight * (1 - seg(pp, 0.88, 1)) - ch * 0.58 - innerHeight / 2;
          y = lerp(y, ys, seg(pp, 0.8, 0.88));
          const e = ease(seg(pp, 0.89 + 0.025 * i, 0.975 + 0.0125 * i)); 
          x = lerp(x, f.x * cw, e);
          y = lerp(y, f.y * ch + innerHeight * 0.08, e);
          r = lerp(r, f.r, e);
          let sc = lerp(1, 0.8, e),
            A = 0;
          if (m > 0) {
            const a = ease(seg(m, 0, 0.25)),
              bb = ease(seg(m, 0.25, 0.6)),
              g = G[i],
              by = f.y * ch + innerHeight * 0.08;
            x = lerp(lerp(f.x * cw, g.x * cw, a), (i - 1) * step, bb);
            y =
              lerp(
                lerp(by, g.y * ch + innerHeight * 0.08, a),
                -innerHeight * 0.04,
                ease(seg(m, 0.3, 0.75)),
              ) -
              ease(seg(m, 0.9, 1)) * innerHeight * 0.12;
            r = lerp(
              lerp(lerp(f.r, g.r, a), -14, bb),
              0,
              ease(seg(m, 0.6, 0.85)),
            );
            sc = lerp(0.8, 1, ease(seg(m, 0.1, 0.5)));
            A = 180 * ease(seg(m, 0.28 + 0.03 * i, 0.76 + 0.03 * i));
          }
          c.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${sc}) rotateY(${A}deg)`;
          c.style.setProperty("--mh", seg(m, 0.86, 0.97) * 100 + "%");
        });

        const u = seg(p, 0.12, 0.7),
          R = lerp(88, 0, seg(p, 0.68, 0.76));
        const ex = seg(pp, 0.88, 1),
          Rb = lerp(0, 88, seg(pp, 0.88, 0.93));
        panel.style.transform = `translateY(${(1 - u) * 100 - ex * 100}%)`;
        panel.style.borderRadius = `${R}px ${R}px ${Rb}px ${Rb}px`;

        const e2 = ease(seg(p, 0.56, 0.74));
        lines.forEach((l, i) => {
          const e1 = ease(seg(p, 0.3 + 0.03 * i, 0.52 + 0.03 * i));
          l.style.transform = `translate(${lerp(lerp(A[i], B[i], e1), 0, e2)}px,${i * lh * e1}px)`;
        });

        copy.style.opacity = seg(p, 0.7, 0.76);
        const r = seg(pp, 0.46, 0.8) * (words.length + 8);
        words.forEach((w, k) => {
          w.style.opacity = lerp(0.18, 1, clamp((r - k) / 8));
        });


        
        const T = seg(pp, 0.46, 0.84),
          sweep =
            HL + cr(PX, Math.min(T, 0.4)) * RW + seg(T, 0.4, 0.6) * RW * 0.25;
        letters.forEach((el) => {
          const q = ease(clamp((sweep - el._x + 20) / 220)),
            [a, b, c] = el._r;
          el.style.transform = q
            ? `translate(${q * (40 + a * 150)}px,${q * (30 + b * 150)}px) rotate(${(c - 0.5) * 260 * q}deg) skewX(${-14 * q}deg) scale(${1 - 0.6 * q * q})`
            : "";
          el.style.opacity = 1 - clamp((q - 0.35) / 0.65);
        });
        const sc = lerp(1, 0.55, seg(T, 0.8, 1));
        plane.style.opacity = seg(pp, 0.455, 0.475);
        plane.style.transform = `translate(${HL + cr(PX, T) * RW}px,${cr(PY, T) * SH}px) translate(-50%,-50%) rotate(${cr(PR, T)}deg) scale(${sc * lerp(1, 0.45, seg(T, 0.82, 0.98))},${sc})`;
        const b = seg(pp, 0.54, 0.6);
        bin.style.opacity = b;
        bin.style.transform = `translate(-50%,${(1 - b) * 24}px)`;
        hl.style.setProperty("--hl", seg(pp, 0.8, 0.86) * 100 + "%");
        nxt.style.transform = `translateY(${lerp(100, 86, ease(seg(m, 0.88, 1)))}%)`;
      }


      // Smoothing: the animation chases the scroll position with damping, so wheel notches glide instead of jumping.
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let target = 0,
        cur = 0,
        raf = 0,
        last = 0;
      function loop(now) {
        const dt = Math.min(50, now - (last || now));
        last = now;
        const d = target - cur;
        cur =
          still || Math.abs(d) < 0.0002
            ? target
            : cur + d * (1 - Math.pow(1 - 0.1, dt / 16.7));
        frame(cur);
        if (cur !== target) raf = requestAnimationFrame(loop);
        else {
          raf = 0;
          last = 0;
        }
      }
      const tick = () => {
        target = read();
        if (!raf) raf = requestAnimationFrame(loop);
      };
      addEventListener("scroll", tick, { passive: true });
      addEventListener("resize", () => {
        layout();
        tick();
      });
      layout();
      target = cur = read();
      frame(cur);
      if (document.fonts)
        document.fonts.ready.then(() => {
          layout();
          frame(cur);
        });
    