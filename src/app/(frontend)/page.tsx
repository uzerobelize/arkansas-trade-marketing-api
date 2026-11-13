import { HomeClient, type HomePageContent } from '@/components/HomeClient'
import { connection } from 'next/server'
import { getNextly } from 'nextly'
import { Suspense } from "react";
import config from '../../../nextly.config'

async function getHomePageContent(): Promise<HomePageContent> {
  const nextly = await getNextly({ config })

  let res: HomePageContent = {}
  try {
    res = (await nextly.findSingle({
      slug: 'homepage',
    })) as HomePageContent
  } catch (error) {
    console.error('Failed to load homepage single:', error)
  }

  return res;
}

export default async function Page() {
  await connection();

  const pageData = await getHomePageContent();

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeClient content={pageData} />
      </Suspense>
    </main>
  );
}
