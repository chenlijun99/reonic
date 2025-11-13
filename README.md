# reonic assignment

## Setup

Requirements:

* Node.js (tested on v22.20.0, v22.7.0 is where `--experimental-transform-types` has been introduced)
* pnpm

```sh
$ pnpm install
```

## Task 1 (logic)

Run the script. The output shows the simulation results (which match the hints) and also contains my answers to the bonus questions.

```sh
$ node --experimental-transform-types packages/simulator-core/src/task1.ts
```

## Task 2a (Frontend)

```sh
$ cd packages/frontend
$ pnpm run dev
```

## Tech stack

* TypeScript
* React 19
* [React-router 7](https://reactrouter.com/home) (declarative mode)
* [Redux-toolkit](https://redux-toolkit.js.org/)
* [Tailwind CSS v4](https://tailwindcss.com/)
* [react-aria](https://react-spectrum.adobe.com/react-aria/index.html) for headless components

## Known issues

* Light/dark mode switch causes some UI lag due to the echarts chart being disposed and recreated with the new theme. ECharts 6 has introduced support for [Dynamic Theme Switching](https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/#2.-dynamic-theme-switching), but the react echarts utility wrapper library we use doesn't support it yet. It shouldn't hard to contribute support back to add this feature.
