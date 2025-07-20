import ResumeCard from '~/components/ResumeCard';
import type { Route } from './+types/home';
import Navbar from '~/components/navbar';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

export function meta({}: Route.MetaArgs) {
   return [
      { title: 'Resumind' },
      { name: 'description', content: 'Smart feedback for your dream job!' },
   ];
}

export default function Home() {
   const { auth, fs, kv } = usePuterStore();
   const navigate = useNavigate();
   const [resumes, setResumes] = useState<Resume[]>([]);
   const [loadingResumes, setLoadingResumes] = useState<boolean>(false);

   useEffect(() => {
      if (!auth.isAuthenticated) navigate('/auth?next=/');
   }, [auth.isAuthenticated]);

   useEffect(() => {
      async function loadResumes() {
         setLoadingResumes(true);
         const resumes = (await kv.list('resume:*', true)) as KVItem[];

         const parsedResumes = resumes
            .map((item) => JSON.parse(item.value) as Resume)
            .filter((r) => !!r?.feedback);

         setResumes(parsedResumes || []);
         setLoadingResumes(false);

         console.log({ parsedResumes });
      }
      loadResumes();
   }, []);

   return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
         <Navbar />

         <section className={'main-section'}>
            <div className={'page-heading py-16'}>
               <h1>Track Your Applications & Resume Ratings</h1>

               {!loadingResumes && resumes?.length === 0 ? (
                  <h2>
                     No resumes found. Upload your first resume to get
                     feedback..
                  </h2>
               ) : (
                  <h2>
                     Review your submissions and check AI-powered feedback.
                  </h2>
               )}
            </div>
            {loadingResumes && (
               <div className="flex flex-col items-center justify-center ">
                  <img
                     src="/images/resume-scan-2.gif"
                     alt=""
                     className="w-[200px]"
                  />
               </div>
            )}

            {!loadingResumes && resumes?.length > 0 && (
               <div className="resumes-section">
                  {resumes.map((resume) => (
                     <ResumeCard key={resume.id} resume={resume} />
                  ))}
               </div>
            )}

            {!loadingResumes && !resumes?.length && (
               <div className="flex flex-col items-center justify-center mt-10 gap-4">
                  <Link
                     to="/upload"
                     className="primary-button w-fit text-xl fonr-semibold"
                  >
                     Upload Resume
                  </Link>
               </div>
            )}
         </section>
      </main>
   );
}
