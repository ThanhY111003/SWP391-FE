import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Forbidden = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const previousPath = location.state?.from;
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const primaryRoute = useMemo(() => {
    if (role === "ROLE_ADMIN") return "/manufacturer/reports";
    if (role === "ROLE_DEALER_MANAGER" || role === "ROLE_DEALER_STAFF") {
      return "/dealer/dashboard";
    }
    return "/login";
  }, [role]);

  const highlight = previousPath ? `Bạn không có quyền truy cập ${previousPath}` : "Bạn không có quyền truy cập trang này";

  const handleGoBack = () => {
    navigate(primaryRoute, { replace: true });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center px-6 text-white">
      <div className="relative max-w-3xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
        <div className="absolute inset-x-10 -top-12 flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-red-500/90 flex items-center justify-center shadow-xl shadow-red-500/50">
            <span className="text-5xl font-black">403</span>
          </div>
        </div>
        <div className="pt-8 text-center space-y-6">
          <p className="uppercase tracking-[0.4em] text-sm text-red-300">forbidden access</p>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Oops! Bạn không đủ quyền <br className="hidden md:block" /> để vào khu vực này
          </h1>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            {highlight}. Nếu bạn tin rằng đây là một sự nhầm lẫn, hãy liên hệ quản trị viên để được cấp quyền phù hợp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={handleGoBack}
              className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-lg shadow-white/20 hover:translate-y-[-2px] transition-transform"
            >
              Quay về trang chính
            </button>
            <button
              onClick={handleLogout}
              className="px-8 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Đăng nhập tài khoản khác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;

