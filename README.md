<img height="60" src="https://raw.githubusercontent.com/urpflanze-org/core/master/docs/assets/images/logo-for-github.svg">

## Synopsis

This package is used to draw a scene created with the [Urpflanze Core](https://github.com/urpflanze-org/core) on Canvas.

You can export a single frame or an animation in ZIP (frames in png or jpg), video (mp4 or webp) or in GIF.

You can use it in the browser (Canvas, OffscreenCanvas, ServiceWorker) or in Node.

## Donate

I am trying to create a tool for those who want to approach the world of programming
or for programmers who want to approach the world of creative coding.

I have spent a lot of time and will spend more to support this project.
I also have in mind a **[web editor](https://github.com/urpflanze-org/editor)** (open-source) where you can use the features of this library in the browser.

You can see a preview [here](https://editor.urpflanze.org)

[![](https://img.shields.io/badge/donate-paypal-003087.svg?logo=paypal)](https://www.paypal.me/genbs)
[![](https://img.shields.io/badge/donate-ko--fi-29abe0.svg?logo=ko-fi)](https://ko-fi.com/urpflanze)

[![](https://img.shields.io/badge/bitcoin-1CSQq4aMmsA71twvyZHZCjmeB2AmQGCPNq-f7931a.svg?logo=bitcoin)](https://explorer.btc.com/btc/address/1CSQq4aMmsA71twvyZHZCjmeB2AmQGCPNq)
[![](https://img.shields.io/badge/ethereum-0x9086c4bb7015c1d6dc79162d02e7e1239c982c01-ecf0f1.svg?logo=ethereum)](https://etherscan.io/address/0x9086c4bb7015c1d6dc79162d02e7e1239c982c01)

---

## Menu

- [Synopsis](#synopsis)
- [Donate](#donate)
- [Menu](#menu)
- [Installation](#installation)
- [BrowserDrawerCanvas](#browserdrawercanvas)
	- [Timeline and Animation](#timeline-and-animation)
- [Renderer](#renderer)
	- [Video](#video)
	- [ZIP](#zip)
- [Renderer events](#renderer-events)
- [DrawerOptions](#draweroptions)

## Installation

You can install the library with the command:

```bash
npm i @urpflanze/drawer-canvas --save
```

And import into your project

```javascript
/**
 * Full importing
 */
import { BrowserDrawerCanvas, DrawerCanvas } from '@urpflanze/drawer-canvas'

const scene = ... // Urpflanze Scene

const drawer = new BrowserDrawerCanvas(scene, ...) // for browser
// const drawer = new DrawerCanvas(scene, ...) for node

```

Otherwise you can use from the browser using a CDN

```html
<!-- ES Modules -->
<script type="module">
	import * as Urpflanze from 'https://esm.run/@urpflanze/core'
	import DrawerCanvas, { ... } from 'https://esm.run/@urpflanze/drawer-canvas'

	const scene = new Urpflanze.Scene()
	const drawer = new DrawerCanvas(scene, document.body) // as BrowserDrawerCanvas
</script>

<!-- UMD -->
<script src="https://cdn.jsdelivr.net/npm/@urpflanze/core"></script>
<script src="https://cdn.jsdelivr.net/npm/@urpflanze/drawer-canvas"></script>
<script>
	const scene = new Urpflanze.Scene()
	const drawer = new DrawerCanvas.default(scene, ...) // or DrawerCanvas.BrowserDrawerCanvas
</script>
```

## BrowserDrawerCanvas

You can render the scene on canvas using the `draw` method

```javascript

// Creating a Scene
const scene = new Urpflanze.Scene()
scene.add(...)

// Draw the scene
const drawer = new DrawerCanvas(scene, document.body) // The canvas will be added to body
drawer.draw()

```

### Timeline and Animation

You can set animation duration and FPS using the `timeline` object

```javascript
const drawer = new DrawerCanvas(scene, document.body)

drawer.timeline.setDuration([number in milliseconds])
drawer.timeline.setFramerate([number])

// draw at time
drawer.timeline.setTime([number in milliseconds])
```

By default the duration of an animation is 1 minute (60000 milliseconds) the framerate is 30 instead.

To start the animation you can use the `startAnimation` method:

```javascript
const drawer = new DrawerCanvas(scene, document.body)
drawer.startAnimation()

// drawer.pauseAnimation(): stop the animation
// drawer.playAnimation(): start animation if is stopped or paused
// drawer.stopAnimation(): stop the animation and return to the start
```

## Renderer

You can export a frame using the `frame` or` frameAtTime` methods, export a ZIP (using [JSZip](https://github.com/Stuk/jszip)) containing the frames (jpeg or png), export a video (using [FFMPEG](https://github.com/ffmpegwasm/ffmpeg.wasm)) (mp4, webp or gif).

### Video

Example of export video in a browser:

```javascript
const scene = new Urpflanze.Scene()

scene.add(
	new Urpflanze.Rect({
		// rotate from 0 to 45 deg in 3000ms
		rotateZ: () => -(Math.cos((scene.currentTime * Urpflanze.PI2) / 6000) * 0.5 + 0.5) * (Math.PI / 2),
	})
)

const drawer = new DrawerCanvas(scene, document.body, {}, 3000 /* duration */, 24 /* fps */)

const renderer = new Renderer(drawer)
renderer.render('video/mp4', 1).then(buffer => {
	const blob = new Blob([buffer], { type: 'video/mp4' })
	const videoUrl = window.URL.createObjectURL(blob)
	const videoElement = document.createElement('video')
	videoElement.setAttribute('src', videoUrl)
	videoElement.setAttribute('loop', 'true')
	videoElement.setAttribute('controls', 'true')
	document.body.appendChild(videoElement)
})
```

Example of export video in node:

```javascript
const fs = require('fs')

const scene = new Urpflanze.Scene()

scene.add(
	new Urpflanze.Rect({
		// rotate from 0 to 45 deg in 3000ms
		rotateZ: () => -(Math.cos((scene.currentTime * Urpflanze.PI2) / 6000) * 0.5 + 0.5) * (Math.PI / 2),
	})
)

const drawer = new DrawerCanvas(scene, undefined, {}, 3000 /* duration */, 24 /* fps */)

const renderer = new Renderer(drawer /*, ffmpegCorePath*/)
renderer.render('video/mp4', 1).then(buffer => {
	fs.writeFileSync('video.mp4', buffer)
	process.exit()
})
```

> You need to run with this flags for use FFMPEG

```bash
node --experimental-wasm-threads --experimental-wasm-bulk-memory [name].js
```

### ZIP

Example of export ZIP in a browser:

```javascript
// After creating a scene
const drawer = new DrawerCanvas(scene, document.body, {}, 3000, 10)
const renderer = new Renderer(drawer)
renderer.zip('image/png' /*, quality, framesForChunk */).then(chunks => {
	chunks.forEach((chunk, index) => {
		const blob = new Blob([chunk], { type: 'application/zip' })
		const chunkURL = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.innerText = 'download_' + index + '.zip'
		a.setAttribute('href', chunkURL)
		document.body.appendChild(a)
	})
})
```

## Renderer events

You can attach functions to events called when rendering with the 'attach' method:

```javascript
const renderer = new Renderer(drawer)

renderer.attach('[eventName]', eventArgs => console.log(eventArgs))
```

| Event Name               | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| renderer:zip_start       | Called when start ZIP rendering                               |
| renderer:zip_progress    | Called each frame render                                      |
| renderer:zip_preparing   | Called when each frame is rendered and ZIP generation start   |
| renderer:video_init      | Called when start video rendering before loading FFmpeg.wasm  |
| renderer:video_start     | Called when FFmpeg.wasm is loaded                             |
| renderer:video_progress  | Called each frame render                                      |
| renderer:video_preparing | Called when each frame is rendered and video generation start |

Quando renderizzi un video puoi intercettare i log di FFmpeg passando gli argomenti al metodo `render`

```javascript
const renderer = new Renderer(drawer)

renderer.render(
	'gif',
	1,
	e => console.log('ffmpeg log', e),
	e => console.log('ffmpeg progress', e)
)
```

## DrawerOptions

Any parameter is optional

| Param              | Type                     | Default      | Description                                                             |
| ------------------ | ------------------------ | ------------ | ----------------------------------------------------------------------- |
| time               | number                   | 0            | Draw at time                                                            |
| noBackground       | boolean                  | false        | Disable Scene background                                                |
| ghosts             | number                   | 0            | Number of previus frame based on `ghostSkipTime` or `ghostSkipFunction` |
| ghostAlpha         | boolean                  | true         | Enable ghost apha                                                       |
| ghostSkipTime      | number                   | 30           | Delay of each frame                                                     |
| ghostSkipFunction  | Function                 | undefined    | Dynamic `ghostSkipTime`                                                 |
| width              | number                   | scene width  | The canvas width                                                        |
| height             | number                   | scene height | The canvas height                                                       |
| clear              | boolean                  | true         | Clear canvas                                                            |
| simmetricLines     | number                   | undefined    | Utility lines                                                           |
| sceneFit           | cover \| contain \| none | contain      | Fit scene into canvas                                                   |
| backgroundImage    | CanvasImageSource        | undefined    | Draw image after scene background                                       |
| backgroundImageFit | cover \| contain \| none | cover        | `backgroundImage` fit                                                   |
