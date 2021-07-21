import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg'
import { clamp, now } from '@urpflanze/core'
import { Canvas, JpegConfig, PngConfig } from 'canvas'
import * as JSZip from 'jszip'
import BrowserDrawerCanvas from './browser'
import type { DrawerCanvas } from './DrawerCanvas'
import { Emitter } from './Emitter'
import { IRendererEvents, TRendererVideoType } from './types'
import { bBrowser, bNode } from './utils'

type BoB = Blob | Buffer
type OoQ = PngConfig | JpegConfig | number

class Renderer extends Emitter<IRendererEvents> {
	private ffmpeg: FFmpeg | undefined
	private drawer: DrawerCanvas
	private ffmpegCorePath: string | undefined

	constructor(drawer: DrawerCanvas, ffmpegCorePath?: string) {
		super()

		this.drawer = drawer
		this.ffmpegCorePath =
			typeof ffmpegCorePath === 'undefined' && drawer instanceof BrowserDrawerCanvas
				? 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
				: ffmpegCorePath
	}

	/**
	 * Render any frame and create array of zip
	 *
	 * @param imagesType
	 * @param quality
	 * @param framesForChunk
	 * @returns
	 */
	public async zip(
		imagesType: 'image/jpeg' | 'image/png' = 'image/png',
		quality = 1,
		framesForChunk = 600
	): Promise<Array<Uint8Array>> {
		const startTime = now()
		const zip = new JSZip()
		const totalFrames = this.drawer.timeline.getFramesCount()
		const chunks = Math.ceil(totalFrames / framesForChunk)

		this.dispatch('renderer:zip_start', { chunks, totalFrames, framesForChunk })

		const extension = imagesType === 'image/jpeg' ? '.jpg' : '.png'

		const zipParts: Array<Uint8Array> = []

		let totalRenderTime = 0

		for (let chunk = 0, rendered = 1; chunk < chunks; chunk++) {
			for (let frameIndex = 0; frameIndex < framesForChunk; frameIndex++, rendered++) {
				const frame = frameIndex + chunk * framesForChunk
				if (frame < totalFrames) {
					const renderStartTime = now()
					const frameName = frame.toString().padStart(5, '0') + extension

					const blob = await this.frame(frame, imagesType, quality)
					const buffer = (await (bNode ? blob : (blob as Blob).arrayBuffer())) as Buffer | ArrayBuffer
					zip.file(frameName, new Uint8Array(buffer, 0, buffer.byteLength))

					const currentTime = now()
					const renderTime = currentTime - renderStartTime
					totalRenderTime += renderTime

					this.dispatch('renderer:zip_progress', {
						chunk,
						frame,
						totalFrames,
						framesForChunk,
						totalChunks: chunks,
						renderTime,
						remainingTime: (totalFrames - rendered) * (totalRenderTime / rendered),
						elapsedTime: currentTime - startTime,
					})
				}
			}

			this.dispatch('renderer:zip_preparing')

			zipParts.push(await zip.generateAsync({ type: 'uint8array' }))
		}

		return zipParts
	}

	/**
	 * Render animation
	 *
	 * @param type render type
	 * @param quality
	 * @param ffmpegLogger
	 * @param ffmpegProgress
	 * @returns
	 */
	public async render(
		type: TRendererVideoType = 'video/mp4',
		quality = 1,
		ffmpegLogger?: (logParams: { type: string; message: string }) => any,
		ffmpegProgress?: (progressParams: { ratio: number }) => any
	): Promise<Uint8Array> {
		const startTime = now()

		const totalFrames = this.drawer.timeline.getFramesCount()
		const framerate = this.drawer.timeline.getFramerate()
		const duration = this.drawer.timeline.getDuration()

		this.dispatch('renderer:video_init', { totalFrames, framerate, duration, type })

		if (!this.ffmpeg) {
			const ffmpegOptions: any = {
				log: false,
			}

			if (this.ffmpegCorePath) ffmpegOptions.corePath = this.ffmpegCorePath
			if (ffmpegLogger) ffmpegOptions.logger = ffmpegLogger
			if (ffmpegProgress) ffmpegOptions.progress = ffmpegProgress

			this.ffmpeg = createFFmpeg(ffmpegOptions)

			await this.ffmpeg.load()
		}

		let totalRenderTime = 0

		this.dispatch('renderer:video_start', { totalFrames, framerate, duration, type })

		for (let frame = 0; frame < totalFrames; frame++) {
			const renderStartTime = now()

			const blob = await this.frame(frame, 'image/jpeg', quality)
			const buffer = (await (bNode ? blob : (blob as Blob).arrayBuffer())) as Buffer | ArrayBuffer

			const frameName = frame.toString().padStart(5, '0') + '.jpg'
			this.ffmpeg.FS('writeFile', frameName, new Uint8Array(buffer, 0, buffer.byteLength))

			const currentTime = now()
			const renderTime = currentTime - renderStartTime
			totalRenderTime += renderTime

			this.dispatch('renderer:video_progress', {
				totalFrames,
				frame,
				renderTime,
				duration,
				remainingTime: (totalFrames - frame) * (totalRenderTime / (frame + 1)),
				elapsedTime: currentTime - startTime,
			})
		}

		const args = ['-r', framerate.toString(), '-i', '%05d.jpg']
		let outExt = 'mp4'

		switch (type) {
			case 'video/webm':
				args.push('-c:v', 'libvpx')
				args.push('-row-mt', '1')
				args.push('-pix_fmt', 'yuv420p')
				outExt = 'webm'
				break
			case 'video/mp4':
				args.push('-c:v', 'libx264')
				args.push('-pix_fmt', 'yuv420p')
				outExt = 'mp4'
				break
			case 'gif':
				args.push('-loop', '0')
				outExt = 'gif'
				break
		}
		const outName = 'out.' + outExt

		args.push(outName)

		this.dispatch('renderer:video_preparing')

		await this.ffmpeg.run(...args)
		const result = await this.ffmpeg.FS('readFile', outName)

		return result
	}

