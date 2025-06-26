import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import {
  IntroLoading,
  Outage,
  OutOfMinutes,
  Conversation,
  Settings,
} from "./screens";

function App() {
  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "introLoading":
        return <IntroLoading />;
      case "outage":
        return <Outage />;
      case "outOfMinutes":
        return <OutOfMinutes />;
      case "settings":
        return <Settings />;
      case "conversation":
      default:
        return <Conversation />;
    }
  };

  // Always use full screen layout for conversation
  return (
    <main className="h-svh w-full bg-black">
      {renderScreen()}
    </main>
  );
}

export default App;