import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { Provider as RollbarProvider, ErrorBoundary } from "@rollbar/react";
import { RecoilRoot } from "recoil";
import KeplrWatcher from "./components/keplr-watcher";
import Loading from "./components/loading";
import EmbeddedLayout from "./layout/embedded";
import AppLayout from "./layout/app";
import DensLayout from "./layout/dens";
import rollbar from "./lib/rollbar";
import WithKeplr from "./layout/with-keplr";
import WithDENS from "./layout/with-dens";
import Error from "./pages/error";

const WebhookListNotifications = lazy(
  () => import("./pages/notifications/webhook/list"),
);
const WebhookCreateNotifications = lazy(
  () => import("./pages/notifications/webhook/create"),
);
const WebhookEditNotifications = lazy(
  () => import("./pages/notifications/webhook/edit"),
);

const DensPath = lazy(() => import("./pages/dens-path/index"));

const ShareFeed = lazy(() => import("./pages/share-feed"));

const EmbeddedAllPosts = lazy(() => import("./pages/embedded/index"));
const EmbeddedUserFeed = lazy(() => import("./pages/embedded/user-feed"));

const IFTTT = lazy(() => import("./pages/tutorials/ifttt"));
const FAQ = lazy(() => import("./pages/notifications/faq"));
const TwitterIndex = lazy(() => import("./pages/twitter/index"));
const TwitterConnect = lazy(() => import("./pages/twitter/connect"));
const HowlRewardsKeplr = lazy(() =>
  import("./pages/howl-rewards").then((m) => ({ default: m.HowlRewardsKeplr })),
);
const HowlRewardsTokenId = lazy(() =>
  import("./pages/howl-rewards").then((m) => ({
    default: m.HowlRewardsTokenId,
  })),
);
const WinstonWolfe = lazy(() => import("./pages/bots/winston-wolfe"));
const Roadmap = lazy(() => import("./pages/roadmap"));
const EmailNotifications = lazy(
  () => import("./pages/notifications/email/get"),
);
const EmailCreateForm = lazy(
  () => import("./pages/notifications/email/create"),
);
const EmailEditForm = lazy(() => import("./pages/notifications/email/edit"));

const router = createBrowserRouter([
  {
    path: "/dens-path",
    element: <DensLayout />,
    errorElement: (
      <div style={{ width: "50%", margin: "50px auto" }}>
        <Error />
      </div>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <DensPath />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/embedded",
    element: <EmbeddedLayout />,
    errorElement: (
      <div style={{ width: "50%", margin: "50px auto" }}>
        <Error />
      </div>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <EmbeddedAllPosts />
          </Suspense>
        ),
      },
      {
        path: "user/:username",
        element: (
          <Suspense fallback={<Loading />}>
            <EmbeddedUserFeed />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: (
      <div style={{ width: "50%", margin: "50px auto" }}>
        <Error />
      </div>
    ),
    children: [
      { index: true, element: <Navigate to="/notifications" replace /> },
      {
        path: "howl-rewards",
        element: (
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        ),
        children: [
          { index: true, element: <HowlRewardsKeplr /> },
          {
            path: ":dens",
            element: <HowlRewardsTokenId />,
          },
        ],
      },
      {
        path: "share-feed",
        element: (
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        ),
        children: [{ index: true, element: <ShareFeed /> }],
      },
      {
        path: "roadmap",
        element: (
          <Suspense fallback={<Loading />}>
            <Roadmap />
          </Suspense>
        ),
      },
      {
        path: "twitter",
        element: (
          <WithKeplr>
            <WithDENS />
          </WithKeplr>
        ),
        errorElement: <Error />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loading />}>
                <TwitterIndex />
              </Suspense>
            ),
          },
          {
            path: "connect",
            element: (
              <Suspense fallback={<Loading />}>
                <TwitterConnect />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "tutorials",
        element: (
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="ifttt" replace /> },
          { path: "ifttt", element: <IFTTT /> },
        ],
      },
      {
        path: "bots",
        element: (
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="winston-wolfe" replace /> },
          { path: "winston-wolfe", element: <WinstonWolfe /> },
        ],
      },
      {
        path: "notifications",
        errorElement: <Error />,
        children: [
          {
            index: true,
            element: <Navigate to="email" replace />,
          },
          {
            path: "faq",
            element: (
              <Suspense fallback={<Loading />}>
                <FAQ />
              </Suspense>
            ),
          },
          {
            path: "email",
            element: (
              <Suspense fallback={<Loading />}>
                <WithKeplr>
                  <WithDENS />
                </WithKeplr>
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: <EmailNotifications />,
              },
              {
                path: "create",
                element: <EmailCreateForm />,
              },
              {
                path: "update",
                element: <EmailEditForm />,
              },
            ],
          },
          {
            path: "webhooks",
            element: (
              <Suspense fallback={<Loading />}>
                <WithKeplr>
                  <WithDENS />
                </WithKeplr>
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: <WebhookListNotifications />,
              },
              {
                path: ":ix",
                element: <WebhookEditNotifications />,
              },
              {
                path: "create",
                element: <WebhookCreateNotifications />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {},
});

function App() {
  return (
    <RollbarProvider instance={rollbar}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <KeplrWatcher />
            <RouterProvider router={router} />
          </ErrorBoundary>
        </QueryClientProvider>
      </RecoilRoot>
    </RollbarProvider>
  );
}

export default App;
