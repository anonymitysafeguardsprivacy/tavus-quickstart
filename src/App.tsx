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

  // For conversation screen, use full screen layout
  if (currentScreen === "conversation") {
    return (
      <main className="h-svh w-full bg-black">
        {renderScreen()}
      </main>
    );
  }

  return (
    <main className="flex h-svh flex-col items-center justify-between gap-3 p-5 sm:gap-4 lg:p-8 bg-black">
      {currentScreen !== "introLoading" && <Header />}
      <div className="flex-1 w-full">
        {renderScreen()}
      </div>
      {currentScreen !== "introLoading" && <Footer />}
    </main>
  );
}

export default App;