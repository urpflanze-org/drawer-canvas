import { parseColor } from '@urpflanze/color'
import { IBaseRepetition, mod, now, Scene, ShapePrimitive, TDrawerProp, Vec2 } from '@urpflanze/core'
import { Canvas, createCanvas } from 'canvas'

import { Emitter } from './Emitter'
import { Timeline } from './Timeline'

import {
	IDrawerCanvasEvents,
	IDrawerCanvasOptions,
	IDrawerCanvasPropArguments,
	IDrawerCanvasStreamProps,
	IDrawerPropArguments,
} from './types'
import { bBrowser, bWorker, fit } from './utils'

type DCanvas = Canvas | HTMLCanvasElement | OffscreenCanvas

/**
 *
 * @category Services.Drawer
 * @extends {Emitter<DrawerCanvasEvents>}
 */
class DrawerCanvas extends Emitter<IDrawerCanvasEvents> {
	protected scene?: Scene
	protected drawerOptions: Required<Omit<IDrawerCanvasOptions, 'backgroundImage' | 'ghostSkipFunction'>> & {
		backgroundImage?: CanvasImageSource
		ghostSkipFunction?: (ghostRepetition: IBaseRepetition, currentTime: number) => number
	}

	protected animation_id: number | null
	protected draw_id: number | null
	protected redraw_id: number | null

	public timeline: Timeline
	protected canvas!: Canvas | HTMLCanvasElement | OffscreenCanvas
	protected context!: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null

	constructor(
		scene?: Scene,
		canvasOrContainer?: HTMLElement | DCanvas,
		drawerOptions?: IDrawerCanvasOptions,
		duration = 6000,
		framerate = 60
	) {
		super()

		this.drawerOptions = {
			width: drawerOptions?.width || scene?.width || 400,
			height: drawerOptions?.height || scene?.height || 400,
			clear: drawerOptions?.clear ?? true,
			time: drawerOptions?.time ?? 0,
			simmetricLines: drawerOptions?.simmetricLines ?? 0,
			noBackground: drawerOptions?.noBackground ?? false,
			ghosts: drawerOptions?.ghosts || 0,
			ghostAlpha: drawerOptions?.ghostAlpha === false ? false : true,
			ghostSkipTime: drawerOptions?.ghostSkipTime ?? 30,
			ghostSkipFunction: drawerOptions?.ghostSkipFunction,
			sceneFit: drawerOptions?.sceneFit || 'contain',
			backgroundImage: drawerOptions?.backgroundImage,
			backgroundImageFit: drawerOptions?.backgroundImageFit || 'cover',
		}

		this.timeline = new Timeline(duration, framerate)
		this.timeline.setTime(this.drawerOptions.time)
		this.draw_id = null
		this.redraw_id = null
		this.animation_id = null

		if (scene) {
			this.setScene(scene)
		}

		if (!bWorker || (bWorker && canvasOrContainer instanceof OffscreenCanvas)) this.setCanvas(canvasOrContainer)
	}

	/**
	 * Return option value or default
	 *
	 * @param {K keyof IDrawerCanvasOptions} name
	 * @param {IDrawerCanvasOptions[K]} defaultValue
	 */
	public getOption<K extends keyof IDrawerCanvasOptions>(
		name: K,
		defaultValue: IDrawerCanvasOptions[K]
	): IDrawerCanvasOptions[K] {
		return this.drawerOptions[name] ?? defaultValue
	}

	/**
	 * Create instance of canvas (HTMLCanvasElement in browser o Canvas in Node)
	 */
	public setCanvas(canvasOrContainer?: HTMLElement | DCanvas): void {
		if (bWorker) {
			if (canvasOrContainer instanceof OffscreenCanvas) {
				this.canvas = canvasOrContainer
			} else {
				console.error('Cannot set cavas')
			}
		} else {
			if (bBrowser) {
				const canvas = createCanvas(this.drawerOptions.width, this.drawerOptions.height)

				if (
					canvasOrContainer instanceof HTMLElement &&
					!(canvasOrContainer instanceof HTMLCanvasElement || canvasOrContainer instanceof OffscreenCanvas)
				) {
					this.canvas = canvas
					while (canvasOrContainer.lastChild) canvasOrContainer.removeChild(canvasOrContainer.lastChild)
					canvasOrContainer.appendChild(canvas as unknown as HTMLCanvasElement)
				} else {
					this.canvas = typeof canvasOrContainer === 'undefined' ? canvas : canvasOrContainer
				}
			} else {
				this.canvas = createCanvas(this.drawerOptions.width, this.drawerOptions.height)
			}
		}

		if (this.canvas) {
			this.canvas.width = this.drawerOptions.width
			this.canvas.height = this.drawerOptions.height

			this.context = this.canvas.getContext('2d', {
				alpha: true,
				// @ts-ignore
				// desynchronized: true,
			}) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
		}
	}

