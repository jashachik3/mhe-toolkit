import { useHashView } from "./lib/routing";
import { C, bodyFont } from "./theme";
import { Home } from "./screens/Home";
import { SpeedCalc } from "./screens/SpeedCalc";
import { HPCalc } from "./screens/HPCalc";
import { CurveCalc } from "./screens/CurveCalc";
import { AccumCalc } from "./screens/AccumCalc";
import { GapCalc } from "./screens/GapCalc";
import { ReferenceScreen } from "./screens/ReferenceScreen";

export default function App() {
  const [view, setView] = useHashView();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: bodyFont,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {view === "home" && <Home setView={setView} />}
      {view === "speed" && <SpeedCalc setView={setView} />}
      {view === "hp" && <HPCalc setView={setView} />}
      {view === "curve" && <CurveCalc setView={setView} />}
      {view === "accum" && <AccumCalc setView={setView} />}
      {view === "reference" && <ReferenceScreen setView={setView} />}
      {view === "gap" && <GapCalc setView={setView} />}
    </div>
  );
}
