import React from "react";

import {
  SCROLL_OFFSET,
  MIN_RESOLUTION,
  MAX_RESOLUTION,
} from "../utils/constants";
import { Point } from "../utils/types";

import { getTileAPI } from "../utils/getTileAPI";

export const useImageController = () => {
  const [zoom, setZoom] = React.useState<{ scale: number; resolution: number }>(
    {
      scale: 2.0,
      resolution: MIN_RESOLUTION,
    },
  );
  const [position, setPosition] = React.useState<Point>({
    x: 0,
    y: 0,
  });

  const handleResolutionIncrease = () => {
    setZoom({
      ...zoom,
      resolution:
        zoom.resolution < MAX_RESOLUTION
          ? zoom.resolution + 1
          : zoom.resolution,
    });
  };

  const handleResolutionDecrease = () => {
    setZoom({
      ...zoom,
      resolution:
        zoom.resolution > MIN_RESOLUTION
          ? zoom.resolution - 1
          : zoom.resolution,
    });
  };
  const imageRef = React.useRef<HTMLDivElement>(null);

  // Handle mouse controls (panning, zooming)
  React.useEffect(() => {
    const image = imageRef.current;
    let prevPosition: Point = { x: 0, y: 0 };
    let dragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      dragging = true;
      prevPosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      dragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const deltaX = e.clientX - prevPosition.x;
        const deltaY = e.clientY - prevPosition.y;
        prevPosition = { x: e.clientX, y: e.clientY };
        setPosition((position) => ({
          x: position.x + deltaX,
          y: position.y + deltaY,
        }));
      }
    };

    const handleMouseScroll = (e: WheelEvent) => {
      e.preventDefault();

      // Adjust image scale
      setZoom((prevZoom) => {
        const newZoom = {
          scale:
            e.deltaY < 0
              ? Math.min(4.0, prevZoom.scale + SCROLL_OFFSET)
              : Math.max(0.4, prevZoom.scale - SCROLL_OFFSET),
          resolution: prevZoom.resolution,
        };

        // Adjust resolution based on scale dynamically
        if (prevZoom.resolution !== MAX_RESOLUTION && newZoom.scale >= 4.0) {
          newZoom.scale = 2.0;
          newZoom.resolution += 1;
        } else if (
          prevZoom.resolution !== MIN_RESOLUTION &&
          newZoom.scale < 1.0
        ) {
          newZoom.scale = 2.0;
          newZoom.resolution -= 1;
        }

        return { ...newZoom };
      });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      dragging = false;
    };

    image?.addEventListener("mousedown", handleMouseDown);
    image?.addEventListener("mouseup", handleMouseUp);
    image?.addEventListener("mousemove", handleMouseMove);
    image?.addEventListener("wheel", handleMouseScroll, { passive: false });
    image?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      image?.removeEventListener("mousedown", handleMouseDown);
      image?.removeEventListener("mouseup", handleMouseUp);
      image?.removeEventListener("mousemove", handleMouseMove);
      image?.removeEventListener("wheel", handleMouseScroll);
      image?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [imageRef]);

  const [grid, setGrid] = React.useState<string[][]>([]);
  const [cache, setCache] = React.useState<(typeof grid)[]>(() =>
    Array.from({ length: MAX_RESOLUTION }),
  );

  const [loading, setLoading] = React.useState<boolean>(true); // Loading state for page mount

  React.useEffect(() => {
    let stale = false; // Throw out stale resolution change during rapid zooming

    // Retrieve grid if cached
    if (cache[zoom.resolution]) {
      setGrid([...cache[zoom.resolution]]);
      return;
    }

    if (zoom.resolution === 0) {
      getTileAPI(0, 0, zoom.resolution).then((res) => {
        if (!stale) {
          setGrid([[res]]);
          setCache((prevCache) => {
            prevCache[zoom.resolution] = [[res]];
            return prevCache;
          });
          setLoading(false);
        }
      });
      return;
    }

    // Empty 2D array of image URLs
    const newGrid: string[][] = Array.from(
      { length: zoom.resolution * 2 },
      () => Array.from<string>({ length: zoom.resolution * 2 }).fill(""),
    );

    const promises: Promise<void>[] = [];

    // Construct tile layout

    for (let i = 0; i < zoom.resolution * 2; i++) {
      for (let j = 0; j < zoom.resolution * 2; j++) {
        try {
          const task = getTileAPI(i, j, zoom.resolution).then((res) => {
            newGrid[i][j] = res;
          });
          promises.push(task);
        } catch (err) {
          console.error("Could not create grid: ", err);
        }
      }
    }

    // Wait for grid tiles to be fully resolved
    Promise.all(promises)
      .then(() => {
        if (!stale) {
          setGrid(newGrid);
          setCache((prevCache) => {
            prevCache[zoom.resolution] = newGrid;
            return prevCache;
          });
        }
      })
      .catch((err) => console.error("Tiles could not be loaded: ", err));

    return () => {
      stale = true;
    };
  }, [zoom.resolution, cache]);

  return {
    imageRef,
    position,
    scale: zoom.scale,
    resolution: zoom.resolution,
    grid,
    gridLoading: loading,
    handleResolutionIncrease,
    handleResolutionDecrease,
  };
};
