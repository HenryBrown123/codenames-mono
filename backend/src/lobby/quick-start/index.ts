import { quickStartService } from "./quick-start.service";
import { quickStartController } from "./quick-start.controller";

export default function quickStart(dependencies: Parameters<typeof quickStartService>[0]) {
  const service = quickStartService(dependencies);
  const controller = quickStartController({ quickStart: service });

  return {
    service,
    controller,
  };
}