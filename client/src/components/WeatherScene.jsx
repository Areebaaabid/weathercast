import { useMemo } from "react";

/* ─── Sunny Scene ─── */
const SunnyScene = () => (
  <div className="scene scene-sunny">
    {/* Sky gradient is CSS bg */}
    {/* Sun */}
    <div className="sun">
      <div className="sun-core" />
      {[...Array(12)].map((_, i) => (
        <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)` }} />
      ))}
      <div className="sun-glow" />
    </div>
    {/* Lazy drifting clouds */}
    <div className="cloud cloud-1"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
    <div className="cloud cloud-2"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
    <div className="cloud cloud-3"><div className="c-body"/><div className="c-bump1"/></div>
    {/* Hills */}
    <div className="hills">
      <div className="hill hill-back" />
      <div className="hill hill-mid" />
      <div className="hill hill-front" />
    </div>
  </div>
);

/* ─── Cloudy Scene ─── */
const CloudyScene = () => (
  <div className="scene scene-cloudy">
    <div className="cloud cloud-big cloud-b1"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/><div className="c-bump3"/></div>
    <div className="cloud cloud-big cloud-b2"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
    <div className="cloud cloud-big cloud-b3"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/><div className="c-bump3"/></div>
    <div className="cloud cloud-big cloud-b4"><div className="c-body"/><div className="c-bump1"/></div>
    <div className="cloud cloud-big cloud-b5"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
  </div>
);

/* ─── Rain Scene ─── */
const RainScene = ({ heavy }) => {
  const drops = useMemo(() =>
    Array.from({ length: heavy ? 120 : 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 110 - 5,
      delay: Math.random() * 1.5,
      duration: heavy ? 0.35 + Math.random() * 0.2 : 0.55 + Math.random() * 0.3,
      opacity: 0.4 + Math.random() * 0.4,
      height: heavy ? 20 + Math.random() * 10 : 14 + Math.random() * 8,
    })), [heavy]);

  return (
    <div className={`scene scene-rain ${heavy ? "scene-heavy" : ""}`}>
      <div className="rain-cloud rc1"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/><div className="c-bump3"/></div>
      <div className="rain-cloud rc2"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
      <div className="rain-cloud rc3"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
      <div className="drops-container">
        {drops.map(d => (
          <div key={d.id} className="raindrop" style={{
            left: `${d.left}%`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            opacity: d.opacity,
            height: `${d.height}px`,
          }} />
        ))}
      </div>
      <div className="puddles">
        {[20,45,70,85].map(l => <div key={l} className="puddle" style={{left:`${l}%`}}><div className="ripple"/><div className="ripple r2"/></div>)}
      </div>
    </div>
  );
};

/* ─── Storm Scene ─── */
const StormScene = () => {
  const drops = useMemo(() =>
    Array.from({ length: 140 }, (_, i) => ({
      id: i,
      left: Math.random() * 110 - 5,
      delay: Math.random() * 1.2,
      duration: 0.28 + Math.random() * 0.15,
      opacity: 0.5 + Math.random() * 0.4,
    })), []);

  return (
    <div className="scene scene-storm">
      <div className="storm-clouds">
        <div className="sc sc1"/><div className="sc sc2"/><div className="sc sc3"/><div className="sc sc4"/>
      </div>
      {/* Lightning bolts */}
      <div className="bolt bolt-1">⚡</div>
      <div className="bolt bolt-2">⚡</div>
      <div className="flash" />
      <div className="drops-container">
        {drops.map(d => (
          <div key={d.id} className="raindrop raindrop-storm" style={{
            left: `${d.left}%`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            opacity: d.opacity,
          }} />
        ))}
      </div>
    </div>
  );
};

/* ─── Snow Scene ─── */
const SnowScene = () => {
  const flakes = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 5 + Math.random() * 8,
      size: 4 + Math.random() * 10,
      opacity: 0.5 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 60,
    })), []);

  return (
    <div className="scene scene-snow">
      <div className="snow-cloud sc1"><div className="c-body"/><div className="c-bump1"/><div className="c-bump2"/></div>
      <div className="snow-cloud sc2"><div className="c-body"/><div className="c-bump1"/></div>
      {flakes.map(f => (
        <div key={f.id} className="snowflake" style={{
          left: `${f.left}%`,
          width: `${f.size}px`,
          height: `${f.size}px`,
          animationDuration: `${f.duration}s`,
          animationDelay: `${f.delay}s`,
          opacity: f.opacity,
          '--drift': `${f.drift}px`,
        }} />
      ))}
      <div className="snow-ground" />
    </div>
  );
};

/* ─── Fog Scene ─── */
const FogScene = () => (
  <div className="scene scene-fog">
    {[1,2,3,4,5].map(i => (
      <div key={i} className={`fog-band fog-${i}`} />
    ))}
  </div>
);

/* ─── Router ─── */
const WeatherScene = ({ theme }) => {
  if (theme === "sun")   return <SunnyScene />;
  if (theme === "cloud") return <CloudyScene />;
  if (theme === "rain")  return <RainScene heavy={false} />;
  if (theme === "storm") return <StormScene />;
  if (theme === "snow")  return <SnowScene />;
  if (theme === "fog")   return <FogScene />;
  return <SunnyScene />;
};

export default WeatherScene;
