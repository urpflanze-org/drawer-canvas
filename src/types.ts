import type { IBaseRepetition, IPropArguments } from '@urpflanze/core'

/**
 * @category DrawerCanvas
 */
export interface IDrawerPropArguments extends IPropArguments {}

/**
 *
 * @category DrawerCanvas
 * @export
 * @interface IDrawerCanvasPropArguments
 * @extends {IDrawerPropArguments}
 */
export interface IDrawerCanvasPropArguments extends IDrawerPropArguments {
	/**
	 * Canvas rendering context
	 *
	 * @type {(CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D)}
	 */
	canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
}

/**
 * @category DrawerCanvas
 */
export type TDrawerCanvasProp<T> = T | { (propArguments: IDrawerCanvasPropArguments): T }
/**
 * @category DrawerCanvas
 */
export type TDrawerProp<T> = T | { (propArguments: IDrawerPropArguments): T }

/**
 * @category DrawerCanvas
 */
export interface IDrawerCanvasStreamProps {
	fill?: TDrawerCanvasProp<string | CanvasGradient | CanvasPattern>
	stroke?: TDrawerCanvasProp<string | CanvasGradient | CanvasPattern>
	lineWidth?: TDrawerCanvasProp<number>
	opacity?: TDrawerCanvasProp<number>
	lineDash?: TDrawerCanvasProp<[number, number]>
	lineDashOffset?: TDrawerCanvasProp<number>
	lineJoin?: TDrawerCanvasProp<'bevel' | 'round' | 'miter'>
	lineCap?: TDrawerCanvasProp<'butt' | 'round' | 'square'>
	miterLimit?: TDrawerCanvasProp<number>
	shadowBlur?: TDrawerCanvasProp<number>
	shadowColor?: TDrawerCanvasProp<string>
	shadowOffsetX?: TDrawerCanvasProp<string>
	shadowOffsetY?: TDrawerCanvasProp<string>
	composite?: TDrawerCanvasProp<TCanvasContexComposite>
	filter?: TDrawerCanvasProp<string>
}

/**
 * @category DrawerCanvas
 */
export interface IDrawerCanvasOptions {
	time?: number
	noBackground?: boolean

	ghosts?: number
	ghostAlpha?: boolean
	ghostSkipTime?: number
	ghostSkipFunction?: (ghostRepetition: IBaseRepetition, currentTime: number) => number

	width?: number
	height?: number
	clear?: boolean
	simmetricLines?: number
	sceneFit?: 'cover' | 'contain' | 'none'

	backgroundImage?: CanvasImageSource
	backgroundImageFit?: 'cover' | 'contain' | 'none'
}

/**
 * @category DrawerCanvas
 */
export interface IDrawerCanvasEvents {
	/**
	 * Called before scene is drawn
	 */
	'drawer-canvas:before_draw': {
		currentFrame: number
		currentTime: number
	}
	/**
	 * Called after call .resize() method
	 */
	'drawer-canvas:resize': void
}

type TCanvasContexComposite =
	| 'source-over'
	| 'source-in'
	| 'source-out'
	| 'source-atop'
	| 'destination-over'
	| 'destination-in'
	| 'destination-out'
	| 'destination-atop'
	| 'lighter'
	| 'copy'
	| 'xor'
	| 'multiply'
	| 'screen'
	| 'overlay'
	| 'darken'
	| 'lighten'
	| 'color-dodge'
	| 'color-burn'
	| 'hard-light'
	| 'soft-light'
	| 'difference'
	| 'exclusion'
	| 'hue'
	| 'saturation'
	| 'color'
	| 'luminosity'

/**
 * @category DrawerCanvas
 */
export interface ISceneChildDrawerData {
	highlighted?: boolean
	visible?: boolean
	disableGhost?: boolean
	composite?: TCanvasContexComposite
}

/**
 * @category Timeline
 */
export interface ITimelineEvents {
	/**
	 * Called when sequence is update
	 */
	'timeline:update_sequence': ISequenceMeta
	/**
	 * Called when sequence is update
	 */
	'timeline:change_status': 'start' | 'stop' | 'pause'
	/**
	 * Called each animation tick
	 */
	'timeline:progress': {
		currentFrame: number
		currentTime: number
		fps: number
	}
}

/**
 * @category Timeline
 */
export interface ISequenceMeta {
	duration: number
	frames: number
	framerate: number
}

/**
 * @category Renderer
 */
export type TRendererVideoType = 'video/webm' | 'video/mp4' | 'gif'

/**
 *
 * @category Renderer
 * @export
 * @interface IRendererEvents
 */
export interface IRendererEvents {
	/**
	 * Called when start ZIP rendering
	 */
	'renderer:zip_start': { chunks: number; framesForChunk: number; totalFrames: number }

	/**
	 * Called each frame render
	 */
	'renderer:zip_progress': {
		chunk: number
		frame: number
		totalFrames: number
		totalChunks: number
		framesForChunk: number
		renderTime: number
		remainingTime: number
		elapsedTime: number
	}

	/**
	 * Called when each frame is rendered and ZIP generation start
	 */
	'renderer:zip_preparing': void

	/**
	 * Called when start video rendering before loading FFmpeg.wasm
	 */
	'renderer:video_init': { totalFrames: number; duration: number; framerate: number; type: TRendererVideoType }

	/**
	 * Called when FFmpeg.wasm is loaded
	 */
	'renderer:video_start': { totalFrames: number; duration: number; framerate: number; type: TRendererVideoType }

	/**
	 * Called each frame render
	 */
	'renderer:video_progress': {
		frame: number
		duration: number
		totalFrames: number
		renderTime: number
		remainingTime: number
		elapsedTime: number
	}

	/**
	 * Called when each frame is rendered and video generation start
	 */
	'renderer:video_preparing': void
}
