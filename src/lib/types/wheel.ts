export interface SpinResult {
	winner: string;
	rotation: number;
	timestamp: number;
	wasRigged: boolean;
}

export interface RigConfig {
	enabled: boolean;
	targetId?: number;
}
