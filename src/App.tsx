import "./App.css";

import ZoomButton from "./components/ZoomButton";

import { useImageController } from "./hooks/useImageController";

function App() {
  const {
    imageRef,
    position,
    scale,
    resolution,
    grid,
    gridLoading,
    handleResolutionIncrease,
    handleResolutionDecrease,
  } = useImageController();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative m-2 flex w-full flex-1 items-center justify-center self-stretch overflow-hidden bg-[#666666]">
        <div
          ref={imageRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          className="flex cursor-grab active:cursor-grabbing"
        >
          {gridLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {grid.map((row, i) => (
                <div key={`${resolution}-${i}`}>
                  {row.map((imgURL, j) => (
                    <img
                      key={`${i}-${j}-${resolution}`}
                      src={imgURL}
                      alt={`tile-${i}-${j}`}
                      draggable="false"
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="absolute flex w-full flex-wrap items-center justify-end self-end p-4">
        <ZoomButton
          resolution={resolution}
          increase={handleResolutionIncrease}
          decrease={handleResolutionDecrease}
        />
      </div>
    </div>
  );
}

export default App;
