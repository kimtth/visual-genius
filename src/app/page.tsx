"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/state/authStore";
import { AuthForm } from "@/components/auth/AuthForm";
import { Loader2 } from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // If user is already authenticated, redirect to teach page
        if (isAuthenticated && _hasHydrated) {
            router.push("/teach");
        }
    }, [isAuthenticated, _hasHydrated, router]);

    // Show loading spinner while hydrating from localStorage
    if (!_hasHydrated) {
        return (
            <section className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </section>
        );
    }

    // Show auth form if not authenticated
    return (
        <section className="flex min-h-[80vh] items-center justify-center p-4">
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900">
                        Visual Genius Communication Hub
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600">
                        Supporting ASD families with AI-powered visual communication tools. Create teaching cards,
                        facilitate conversations, and track responses—all in one place.
                    </p>
                </div>

                <div className="flex justify-center">
                    <AuthForm />
                </div>
            </div>
        </section>
    );
}
