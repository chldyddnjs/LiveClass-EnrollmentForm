import { lazyImport } from "./helper.ts";
import { createBrowserRouter } from "react-router-dom";

const LoadingPage     = lazyImport(() => import("../pages/LoadingPage.tsx"),"LoadingPage");
const CourseListPage  = lazyImport(() => import("../pages/Course/CourseListPage.tsx"),"CourseListPage");
const CourseDetailPage = lazyImport(() => import("../pages/Course/CourseDetailPage.tsx"),"CourseDetailPage");
// const EnrollPage      = lazyImport(() => import("../pages/enroll/EnrollPage.tsx"),"EnrollPage");
// const EnrollCompletePage = lazyImport(() => import("../pages/enroll/EnrollCompletePage.tsx"),"EnrollCompletePage");
const NotFoundPage    = lazyImport(() => import("../pages/NotFoundPage.tsx"),"NotFoundPage");

const Router = createBrowserRouter([
    {
        path: "/",
        Component: CourseListPage,
        HydrateFallback: LoadingPage, 
    },
    {
        path: "/courses/:id",
        Component: CourseDetailPage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/enroll/:courseId",
        Component: LoadingPage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "/enroll/complete",
        Component: LoadingPage,
        HydrateFallback: LoadingPage,
    },
    {
        path: "*",
        Component: NotFoundPage,
        HydrateFallback: LoadingPage,
    },
]);

export default Router;
