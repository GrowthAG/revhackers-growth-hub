import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  headerVariant?: 'default' | 'light';
}

const PageLayout = ({ children, headerVariant = 'default' }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#09090b] text-white selection:bg-[#00CC6A] selection:text-black">
      <Header variant={headerVariant} />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
