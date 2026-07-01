import { Outlet } from "react-router";
import Navbar from "../components/Navbar"; // ✅ Apne Navbar ka sahi path check kar lena bhai

export default function MainLayout() {
    return (
        <div className="main-layout">
            {/* 👑 Har page par pehle Navbar dikhega */}
            <Navbar />

            {/* 🏃‍♂️ Is Outlet ke andar hamare alag-alag pages (home, upload) load honge */}
            <main>
                <Outlet />
            </main>
        </div>
    );
}