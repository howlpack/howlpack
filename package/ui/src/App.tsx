import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RecoilRoot } from "recoil";
import KeplrWatcher from "./components/keplr-watcher";
import AppLayout from "./layout/app";
import Root from "./pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [{ index: true, element: <Root /> }],
  },
]);

function App() {
  return (
    <RecoilRoot>
      <KeplrWatcher />
      <RouterProvider router={router} />
    </RecoilRoot>
  );
}

export default App;
