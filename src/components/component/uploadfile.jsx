"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import ConfettiEffect from "@/components/ConfettiEffect";
import Image from "next/image";
import { ClipboardIcon } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function Uploadfile() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileLink, setFileLink] = useState(null);
  const fileInputRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadRequest, setUploadRequest] = useState(null); // State to hold the XMLHttpRequest instance
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef(null);

  const handleCopyLink = () => {
    if (fileLink) {
      setShowConfetti(true);
      navigator.clipboard.writeText(fileLink);

      if (!showConfetti) {
        confettiTimeoutRef.current = setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }

      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 20971520) {
      setSelectedFile(file);
    } else if (file.size >= 20971520) {
      alert("File is too large or invalid.");
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    setUploadProgress(0);

    const file = e.target.files[0];
    if (file) {
      // Check if file exists before accessing properties
      if (file.size <= 20971520) {
        setSelectedFile(file);
      } else if (file.size >= 20971520) {
        alert("File is too large or invalid.");
      }
    } else {
      console.log("No file selected"); // Handle no file selection case (optional)
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const filePath = `${Date.now()}_${selectedFile.name}`;
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round(
            (event.loaded * 100) / event.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      xhr.open("POST", `${supabaseUrl}/storage/v1/object/uploads/${filePath}`);
      xhr.setRequestHeader("Authorization", `Bearer ${supabaseAnonKey}`);

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const fileURL = `${supabaseUrl}/storage/v1/object/public/${response.Key}`;
          setUploadProgress(100); // Ensure progress bar shows 100%
          setFileLink(fileURL);
          setDialogOpen(true);
        } else {
          console.error("Upload failed:", xhr.responseText);
          alert("Failed to upload file.");
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        console.error("Upload error:", xhr.responseText);
        alert("Failed to upload file.");
        setUploading(false);
      };

      const formData = new FormData();
      formData.append("file", selectedFile);
      xhr.send(formData);

      // Store the XMLHttpRequest instance in state to be able to cancel it
      setUploadRequest(xhr);
    } catch (error) {
      console.error("Error uploading file:", error.message);
      alert("Failed to upload file.");
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    if (uploadRequest) {
      uploadRequest.abort();
      setUploading(false);
      setUploadProgress(0);
      setFileLink(null); // Optionally clear the file link if the upload is canceled
      toast({
        title: "Upload canceled",
        description: "The upload has been canceled.",
      });
    }
  };

  useEffect(() => {
    console.log("Card open state changed:", dialogOpen);
  }, [dialogOpen]);

  return (
    <Card className="flex flex-col items-center w-full min-h-screen p-4 bg-red-50">
      <header className="flex items-center w-full max-w-6xl p-10 mb-8">
        <Button
          variant="primary"
          className="flex items-center gap-2 bg-red-100"
        >
          <Image
            className="dark:scale-0"
            src={"/logo.svg"}
            width={25}
            height={25}
          />
          <div className="text-red-800 font-bold">KlearShare</div>
        </Button>
      </header>
      <main className="w-full max-w-2xl space-y-20">
        <div>
          <h1 className="text-8xl font-black text-center">
            Share Files in 1 sec.
          </h1>
          <p className="text-muted-foreground text-center font-bold text-red-500">
            No sign-in, completely Anonymous. Just upload and copy the link...
          </p>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex flex-col items-center justify-center w-full p-10 border-2 rounded-md cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-100"
                  : "border-dashed border-muted-foreground"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              {selectedFile ? (
                <>
                  <p className="font-semibold">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </>
              ) : (
                <>
                  <FileIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground font-semibold">
                    Drag and drop a file or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, image, video, or audio (20MB Max)
                  </p>
                </>
              )}
              <input
                id="file"
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {uploading && (
              <div className="flex flex-col items-center mt-4">
                <Progress value={uploadProgress} className="mb-2" />
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={handleCancelUpload}
                >
                  Cancel Upload
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex w-full mt-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </CardFooter>
        </Card>

        {fileLink && (
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            className="relative"
          >
            {showConfetti && <ConfettiEffect visible={showConfetti} />}
            <DialogContent className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">
                  Boom! Here&apos;s your download link 👇🏻🗃️🎊
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <a
                      href={fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline truncate"
                      title={fileLink}
                    >
                      {fileLink.substring(0, 40)}...
                    </a>
                  </div>
                </div>
              </DialogDescription>
              <DialogFooter className="flex justify-end mt-4">
                <Button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  Copy URL
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </Card>
  );
}

function FileIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
