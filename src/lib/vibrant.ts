import { Vibrant, WorkerPipeline } from "node-vibrant/worker";
import PipelineWorker from "node-vibrant/worker.worker?worker";

Vibrant.use(new WorkerPipeline(PipelineWorker as never));

export async function extractIconPalette(blobUrl: string) {
  const palette = await Vibrant.from(blobUrl).getPalette();

  return palette;
}
