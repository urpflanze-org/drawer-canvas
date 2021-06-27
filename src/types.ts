import { IBaseRepetition, IPropArguments } from '@urpflanze/core'

export interface IDrawerPropArguments extends IPropArguments {}

export interface IDrawerCanvasPropArguments extends IDrawerPropArguments {
	canvasContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
}

export type TDrawerCanvasProp<T> = T | { (propArguments: IDrawerCanvasPropArguments): T }
export type TDrawerProp<T> = T | { (propArguments: IDrawerPropArguments): T }

/**
 * @category Services.Drawer
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
 * @category Services.Drawer
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
 * @category Services.Drawer
 */
export interface IDrawerCanvasEvents {
	'drawer-canvas:before_draw': {
		currentFrame: number
		currentTime: number
	}
	'drawer-canvas:buffer_loaded': void
	'drawer-canvas:buffer_flush': void
	'drawer-canvas:resize': void
}

/**
 * @category Services.Drawer
 */
export interface IDrawerSVGEvents {
	'drawer-svg:before_draw': {
		currentFrame: number
		currentTime: number
	}
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
 * @category Services.Drawer
 */
export interface ISceneChildDrawerData {
	highlighted?: boolean
	visible?: boolean
	disableGhost?: boolean
	composite?: TCanvasContexComposite
}

/**
 * @category Services.Timeline
 */
export interface ITimelineEvents {
	'timeline:update_sequence': ISequenceMeta
	'timeline:change_status': 'start' | 'stop' | 'pause'
	'timeline:progress': {
		current_frame: number
		current_time: number
		fps: number
	}
}

/**
 * @category Services.Timeline
 */
export interface ISequenceMeta {
	duration: number
	frames: number
	framerate: number
}
