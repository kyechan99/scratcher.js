# Overview

Scratcher.js is a scratch interaction library that enables you to quickly implement a "scratchcard experience" into your products. You can easily get started with simple configuration on screens where user engagement is important, such as event winner reveals, coupon code exposure, and game-style reward UIs.

## What Problem Does It Solve?

Implementing a scratch UI from scratch requires considering input event handling, progress calculation, completion thresholds, rendering performance, and framework-specific reimplementations. Scratcher.js solves these repetitive issues by consolidating them into a common engine and providing framework-specific bindings to reduce implementation burden.

## Monorepo Package Structure

- `@scratcher/core`: The core engine that handles scratch logic and state calculation
- `@scratcher/react`: Binding for React environments
- `@scratcher/vue`: Binding for Vue environments
- `@scratcher/svelte`: Binding for Svelte environments

With this structure, you can reuse the operational concepts almost entirely when expanding from web to mobile apps.

## Key Features

- Mouse/touch-based scratch interaction
- Adjustable behavior parameters like brush size and sensitivity
- Cover/background image application and custom rendering
- Progress tracking, completion state detection, and completion callbacks
- Stable development experience with TypeScript types

## Getting Started

If you're implementing this for the first time, start by checking the installation and minimal example in [Getting Started](/docs/getting-started). After that, adjust the options in [Configuration](/docs/configuration), and compare actual UI patterns in [Examples](/examples/custom-cover) to quickly find a configuration that fits your project.

## Contribution and Feedback

Scratcher.js is operated as open source. We welcome all use case sharing, bug reports, and feature suggestions. Please submit improvement ideas as GitHub Issues and code contributions as PRs.
