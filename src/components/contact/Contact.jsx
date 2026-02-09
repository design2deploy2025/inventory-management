"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    emailjs
      .sendForm(
        "service_nk9nrgx",
        "template_0g4owgi",
        formRef.current,
        "_JN_aT6Na3UuGoxd_"
      )
      .then(
        () => {
          setLoading(false);
          setStatus("Message sent successfully!");
          formRef.current.reset();
        },
        () => {
          setLoading(false);
          setStatus("Something went wrong. Please try again.");
        }
      );
  };

  return (
    <div
      className="relative flex flex-col items-center bg-black text-white text-sm pb-16 bg-center bg-cover"
      id="contact"
    >
      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center mt-24">
        {/* <h2 className="text-base/7 font-semibold text-indigo-400">Contact</h2> */}
        <p className="mt-2 text-4xl md:text-6xl font-semibold tracking-tight text-balance bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text">
          Let's talk about your project
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-slate-300 text-base md:text-base max-md:px-2 max-w-md">
        Feel free to reach out if you'd like to brainstorm ideas, discuss a
        project, or work on something impactful together.
      </p>

      <form
        ref={formRef}
        onSubmit={sendEmail}
        className="flex flex-col items-center text-sm mt-8"
      >
        {/* Inputs */}
        <div className="flex flex-col md:flex-row items-center gap-8 w-[350px] md:w-[700px]">
          <div className="w-full">
            <label className="text-slate-300">Your Name</label>
            <input
              type="text"
              name="name"
              required
              className="h-12 p-2 mt-2 w-full border border-white/15 bg-white/10 outline-none focus:border-indigo-500 text-white placeholder-slate-400"
              placeholder="John Doe"
            />
          </div>

          <div className="w-full">
            <label className="text-slate-300">Your Email</label>
            <input
              type="email"
              name="email"
              required
              className="h-12 p-2 mt-2 w-full border border-white/15 bg-white/10 outline-none focus:border-indigo-500 text-white placeholder-slate-400"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Message */}
        <div className="mt-6 w-[350px] md:w-[700px]">
          <label className="text-slate-300">Message</label>
          <textarea
            name="message"
            required
            className="w-full mt-2 p-4 h-40 border border-white/15 bg-white/10 outline-none focus:border-indigo-500 text-white placeholder-slate-400 resize-none"
            placeholder="Tell us about your project..."
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Message"}
          {!loading && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79688 11.5117H18.2274M18.2274 11.5117L11.5121 4.79639M18.2274 11.5117L11.5121 18.2269"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Status */}
        {status && (
          <p className="mt-4 text-sm text-slate-300">{status}</p>
        )}
      </form>
    </div>
  );
}
