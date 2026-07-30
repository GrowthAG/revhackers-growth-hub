import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  headerVariant?: 'default' | 'light';
  hideFooter?: boolean;
}

const PageLayout = ({ children, headerVariant = 'default', hideFooter = false }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-white text-zinc-900">
      <Header variant={headerVariant} />
      <main className="flex-grow w-full">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
