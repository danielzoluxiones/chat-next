'use client'
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Loading } from "../loading/index";

export default function Home () {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [history, setHistory] = useState(false);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [pdfPreview, setPdfPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [files, setFiles] = useState<any>([]);

  const socket = io("/");

  useEffect(() => {
    socket.on("message", receiveMessage);

    return () => {
      socket.off("message", receiveMessage);
    };
  }, []);

  const handleFileUpload = async (e:any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    let newFile = null;
    if (file.type.startsWith("image/")) {
      newFile = { type: "image", url: previewUrl, name: file.name };
    } else if (file.type === "application/pdf") {
      newFile = { type: "pdf", url: previewUrl, name: file.name };
    } else if (file.type.startsWith("video/")) {
      newFile = { type: "video", url: previewUrl, name: file.name };
    } else {
      alert("Formato no soportado. Solo imágenes, PDF o MP4.");
      return;
    }

    setFiles((prev:any) => [...prev, newFile]);
  };

  const receiveMessage = (message:any) =>
    setMessages((state:any) => [...state, message]);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    const newMessage = {
      body: message,
      from: "Me",
    };
    console.log("newMessage", newMessage);
    setMessages([...messages, newMessage]);
    socket.emit("message", message);
  };

  const handleSearch = async (value:any) => {
    setLoad(true);
    try {
      const res = await fetch(`http://localhost:3000/history`);
      const data = await res.json();
      console.log("data", data);
      setTimeout(() => {
        setLoad(false);
        setHistory(true);
      }, 2000);
    } catch (err) {
      console.error("Error buscando historial:", err);
    }
  };

  return (
    <div className="h-screen bg-zinc-800 text-white flex">
      <div
        className={`bg-zinc-900 p-4 h-full overflow-auto transition-all duration-300 ${
          open ? "w-4/5" : "w-full"
        } bg-blue-500 p-3`}
      >
        <div className="flex justify-end">
          <button onClick={() => setOpen(!open)} className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 p-2">
          <h1 className="text-md font-bold my-2">Chat</h1>

          <div className="flex items-center">
            <input
              type="text"
              placeholder="Write your messge..."
              className="border-2 border-zinc-500 p-1 w-full rounded"
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="mr-2 ml-2">
              <label htmlFor="fileInput" className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
              </label>
            </div>
          </div>

          <input
            id="fileInput"
            type="file"
            onChange={handleFileUpload}
            placeholder="Fileload"
            className="hidden"
          />

          <ul>
            {messages.map((message:any, i:any) => (
              <li
                key={i}
                className={`my-2 p-2 table  rounded-md 
            ${message.from === "Me" ? "bg-sky-700" : "bg-black ml-auto"}`}
              >
                <span className="text-xs block"> {message.from}</span>
                <span className="text-sm">{message.body}</span>
              </li>
            ))}
            <div className="mt-4 space-y-6">
              {files.map((file:any, index:any) => (
                <div key={index} className="p-2">
                  {file.type === "image" && (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-40 border mb-2"
                    />
                  )}
                  {file.type === "pdf" && (
                    <iframe
                      src={file.url}
                      width="400"
                      height="300"
                      title={file.name}
                    />
                  )}
                  {file.type === "video" && (
                    <video src={file.url} controls width="400" />
                  )}

                  {/* Botón Descargar */}
                  <div className="mt-2">
                    <a
                      href={file.url}
                      download={file.name}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </ul>
        </form>
      </div>

      {/* Panel lateral */}
      {open && (
        <div className="fixed top-0 right-0 h-full w-1/5 transition-all duration-300 bg-zinc-800 p-4 border-l-2 border-zinc-600 shadow-lg">
          <div
            className="flex justify-end cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-md font-bold my-2 text-white">Buscador</h1>
          <input
            type="text"
            placeholder="Search history..."
            className="border-2 border-zinc-500 p-2 w-full rounded"
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div>
            {load && <Loading></Loading>}

            <ul>
              {history &&
                messages.map((message:any, i:any) => (
                  <li
                    key={i}
                    className={`my-2 p-2 table  rounded-md 
            ${message.from === "Me" ? "bg-sky-700" : "bg-black ml-auto"}`}
                  >
                    <span className="text-xs block"> {message.from}</span>
                    <span className="text-sm">{message.body}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>

  );
}
