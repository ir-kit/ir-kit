import { Centered } from "../../../shared/ui/centered";
import { useCapture } from "../../capture-control";

export function Empty() {
  const { capturing } = useCapture();
  return (
    <Centered>
      <div className="text-center">
        <p className="text-zinc-300">
          {capturing ? "Listening for traffic…" : "Capture is paused."}
        </p>
        <p className="mt-1 text-zinc-600">
          Browse the page to start building a spec.
        </p>
      </div>
    </Centered>
  );
}
