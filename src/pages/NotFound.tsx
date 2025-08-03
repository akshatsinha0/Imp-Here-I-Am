import { useLocation } from "react-router-dom";
import { useEffect } from "react";
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-mobile safe-area-inset">
      <div className="text-center container-mobile max-w-md">
        <h1 className="text-responsive-2xl font-bold mb-4">404</h1>
        <p className="text-responsive-lg text-gray-600 mb-4">Oops! Page not found</p>
        <a
          href="/"
          className="text-blue-500 hover:text-blue-700 underline text-responsive-base touch-target inline-block"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};
export default NotFound;