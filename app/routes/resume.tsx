import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

interface Feedback {
    ATS: {
        score: number;
        tips: string[];
    };
    [key: string]: any;
}

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            // 👇 Pure document stream read karke direct secure local blob generate kar rahe hain
            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const localBlobUrl = URL.createObjectURL(pdfBlob);

            // Local blob preview window ke liye set kiya
            setResumeUrl(localBlobUrl);

            setFeedback(data.feedback);
            console.log({ resumeUrl: localBlobUrl, feedback: data.feedback });
        }

        if (!isLoading && auth.isAuthenticated) {
            loadResume();
        }
    }, [id, isLoading, auth.isAuthenticated]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {resumeUrl && (
                        /* 👇 Apka exact style fallback jisme width strictly controlled hai taaki lambi patti na bane */
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-lg relative group">

                            {/* Embedded clean document preview viewport format without raw browser headers */}
                            <iframe
                                src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-0 rounded-2xl pointer-events-none"
                                title="resume"
                            />

                            {/* 👇 Invisible Overlay: Is par click karte hi original file safe zoom aur download views ke sath open hogi */}
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 z-50 cursor-zoom-in bg-transparent"
                                title="Click to open full high-quality preview"
                            />
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="Scanning..." />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume;