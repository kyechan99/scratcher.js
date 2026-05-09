# FAQ

If you don't find the answer to your question here, please submit it as a GitHub Issue. We'll continue to add frequently asked questions to this FAQ.

## Q. What environments can I use this in?

A. `@scratcher/core` provides React, Vue, and Svelte bindings, so you can apply the same scratch interaction in any of these frameworks.

## Q. Do you support custom brushes and images?

A. Yes. We provide commonly used options in practice, including brush size/sensitivity adjustment, cover/background image application, and callback handling.

## Q. Do you support TypeScript?

A. Yes. All packages are written based on TypeScript, so you get type safety and auto-completion support.

## Q. How is the performance?

A. We designed it to reduce performance degradation by separating scratch progress calculation and state management into core logic. However, on low-spec devices, performance may vary depending on brush size, event frequency, and image resolution, so testing in various environments is recommended.

## Q. Can I use this in SSR environments?

A. Yes. However, since scratch interaction uses browser input events, the actual operation initialization must be handled on the client side.

## Q. What about the license?

A. It's MIT licensed.

---