	/**
	 * Return instance of canvas
	 *
	 * @returns canvas
	 */
	public getCanvas(): Canvas | HTMLCanvasElement | OffscreenCanvas {
		return this.canvas
	}

	public setScene(scene: Scene) {
		this.scene = scene
	}

	public draw(): number {
		if (this.context === null || typeof this.scene === 'undefined') return 0

		const start_time = now()

		const timeline = this.timeline
		const drawAtTime = timeline.getTime()

		const drawerOptions: Required<Omit<IDrawerCanvasOptions, 'backgroundImage' | 'ghostSkipFunction'>> & {
			backgroundImage?: CanvasImageSource
			ghostSkipFunction?: (ghostRepetition: IBaseRepetition, currentTime: number) => number
			ghostIndex: number | undefined
		} = {
			...this.drawerOptions,
			ghostIndex: undefined,
			clear: this.drawerOptions.clear || timeline.getCurrentFrame() <= 1,
			time: drawAtTime,
		}

		const currentFrame = timeline.getFrameAtTime(drawAtTime)

		this.dispatch('drawer-canvas:before_draw', {
			currentFrame: currentFrame,
			currentTime: drawAtTime,
		})

		if (drawerOptions.simmetricLines > 0) {
			if (drawerOptions.clear) {
				DrawerCanvas.clear(
					this.context,
					drawerOptions.width,
					drawerOptions.height,
					drawerOptions.noBackground ? false : this.scene.background,
					drawerOptions.backgroundImage,
					drawerOptions.backgroundImageFit
				)
			}
			DrawerCanvas.drawSimmetricLines(
				this.context,
				drawerOptions.simmetricLines,
				drawerOptions.width,
				drawerOptions.height,
				this.scene.color
			)
			drawerOptions.clear = false
		}

		if (drawerOptions.ghosts) {
			const ghostDrawerOptions: IDrawerCanvasOptions & { ghostIndex?: number } = {
				...drawerOptions,
			}
			const drawAtTime = timeline.getTime()
			const sequenceDuration = timeline.getDuration()

			const ghostRepetition: IBaseRepetition = {
				offset: 0,
				index: 0,
				count: drawerOptions.ghosts,
			}

			for (let i = 1; i <= drawerOptions.ghosts; i++) {
				ghostRepetition.index = i
				ghostRepetition.offset = ghostRepetition.index / ghostRepetition.count

				const ghostTime =
					drawAtTime -
					(drawerOptions.ghostSkipFunction
						? drawerOptions.ghostSkipFunction(ghostRepetition, drawAtTime)
						: i * (drawerOptions.ghostSkipTime as number))

				ghostDrawerOptions.ghostIndex = i
				ghostDrawerOptions.time = mod(ghostTime, sequenceDuration)
				ghostDrawerOptions.clear = drawerOptions.clear && ghostDrawerOptions.ghostIndex === 1
				this.realDraw(ghostDrawerOptions)
			}

			drawerOptions.clear = false
		}

		this.realDraw(drawerOptions)

		return now() - start_time
	}

