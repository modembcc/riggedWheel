// Components
export { WheelSpinner, Modal } from './components';

// Utils
export {
	generateSlicePath,
	getTextPosition,
	getColorForItem,
	selectWinner,
	calculateTargetRotation,
	calculateRandomRotation
} from './utils';

// Types
export type { SpinResult, RigConfig } from './types';

// Constants
export const DEFAULT_WHEEL_CONFIG = {
	radius: 150,
	spinDuration: 4000,
	minSpins: 5,
	maxSpins: 8
} as const;
