/**
 * WAAPI animation definition
 * Matches native Web Animations API structure
 */
export interface AnimationDefinition {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

/**
 * Generic entity transition
 * Describes state change that triggers animations
 */
export interface EntityTransition {
  fromState: string;
  toState: string;
  event: string;
}
