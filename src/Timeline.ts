import { mod, now } from '@urpflanze/core'
import { Emitter } from './Emitter'
import { ISequenceMeta, ITimelineEvents } from './types'

/**
 * Is used for sequence time management.
 * It is necessary to set the duration and the number of frames per second (frame rate).
 *
 * @category Timeline
 * @class Timeline
 * @extends {Emitter<ITimelineEvents>}
 */
class Timeline extends Emitter<ITimelineEvents> {
	/**
	 * Animation status started
	 * @internal
	 */
	public static readonly START = 'start'

	/**
	 * Animation status paused
	 * @internal
	 */
	public static readonly PAUSE = 'pause'

	/**
	 * Animation status stop
	 * @internal
	 */
	public static readonly STOP = 'stop'

	private readonly fps_samples_size: number = 30
	private fps_samples: Array<number> = []
	private fps_samples_index = 0
	private fps: number

	private currentFrame: number
	private currentTime: number

	private paused_time = 0
	private start_time: number
	private tick_time: number
	private last_tick: number

	private b_sequence_started: boolean

	private sequence: ISequenceMeta

	constructor(duration = 60000, framerate = 30) {
		super()

		this.sequence = {
			duration,
			framerate,
			frames: Math.round((duration / 1000) * framerate),
		}

		this.tick_time = 1000 / this.sequence.framerate
		this.fps = this.sequence.framerate

		this.b_sequence_started = false

		this.currentFrame = 0
		this.currentTime = 0

		this.last_tick = 0
		this.start_time = 0
	}

	//#region sequence meta

	/**
	 * Return the sequence
	 *
	 * @returns {Sequence}
	 */
	public getSequence(): ISequenceMeta {
		return { ...this.sequence }
	}

	/**
	 * Set Sequence
	 *
	 * @param {number} duration in ms
	 * @param {number} framerate
	 * @param {number} atTime
	 */
	public setSequence(duration: number, framerate: number, atTime?: number): void {
		this.sequence.duration = duration
		this.sequence.framerate = framerate

		this.tick_time = 1000 / this.sequence.framerate
		this.sequence.frames = Math.round((this.sequence.duration / 1000) * this.sequence.framerate)

		if (typeof atTime !== 'undefined') {
			this.setTime(atTime)
		} else {
			this.dispatch('timeline:update_sequence', this.getSequence())
		}
	}

	/**
	 * Set duration of timeline
	 *
	 * @param {number} framerate
	 */
	public setDuration(duration: number): void {
		this.setSequence(duration, this.sequence.framerate)
	}

	/**
	 * Get timeline duration
	 *
	 * @returns {number}
	 */
	public getDuration(): number {
		return this.sequence.duration
	}

	/**
	 * Return framerate
	 *
	 * @returns {number}
	 */
	public getFramerate(): number {
		return this.sequence.framerate
	}

	/**
	 * Set a framerate
	 *
	 * @param {number} framerate
	 */
	public setFramerate(framerate: number): void {
		this.setSequence(this.sequence.duration, framerate)
	}

	/**
	 * Get number of frames based on duration and framerate
	 *
	 * @returns {number}
	 */
	public getFramesCount(): number {
		return this.sequence.frames
	}

	//#endregion meta

	//#region change status

	public bSequenceStarted(): boolean {
		return this.b_sequence_started
	}

	/**
	 * Start the sequence
	 *
	 */
	public start(): void {
		if (!this.b_sequence_started) {
			this.b_sequence_started = true
			this.start_time = this.paused_time

			this.dispatch('timeline:change_status', Timeline.START)
		}
	}

	/**
	 * Pause the sequence
	 *
	 */
	public pause(): void {
		if (this.b_sequence_started) {
			this.paused_time = now()
			this.b_sequence_started = false

			this.dispatch('timeline:change_status', Timeline.PAUSE)
		}
	}

	/**
	 * Stop the sequence and reset
	 *
	 */
	public stop(): void {
		if (this.b_sequence_started) {
			this.b_sequence_started = false
			this.currentTime = 0
			this.currentFrame = 0
			this.start_time = 0
			this.paused_time = 0

			this.dispatch('timeline:change_status', Timeline.STOP)
		}
	}

	/**
	 * Animation tick
	 *
	 * @param {number} timestamp current timestamp
	 * @returns {boolean}
	 */
	public tick(timestamp: number): boolean {
		if (this.b_sequence_started) {
			if (!this.start_time) {
				this.start_time = timestamp
				this.last_tick = -this.tick_time
			}

			const currentTime = timestamp - this.start_time
			const elapsed = currentTime - this.last_tick

			if (elapsed >= this.tick_time) {
				this.calculateFPS(1 / (elapsed / 1000))
				this.last_tick = currentTime

				this.currentTime = (currentTime - (elapsed % this.tick_time)) % this.sequence.duration
				this.currentFrame = this.getFrameAtTime(this.currentTime)

				this.dispatch('timeline:progress', {
					currentFrame: this.currentFrame,
					currentTime: this.currentTime,
					fps: this.fps,
				})

				return true
			}
		}

		return false
	}

	/**
	 * Calculate fps
	 *
	 * @private
	 * @param {number} currentFPS
	 */
	private calculateFPS(currentFPS: number): void {
		const samples = this.fps_samples.length

		if (samples > 0) {
			let average = 0

			for (let i = 0; i < samples; i++) average += this.fps_samples[i]

			this.fps = Math.round(average / samples)
		}

		this.fps_samples[this.fps_samples_index] = Math.round(currentFPS)
		this.fps_samples_index = (this.fps_samples_index + 1) % this.fps_samples_size
	}

	//#endregion

	//#region Frame and Time

	/**
	 * Return current animation frame
	 *
	 * @returns {number}
	 */
	public getCurrentFrame(): number {
		return this.currentFrame
	}

	/**
	 * get the time at specific frame number
	 *
	 * @param {number} frame
	 * @returns {number}
	 */
	public getFrameTime(frame: number): number {
		frame = mod(frame, this.sequence.frames)
		return (frame * this.tick_time) % this.sequence.duration
	}

	/**
	 * Return frame number at time
	 *
	 * @param {number} time
	 * @returns {number}
	 */
	public getFrameAtTime(time: number): number {
		return Math.round((time % this.sequence.duration) / this.tick_time)
	}

	/**
	 * set current frame
	 *
	 * @param {number} frame
	 */
	public setFrame(frame: number): void {
		this.currentFrame = mod(frame, this.sequence.frames)
		this.currentTime = this.getFrameTime(this.currentFrame)

		this.dispatch('timeline:progress', {
			currentFrame: this.currentFrame,
			currentTime: this.currentTime,
			fps: this.fps,
		})
	}

	/**
	 * Return tick time (based on framerate)
	 *
	 * @returns {number}
	 */
	public getTickTime(): number {
		return this.tick_time
	}

	/**
	 * Return the current time
	 *
	 * @returns {number}
	 */
	public getTime(): number {
		return this.currentTime
	}

	/**
	 * Set animation at time
	 *
	 * @param {number} time
	 */
	public setTime(time: number): void {
		time = mod(time, this.sequence.duration)

		this.currentTime = time
		this.currentFrame = this.getFrameAtTime(time)

		this.dispatch('timeline:progress', {
			currentFrame: this.currentFrame,
			currentTime: this.currentTime,
			fps: this.fps,
		})
	}

	//#endregion
}

export { Timeline }
