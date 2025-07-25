import { AIResponseFormat, prepareInstructions } from '../../constants';
import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/navbar';
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const Upload = () => {
   const { auth, isLoading, fs, ai, kv } = usePuterStore();
   const navigate = useNavigate();
   const [isProcessing, setIsProcessing] = useState<boolean>(false);
   const [statusText, setStatusText] = useState<string>('');
   const [file, setFile] = useState<File | null>(null);

   function handleFileSelect(file: File | null) {
      setFile(file);
   }

   async function handleAnalyze({
      companyName,
      jobTitle,
      jobDescription,
      file,
   }: {
      companyName: string;
      jobTitle: string;
      jobDescription: string;
      file: File;
   }) {
      try {
         setIsProcessing(true);
         setStatusText('Uploading and analyzing your resume...');
         const uploadedFile = await fs.upload([file]);
         if (!uploadedFile)
            return setStatusText('Error: Failed to upload file');

         setStatusText('Converting resume to image...');
         const imageFile = await convertPdfToImage(file);

         if (!imageFile)
            return setStatusText('Error: Failed to convert resume to image');
         if (!imageFile.file)
            return setStatusText('Error: Image file handling error');

         setStatusText('Uploading the image...');
         const uploadedImage = await fs.upload([imageFile.file]);
         if (!uploadedImage)
            return setStatusText('Error: Failed to upload image');

         setStatusText('Preparing data ...');
         const uuid = generateUUID();
         const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobDescription,
            jobTitle,
            feedback: '',
         };
         await kv.set(`resume:${uuid}`, JSON.stringify(data));
         setStatusText('Analyzing your resume...');

         const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({
               jobTitle,
               jobDescription,
               AIResponseFormat,
            }),
         );
         if (!feedback)
            return setStatusText('Error: Failed to analyze your resume');

         const feedbackText =
            typeof feedback.message.content === 'string'
               ? feedback.message.content
               : feedback.message.content[0].text;

         data.feedback = JSON.parse(feedbackText);
         await kv.set(`resume:${uuid}`, JSON.stringify(data));
         setStatusText('Analysis complete! Redirecting ...');

         navigate(`/resume/${uuid}`);
      } catch (err: any) {
         console.log({ err });
         if (String(err?.error?.message).includes('usage-limited-chat')) {
            toast.info(
               'Sorry you have reached your usage limit for today. Please try again tomorrow.',
            );
            setIsProcessing(false);
         }
      }
   }

   function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (!form) return;

      const formData = new FormData(form);

      const companyName = String(formData.get('company-name') || '');
      const jobTitle = String(formData.get('job-title') || '');
      const jobDescription = String(formData.get('job-description') || '');

      if (!file) return;

      handleAnalyze({ companyName, jobTitle, jobDescription, file });
   }

   return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
         <Navbar />
         <section className={'main-section'}>
            <div className="page-heading py-16">
               <h1>Smart feedback for your dream job</h1>
               {isProcessing ? (
                  <>
                     <h2>{statusText}</h2>
                     <img src="/images/resume-scan.gif" className="w-full" />
                  </>
               ) : (
                  <h2>
                     Drop your resume for an ATS score and improvement tips
                  </h2>
               )}
               {!isProcessing && (
                  <form
                     action=""
                     id="upload-form"
                     onSubmit={handleSubmit}
                     className="flex flex-col gap-4 mt-8"
                  >
                     <div className="form-div">
                        <label htmlFor="company-name">Company Name</label>
                        <input
                           type="text"
                           name="company-name"
                           placeholder="Company Name"
                           id="company-name"
                        />
                     </div>
                     <div className="form-div">
                        <label htmlFor="job-title">Job Title</label>
                        <input
                           type="text"
                           name="job-title"
                           placeholder="Job Title"
                           id="job-title"
                        />
                     </div>
                     <div className="form-div">
                        <label htmlFor="job-description">Job Description</label>
                        <textarea
                           rows={5}
                           name="job-description"
                           placeholder="Job Description"
                           id="job-description"
                        />
                     </div>
                     <div className="form-div">
                        <label htmlFor="uploader">Upload Resume</label>
                        <FileUploader onFileSelect={handleFileSelect} />
                     </div>
                     <div className="flex items-center gap-4 w-full">
                        <Link to="/" className="back-button bg-white">
                           <img
                              src="/icons/back.svg"
                              alt="logo"
                              className="w-2.5 h-2.5"
                           />
                           <span className="text-gray-800 text-sm font-semibold">
                              Back
                           </span>
                        </Link>

                        <button className="primary-button w-full" type="submit">
                           Analyze Resume
                        </button>
                     </div>
                  </form>
               )}
            </div>
         </section>
      </main>
   );
};

export default Upload;
