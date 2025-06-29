import { MIN_RESOLUTION, MAX_RESOLUTION } from "../utils/constants";

export default function ZoomButton({
  resolution,
  increase,
  decrease,
}: {
  resolution: number;
  increase: () => void;
  decrease: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-2xl font-semibold">
      <button
        onClick={increase}
        className={`rounded-sm px-2 pb-1 ${resolution === MAX_RESOLUTION ? "cursor-not-allowed bg-white/50" : "bg-white hover:bg-yellow-500"}`}
      >
        +
      </button>
      <button
        onClick={decrease}
        className={`rounded-sm px-2 pb-1 ${resolution === MIN_RESOLUTION ? "cursor-not-allowed bg-white/50" : "bg-white hover:bg-yellow-500"}`}
      >
        -
      </button>
    </div>
  );
}