	/**
	 * Render frame `frameNumber` to Blob or Buffer
	 *
	 * @param frameNumber frame to render
	 * @param mime image type
	 * @param options quality or options
	 * @returns Promise of Blob for browser or Buffer for Node
	 */
	public frame(frameNumber: number, mime: 'image/png' | 'image/jpeg' = 'image/png', options: OoQ = 1): Promise<BoB> {
		if (!this.drawer.getOption('clear', true)) {
			for (let i = 0; i <= frameNumber; i++) {
				this.drawer.timeline.setFrame(i)
				this.drawer.draw()
			}
		} else {
			this.drawer.timeline.setFrame(frameNumber)
			this.drawer.draw()
		}

		return this.blobOrBuffer(mime, options)
	}

	/**
	 * Render frame at time to Blob or Buffer
	 *
	 * @param time animation time
	 * @param mime image type
	 * @param options quality or options
	 * @returns Promise of Blob for browser or Buffer for Node
	 */
	public frameAtTime(time: number, mime: 'image/png' | 'image/jpeg' = 'image/png', options: OoQ = 1): Promise<BoB> {
		return this.frame(this.drawer.timeline.getFrameAtTime(time), mime, options)
	}

	/**
	 * Render frame number to DataUrl
	 *
	 * @param frameNumber frame to render
	 * @param mime image type
	 * @param options quality or options
	 * @returns string image
	 */
	public frameToDataUrl(
		frameNumber: number,
		mime: 'image/png' | 'image/jpeg' = 'image/png',
		options: OoQ = 1
	): null | string {
		if (!this.drawer.getOption('clear', true)) {
			for (let i = 0; i <= frameNumber; i++) {
				this.drawer.timeline.setFrame(i)
				this.drawer.draw()
			}
		} else {
			this.drawer.timeline.setFrame(frameNumber)
			this.drawer.draw()
		}

		return this.toDataUrl(mime, options)
	}

	/**
	 * Render a frame at `time` to DataUrl
	 *
	 * @param time of animation
	 * @param mime image type
	 * @param options quality or options
	 * @returns string image
	 */
	public frameAtTimeToDataUrl(
		time: number,
		mime: 'image/png' | 'image/jpeg' = 'image/png',
		options: OoQ = 1
	): null | string {
		return this.frameToDataUrl(this.drawer.timeline.getFrameAtTime(time), mime, options)
	}

	/**
	 * Canvas to DataURL
	 *
	 * @param mime
	 * @param optionsOrQuality
	 * @returns
	 */
	private toDataUrl(mime: 'image/png' | 'image/jpeg' | 'application/pdf', optionsOrQuality: OoQ = 1): null | string {
		const canvas = this.drawer.getCanvas()

		if (canvas) {
			if (bBrowser && canvas instanceof OffscreenCanvas) {
				console.warn('Cannot convert toDataURL in OffscreenCanvas')
			} else {
				return (canvas as Canvas | HTMLCanvasElement).toDataURL(mime, optionsOrQuality)
			}
		}

		return null
	}

	/**
	 * Canvas to BoB
	 *
	 * @param mime
	 * @param optionsOrQuality
	 * @returns
	 */
	private blobOrBuffer(mime: 'image/png' | 'image/jpeg', optionsOrQuality: OoQ = 1): Promise<BoB> {
		const canvas = this.drawer.getCanvas()
		if (canvas === null) throw new Error('Canvas not setted into Drawer')

		if (bNode) {
			// TODO default node quality for jpeg and png
			switch (mime) {
				case 'image/png': {
					const pngConf: PngConfig =
						typeof optionsOrQuality === 'number'
							? {
									compressionLevel: (9 - clamp(0, 1, optionsOrQuality) * 9) as 0 | 1 | 5 | 2 | 3 | 4 | 6 | 7 | 8 | 9,
							  }
							: (optionsOrQuality as PngConfig)
					return Promise.resolve((canvas as Canvas).toBuffer(mime, pngConf))
				}
				case 'image/jpeg': {
					const jpegConf: JpegConfig =
						typeof optionsOrQuality === 'number'
							? {
									quality: optionsOrQuality,
							  }
							: (optionsOrQuality as JpegConfig)
					return Promise.resolve((canvas as Canvas).toBuffer(mime, jpegConf))
				}
			}
		}

		if (canvas instanceof OffscreenCanvas) {
			return canvas.convertToBlob({ type: mime, quality: typeof optionsOrQuality === 'number' ? optionsOrQuality : 1 })
		}

		return new Promise<Blob>(resolve => {
			;(canvas as HTMLCanvasElement).toBlob(
				blob => {
					if (blob) resolve(blob)
					else throw new Error('Blob error')
				},
				mime,
				typeof optionsOrQuality === 'number' ? optionsOrQuality : 1
			)
		})
	}
}

export { Renderer }
