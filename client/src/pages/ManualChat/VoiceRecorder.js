import { useState, useRef, useEffect } from "react";
import { MdMic, MdStop, MdPlayArrow, MdPause, MdSend, MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import "./VoiceRecorder.css";

const VoiceRecorder = ({ socket, currentRoomId, userData, replyingTo, cancelReply, getSenderInfo }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(new Audio());
    const toastIdRef = useRef(null); // To manage toast notifications

    // Inside component
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                // Prevent Enter from triggering recording
                e.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const startRecording = async (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        try {
            // Dismiss any existing toast to prevent duplicates
            if (toastIdRef.current) toast.dismiss(toastIdRef.current);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            toastIdRef.current = toast.success("Recording started...");
        } catch (error) {
            toastIdRef.current = toast.error("Failed to access microphone");
            console.error("Recording error:", error);
        }
    };

    const stopRecording = (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (toastIdRef.current) toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.success("Recording stopped");
        }
    };

    const playAudio = (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        if (audioUrl && !isPlaying) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            setIsPlaying(true);
            audioRef.current.onended = () => setIsPlaying(false);
            if (toastIdRef.current) toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.success("Playing preview...");
        }
    };

    const pauseAudio = (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (toastIdRef.current) toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.success("Preview paused");
        }
    };

    const sendVoiceNote = (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        if (!audioBlob) {
            if (toastIdRef.current) toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.error("No recording to send");
            return;
        }

        const uploadingToast = toast.loading("Sending voice note...");
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const fileData = {
                    name: `voice_note_${Date.now()}.webm`,
                    type: "audio/webm",
                    content: reader.result,
                };

                const currentUserInfo = getSenderInfo(userData._id);

                socket.emit("manual_audio_upload", {
                    room: currentRoomId,
                    fileData,
                    senderId: userData._id,
                    senderName: currentUserInfo.name,
                    senderRole: currentUserInfo.role,
                    timestamp: new Date().toISOString(),
                    isAudio: true,
                    ...(replyingTo && {
                        replyTo: {
                            messageId: replyingTo.messageIndex.toString(),
                            text: replyingTo.text || (replyingTo.file ? "Image" : ""),
                            senderName: replyingTo.senderName,
                            senderRole: replyingTo.senderRole,
                            isFile: !!replyingTo.file,
                            isAudio: replyingTo.isAudio || false,
                            timestamp: replyingTo.originalTimestamp,
                        },
                    }),
                });

                toast.dismiss(uploadingToast);
                toastIdRef.current = toast.success("Voice note sent!");
                setAudioBlob(null);
                setAudioUrl(null);
                setIsPlaying(false);
                audioRef.current.pause();
                audioRef.current.src = "";
                if (replyingTo) cancelReply();
            } catch (error) {
                toast.dismiss(uploadingToast);
                toastIdRef.current = toast.error("Failed to send voice note");
                console.error("Send voice note error:", error);
            }
        };

        reader.onerror = () => {
            toast.dismiss(uploadingToast);
            toastIdRef.current = toast.error("Failed to process voice note");
        };

        reader.readAsDataURL(audioBlob);
    };

    const cancelRecording = (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        setAudioBlob(null);
        setAudioUrl(null);
        setIsPlaying(false);
        audioRef.current.pause();
        audioRef.current.src = "";
        if (toastIdRef.current) toast.dismiss(toastIdRef.current);
        toastIdRef.current = toast.success("Recording cancelled");
    };

    // Single button logic: Start -> Stop -> Send
    const handleMainButtonClick = (e) => {
        if (!isRecording && !audioBlob) {
            startRecording(e);
        } else if (isRecording) {
            stopRecording(e);
        } else {
            sendVoiceNote(e);
        }
    };

    return (
        <div className="voice-recorder-container">
            <button
                className={`voice-recorder-button ${isRecording ? "recording" : audioBlob ? "send" : ""}`}
                onClick={handleMainButtonClick}
                disabled={!currentRoomId}
                title={
                    isRecording ? "Stop Recording" : audioBlob ? "Send Voice Note" : "Start Recording"
                }
            >
                {isRecording ? <MdStop size={20} /> : audioBlob ? <MdSend size={20} /> : <MdMic size={20} />}
            </button>
            {audioBlob && (
                <div className="voice-recorder-controls">
                    <button
                        type="button"
                        className="voice-control-button"
                        onClick={isPlaying ? pauseAudio : playAudio}
                        title={isPlaying ? "Pause Preview" : "Play Preview"}
                    >
                        {isPlaying ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
                    </button>
                    <button
                        type="button"
                        className="voice-control-button cancel"
                        onClick={cancelRecording}
                        title="Cancel Recording"
                    >
                        <MdClose size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;