	public realDraw(options: IDrawerCanvasOptions & { ghostIndex?: number }) {
		const width = this.drawerOptions.width
		const height = this.drawerOptions.height

		const context = this.context as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
		const scene = this.scene as Scene
		const time = options.time ?? 0

		const bGhost: boolean =
			typeof options.ghosts !== 'undefined' &&
			options.ghosts > 0 &&
			typeof options.ghostIndex !== 'undefined' &&
			options.ghostIndex > 0
		const ghostMultiplier: number = bGhost ? 1 - (options.ghostIndex as number) / ((options.ghosts as number) + 0.5) : 0
		const ghostAlpha: boolean = options.ghostAlpha === true

		const sceneFit = fit(scene.width, scene.height, width, height, this.drawerOptions.sceneFit)
		const translateX = sceneFit.x
		const translateY = sceneFit.y

		options.clear &&
			DrawerCanvas.clear(
				context,
				width,
				height,
				options.noBackground ? false : scene.background,
				options.backgroundImage,
				options.backgroundImageFit
			)

		let logFillColorWarn = false
		let logStrokeColorWarn = false

		scene.currentTime = time
		const sceneChilds = scene.getChildren()
		for (let i = 0, len = sceneChilds.length; i < len; i++) {
			const sceneChild = sceneChilds[i]

			if (
				!sceneChild.data ||
				(!(sceneChild.data.visible === false) && !(bGhost && sceneChild.data.disableGhost === true))
			) {
				sceneChilds[i].generate(time, true)

				const childIndexedBuffer = sceneChilds[i].getIndexedBuffer() || []
				const childBuffer = sceneChilds[i].getBuffer() || []

				let childVertexIndex = 0

				for (
					let currentBufferIndex = 0, len = childIndexedBuffer.length;
					currentBufferIndex < len;
					currentBufferIndex++
				) {
					const currentIndexing = childIndexedBuffer[currentBufferIndex]
					const shape = currentIndexing.shape as ShapePrimitive
					const propArguments: IDrawerCanvasPropArguments = {
						canvasContext: context,
						...currentIndexing,
					}

					const composite = DrawerCanvas.getStreamDrawerProp(shape, 'composite', propArguments, 'source-over')

					context.globalCompositeOperation = composite

					context.beginPath()
					context.moveTo(
						childBuffer[childVertexIndex] * sceneFit.scale + translateX,
						childBuffer[childVertexIndex + 1] * sceneFit.scale + translateY
					)

					childVertexIndex += 2
					for (
						let currentFrameLength = childVertexIndex + currentIndexing.frameLength - 2;
						childVertexIndex < currentFrameLength;
						childVertexIndex += 2
					)
						context.lineTo(
							childBuffer[childVertexIndex] * sceneFit.scale + translateX,
							childBuffer[childVertexIndex + 1] * sceneFit.scale + translateY
						)

					if (shape.isClosed()) context.closePath()

					const alpha = DrawerCanvas.getStreamDrawerProp(shape, 'opacity', propArguments, 1)

					context.globalAlpha = alpha

					const shadowColor = DrawerCanvas.getStreamDrawerProp(shape, 'shadowColor', propArguments)
					const shadowBlur = DrawerCanvas.getStreamDrawerProp(shape, 'shadowBlur', propArguments)
					const shadowOffsetX = DrawerCanvas.getStreamDrawerProp(shape, 'shadowOffsetX', propArguments)
					const shadowOffsetY = DrawerCanvas.getStreamDrawerProp(shape, 'shadowOffsetY', propArguments)

					context.shadowColor = shadowColor
					context.shadowBlur = shadowBlur
					shadowOffsetX && (context.shadowOffsetX = shadowOffsetX)
					shadowOffsetY && (context.shadowOffsetY = shadowOffsetY)

					let fill = DrawerCanvas.getStreamDrawerProp(shape, 'fill', propArguments)

					if (typeof fill !== 'undefined') {
						if (bGhost && ghostAlpha) {
							const color = DrawerCanvas.ghostifyColor(fill, ghostMultiplier)
							if (color) {
								fill = color
							} else if (!logFillColorWarn) {
								console.warn(`[Urpflanze:DrawerCanvas] Unable ghost fill color '${fill}',
								please enter a rgba or hsla color`)
								logFillColorWarn = true
							}
						}

						context.fillStyle = fill
						context.fill()
					}

					let stroke = DrawerCanvas.getStreamDrawerProp(
						shape,
						'stroke',
						propArguments,
						typeof fill === 'undefined' ? scene.color : undefined
					)
					let lineWidth = DrawerCanvas.getStreamDrawerProp(shape, 'lineWidth', propArguments, 1)

					if (stroke) {
						if (bGhost && ghostAlpha) {
							const color = DrawerCanvas.ghostifyColor(stroke, ghostMultiplier)
							if (color) {
								stroke = color
							} else if (!logStrokeColorWarn) {
								console.warn(`[Urpflanze:DrawerCanvas] Unable ghost stroke color '${stroke}',
								please enter a rgba or hsla color`)
								logStrokeColorWarn = true
							}
							lineWidth *= ghostMultiplier
						}

						const lineJoin = DrawerCanvas.getStreamDrawerProp(shape, 'lineJoin', propArguments)
						const lineCap = DrawerCanvas.getStreamDrawerProp(shape, 'lineCap', propArguments)
						const lineDash = DrawerCanvas.getStreamDrawerProp(shape, 'lineDash', propArguments)
						const lineDashOffset = DrawerCanvas.getStreamDrawerProp(shape, 'lineDashOffset', propArguments)
						const miterLimit = DrawerCanvas.getStreamDrawerProp(shape, 'miterLimit', propArguments)

						context.setLineDash.call(context, lineDash || [])
						context.lineJoin = lineJoin
						context.lineCap = lineCap
						context.lineDashOffset = lineDashOffset
						context.miterLimit = miterLimit

						context.lineWidth = lineWidth * sceneFit.scale
						context.strokeStyle = stroke
						context.stroke()
					}
				}
				context.restore()
			}
		}
	}

