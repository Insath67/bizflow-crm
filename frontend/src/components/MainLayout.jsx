import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1">{children}</main>

      <AppFooter />
    </div>
  );
};

export default MainLayout;