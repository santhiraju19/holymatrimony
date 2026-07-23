"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    // Temporary delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    setLoading(false);

    setSuccess(true);

    setForm({
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  }

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Send Us a Message
          </h2>

          <p className="mt-4 text-gray-600">
            Have a question or need assistance?
            Fill out the form below and our team will get back to you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border bg-white p-8 shadow-lg"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Full Name
              </label>

              <input
                required
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Email Address
              </label>

              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Phone Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Subject
              </label>

              <input
                required
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-medium">
              Message
            </label>

            <textarea
              required
              rows={6}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-primary"
            />
          </div>

          {success && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
              ✅ Thank you! Your message has been received. Our team
              will contact you shortly.
            </div>
          )}

          <button
            disabled={loading}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Send size={18} />

            {loading
              ? "Sending..."
              : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}