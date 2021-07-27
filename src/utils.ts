export const bNode =
	typeof process !== 'undefined' &&
	typeof process.versions !== 'undefined' &&
	typeof process.versions.node !== 'undefined'

export const bBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

export const bWorker =
	typeof self === 'object' && ['ServiceWorkerGlobalScope', 'DedicatedWorkerGlobalScope'].includes(self.constructor.name)

/**
 * Utiltites
 *
 * @category Utilities
 * @export
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} destWidth
 * @param {number} destHeight
 * @param {('cover' | 'contain' | 'none')} [fit='none']
 * @return {*}  {{ x: number; y: number; width: number; height: number; scale: number }}
 */
export function fit(
	sourceWidth: number,
	sourceHeight: number,
	destWidth: number,
	destHeight: number,
	fit: 'cover' | 'contain' | 'none' = 'none'
): { x: number; y: number; width: number; height: number; scale: number } {
	let x = 0,
		y = 0,
		scale = 1,
		finalWidth = sourceWidth,
		finalHeight = sourceHeight

	const ratio = destWidth / destHeight
	const sourceRatio = sourceWidth / sourceHeight

	if (fit === 'contain') {
		finalWidth = ratio > sourceRatio ? (sourceWidth * destHeight) / sourceHeight : destWidth
		finalHeight = ratio > sourceRatio ? destHeight : (sourceHeight * destWidth) / sourceWidth
		scale = Math.max(finalWidth, finalHeight) / Math.max(sourceWidth, sourceHeight)
	} else if (fit === 'cover') {
		finalWidth = ratio < sourceRatio ? (sourceWidth * destHeight) / sourceHeight : destWidth
		finalHeight = ratio < sourceRatio ? destHeight : (sourceHeight * destWidth) / sourceWidth
		// scale = Math.min(sourceWidth, sourceHeight) / Math.min(finalWidth, finalHeight)
		scale = Math.max(finalWidth, finalHeight) / Math.max(sourceWidth, sourceHeight)
	} else {
		// finalWidth = sourceWidth
		// finalHeight = sourceHeight
	}

	x = (destWidth - finalWidth) / 2
	y = (destHeight - finalHeight) / 2

	return {
		x,
		y,
		width: finalWidth,
		height: finalHeight,
		scale,
	}
}
