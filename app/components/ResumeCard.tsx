import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath } }: { resume: any }) => {
    const { fs } = usePuterStore();
    const [previewSrc, setPreviewSrc] = useState('');

    useEffect(() => {
        const fetchThumbnail = async () => {
            const pathToRead = imagePath || resumePath;
            if (!pathToRead) return;

            try {
                // Cloud se file ka data blob nikal rahe hain
                const blob = await fs.read(pathToRead);
                if (!blob) return;

                if (pathToRead.toLowerCase().includes('.pdf')) {
                    // 🔥 PDF to Image On-The-Fly Generation:
                    // Agar library crash ho chuki hai, toh hum browser ke dynamic render object format se binary stream read kar rahe hain
                    const fileUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                    setPreviewSrc(fileUrl);
                } else {
                    // Agar standard image file hai
                    const imageUrl = URL.createObjectURL(new Blob([blob], { type: 'image/png' }));
                    setPreviewSrc(imageUrl);
                }
            } catch (err) {
                console.error("Error generating thumbnail:", err);
            }
        };

        fetchThumbnail();
    }, [imagePath, resumePath]);

    const isPdf = (imagePath || resumePath || "").toLowerCase().includes('.pdf');

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback?.overallScore || feedback?.ATS?.score || 0} />
                </div>
            </div>

            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-[350px] max-sm:h-[200px] overflow-hidden rounded-xl bg-slate-50 relative pointer-events-none">
                    {previewSrc ? (
                        isPdf ? (
                            /* 👇 Agar file PDF hai, toh chota clean preview frame bina scrollbars ke jo exact image lagega */
                            <iframe
                                src={`${previewSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                className="w-full h-full border-0 pointer-events-none overflow-hidden block"
                                scrolling="no"
                                title="preview"
                            />
                        ) : (
                            /* Normal image tag agar sahi conversion database mein pehle se ho */
                            <img
                                src={previewSrc}
                                alt="resume preview"
                                className="w-full h-full object-cover object-top"
                            />
                        )
                    ) : (
                        <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-gray-400 font-medium text-sm">
                            Loading template...
                        </div>
                    )}
                    {/* Layer overlay safety taaki clickable links active rahein dashboard cards par */}
                    <div className="absolute inset-0 bg-transparent z-10" />
                </div>
            </div>
        </Link>
    )
}
export default ResumeCard;