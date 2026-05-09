<script setup lang="ts">
import { useData, withBase } from 'vitepress';

const { localeIndex } = useData();
</script>

<template>
  <section class="landing-section centered">
    <div class="landing">
      <img class="landing__logo" src="/public/logo.png" alt="scratcher.js" />
      <h1 class="landing__title">Scratcher.js</h1>
      <div class="landing__desc">
        <p>
          <b> An open-source interactive scratch card library that is easy-to-use on the web. </b>
        </p>
        <p>
          You can hide a specific element and gradually reveal it through user actions such as mouse
          or touch interactions.
        </p>
      </div>
      <div>
        <ul class="landing__ua">
          <li class="landing__ua-item">Free and open-source</li>
          <li class="landing__ua-item">Simple Integration</li>
          <li class="landing__ua-item">Smooth, Real-time Effect</li>
          <li class="landing__ua-item">Supports frameworks</li>
        </ul>
      </div>
      <a
        class="landing__started-btn"
        :href="
          withBase((localeIndex === 'root' ? '' : `/${localeIndex}`) + '/docs/getting-started')
        "
      >
        <button class="btn btn-primary">Get Started</button>
      </a>
    </div>
  </section>
</template>

<style>
.landing {
  margin: 5rem 0rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.landing .landing__logo {
  width: 7rem;
}

.landing .landing__title {
  font-size: 4rem;
  line-height: 4rem;
  font-weight: 700;
}

.landing .landing__desc {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 300;
}

.landing .landing__desc p {
  margin: 0;
}

.landing .landing__ua {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-evenly;
  gap: 1rem;
  width: 100%;
}

.landing .landing__ua .landing__ua-item {
  margin: 0;
  background: var(--vp-c-bg);
  padding: 0.875rem;
  border-radius: 0.75rem;
  box-shadow: 0px 0px 4px 0px var(--week-gray2);
  font-weight: 300;
}

.landing .landing__started-btn .btn-primary {
  box-shadow: 0 4px 11px var(--vp-c-brand-1);
}

@media (max-width: 720px) {
  .landing .landing__ua .landing__ua-item {
    font-size: 0.875rem;
  }
}
</style>
