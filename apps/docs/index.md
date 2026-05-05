---
layout: home
title: docs
---

<HomePlayground />

<LandingSection />

<section class="centered ease-section">
  <div class="ease-left">
    <img src="/public/intro.gif" alt="intro" class="ease-intro" />
    <b class="ease-lead">
      Scratcher.js is surprisingly easy to use.
    </b>
    <p class="ease-desc">Make your service more interactive.</p>
  </div>

  <div class="ease-right">
  
:::tabs

== React

```tsx
<Scratcher
  class="react-scratch-card"
  width={400}
  height={240}
  brushSize={30}
  renderCover={renderCover}
>
  <div class="reward">Custom Cover Example</div>
</Scratcher>
```

== Vue

```tsx
<Scratcher
  class="vue-scratch-card"
  :width="400"
  :height="240"
  :brushSize="30"
  :renderCover="renderCover"
>
  <div class="reward">Custom Cover Example</div>
</Scratcher>
```

== Vanilla

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
  renderCover,
});
scratcher.bindCanvas(canvas);
```

::::

  </div>
</section>

<!-- <section class="centered"> -->
<!-- Sponsor -->
<!-- Contribute -->
<!-- </section> -->

<!-- FOoter -->

<footer class="app-footer">
    <div class="app-footer-inner">
        <div class="app-footer-brand">
        <strong>scratcher.js</strong>
        <p>Cross-framework scratch interaction library for web and mobile.</p>
        </div>
        <nav class="app-footer-links" aria-label="Footer links">
        <a href="/docs/overview">Docs</a>
        <a href="/examples/custom-cover">Examples</a>
        <a href="https://github.com/kyechan99/scratcher.js" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://github.com/kyechan99/scratcher.js/issues" target="_blank" rel="noreferrer">Issues</a>
        </nav>
        <p class="app-footer-meta">
        MIT Licensed © 2026
        </p>
    </div>
</footer>
