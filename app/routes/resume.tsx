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
    const [feedback, setFeedback] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const localBlobUrl = URL.createObjectURL(pdfBlob);

            setResumeUrl(localBlobUrl);
            setFeedback(data.feedback);
            console.log({ resumeUrl: localBlobUrl, feedback: data.feedback });
        }

        if (!isLoading && auth.isAuthenticated) {
            loadResume();
        }
    }, [id, isLoading, auth.isAuthenticated]);

    return (
        <main className="!pt-0 min-h-screen bg-white">
            <nav className="resume-nav w-full">
                <Link to="/" className="back-button w-fit block">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5 inline-block mr-2" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            {/* 👇 Zoom-Proof Split Layout (Flex row hata kar direct responsive Grid laga diya) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[calc(100vh-60px)] items-start">

                {/* LEFT SIDE PANEL: Auto adjusting resume canvas */}
                <section className="bg-[url('/images/bg-small.svg')] bg-cover w-full h-full min-h-[500px] lg:h-[calc(100vh-60px)] lg:sticky lg:top-[60px] flex items-center justify-center p-4">
                    {resumeUrl && (
                        /* 👇 Aspect Ratio matching box: Ye har zoom level aur resolution par dynamic center hi rahega */
                        <div className="animate-in fade-in duration-1000 gradient-border h-full max-h-[750px] w-full max-w-[460px] aspect-[1/1.41] overflow-hidden rounded-2xl shadow-xl relative bg-white flex items-center justify-center transition-all duration-300">

                            <iframe
                                src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                className="w-full h-full border-0 rounded-2xl pointer-events-none block object-contain"
                                title="resume"
                            />

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

                {/* RIGHT SIDE PANEL: Content Cards Scrolling Node */}
                <section className="feedback-section w-full p-6 lg:p-12 h-full overflow-y-auto">
                    <h2 className="text-4xl !text-black font-bold mb-6">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000 w-full">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="w-full flex justify-center items-center py-12">
                            <img src="/images/resume-scan-2.gif" className="w-full max-w-sm" alt="Scanning..." />
                        </div>
                    )}
                </section>

            </div>
        </main>
    )
}
export default Resume;