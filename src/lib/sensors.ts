import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";

export const shortcutSensor = PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Delay({
      value: 100,
      tolerance: 0,
    }),
  ],
});
