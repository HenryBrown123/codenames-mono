export interface AnimationDefinition {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

export const container: Record<string, AnimationDefinition> = {
  deal: {
    keyframes: [
      {
        opacity: "0",
        transform: "translateY(-100px) rotate(-15deg) scale(0.5)",
        offset: 0,
      },
      {
        opacity: "0.5",
        transform: "translateY(-30px) rotate(-5deg) scale(0.8)",
        offset: 0.5,
      },
      {
        opacity: "1",
        transform: "translateY(0) rotate(0deg) scale(1)",
        offset: 1,
      },
    ],
    options: {
      duration: 600,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      fill: "both" as FillMode,
    },
  },
  select: {
    keyframes: [{ transform: "scale(1)" }, { transform: "scale(0.95)" }, { transform: "scale(1)" }],
    options: {
      duration: 300,
      easing: "ease-in-out",
    },
  },
  reset: {
    keyframes: [
      { opacity: "1", transform: "scale(1)" },
      { opacity: "0", transform: "scale(0.8) translateY(-20px)" },
    ],
    options: {
      duration: 300,
      easing: "ease-out",
      fill: "forwards" as FillMode,
    },
  },
};

export const containerAssassin: Record<string, AnimationDefinition> = {
  ...container,
  select: {
    keyframes: [
      {
        filter: "brightness(1) saturate(1)",
        transform: "scale(1)",
      },
      {
        filter: "brightness(2) saturate(0)",
        transform: "scale(1.1)",
      },
      {
        filter: "brightness(0.5) saturate(2)",
        transform: "scale(0.95)",
      },
      {
        filter: "brightness(1) saturate(1)",
        transform: "scale(1)",
      },
    ],
    options: {
      duration: 1000,
      easing: "ease-in-out",
    },
  },
};

export const word: Record<string, AnimationDefinition> = {
  deal: {
    keyframes: [{ opacity: "0" }, { opacity: "1" }],
    options: {
      duration: 300,
      delay: 200,
    },
  },
  reveal_colors: {
    keyframes: [
      {
        transform: "scale(1)",
        filter: "brightness(1)",
      },
      {
        transform: "scale(1.05)",
        filter: "brightness(1.1)",
      },
      {
        transform: "scale(1)",
        filter: "brightness(1)",
      },
    ],
    options: {
      duration: 400,
      easing: "ease-in-out",
    },
  },
  hide_colors: {
    keyframes: [
      {
        transform: "scale(1)",
        filter: "brightness(1)",
      },
      {
        transform: "scale(0.95)",
        filter: "brightness(0.9)",
      },
      {
        transform: "scale(1)",
        filter: "brightness(1)",
      },
    ],
    options: {
      duration: 300,
    },
  },
  select: {
    keyframes: [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(0)" }],
    options: {
      duration: 400,
      easing: "ease-in",
    },
  },
};

export const badge: Record<string, AnimationDefinition> = {
  reveal_colors: {
    keyframes: [
      {
        opacity: "0",
        transform: "scale(0.5) translateY(10px)",
      },
      {
        opacity: "1",
        transform: "scale(1.1) translateY(0)",
      },
      {
        opacity: "1",
        transform: "scale(1) translateY(0)",
      },
    ],
    options: {
      duration: 400,
      delay: 100,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      fill: "forwards" as FillMode,
    },
  },
  hide_colors: {
    keyframes: [
      { opacity: "1", transform: "scale(1)" },
      { opacity: "0", transform: "scale(0.8)" },
    ],
    options: {
      duration: 200,
      fill: "forwards" as FillMode,
    },
  },
};

export const badgeAssassin: Record<string, AnimationDefinition> = {
  ...badge,
  reveal_colors: {
    keyframes: [
      {
        filter: "brightness(1)",
        boxShadow: "0 0 0 transparent",
      },
      {
        filter: "brightness(1.5)",
        boxShadow: "0 0 30px rgba(255, 0, 0, 0.8), inset 0 0 20px rgba(255, 0, 0, 0.4)",
      },
    ],
    options: {
      duration: 600,
      fill: "forwards" as FillMode,
    },
  },
};

export const cover: Record<string, AnimationDefinition> = {
  select: {
    keyframes: [
      { transform: "rotateY(-180deg) scale(0)" },
      { transform: "rotateY(-90deg) scale(0.5)" },
      { transform: "rotateY(0deg) scale(1)" },
    ],
    options: {
      duration: 600,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      fill: "forwards" as FillMode,
    },
  },
};

export const cardInner: Record<string, AnimationDefinition> = {
  select: {
    keyframes: [{ transform: "rotateY(0deg)" }, { transform: "rotateY(180deg)" }],
    options: {
      duration: 600,
      easing: "ease-in-out",
      fill: "forwards" as FillMode,
    },
  },
};
