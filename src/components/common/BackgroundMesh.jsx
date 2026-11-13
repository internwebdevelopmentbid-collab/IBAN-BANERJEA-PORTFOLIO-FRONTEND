import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const GOLD = "#D4A62A";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getMeshDensity(width, height) {
  let columns;

  if (width < 480) columns = 7;
  else if (width < 640) columns = 8;
  else if (width < 768) columns = 9;
  else if (width < 1024) columns = 11;
  else if (width < 1440) columns = 14;
  else if (width < 1920) columns = 17;
  else columns = Math.round(width / 105);

  const cellWidth = width / columns;
  const rows = Math.min(80, Math.max(5, Math.ceil(height / cellWidth)));

  return { columns, rows };
}

/* -------------------------------------------------------------------------- */
/* MESH GENERATION                                                            */
/* -------------------------------------------------------------------------- */

function createMesh(width, height, columns, rows) {
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  const vertices = [];

  for (let row = 0; row <= rows; row += 1) {
    const rowVertices = [];

    for (let column = 0; column <= columns; column += 1) {
      const isEdge =
        row === 0 || row === rows || column === 0 || column === columns;

      const x = column * cellWidth;
      const y = row * cellHeight;

      const randomness = width < 640 ? 0.18 : 0.28;

      rowVertices.push({
        x: isEdge
          ? x
          : x + randomBetween(-cellWidth * randomness, cellWidth * randomness),

        y: isEdge
          ? y
          : y +
            randomBetween(-cellHeight * randomness, cellHeight * randomness),
      });
    }

    vertices.push(rowVertices);
  }

  const facets = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const topLeft = vertices[row][column];
      const topRight = vertices[row][column + 1];
      const bottomLeft = vertices[row + 1][column];
      const bottomRight = vertices[row + 1][column + 1];

      const center = {
        x:
          (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4 +
          randomBetween(-cellWidth * 0.12, cellWidth * 0.12),

        y:
          (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4 +
          randomBetween(-cellHeight * 0.12, cellHeight * 0.12),
      };

      const triangles = [
        [topLeft, topRight, center],
        [topRight, bottomRight, center],
        [bottomRight, bottomLeft, center],
        [bottomLeft, topLeft, center],
      ];

      for (const points of triangles) {
        const facetCenter = {
          x: (points[0].x + points[1].x + points[2].x) / 3,
          y: (points[0].y + points[1].y + points[2].y) / 3,
        };

        const radius = Math.max(
          ...points.map((point) =>
            Math.hypot(point.x - facetCenter.x, point.y - facetCenter.y),
          ),
        );

        facets.push({
          points,
          center: facetCenter,
          radius,
          variation: ((facets.length * 31) % 11) / 11,
        });
      }

      if (Math.random() > 0.6 && row > 0 && column > 0) {
        const cutPoint = {
          x: center.x + randomBetween(-cellWidth * 0.12, cellWidth * 0.12),
          y: center.y + randomBetween(-cellHeight * 0.12, cellHeight * 0.12),
        };

        const points = [topLeft, center, cutPoint];

        const facetCenter = {
          x: (topLeft.x + center.x + cutPoint.x) / 3,
          y: (topLeft.y + center.y + cutPoint.y) / 3,
        };

        const radius = Math.max(
          ...points.map((point) =>
            Math.hypot(point.x - facetCenter.x, point.y - facetCenter.y),
          ),
        );

        facets.push({
          points,
          center: facetCenter,
          radius,
          variation: ((facets.length * 31) % 11) / 11,
        });
      }
    }
  }

  return facets;
}

/* -------------------------------------------------------------------------- */
/* VIEWPORT SIZE                                                              */
/* -------------------------------------------------------------------------- */

function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/* -------------------------------------------------------------------------- */
/* BACKGROUND MESH                                                            */
/* -------------------------------------------------------------------------- */

