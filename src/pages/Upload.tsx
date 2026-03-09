import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Film, X, Loader2, CheckCircle } from 'lucide-react';

const Upload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [uploadComplete, setUploadComplete] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        if (!isUploading) {
            setFile(null);
            setUploadProgress(0);
            setStatusMessage('');
            setUploadComplete(false);
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setIsUploading(true);
        setStatusMessage('Starting upload...');
        setUploadProgress(0);

        // Simulate upload orchestration
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setStatusMessage('Analyzing match data with Computer Vision...');

                // Simulate analysis delay
                setTimeout(() => {
                    setStatusMessage('Generating insights and heatmaps...');
                    setTimeout(() => {
                        setUploadComplete(true);
                        setIsUploading(false);
                        setStatusMessage('Analysis Complete!');

                        // Redirect to dashboard after a short delay
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 1500);
                    }, 2000);
                }, 2000);
            }
            setUploadProgress(progress);
            if (progress < 100) {
                setStatusMessage(`Uploading video... ${progress}%`);
            }
        }, 300);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-32">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Match Video</h1>
                <p className="text-[#8495a7] text-sm">Upload your football match video for AI-powered analysis.</p>
            </div>

            {/* Upload Zone */}
            <div className={`border-2 border-dashed ${file ? 'border-primary/50 bg-primary/5' : 'border-[#1e293b] bg-[#0a0f16]'} rounded-3xl p-12 transition-colors mb-10 flex flex-col items-center justify-center text-center relative`}>
                <input
                    title='select'
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={file !== null}
                />

                {!file ? (
                    <>
                        <div className="w-12 h-12 rounded-2xl bg-[#0f151c] border border-white/5 flex items-center justify-center mb-6 z-0">
                            <UploadIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-white font-bold text-sm mb-2 relative z-0">Drop your video here</h3>
                        <p className="text-[#5e6b7e] text-[11px] mb-6 relative z-0">or click to browse files</p>
                        <p className="text-[#334155] text-[10px] uppercase font-bold tracking-wider relative z-0">
                            Supports: MP4, AVI, MOV, MKV, WEBM (Max 2GB)
                        </p>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center relative z-20">
                        <Film className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-white font-bold text-[13px] mb-1">{file.name}</h3>
                        <p className="text-[#5e6b7e] text-[11px] mb-4">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                        <button
                            onClick={handleRemove}
                            className="text-red-500 hover:text-red-400 text-[11px] font-bold flex items-center gap-1 transition-colors relative z-20 cursor-pointer p-2"
                        >
                            <X className="h-3 w-3" /> Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Match Details Form */}
            <div className="bg-[#0f151c] rounded-3xl border border-white/5 p-8 mb-8">
                <h2 className="text-lg font-bold text-white mb-8">Match Details</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Match Title *</label>
                        <input
                            type="text"
                            placeholder="e.g. FC Green Eagles vs Black Panthers - League Match"
                            className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Home Team</label>
                            <input
                                type="text"
                                placeholder="FC Green Eagles"
                                className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Away Team</label>
                            <input
                                type="text"
                                placeholder="Black Panthers FC"
                                className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Notes (optional)</label>
                        <textarea
                            rows={4}
                            placeholder="Any additional notes about this match..."
                            className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Submit Button & Progress */}
            {isUploading || uploadComplete ? (
                <div className="bg-[#0f151c] rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center">
                    <div className="w-full bg-[#1e293b] rounded-full h-2.5 mb-4 overflow-hidden flex">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-white">
                        {uploadComplete ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        )}
                        <span>{statusMessage}</span>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className={`w-full font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors ${file ? 'bg-primary hover:bg-[#00c968] text-[#0a0f16]' : 'bg-[#1e293b] text-white/50 cursor-not-allowed'
                        }`}
                >
                    <UploadIcon className="h-4 w-4" /> Upload & Analyze
                </button>
            )}
        </div>
    );
};

export default Upload;
