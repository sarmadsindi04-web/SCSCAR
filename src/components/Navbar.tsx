import React from "react";
import { User } from "../types.ts";
import { auth, googleAuthProvider } from "../lib/firebase.ts";
import { signInWithPopup, signOut } from "firebase/auth";
import { Shield, Key, LogOut, Car, BarChart2, Search, Heart, UserCheck } from "lucide-react";

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoginSuccess: (token: string, fbUser: any) => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onLoginSuccess,
  onLogout,
}: NavbarProps) {
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      onLoginSuccess(token, result.user);
    } catch (err) {
      console.error("Login popup failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <nav className="sticky top-0 h-20 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 z-50 backdrop-blur-md bg-black/40">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo with skew badge */}
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab("home")}>
              <div className="w-8 h-8 bg-[#FF0000] rounded-sm flex items-center justify-center transform skew-x-12 border border-white/10 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                <span className="text-black font-black italic -skew-x-12 text-sm leading-none">S</span>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tighter italic text-white leading-none block">
                  SCS<span className="text-[#FF0000]">CAR</span>
                </span>
                <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase leading-none mt-0.5">
                  HYPER DATABASE
                </p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-widest text-[#A3A3A3]">
              {[
                { id: "home", label: "DATABASE" },
                { id: "catalog", label: "CATALOG" },
                { id: "compare", label: "COMPARISON" },
                { id: "favorites", label: "FAVORITES" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`hover:text-white transition-colors tracking-widest uppercase cursor-pointer ${
                      isActive ? "text-[#FF0000]" : ""
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {user?.isAdmin && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`flex items-center gap-1 hover:text-white transition-colors tracking-widest uppercase cursor-pointer ${
                    activeTab === "admin" ? "text-[#FF0000]" : ""
                  }`}
                >
                  ADMIN
                </button>
              )}
            </div>
          </div>

          {/* Live Database Indicators & Search */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right leading-none select-none">
              <div className="text-[10px] text-[#FF0000] font-bold tracking-widest uppercase mb-1">Live Database</div>
              <div className="text-xs font-mono text-zinc-200">142,892 VEHICLES</div>
            </div>

            {/* Auth Controls */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 bg-zinc-950 p-1.5 pr-4 border border-white/10 rounded-sm">
                  <div className="w-6 h-6 bg-[#FF0000] text-black font-black text-[10px] flex items-center justify-center">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left text-[10px] font-mono leading-tight">
                    <p className="font-bold text-zinc-200 truncate max-w-[110px]">
                      {user.email.split("@")[0].toUpperCase()}
                    </p>
                    <p className="text-[#FF0000]">
                      {user.isAdmin ? "ADMIN" : "MEMBER"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-mono text-zinc-400 hover:text-[#FF0000] tracking-widest uppercase transition-colors shrink-0 cursor-pointer"
                    title="Sign Out"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  disabled={loading}
                  onClick={handleLogin}
                  className="px-5 py-2.5 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-[#FF0000] hover:text-white transition-all cursor-pointer"
                >
                  {loading ? "AUTHENTICATING..." : "LOGIN"}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex justify-around items-center border-t border-white/5 bg-black/95 py-3 fixed bottom-0 left-0 right-0 z-50">
        {[
          { id: "home", label: "DATABASE", icon: Car },
          { id: "catalog", label: "CATALOG", icon: Search },
          { id: "compare", label: "COMPARE", icon: BarChart2 },
          { id: "favorites", label: "FAVORITES", icon: Heart },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold tracking-wider transition-colors cursor-pointer ${
                isActive ? "text-[#FF0000]" : "text-zinc-500 hover:text-white"
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        {user?.isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === "admin" ? "text-[#FF0000]" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>ADMIN</span>
          </button>
        )}
      </div>
    </>
  );
}
