import Link from "next/link";
import { BookOpen, MessageCircle, MessagesSquare, Keyboard } from "lucide-react";

export default function LandingPage() {
    return (
        <section className="min-h-[80vh] grid items-start gap-8 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-10 shadow-sm">
            <div className="space-y-4">
                <h1 className="text-3xl font-semibold text-slate-900">
                    Visual Genius Communication Hub
                </h1>
                <p className="max-w-2xl text-sm text-slate-600">
                    Supporting ASD families with AI-powered visual communication tools. Create teaching cards,
                    facilitate conversations, and track responses—all in one place.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 self-start">
                    <Link
                        href="/teach"
                        className="group rounded-xl border border-slate-200 bg-white p-6 shadow transition hover:border-brand hover:shadow-md"
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Teach</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Create and organize visual cards for teaching concepts, routines, and procedures
                        </p>
                    </Link>

                    <Link
                        href="/parent"
                        className="group rounded-xl border border-slate-200 bg-white p-6 shadow transition hover:border-brand hover:shadow-md"
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Communicate</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Start conversations using predefined topics and track responses in real-time
                        </p>
                    </Link>

                    <Link
                        href="/child"
                        className="group rounded-xl border border-slate-200 bg-white p-6 shadow transition hover:border-brand hover:shadow-md"
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
                            <MessagesSquare className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Child Board</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Child-friendly interface for selecting cards and responding to conversations
                        </p>
                    </Link>

                    <Link
                        href="/letterboard"
                        className="group rounded-xl border border-slate-200 bg-white p-6 shadow transition hover:border-brand hover:shadow-md"
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            <Keyboard className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Letterboard</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Guided letterboard with partner tips, quick phrases, and adaptive speech pacing
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
}
