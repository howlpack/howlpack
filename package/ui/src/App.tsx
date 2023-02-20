import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RecoilRoot } from "recoil";
import KeplrWatcher from "./components/keplr-watcher";
import AppLayout from "./layout/app";
import Root from "./pages";
import FAQ from "./pages/faq";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Root /> },
      {
        path: "faq",
        element: <FAQ />,
      },
    ],
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