	/**
	 * Return a drawer value
	 *
	 * @static
	 * @template T
	 * @param {ShapePrimitive<T>} shape
	 * @param {keyof T} key
	 * @param {IDrawerPropArguments} propArguments
	 * @param {*} [defaultValue]
	 * @returns {*}
	 */
	static getStreamDrawerProp(
		shape: ShapePrimitive<any, any>,
		key: keyof IDrawerCanvasStreamProps,
		propArguments: IDrawerPropArguments,
		defaultValue?: any
	): any {
		let attribute: TDrawerProp<any> = shape.drawer[key] as any

		if (typeof attribute === 'function') {
			attribute = attribute(propArguments)
		}

		return attribute ?? defaultValue
	}

	/**
	 * Create color based on ghostMultiplier
	 *
	 * @static
	 * @param {any} color
	 * @param {number} ghostMultiplier
	 * @return {*}  {(string | undefined)}
	 */
	static ghostifyColor(color: any, ghostMultiplier: number): string | undefined {
		if (typeof color === 'string' || typeof color === 'number') {
			const parsed = parseColor(color)
			if (parsed) {
				const ghostAlpha = parsed.alpha * ghostMultiplier
				return parsed.type === 'rgb'
					? `rgba(${parsed.a},${parsed.b},${parsed.c},${ghostAlpha})`
					: `hsla(${parsed.a},${parsed.b}%,${parsed.c}%,${ghostAlpha})`
			}
		}

		return color
	}

	/**
	 * Clear canvas, draw background or image (and fit)
	 *
	 * @param context
	 * @param width
	 * @param height
	 * @param background
	 * @param backgroundImage
	 * @param backgroundImageFit
	 */
	static clear(
		context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
		width: number,
		height: number,
		background: string | boolean,
		backgroundImage?: CanvasImageSource,
		backgroundImageFit?: 'cover' | 'contain' | 'none'
	) {
		if (typeof background === 'boolean' && background === false) {
			context.clearRect(0, 0, width, height)
		} else {
			context.globalCompositeOperation = 'source-over'

			context.fillStyle = background as string // or true
			context.fillRect(0, 0, width, height)

			if (backgroundImage) {
				const sourceWidth =
					backgroundImage instanceof SVGImageElement ? backgroundImage.width.baseVal.value : backgroundImage.width
				const sourceHeight =
					backgroundImage instanceof SVGImageElement ? backgroundImage.height.baseVal.value : backgroundImage.height

				const fitRect = fit(sourceWidth, sourceHeight, width, height, backgroundImageFit)

				context.drawImage(backgroundImage, fitRect.x, fitRect.y, fitRect.width, fitRect.height)
			}
		}
	}

	/**
	 * Draw utility lines
	 *
	 * @param context
	 * @param simmetricLines
	 * @param width
	 * @param height
	 * @param color
	 */
	static drawSimmetricLines(
		context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
		simmetricLines: number,
		width: number,
		height: number,
		color: string
	): void {
		const offset = Math.PI / simmetricLines
		const size = Math.max(width, height)
		const sizeMin = Math.min(width, height)
		const k = width < height ? 1 : 0
		const centerX = [size / 2, size / 2]
		const centerY = [sizeMin / 2, sizeMin / 2]

		for (let i = 0; i < simmetricLines; i++) {
			const a = [-size, -size]
			const b = [size * 2, size * 2]
			const rotate = i * offset + Math.PI / 4

			Vec2.rotateZ(a, i % 2 === k ? centerX : centerY, rotate)
			Vec2.rotateZ(b, i % 2 === k ? centerX : centerY, rotate)

			context.beginPath()
			context.strokeStyle = color
			context.lineWidth = 1

			context.moveTo(a[0], a[1])
			context.lineTo(b[0], b[1])

			context.stroke()
		}
	}
}

export { DrawerCanvas }

// const sourceRatio = sourceWidth / sourceHeight

// let x = 0,
// 	y = 0,
// 	bgWidth = width,
// 	bgHeight = height
// if (sourceRatio !== ratio) {
// 	if (options.backgroundImageFit === 'contain') {
// 		bgWidth = ratio > sourceRatio ? (sourceWidth * height) / sourceHeight : width
// 		bgHeight = ratio > sourceRatio ? height : (sourceHeight * width) / sourceWidth
// 	} else {
// 		bgWidth = ratio < sourceRatio ? (sourceWidth * height) / sourceHeight : width
// 		bgHeight = ratio < sourceRatio ? height : (sourceHeight * width) / sourceWidth
// 	}

// 	x = (width - bgWidth) / 2
// 	y = (height - bgHeight) / 2
