---
layout: home
title: docs
---

<HomePlayground />

<LandingSection />

<section class="centered">

:::tabs
== Ts

```ts
import { Scratcher, type ScratcherConfig } from '@scratcher/core';

const scratcher = new Scratcher({
  ...scratcherConfig,
});
```

== React

```ts
import { Scratcher } from "@scratcher/react";

<Scratcher
    {...scratcherConfig}
    callbacks={{
        onProgress: (next) => console.log(next.progress),
        onComplete: () => console.log("completed")
    }}
>
  <div>React: React Coupon</div>
</Scratcher>;
```

== Vue

```ts
import { Scratcher } from "@scratcher/vue";

<Scratcher
    v-bind="scratcherConfig"
    :callbacks="{
    onStrokeEnd: (next) => console.log(next.scratchedCells)
    }"
>
  <div>Vue: Vue Coupon</div>
</Scratcher>
```

== React Native

```ts
import { useNativeScratchController } from '@scratcher/react-native';

const { scratcher } = useNativeScratchController({
  ...scratcherConfig,
  callbacks: {
    onReset: () => console.log('reset'),
  },
});
```

:::

</section>
