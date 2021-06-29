import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { Canvas, JpegConfig, PdfConfig, PngConfig } from 'canvas'
import * as JSZip from 'jszip'

import { DrawerCanvas } from './DrawerCanvas'
import { bBrowser, bNode } from './utils'

type BoB = Blob | Buffer
type OoQ = PngConfig | JpegConfig | PdfConfig | number

class Renderer {
	private ffmpeg: FFmpeg | undefined
	private drawer: DrawerCanvas
	private ffmpegCorePath: string | undefined

	constructor(drawer: DrawerCanvas, ffmpegCorePath?: string) {
		this.drawer = drawer
		this.ffmpegCorePath = ffmpegCorePath
	}

	public async zip(
		imagesType: 'image/jpeg' | 'image/png' = 'image/png',
		quality: number = 1,
		framesForChunk = 600
	): Promise<Array<Uint8Array>> {
		const zip = new JSZip()
		const frames = this.drawer.timeline.getFramesCount()
		const chunks = Math.ceil(frames / framesForChunk)

		const extension = imagesType === 'image/jpeg' ? '.jpg' : '.png'

		const zipParts: Array<Uint8Array> = []

		for (let chunk = 0; chunk < chunks; chunk++) {
			for (let frameIndex = 0; frameIndex < framesForChunk; frameIndex++) {
				const frame = frameIndex + chunk * framesForChunk
				if (frame < frames) {
					const frameName = frame.toString().padStart(5, '0') + extension

					const blob = await this.frame(frame, imagesType, quality)
					const buffer = (await (bNode ? blob : (blob as Blob).arrayBuffer())) as Buffer | ArrayBuffer
					zip.file(frameName, new Uint8Array(buffer, 0, buffer.byteLength))
				}
			}
			zipParts.push(await zip.generateAsync({ type: 'uint8array' }))
		}

		return zipParts
	}

	public async render(
		type: 'video/webm' | 'video/mp4' = 'video/mp4',
		quality: number = 1,
		// TODO: move into contructor
		ffmpegLogger?: (logParams: { type: string; message: string }) => any,
		ffmpegProgress?: (progressParams: { ratio: number }) => any
	): Promise<Uint8Array> {
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

		const frames = this.drawer.timeline.getFramesCount()
		const framerate = this.drawer.timeline.getFramerate().toString()

		for (let frame = 0; frame < frames; frame++) {
			const blob = await this.frame(frame, 'image/jpeg', quality)
			const buffer = (await (bNode ? blob : (blob as Blob).arrayBuffer())) as Buffer | ArrayBuffer

			const frameName = frame.toString().padStart(5, '0') + '.jpg'
			this.ffmpeg.FS('writeFile', frameName, new Uint8Array(buffer, 0, buffer.byteLength))
		}

		const args = ['-r', framerate, '-i', '%05d.jpg']

		if (type === 'video/webm') {
			args.push('-c:v', 'libvpx')
			args.push('-row-mt', '1')
		} else {
			args.push('-c:v', 'libx264')
		}

		args.push('-pix_fmt', 'yuv420p', 'out.mp4')

		await this.ffmpeg.run(...args)
		const result = await this.ffmpeg.FS('readFile', 'out.mp4')

		return result
	}

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

	public frameAtTime(time: number, mime: 'image/png' | 'image/jpeg' = 'image/png', options: OoQ = 1): Promise<BoB> {
		return this.frame(this.drawer.timeline.getFrameAtTime(time), mime, options)
	}

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
	private blobOrBuffer(mime: 'image/png' | 'image/jpeg' | 'application/pdf', optionsOrQuality: OoQ): Promise<BoB> {
		const canvas = this.drawer.getCanvas()
		if (canvas === null) throw new Error('Canvas not setted into Drawer')

		if (bNode) {
			// TODO default node quality for jpeg and png
			// @ts-ignore
			return Promise.resolve((canvas as Canvas).toBuffer(mime, optionsOrQuality))
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
