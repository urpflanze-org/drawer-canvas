import type { Scene } from '@urpflanze/core'
import { IBrowserDrawerCanvasOptions, TTimelineTickMode } from '../types'
import { DrawerCanvas } from '../DrawerCanvas'
import { bBrowser } from '../utils'
import { DCanvas } from '../browser'

/**
 *
 * @category DrawerCanvas
 * @class BrowserDrawerCanvas
 * @extends {DrawerCanvas}
 */
class BrowserDrawerCanvas extends DrawerCanvas {
	protected dpi = 1
	protected loop

	protected animation_id: number | null
	protected draw_id: number | null
	protected redraw_id: number | null

	constructor(
		scene?: Scene,
		canvasOrContainer?: HTMLElement | HTMLCanvasElement | OffscreenCanvas,
		drawerOptions?: IBrowserDrawerCanvasOptions,
		duration = 60000,
		framerate = 60,
		tickMode: TTimelineTickMode = drawerOptions?.clear === false ? 'linear' : 'async'
	) {
		super(scene, canvasOrContainer, drawerOptions, duration, framerate, tickMode)

		this.dpi = drawerOptions?.dpi || 1
		this.loop = drawerOptions?.loop === false ? false : true

		this.draw_id = null
		this.redraw_id = null
		this.animation_id = null

		this.draw = this.draw.bind(this)
		this.animate = this.animate.bind(this)
		this.startAnimation = this.startAnimation.bind(this)

		this.resize(this.drawerOptions.width, this.drawerOptions.height)

		this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
	}

	public setCanvas(canvasOrContainer?: HTMLElement | DCanvas): void {
		super.setCanvas(canvasOrContainer)
	}

	public resize(width: number, height: number, sceneFit?: 'cover' | 'contain' | 'none', dpi: number = this.dpi): void {
		this.drawerOptions.width = width * dpi
		this.drawerOptions.height = height * dpi

		if (this.canvas) {
			this.canvas.width = width * dpi
			this.canvas.height = height * dpi

			if (bBrowser && this.canvas instanceof HTMLCanvasElement) {
				this.canvas.style.width = width + 'px'
				this.canvas.style.height = height + 'px'
			}
		}

		if (typeof sceneFit !== 'undefined') {
			this.drawerOptions.sceneFit = sceneFit
		}

		this.dispatch('drawer-canvas:resize')
	}

	/**
	 * Internal tick animation
	 */
	private animate(timestamp: number): void {
		if (this.timeline.bSequenceStarted()) {
			this.animation_id = requestAnimationFrame(this.animate)

			if (this.timeline.tick(timestamp)) {
				if (this.loop || (this.loop === false && this.timeline.getCurrentLoop() === 0)) this.draw()
				else {
					cancelAnimationFrame(this.animation_id)
					this.timeline.setTime(this.timeline.getSequence().duration - 0.00001)
					this.draw()
				}
			}
		}
	}

	private handleVisibilityChange() {
		if (document.hidden) {
			this.pauseAnimation()
		} else {
			this.playAnimation()
		}
	}

	/**
	 * Start animation drawing
	 */
	public startAnimation(): void {
		this.stopAnimation()

		document.addEventListener('visibilitychange', this.handleVisibilityChange, false)

		this.timeline.start()
		this.animation_id = requestAnimationFrame(this.animate)
	}

	/**
	 * Stop animation drawing
	 */
	public stopAnimation(): void {
		this.timeline.stop()

		document.removeEventListener('visibilitychange', this.handleVisibilityChange)

		if (this.animation_id) cancelAnimationFrame(this.animation_id)
	}

	/**
	 * Pause animation drawing
	 */
	public pauseAnimation(): void {
		this.timeline.pause()

		if (this.animation_id) cancelAnimationFrame(this.animation_id)
	}

	/**
	 * Play animation drawing
	 */
	public playAnimation(): void {
		this.timeline.start()

		requestAnimationFrame(this.animate)
	}

	public redraw(): void {
		if (!this.timeline.bSequenceStarted()) {
			this.draw_id && cancelAnimationFrame(this.draw_id)

			if (typeof this.drawerOptions.ghosts === undefined || this.drawerOptions.ghosts === 0) this.timeline.stop()

			this.draw_id = requestAnimationFrame(this.draw)
		} else if (typeof this.drawerOptions.ghosts === undefined || this.drawerOptions.ghosts === 0) {
			this.stopAnimation()
			this.redraw_id && cancelAnimationFrame(this.redraw_id)
			this.redraw_id = requestAnimationFrame(this.startAnimation)
		}
	}
}

export { BrowserDrawerCanvas }
