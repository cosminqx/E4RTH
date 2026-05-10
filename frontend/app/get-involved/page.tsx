"use client"

import { useState } from "react"

export default function GetInvolved() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [cityCountry, setCityCountry] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      if (!accessKey) throw new Error("Missing Web3Forms access key")

      const payload = {
        access_key: accessKey,
        name: fullName,
        email,
        city_country: cityCountry,
        message,
        subject: "E4RTH - Get Involved Application",
      }

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Submission failed")
      }

      setSuccess(true)
      setFullName("")
      setEmail("")
      setCityCountry("")
      setMessage("")
    } catch (err: any) {
      setError(err?.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Get Involved</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Support E4RTH by contacting our NGO team — we welcome collaborators and partners.</p>
        </header>

        {success ? (
          <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">Thank you</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">Thank you for supporting E4RTH. Your request has been received and will be reviewed by our NGO team.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-neutral-600 dark:text-neutral-400">Full name</span>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition"
                  placeholder="Jane Doe"
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 text-neutral-600 dark:text-neutral-400">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition"
                  placeholder="you@example.org"
                />
              </label>
            </div>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-neutral-600 dark:text-neutral-400">City / Country</span>
              <input
                value={cityCountry}
                onChange={(e) => setCityCountry(e.target.value)}
                className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition"
                placeholder="Iasi, Romania"
              />
            </label>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-neutral-600 dark:text-neutral-400">Short motivation message</span>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition"
                placeholder="Tell us how you'd like to help or collaborate"
              />
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 transition"
              >
                {loading ? "Sending…" : "Send Application"}
              </button>
              <div className="text-sm text-neutral-500">We will only contact you regarding this request.</div>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
