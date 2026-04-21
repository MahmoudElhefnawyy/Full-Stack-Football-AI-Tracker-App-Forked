import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Film, X, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants, scaleUpVariants, hoverScale, tapScale } from '../utils/animations';

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

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setStatusMessage('Starting upload...');
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

            // 1. Upload Video
            const response = await fetch(`${BASE_URL}/api/v1/analysis/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');
            
            const data = await response.json();
            const taskId = data.data.task_id;
            
            setUploadProgress(40);
            setStatusMessage('Video received! AI is processing...');

            // 2. Poll for Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${BASE_URL}/api/v1/analysis/tasks/${taskId}`);
                    const statusData = await statusRes.json();
                    const task = statusData.data;

                    if (task.status === 'processing') {
                        setUploadProgress(70);
                        setStatusMessage('YOLOv8 is analyzing match frames...');
                    } else if (task.status === 'success') {
                        clearInterval(pollInterval);
                        setUploadProgress(100);
                        setUploadComplete(true);
                        setIsUploading(false);
                        setStatusMessage('Analysis Complete!');
                        
                        setTimeout(() => {
                            navigate(`/analysis/${taskId}`);
                        }, 1500);
                    } else if (task.status === 'failed') {
                        clearInterval(pollInterval);
                        setIsUploading(false);
                        setStatusMessage(`Failed: ${task.error_message}`);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000);

        } catch (error) {
            setIsUploading(false);
            setStatusMessage('Error: Connection failed. Make sure the backend is running.');
            console.error('Upload error:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Upload Match Video</h1>
                <p className="text-[#8495a7] text-sm">Upload your football match video for AI-powered analysis.</p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div
                variants={scaleUpVariants}
                initial="hidden"
                animate="visible"
                className={`border-2 border-dashed ${file ? 'border-primary/50 bg-primary/5' : 'border-[#1e293b] bg-[#0a0f16]'} rounded-3xl p-12 transition-colors mb-10 flex flex-col items-center justify-center text-center relative`}
            >
                <input
                    title='select'
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={file !== null}
                />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#0f151c] border border-white/5 flex items-center justify-center mb-6">
                                <UploadIcon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-white font-bold text-sm mb-2">Drop your video here</h3>
                            <p className="text-[#5e6b7e] text-[11px] mb-6">or click to browse files</p>
                            <p className="text-[#334155] text-[10px] uppercase font-bold tracking-wider">
                                Supports: MP4, AVI, MOV, MKV, WEBM (Max 2GB)
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center relative z-20"
                        >
                            <Film className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-white font-bold text-[13px] mb-1">{file.name}</h3>
                            <p className="text-[#5e6b7e] text-[11px] mb-4">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleRemove}
                                className="text-red-500 hover:text-red-400 text-[11px] font-bold flex items-center gap-1 transition-colors relative z-20 cursor-pointer p-2"
                            >
                                <X className="h-3 w-3" /> Remove
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Match Details Form */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-[#0f151c] rounded-3xl border border-white/5 p-8 mb-8"
            >
                <motion.h2 variants={itemVariants} className="text-lg font-bold text-white mb-8">Match Details</motion.h2>

                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Match Title *</label>
                        <input
                            type="text"
                            placeholder="e.g. FC Green Eagles vs Black Panthers - League Match"
                            className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                            <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Home Team</label>
                            <input
                                type="text"
                                placeholder="FC Green Eagles"
                                className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Away Team</label>
                            <input
                                type="text"
                                placeholder="Black Panthers FC"
                                className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants}>
                        <label className="block text-[11px] font-bold text-white/50 mb-2 ml-1">Notes (optional)</label>
                        <textarea
                            rows={4}
                            placeholder="Any additional notes about this match..."
                            className="w-full bg-[#0a0f16] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-[#334155] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        ></textarea>
                    </motion.div>
                </div>
            </motion.div>

            {/* Submit Button & Progress */}
            <AnimatePresence mode="wait">
                {isUploading || uploadComplete ? (
                    <motion.div
                        key="progress"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0f151c] rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center"
                    >
                        <div className="w-full bg-[#1e293b] rounded-full h-2.5 mb-4 overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                            ></motion.div>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-white">
                            {uploadComplete ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                </motion.div>
                            ) : (
                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            )}
                            <motion.span
                                key={statusMessage}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {statusMessage}
                            </motion.span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="button"
                        whileHover={file ? hoverScale : {}}
                        whileTap={file ? tapScale : {}}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleUpload}
                        disabled={!file}
                        className={`w-full font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors ${file ? 'bg-primary hover:bg-[#00c968] text-[#0a0f16]' : 'bg-[#1e293b] text-white/50 cursor-not-allowed'
                            }`}
                    >
                        <UploadIcon className="h-4 w-4" /> Upload & Analyze
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Upload;