function BackgroundMesh() {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") {
      return { width: 1440, height: 900 };
    }

    return getViewportSize();
  });

  /* CURSOR MOTION */

  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  const cursorOpacity = useMotionValue(0);

  const smoothCursorX = useSpring(cursorX, {
    stiffness: 90,
    damping: 28,
    mass: 0.7,
  });

  const smoothCursorY = useSpring(cursorY, {
    stiffness: 90,
    damping: 28,
    mass: 0.7,
  });

  /* REFS */

  const polygonRefs = useRef([]);

  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    inside: false,
  });

  const animationFrameRef = useRef(null);
  const lastLightingFrameRef = useRef(0);

  /* MESH GEOMETRY */

  const density = useMemo(
    () => getMeshDensity(viewport.width, viewport.height),
    [viewport.width, viewport.height],
  );

  const facets = useMemo(
    () =>
      createMesh(
        viewport.width,
        viewport.height,
        density.columns,
        density.rows,
      ),
    [viewport.width, viewport.height, density.columns, density.rows],
  );

  /* ------------------------------------------------------------------------ */
  /* VIEWPORT SIZE TRACKING                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const updateSize = () => {
      const nextSize = getViewportSize();

      setViewport((previous) => {
        if (
          previous.width === nextSize.width &&
          previous.height === nextSize.height
        ) {
          return previous;
        }

        return nextSize;
      });
    };

    window.addEventListener("resize", updateSize, {
      passive: true,
    });

    updateSize();

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* CURSOR LIGHTING                                                           */
  /* ------------------------------------------------------------------------ */

  const updateFacetLighting = useCallback(
    (timestamp) => {
      animationFrameRef.current = null;

      if (timestamp - lastLightingFrameRef.current < 16) {
        animationFrameRef.current =
          window.requestAnimationFrame(updateFacetLighting);

        return;
      }

      lastLightingFrameRef.current = timestamp;

      const { x: mouseX, y: mouseY, inside } = pointerRef.current;

      if (!inside) return;

      const glowRadius =
        viewport.width < 640 ? 260 : viewport.width < 1024 ? 320 : 380;

      const glowRadiusSquared = glowRadius * glowRadius;

      const minDistance = viewport.width < 640 ? 80 : 100;
      const minDistanceSquared = minDistance * minDistance;

      const polygons = polygonRefs.current;

      for (let index = 0; index < facets.length; index += 1) {
        const facet = facets[index];
        const polygon = polygons[index];

        if (!polygon) continue;

        const dx = facet.center.x - mouseX;
        const dy = facet.center.y - mouseY;

        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > glowRadiusSquared) {
          polygon.setAttribute(
            "fill-opacity",
            String(0.008 + facet.variation * 0.012),
          );

          polygon.setAttribute("stroke-opacity", "0.018");

          continue;
        }

        let normalizedDistance = distanceSquared / glowRadiusSquared;

        normalizedDistance = Math.max(0, Math.min(1, normalizedDistance));

        const inverse = 1 - normalizedDistance;
        const glow = inverse * inverse * (3 - 2 * inverse);

        const coreBoost = distanceSquared < minDistanceSquared ? 0.65 : 0;
        const lighting = Math.min(1, glow + coreBoost);

        const baseFill = 0.008 + facet.variation * 0.012;

        polygon.setAttribute(
          "fill-opacity",
          String(baseFill + lighting * 0.055),
        );

        polygon.setAttribute(
          "stroke-opacity",
          String(0.018 + lighting * 0.075),
        );
      }
    },
    [facets, viewport.width],
  );

  /* ------------------------------------------------------------------------ */
  /* RESET LIGHTING                                                            */
  /* ------------------------------------------------------------------------ */

  const resetFacetLighting = useCallback(() => {
    pointerRef.current.inside = false;

    cursorOpacity.set(0);

    for (let index = 0; index < facets.length; index += 1) {
      const polygon = polygonRefs.current[index];
      const facet = facets[index];

      if (!polygon) continue;

      polygon.setAttribute(
        "fill-opacity",
        String(0.008 + facet.variation * 0.012),
      );

      polygon.setAttribute("stroke-opacity", "0.018");
    }
  }, [facets, cursorOpacity]);

  /* ------------------------------------------------------------------------ */
  /* POINTER EVENTS                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePointerMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      pointerRef.current.x = x;
      pointerRef.current.y = y;
      pointerRef.current.inside = true;

      cursorX.set(x);
      cursorY.set(y);
      cursorOpacity.set(1);

      if (animationFrameRef.current === null) {
        animationFrameRef.current =
          window.requestAnimationFrame(updateFacetLighting);
      }
    };

    const handlePointerLeave = () => {
      resetFacetLighting();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        resetFacetLighting();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    document.documentElement.addEventListener("mouseleave", handlePointerLeave);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      document.documentElement.removeEventListener(
        "mouseleave",
        handlePointerLeave,
      );

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    cursorX,
    cursorY,
    cursorOpacity,
    updateFacetLighting,
    resetFacetLighting,
  ]);

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        z-0
        h-screen
        w-full
        overflow-hidden
      "
      style={{
        height: `${viewport.height}px`,
      }}
    >
      {/* BASE BACKGROUND */}

      <div className="absolute inset-0 bg-black" />

      {/* AMBIENT GOLD */}

      <div
        className="absolute inset-0 animate-mesh-ambient"
        style={{
          background: `
            radial-gradient(
              circle at 50% 45%,
              rgba(212,166,42,0.025),
              transparent 55%
            )
          `,
        }}
      />

      {/* SVG MESH */}

      <svg
        className="absolute left-0 top-0 block h-full w-full"
        style={{
          height: `${viewport.height}px`,
        }}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="none"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* LARGE SOFT CURSOR TRAIL */}

          <radialGradient id="cursorAmbientGlow">
            <stop offset="0%" stopColor="#F5D77A" stopOpacity="0.13" />
            <stop offset="15%" stopColor="#D4A62A" stopOpacity="0.095" />
            <stop offset="35%" stopColor="#D4A62A" stopOpacity="0.055" />
            <stop offset="60%" stopColor="#D4A62A" stopOpacity="0.022" />
            <stop offset="82%" stopColor="#D4A62A" stopOpacity="0.007" />
            <stop offset="100%" stopColor="#D4A62A" stopOpacity="0" />
          </radialGradient>

          {/* MEDIUM CURSOR TRAIL */}

          <radialGradient id="cursorFacetGlow">
            <stop offset="0%" stopColor="#F5D77A" stopOpacity="0.14" />
            <stop offset="25%" stopColor="#D4A62A" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#D4A62A" stopOpacity="0.035" />
            <stop offset="75%" stopColor="#D4A62A" stopOpacity="0.012" />
            <stop offset="100%" stopColor="#D4A62A" stopOpacity="0" />
          </radialGradient>

          <filter
            id="cursorAmbientBlur"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="55" />
          </filter>

          <filter
            id="cursorFacetBlur"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        {/* FACETS */}

        {facets.map((facet, index) => {
          const baseFill = 0.008 + facet.variation * 0.012;

          return (
            <polygon
              key={index}
              ref={(element) => {
                polygonRefs.current[index] = element;
              }}
              points={facet.points
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              fill="rgba(255,255,255,1)"
              fillOpacity={baseFill}
              stroke={GOLD}
              strokeWidth={viewport.width < 640 ? 0.25 : 0.35}
              strokeOpacity="0.072"
            />
          );
        })}

        {/* LARGE SOFT CURSOR TRAIL */}

        <motion.circle
          cx={smoothCursorX}
          cy={smoothCursorY}
          r={viewport.width < 640 ? 220 : viewport.width < 1024 ? 260 : 300}
          fill="url(#cursorAmbientGlow)"
          filter="url(#cursorAmbientBlur)"
          style={{ opacity: cursorOpacity }}
        />

        {/* MEDIUM CURSOR TRAIL */}

        <motion.circle
          cx={smoothCursorX}
          cy={smoothCursorY}
          r={viewport.width < 640 ? 130 : viewport.width < 1024 ? 150 : 170}
          fill="url(#cursorFacetGlow)"
          filter="url(#cursorFacetBlur)"
          style={{ opacity: cursorOpacity }}
        />
      </svg>

      {/* VIGNETTE */}

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              transparent 20%,
              rgba(0,0,0,0.25) 65%,
              rgba(0,0,0,0.65) 100%
            )
          `,
        }}
      />
    </div>
  );
}

export default BackgroundMesh;
