import { LoadingScreen } from '@/src/components/site/loading-screen';

/** Route-transition fallback for the public site. Keeps the header/footer chrome. */
export default function SiteLoading() {
  return <LoadingScreen />;
}
